import React, { useEffect, useState } from 'react';
import Layout from './component/layout'; // Update with your actual layout component path
import Link from 'next/link';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';

interface Template {
  id: number;
  title: string;
  explanation: string;
  codeContent: string;
  tags: { id: number; name: string }[];
  language: string;
}

const MyTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const templatesPerPage = 9;

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Unauthorized. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/templates/mytemplates?page=${currentPage}&limit=${templatesPerPage}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTemplates(data.templates);
      setTotalTemplates(data.total);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch templates.');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized. Please log in.');
      return;
    }

    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }

      // Update the template list after deletion
      setTemplates((prevTemplates) => prevTemplates.filter((template) => template.id !== templateId));
      setTotalTemplates((prevTotal) => prevTotal - 1);
    } catch (error: any) {
      setError(error.message || 'Failed to delete template.');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(totalTemplates / templatesPerPage)) {
      setCurrentPage(newPage);
    }
  };

  const totalPages = Math.ceil(totalTemplates / templatesPerPage);

  return (
    <Layout>
      <div className="min-h-screen text-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Templates</h1>
          {loading && <p>Loading templates...</p>}
          {error && <p className="text-error">{error}</p>}
          {!loading && !error && templates.length === 0 && (
            <p className="text-muted">No templates found. Create one to get started!</p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-secondary p-4 rounded-lg shadow-lg hover:bg-secondary/90 transition"
              >
                <h3 className="text-xl font-semibold mb-2">
                  <Link href={`/templates/${template.id}`} legacyBehavior>
                    <a className="hover:underline text-accent">{template.title}</a>
                  </Link>
                </h3>
                <p className="text-muted mb-2">{template.explanation}</p>
                <p className="text-muted mb-2">Language: {template.language}</p>
                <div className="text-muted mb-2">
                  {template.tags.map((tag) => (
                    <span key={tag.id} className="bg-accent text-white px-2 py-1 rounded-md mr-2">
                      {tag.name}
                    </span>
                  )) || <span>No tags</span>}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-error/90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="pagination mt-6 flex justify-center items-center space-x-2">
            <button
              className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FaAngleLeft />
            </button>
            <span className="text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaAngleRight />
            </button>
            <button
              className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyTemplates;