import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './../Navbar';
import CodeEditor from './../component/codeEditor';
import { useAuth } from './../context/useAuth';

interface Template {
  id: number;
  title: string;
  explanation: string;
  codeContent: string;
  language: string;
  tags: { name: string }[];
  authorID: number;
}

const languages = [
  { name: 'Python 3', value: 'python3' },
  { name: 'JavaScript', value: 'node' },
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

const TemplateEditor = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;

  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [stdin, setStdin] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true); // Update state
    }   

    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Template not found');
          } else {
            setError('Failed to fetch template details');
          }
          return;
        }

        const data = await response.json();
        setTemplate(data?.data || null);
        setCode(data?.data?.codeContent || '');
        setLanguage(data?.data?.language || '');
        setTitle(data?.data?.title || '');
        setExplanation(data?.data?.explanation || '');
        setTags(data?.data?.tags?.map((tag: { name: string }) => tag.name) || []); // Extract tag names
      } catch (error) {
        console.error('Error fetching template details:', error);
        setError('An error occurred while fetching template details');
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const runCode = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
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

  const getLanguageName = (langValue: string) => {
    const match = languages.find((lang) => lang.value === langValue);
    return match ? match.name : langValue; // Fallback to the original value if no match is found
  };

  const IsAuthor = (user?.id == template?.authorId);

  const clearOutput = () => {
    setStdin('');
    setStdout('');
    setStderr('');
  };

  const saveTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to update a template.');
      }

      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: title,
          explanation: explanation || '', // Preserve the existing explanation
          tags: tags,
          codeContent: code, // Save the updated code from the editor
          language,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save the template');
      }
  
      alert('Template saved successfully!');
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert(error.message || 'An unexpected error occurred');
    }
  }; 
  
  const saveForkedTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in to fork a template.');
        return;
      }
  
      const forkedTemplateData = {
        title: title,
        explanation: explanation || '',
        tags: tags,
        codeContent: code,
        language: language,
        forkFromId: template?.id || 0, // Use the current template's ID
      };
  
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(forkedTemplateData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save forked template');
      }
  
      alert('Forked template saved successfully!');
      router.push('/my-templates');
    } catch (error: any) {
      console.error('Error saving forked template:', error);
      alert(error.message || 'An unexpected error occurred');
    }
  };  

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!template) return <p>No template found</p>;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-secondary">
      <Navbar isLoggedIn={false} />
      {/* Template Title, Explanation, and Tags */}
      <div className="px-6 py-2 bg-secondary border-b border-border">
        {/* Editable Title */}
        <input
          className="w-8/12 text-2xl font-bold text-foreground bg-transparent border-b border-muted focus:outline-none"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
  
        {/* Editable Description */}
        <textarea
          className="text-muted mt-2 bg-transparent border-b border-muted w-full focus:outline-none"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={1}
        />
  
        <label htmlFor="tags" className="text-foreground font-medium">
          Tags (comma-separated):
        </label>
        <input
          id="tags"
          type="text"
          className="w-4/12 bg-secondary text-foreground p-2 border border-muted rounded focus:outline-none"
          value={tags.join(',')}
          onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()))}
          placeholder="Enter tags separated by commas"
        />

        {/* Fork Link */}
        {template.forkFromId && (
          <span className="ml-96">
            Fork from: 
            <a
              href={`/templates/${template.forkFromId}`}
              className="text-muted text-sm hover:underline ml-1"
            >
              Template {template.forkFromId}
            </a>
          </span>
        )}
      </div>
  
      <div className="flex flex-1 p-4 gap-4">
        {/* Left side - Code Editor Section */}
        <div className="w-3/5 flex flex-col rounded-lg overflow-hidden border border-foreground/10">
          {/* Language display */}
          <div className="bg-secondary p-3 border-b border-border">
            <p className="text-foreground">
              <strong>Language:</strong> {getLanguageName(language)}
            </p>
          </div>
  
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
            {isLoggedIn && IsAuthor && (
              <button
                className="bg-accent hover:bg-accent/90 text-white py-2.5 px-6 rounded-md font-medium transition-colors w-fit"
                onClick={saveTemplate}
              >
                Save
              </button>
            )}
            {isLoggedIn && (
              <button
                className="bg-accent hover:bg-accent/90 text-white py-2.5 px-6 rounded-md font-medium transition-colors w-fit"
                onClick={saveForkedTemplate}
              >
                Fork
              </button>
            )}
            {isRunning && (
              <div className="flex items-center gap-2 text-foreground">
                <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
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

export default TemplateEditor;
