// src/middleware/codeExecutor/languageConfigs.ts

import path from 'path';

export interface LanguageConfig {
  extension: string;
  compileCmd?: (filePath: string) => string;
  runCmd: (filePath: string) => string;
}

export const languageConfigs: { [key: string]: LanguageConfig } = {
  c: {
    extension: '.c',
    compileCmd: (filePath) => `gcc ${filePath} -o /app/Main`,
    runCmd: () => `/app/Main`,
  },
  cpp: {
    extension: '.cpp',
    compileCmd: (filePath) => `g++ ${filePath} -o /app/Main -std=c++17`,
    runCmd: () => `/app/Main`,
  },
  csharp: {
    extension: '.cs',
    compileCmd: (filePath) => `mcs ${filePath} -out:/app/Main.exe`,
    runCmd: () => `mono /app/Main.exe`,
  },
  java: {
    extension: '.java',
    compileCmd: (filePath) => `javac ${filePath}`,
    runCmd: (filePath) => `java ${path.basename(filePath, '.java')}`,
  },
  python3: {
    extension: '.py',
    runCmd: (filePath) => `python3 ${filePath}`,
  },
  node: {
    extension: '.js',
    runCmd: (filePath) => `node ${filePath}`,
  },
  typescript: {
    extension: '.ts',
    compileCmd: (filePath) => `esbuild ${filePath} --outfile=${filePath.replace('.ts', '.js')} --platform=node --target=node18`,
    runCmd: (filePath) => `node ${filePath.replace('.ts', '.js')}`,
  },
  php: {
    extension: '.php',
    runCmd: (filePath) => `php ${filePath}`,
  },
  swift: {
    extension: '.swift',
    runCmd: (filePath) => `swift ${filePath}`,
  },
  kotlin: {
    extension: '.kt',
    compileCmd: (filePath) => `kotlinc ${filePath} -include-runtime -d /app/Main.jar`,
    runCmd: () => `java -jar /app/Main.jar`,
  },
  ruby: {
    extension: '.rb',
    runCmd: (filePath) => `ruby ${filePath}`,
  },
  scala: {
    extension: '.scala',
    compileCmd: (filePath) => `scalac ${filePath}`,
    runCmd: () => `scala Main`,
  },
  rust: {
    extension: '.rs',
    compileCmd: (filePath) => `rustc ${filePath} -o /app/Main`,
    runCmd: () => `/app/Main`,
  },
  // 添加更多语言配置...
};
