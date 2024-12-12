// src/middleware/codeExecutor/utils.ts

export class CodeExecutionError extends Error {
  stdout: string;
  stderr: string;
  timedOut: any;
  exitCode: any;

  constructor(message: string, stdout: string, stderr: string, timedOut: any, exitCode: any) {
    super(message);
    this.name = 'CodeExecutionError';
    this.stdout = stdout;
    this.stderr = stderr;
    this.timedOut = timedOut;
    this.exitCode = exitCode;
  }
}

export function sanitizeErrorMessage(message: string): string {
  // remove file path, version info, etc.
  message = message.replace(/\/.*?\/([^\/\s]+):/g, '$1:');
  message = message.replace(/\(.*?\/([^\/\s]+)\)/g, '($1)');
  message = message.replace(/at\s+.*?\/([^\/\s]+):/g, 'at $1:');
  message = message.replace(/Node\.js v\d+\.\d+\.\d+/g, '');
  return message.trim();
}
