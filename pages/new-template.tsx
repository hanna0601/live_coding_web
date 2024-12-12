import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import CodeEditor from './component/codeEditor';

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

const NewTemplate = () => {
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [codeContent, setCodeContent] = useState('');
  const [language, setLanguage] = useState('python3');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create a template.');
      setShowPopup(true);
      return;
    }

    const payload = {
      title,
      explanation,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      codeContent,
      language,    
    };

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error) {
          setError(result.error);
          setShowPopup(true);
        } else {
          setError('Failed to save template.');
          setShowPopup(true);
        }
        return;
      }

      alert('Template created successfully!');
      router.push('/templates');
    } catch (error) {
      setError('An error occurred while saving the template.');
      setShowPopup(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary text-foreground">
      <Navbar isLoggedIn={true} />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Create New Template</h1>
  
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-muted font-semibold block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
              placeholder="Enter template title"
            />
          </div>
  
          {/* Explanation */}
          <div>
            <label className="text-muted font-semibold block mb-2">Explanation</label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
              placeholder="Enter a brief explanation"
              rows={4}
            />
          </div>
  
          {/* Language */}
          <div>
            <label className="text-muted font-semibold block mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
  
          {/* Code Editor */}
          <div>
            <label className="text-muted font-semibold block mb-2">Code</label>
            <div className="bg-secondary border border-muted rounded-md">
              <CodeEditor value={codeContent} onChange={setCodeContent} language={language} />
            </div>
          </div>
  
          {/* Tags */}
          <div>
            <label className="text-muted font-semibold block mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
              placeholder="Enter tags, separated by commas"
            />
          </div>
        </div>
  
        {/* Save Button */}
        <div className="mt-8">
          <button
            onClick={handleSave}
            className="bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-md"
          >
            Save Template
          </button>
        </div>
      </div>
  
      {/* Error Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/50">
          <div className="bg-secondary p-6 rounded-md text-center max-w-sm w-full">
            <h2 className="text-xl font-semibold text-foreground mb-4">Error</h2>
            <p className="text-muted mb-6">{error}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-error/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );  
};

export default NewTemplate;
