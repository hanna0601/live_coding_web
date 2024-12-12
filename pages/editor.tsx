import React, { useState } from 'react';
import CodeEditor from './component/codeEditor';
import Navbar from './Navbar';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { javascript } from '@codemirror/lang-javascript';

interface LanguageInfo {
  name: string;
  value: string;
  compileCmd?: string;
  runCmd: string;
  memoryLimit: string;
  extension: string;
}

const helloWorldExamples: { [key: string]: string } = {
  python3: 'print("Hello, World!")',
  node: 'console.log("Hello, World!");',
  typescript: 'console.log("Hello, World!");',
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  csharp: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
  ruby: 'puts "Hello, World!"',
  php: '<?php\necho "Hello, World!";',
  swift: 'print("Hello, World!")',
  rust: 'fn main() {\n    println!("Hello, World!");\n}',
  scala: 'object Main extends App {\n    println("Hello, World!")\n}'
};

const languages = [
  { name: 'Python 3', value: 'python3' },
  { name: 'JavaScript', value: 'javascript' },
  { name: 'TypeScript', value: 'typescript' },
  { name: 'Java', value: 'java' },
  { name: 'C', value: 'c' },
  { name: 'C++', value: 'cpp' },
  { name: 'C#', value: 'csharp' },
  { name: 'Ruby', value: 'ruby' },
  { name: 'PHP', value: 'php' },
  { name: 'Swift', value: 'swift' },
  { name: 'Rust', value: 'rust' },
  { name: 'Scala', value: 'scala' },
];

const languageExecutionMap: { [key: string]: string } = {
  javascript: 'javascript',
  python3: 'python3',
  typescript: 'typescript',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  ruby: 'ruby',
  php: 'php',
  swift: 'swift',
  rust: 'rust',
  scala: 'scala'
};

const languagesInfo: LanguageInfo[] = [
  {
    name: 'Python 3',
    value: 'python3',
    runCmd: 'python3 file.py',
    memoryLimit: '32MB',
    extension: '.py'
  },
  {
    name: 'JavaScript',
    value: 'node',
    runCmd: 'node file.js',
    memoryLimit: '32MB',
    extension: '.js'
  },
  {
    name: 'TypeScript',
    value: 'typescript',
    compileCmd: 'esbuild file.ts --outfile=file.js',
    runCmd: 'node file.js',
    memoryLimit: '64MB',
    extension: '.ts'
  },
  {
    name: 'Java',
    value: 'java',
    compileCmd: 'javac Main.java',
    runCmd: 'java Main',
    memoryLimit: '64MB',
    extension: '.java'
  },
  {
    name: 'C',
    value: 'c',
    compileCmd: 'gcc file.c -o program',
    runCmd: './program',
    memoryLimit: '32MB',
    extension: '.c'
  },
  {
    name: 'C++',
    value: 'cpp',
    compileCmd: 'g++ file.cpp -o program -std=c++17',
    runCmd: './program',
    memoryLimit: '32MB',
    extension: '.cpp'
  },
  {
    name: 'C#',
    value: 'csharp',
    compileCmd: 'mcs file.cs -out:program.exe',
    runCmd: 'mono program.exe',
    memoryLimit: '64MB',
    extension: '.cs'
  },
  {
    name: 'Ruby',
    value: 'ruby',
    runCmd: 'ruby file.rb',
    memoryLimit: '32MB',
    extension: '.rb'
  },
  {
    name: 'PHP',
    value: 'php',
    runCmd: 'php file.php',
    memoryLimit: '32MB',
    extension: '.php'
  },
  {
    name: 'Swift',
    value: 'swift',
    runCmd: 'swift file.swift',
    memoryLimit: '32MB',
    extension: '.swift'
  },
  {
    name: 'Rust',
    value: 'rust',
    compileCmd: 'rustc file.rs',
    runCmd: './file',
    memoryLimit: '32MB',
    extension: '.rs'
  },
  {
    name: 'Scala',
    value: 'scala',
    compileCmd: 'scalac file.scala',
    runCmd: 'scala Main',
    memoryLimit: '96MB',
    extension: '.scala'
  }
];

const EditorPage = () => {
  const [language, setLanguage] = useState('python3');
  const [code, setCode] = useState(helloWorldExamples['python3']);
  const [stdin, setStdin] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(helloWorldExamples[newLanguage] || '// Enter your code here');
    setStdout('');
    setStderr('');
  };

  const LanguageSelector = () => {
    return (
      <div className="border-b border-foreground/10" style={{ backgroundColor: 'var(--editor-background)' }}>
      <div className="flex items-center gap-2 p-3">
        <div className="relative inline-block w-48">
          <select
            id="language"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full appearance-none text-foreground px-4 py-2 pr-8 rounded-md 
                     border border-foreground/20 hover:border-foreground/30 
                     focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent
                     transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--editor-background)' }}
          >
            {languagesInfo.map((lang) => (
              <option 
                key={lang.value} 
                value={lang.value}
                className="text-foreground"
                style={{ backgroundColor: 'var(--editor-background)' }}
              >
                {lang.name}
              </option>
            ))}
          </select>
            {/* 下拉箭头图标 */}
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg 
                className="w-4 h-4 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* 信息提示图标和弹出框 */}
          <div className="relative group">
            <div className="w-6 h-6 flex items-center justify-center rounded-full 
                          border border-gray-500 text-gray-400 cursor-help 
                          hover:border-gray-400 hover:text-gray-300 transition-colors">
              <span>?</span>
            </div>
            
            {/* 提示框内容 */}
            <div className="absolute left-0 mt-2 w-80 px-4 py-3 
     rounded-lg shadow-lg border border-foreground/10
     invisible group-hover:visible z-50 
     transition-all duration-200 opacity-0 group-hover:opacity-100"
     style={{ backgroundColor: 'var(--editor-background)' }}>
              {(() => {
                const currentLang = languagesInfo.find(l => l.value === language);
                return (
                  <div className="text-sm text-foreground">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{currentLang?.name}</p>
                      <span className="text-muted">{currentLang?.extension}</span>
                    </div>
                    {currentLang?.compileCmd && (
                      <div className="mb-2">
                        <p className="text-muted mb-1">Compile Command:</p>
                        <code className="block px-2 py-1 rounded text-xs overflow-x-auto"
                              style={{ backgroundColor: 'var(--completion-selected-background)' }}>
                          {currentLang.compileCmd}
                        </code>
                      </div>
                    )}
                    <div className="mb-2">
                      <p className="text-muted mb-1">Run Command:</p>
                      <code className="block px-2 py-1 rounded text-xs overflow-x-auto"
                            style={{ backgroundColor: 'var(--completion-selected-background)' }}>
                        {currentLang?.runCmd}
                      </code>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-foreground/10">
                      <span className="text-muted">Memory Limit:</span>
                      <span className="font-mono text-foreground">{currentLang?.memoryLimit}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: languageExecutionMap[language] || language,
          code,
          stdin,
        }),
      });
      const result = await response.json();
      setStdout(result.stdout);
      setStderr(result.stderr);
    } catch (error) {
      setStderr('An error occurred while running the code');
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setStdin('');
    setStdout('');
    setStderr('');
  };

  return (
<div className="flex flex-col h-screen bg-gradient-to-br from-background to-secondary">
  <Navbar/>
  <div className="flex flex-1 p-4 gap-4">
    {/* Left side - Code Editor Section */}
    <div className="w-3/5 flex flex-col rounded-lg overflow-hidden border border-foreground/10">
      {/* Language selector header */}
      <LanguageSelector />
      {/* Code editor */}
      <div className="flex-1" style={{ backgroundColor: 'var(--editor-background)' }}>
        <CodeEditor value={code} onChange={setCode} language={language} />
          </div>
        </div>
  
        {/* Right side - Input/Output Section */}
        <div className="w-2/5 flex flex-col gap-4">
          {/* Run button and status section */}
          <div className="flex items-center gap-3">
            <button 
              className="bg-accent hover:bg-accent/90 text-white py-2.5 px-6 rounded-md font-medium transition-colors w-fit disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={runCode}
              disabled={isRunning}
            >
              Run Code
            </button>
            <button
              className="bg-gray-300 hover:bg-muted/80 text-black py-2.5 px-6 rounded-md font-medium transition-colors w-fit"
              onClick={clearOutput}
            >
              Clear
            </button>
            {isRunning && (
              <div className="flex items-center gap-2 text-gray-200">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-transparent rounded-full animate-spin"/>
                <span className="text-sm">Running...</span>
              </div>
            )}
          </div>
          {/* Input section */}
          <div className="flex flex-col h-1/3 rounded-lg border border-foreground/10 overflow-hidden">
  <div className="p-2 border-b border-foreground/10" style={{ backgroundColor: 'var(--editor-background)' }}>
    <h3 className="text-foreground font-medium">Input</h3>
  </div>
  <textarea
    className="flex-1 text-foreground p-3 resize-none focus:outline-none"
    style={{ backgroundColor: 'var(--editor-background)' }}
    placeholder="Standard Input (stdin)"
    value={stdin}
    onChange={(e) => setStdin(e.target.value)}
  />
</div>

{/* Output section */}
<div className="flex flex-col flex-1 rounded-lg border border-foreground/10 overflow-hidden">
  <div className="p-2 border-b border-foreground/10" style={{ backgroundColor: 'var(--editor-background)' }}>
    <h3 className="text-foreground font-medium">Output</h3>
  </div>
  <div className="flex-1 p-3 overflow-auto" style={{ backgroundColor: 'var(--editor-background)' }}>
    {stdout && (
      <div className="mb-4">
        <pre className="text-foreground font-mono whitespace-pre-wrap">{stdout}</pre>
      </div>
    )}
    {stderr && (
      <div>
        <pre className="text-red-400 font-mono whitespace-pre-wrap">{stderr}</pre>
      </div>
    )}
  </div>
</div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;