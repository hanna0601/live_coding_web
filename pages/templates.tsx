import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from './component/layout';
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaEyeSlash
} from 'react-icons/fa';

interface Template {
  id: number;
  title: string;
  explanation: string;
  language: string;
  tags: { name: string }[];
  author: { firstName: string; lastName: string } | null;
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

const TemplatePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simulate user login status (replace with actual login check logic)
  useEffect(() => {
    const token = localStorage.getItem('token'); // Assuming a token is stored in localStorage
    setIsLoggedIn(!!token); // Set isLoggedIn to true if token exists
  }, []);

  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 9; // Matches the backend default limit

  const fetchTemplates = async (searchTriggered = false) => {
    setLoading(true);
  
    // Build the query string
    const queryParams = new URLSearchParams();
    if (searchTriggered) {
      if (search) queryParams.append('title', search);
      if (languageFilter) queryParams.append('language', languageFilter); // Use selected value
      if (tags.length > 0) queryParams.append('tags', tags.join(','));
    }
    queryParams.append('page', currentPage.toString());
    queryParams.append('limit', postsPerPage.toString());
  
    try {
      const response = await fetch(`/api/templates/public/?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      const data = await response.json();
  
      // Assuming the API response includes `data` and `totalCount`
      setTemplates(data.data || []);
      const totalItems = data.totalCount || 0; // Update this based on the backend implementation
      setTotalPages(Math.ceil(totalItems / postsPerPage));
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };
  

  // Fetch all templates on initial load
  useEffect(() => {
    fetchTemplates();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value && !tags.includes(value)) {
        setTags((prevTags) => [...prevTags, value]);
        e.currentTarget.value = '';
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchTemplates(true);
  };

    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary text-foreground p-6">
          <div className="max-w-6xl mx-auto">
            {/* Search and Filter Section */}
            <div className="search mb-6">
              <input
                type="text"
                placeholder="Search templates by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 rounded-md bg-secondary text-muted placeholder-muted focus:outline-none mb-4"
              />
  
              {/* Language Filter Dropdown */}
              <select
                value={languageFilter || ''}
                onChange={(e) => setLanguageFilter(e.target.value || null)}
                className="w-full p-2 rounded-md bg-secondary text-muted focus:outline-none mb-4"
              >
                <option value="">All Languages</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.name}
                  </option>
                ))}
              </select>
  
              {/* Tag Input Section */}
              <div className="tag-input mb-4">
                <input
                  type="text"
                  placeholder="Add tags and press Enter..."
                  onKeyDown={handleTagInput}
                  className="w-full p-2 rounded-md bg-secondary text-muted placeholder-muted focus:outline-none"
                />
                <div className="tags flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-accent text-background px-2 py-1 rounded-md flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => setTags(tags.filter((_, i) => i !== index))}
                        className="text-error hover:text-error/90"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
  
              {/* Search and Add Button Section */}
              <div className="search mb-6 flex gap-4">
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90"
                >
                  Search
                </button>
                {isLoggedIn && (
                  <Link href="/new-template">
                    <button className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90">
                      Add New Template
                    </button>
                  </Link>
                )}
              </div>
            </div>
  
            {/* Template List */}
            <div className="template-list grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <p className="col-span-full text-center">Loading templates...</p>
              ) : templates.length > 0 ? (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="template-item bg-secondary p-4 rounded-lg shadow-lg hover:shadow-xl transition"
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/templates/${template.id}`} legacyBehavior>
                        <a className="hover:underline text-accent">{template.title}</a>
                      </Link>
                    </h3>
                    <p className="text-muted mb-2">{template.explanation}</p>
                    <p className="text-muted mb-1">
                      Language:{' '}
                      {languages.find((lang) => lang.value === template.language)?.name || template.language}
                    </p>
                    <p className="text-muted mb-4">
                      Author:{' '}
                      {template.author
                        ? `${template.author.firstName} ${template.author.lastName}`
                        : 'Anonymous'}
                    </p>
                    <div className="text-muted mb-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-accent text-white px-2 py-1 rounded-md mr-2"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center">No templates found.</p>
              )}
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

export default TemplatePage;
