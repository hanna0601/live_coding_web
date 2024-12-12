// src/middleware/codeExecutor/resourceLimits.ts

export const resourceLimits = (language: string) => ({
  cpuShares: '1',
  memory: language === 'scala' ? '96m' : getMemoryLimit(language),
  pidsLimit: 64,            // limit max number of processes to 32
  timeout: 12,               // limit CPU time to 8 seconds
});


const getMemoryLimit = (language: string): string => {
  // languages that need more memory
  const highMemoryLanguages = ['java', 'csharp', 'cs', 'c#', 'typescript'];
  return highMemoryLanguages.includes(language.toLowerCase()) ? '64m' : '32m';
};