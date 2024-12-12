// src/middleware/codeExecutor/index.ts

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { languageConfigs } from './languageConfigs';
import { getDockerImageForLanguage, getDockerRunCommand } from './dockerManager';
import { CodeExecutionError, sanitizeErrorMessage } from './utils';

function ensureLanguageDirectoryExists(language: string) {
  const baseDir = path.join(process.cwd(), 'code-executor');
  const dirPath = path.join(baseDir, language);
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Language directory not found: ${language}. Please run prepare_directories.sh first.`);
  }
  return dirPath;
}

export async function executeCode(
  code: string,
  language: string,
  stdin: string = ''
): Promise<{ stdout: string; stderr: string; error?: string }> {
  const config = languageConfigs[language];
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const langDir = ensureLanguageDirectoryExists(language);
  const uniqueId = uuidv4();
  const fileName = (language === 'java' || language === 'scala') ? `Main${config.extension}` : `Main_${uniqueId}${config.extension}`;
  const filePath = path.join(langDir, fileName);
  fs.writeFileSync(filePath, code);
  try {
    const dockerImage = getDockerImageForLanguage(language);

    let runCommand = '';
    if (config.compileCmd) {
      runCommand = `${config.compileCmd(`/app/${fileName}`)} && ${config.runCmd(
        `/app/${fileName}`
      )}`;
    } else {
      runCommand = config.runCmd(`/app/${fileName}`);
    }

    const dockerCmd = getDockerRunCommand(dockerImage, langDir, runCommand, language);

    const result = await runDockerCommand(dockerCmd, stdin);

    if (language === 'typescript' && result.stderr) {
      result.stderr = result.stderr.split('\n')
        .filter(line => !line.includes('.js') && !line.includes('Done in'))
        .join('\n')
        .trim();
    }

    cleanDirectory(langDir);
    return result;
  } catch (error: any) {
    cleanDirectory(langDir);

    if (error instanceof CodeExecutionError) {
      let userFriendlyError = sanitizeErrorMessage(error.message);
      if (error.exitCode === 124) {
        userFriendlyError = 'Execution timed out';
        error.stderr = 'Execution timed out';
      }
      if (error.exitCode === 137) {
        userFriendlyError = 'resource limit exceeded.';
        error.stderr = 'resource limit exceeded.';
      }
      if (error.exitCode === 139) {
        userFriendlyError = 'Segmentation fault';
        error.stderr = 'Segmentation fault';
      }

      if (language === 'typescript' && error.stderr) {
        error.stderr = error.stderr.split('\n')
          .filter(line => !line.includes('.js') && !line.includes('Done in'))
          .join('\n')
          .trim();
      }

      return {
        stdout: error.stdout,
        stderr: error.stderr,
        error: userFriendlyError
      };
    } else {
      const sanitizedError = sanitizeErrorMessage(error.message);
      throw new Error(sanitizedError);
    }
  }
}

function runDockerCommand(
  command: string,
  stdin: string
): Promise<{ stdout: string; stderr: string; timedOut?: boolean }> {
  return new Promise((resolve, reject) => {
    const process = exec(
      command,
      {
        maxBuffer: 1024 * 1024,
        timeout: 15000,
      },
      (error, stdout, stderr) => {
        const exitCode = error?.code;
        if (error) {
          const timedOut = error.killed;
          reject(new CodeExecutionError(error.message, stdout, stderr, timedOut, error.code));
        } else {
          resolve({ stdout, stderr });
        }
      }
    );

    if (stdin) {
      process.stdin?.write(stdin);
    }
    process.stdin?.end();
  });
}

function cleanDirectory(directory: string) {
  try {
    const files = fs.readdirSync(directory);
    for (const file of files) {
      const filePath = path.join(directory, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error: any) {
        // 如果是权限错误，则记录但不中断执行
        if (error.code === 'EPERM') {
          console.warn(`Warning: Permission denied while deleting ${filePath}`);
          continue;
        }
        throw error;
      }
    }
  } catch (error) {
    console.error('Error cleaning directory:', error);
    // 不抛出错误，让程序继续执行
  }
}
