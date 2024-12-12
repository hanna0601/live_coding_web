// src/middleware/codeExecutor/dockerManager.ts
import { resourceLimits } from './resourceLimits';

export function getDockerImageForLanguage(language: string): string {
  const images: { [key: string]: string } = {
    c: 'myrunner:c',
    cpp: 'myrunner:cpp',
    csharp: 'myrunner:csharp',
    java: 'myrunner:java',
    python3: 'myrunner:python3',
    node: 'myrunner:node',
    typescript: 'myrunner:typescript',
    php: 'myrunner:php',
    swift: 'myrunner:swift',
    kotlin: 'myrunner:kotlin',
    ruby: 'myrunner:ruby',
    scala: 'myrunner:scala',
    rust: 'myrunner:rust',
  };
  return images[language];
}

export function getDockerRunCommand(
  dockerImage: string,
  codeDir: string,
  runCommand: string,
  language: string
): string {
  const limit = resourceLimits(language);
  return `docker run --rm -i \
    --network none \
    --cpus="${limit.cpuShares}" \
    --memory="${limit.memory}" \
    --pids-limit ${limit.pidsLimit} \
    --security-opt no-new-privileges \
    -v "${codeDir}:/app" \
    ${dockerImage} \
    timeout ${limit.timeout}s sh -c "${runCommand}"`;
}

