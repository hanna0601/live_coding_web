import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import Layout from './component/layout';

const NewPost = () => {
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    templateIds: '',
  });
  const [templateIdInput, setTemplateIdInput] = useState(''); // Input for the template ID
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleAddPost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError('Title and content are required.');
      setShowModal(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to add a post.');
      setShowModal(true);
      return;
    }

    const payload = {
      title: newPost.title,
      description: newPost.description,
      content: newPost.content,
      tags: newPost.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      templateIds: newPost.templateIds.split(',').map((id) => parseInt(id.trim())).filter(Boolean),
    };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || 'Failed to add post.');
        setShowModal(true);
        return;
      }

      setSuccess('Post added successfully!');
      router.push('/blog');
    } catch (error) {
      setError('An error occurred while adding the post.');
      setShowModal(true);
    }
  };

  const handleInsertTemplate = async () => {
    const templateId = templateIdInput.trim();
    if (!templateId) {
      setError('Template ID is required.');
      setShowModal(true);
      return;
    }
  
    try {
      // Fetch the template data from the API
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        setError('Template not found.');
        setShowModal(true);
        return;
      }
  
      const { data } = await response.json();
  
      // Extract the title from the response
      const { title } = data;
  
      // Add Markdown link and update templateIds
      const templateLink = `/templates/${templateId}`;
      const markdownLink = `[${title}](${templateLink})`;
  
      setNewPost((prev) => ({
        ...prev,
        content: `${prev.content}\n\n${markdownLink}`,
        templateIds: [...new Set([...prev.templateIds.split(','), templateId])].join(','),
      }));
      setTemplateIdInput(''); // Clear the input field
    } catch (error) {
      setError('An error occurred while fetching the template.');
      setShowModal(true);
    }
  };
  

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Add New Blog Post</h1>
  
          {success && <p className="text-success mb-6">{success}</p>}
  
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-muted font-semibold block mb-2">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
  
            {/* Description */}
            <div>
              <label className="text-muted font-semibold block mb-2">Description</label>
              <textarea
                placeholder="Enter description"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={newPost.description}
                onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
                rows={3}
              />
            </div>
  
            {/* Content */}
            <div>
              <label className="text-muted font-semibold block mb-2">Content</label>
              <textarea
                placeholder="Content (Markdown supported)"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                style={{ minHeight: '150px', resize: 'vertical' }}
              />
            </div>
  
            {/* Template IDs */}
            <div>
              <label className="text-muted font-semibold block mb-2">Insert Template</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter template ID"
                  className="p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                  value={templateIdInput}
                  onChange={(e) => setTemplateIdInput(e.target.value)}
                />
                <button
                  onClick={handleInsertTemplate}
                  className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md"
                >
                  Insert Template
                </button>
              </div>
            </div>
  
            {/* Markdown Preview */}
            <div>
              <label className="text-muted font-semibold block mb-2">Markdown Preview</label>
              <div className="bg-secondary border border-muted rounded-md p-4 text-foreground">
                <ReactMarkdown>{newPost.content || 'Start typing to see the preview...'}</ReactMarkdown>
              </div>
            </div>
  
            {/* Tags */}
            <div>
              <label className="text-muted font-semibold block mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="Enter tags"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
            </div>
  
            {/* Submit Button */}
            <div className="mt-8">
              <button
                onClick={handleAddPost}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md"
              >
                Submit Post
              </button>
            </div>
          </div>
  
          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-background/50 flex items-center justify-center">
              <div className="bg-secondary p-6 rounded-md text-center max-w-sm w-full">
                <h2 className="text-xl font-semibold text-foreground mb-4">Error</h2>
                <p className="text-muted mb-6">{error}</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-error/90"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );  
};

export default NewPost;
