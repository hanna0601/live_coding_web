import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/router';
import Layout from './component/layout';

const EditBlog = () => {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState({
    title: '',
    description: '',
    content: '',
    tags: '',
    templateIds: '',
  });
  const [templateIdInput, setTemplateIdInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/posts/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setPost({
            title: data.title,
            description: data.description,
            content: data.content,
            tags: data.tags.map((tag: { name: string }) => tag.name).join(','), // Convert tags array to a string
            templateIds: data.templates.join(','),
          });
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to fetch post data.');
          setShowModal(true);
          setLoading(false);
        });
    }
  }, [id]);

  const handleSavePost = async () => {
    if (!post.title.trim() || !post.content.trim()) {
      setError('Title and content are required.');
      setShowModal(true);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to edit a post.');
      setShowModal(true);
      return;
    }

    const payload = {
      title: post.title,
      description: post.description,
      content: post.content,
      tags: post.tags.split(',').map((tag) => tag.trim()).filter(Boolean), // Ensure tags are sent as an array
      templates: post.templateIds.split(',').map((id) => parseInt(id.trim())).filter(Boolean),
    };

    try {
      const response = await fetch(`/api/posts/modify/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText || 'Failed to update post.');
        setShowModal(true);
        return;
      }

      setSuccess('Post updated successfully!');
      router.push('/my-posts');
    } catch (error) {
      setError('An error occurred while updating the post.');
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
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        setError('Template not found.');
        setShowModal(true);
        return;
      }

      const { data } = await response.json();
      const { title } = data;

      const templateLink = `/templates/${templateId}`;
      const markdownLink = `[${title}](${templateLink})`;

      setPost((prev) => ({
        ...prev,
        content: `${prev.content}\n\n${markdownLink}`,
        templateIds: [...new Set([...prev.templateIds.split(','), templateId])].join(','),
      }));
      setTemplateIdInput('');
    } catch (error) {
      setError('An error occurred while fetching the template.');
      setShowModal(true);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center text-muted">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary text-foreground p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Blog Post</h1>

          {success && <p className="text-success mb-6">{success}</p>}

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="text-muted font-semibold block mb-2">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-muted font-semibold block mb-2">Description</label>
              <textarea
                placeholder="Enter description"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={post.description}
                onChange={(e) => setPost({ ...post, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Content */}
            <div>
              <label className="text-muted font-semibold block mb-2">Content</label>
              <textarea
                placeholder="Content (Markdown supported)"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={post.content}
                onChange={(e) => setPost({ ...post, content: e.target.value })}
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
                <ReactMarkdown>{post.content || 'Start typing to see the preview...'}</ReactMarkdown>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-muted font-semibold block mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                placeholder="Enter tags"
                className="w-full p-3 bg-secondary text-foreground border border-muted rounded-md focus:outline-none"
                value={post.tags}
                onChange={(e) => setPost({ ...post, tags: e.target.value })}
              />
            </div>

            {/* Save Button */}
            <div className="mt-8">
              <button
                onClick={handleSavePost}
                className="bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-md"
              >
                Save Changes
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

export default EditBlog;
