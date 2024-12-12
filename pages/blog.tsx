import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from './component/layout';
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaEyeSlash
} from 'react-icons/fa';

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: { name: string }[];
  templates: { title: string }[];
  upvotes: number;
  downvotes: number;
  isHidden: boolean;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortByVotes, setSortByVotes] = useState(false);
  const postsPerPage = 9;
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    fetchPosts(currentPage, sortByVotes);
  }, [currentPage, sortByVotes]);

  const fetchPosts = async (page: number, sort: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = `/api/posts?page=${page}&limit=${postsPerPage}&sortBy=${sort ? 'total_votes' : ''}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch posts:', response.statusText);
        setPosts([]);
        return;
      }

      const { posts, total } = await response.json();
      setPosts(Array.isArray(posts) ? posts : []);
      setTotalPages(Math.ceil(total / postsPerPage));
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint = `/api/posts/search?searchQuery=${encodeURIComponent(
        search
      )}&page=${currentPage}&limit=${postsPerPage}&sortBy=${
        sortByVotes ? 'total_votes' : ''
      }`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        console.error('Failed to search posts:', response.statusText);
        setPosts([]);
        return;
      }

      const { posts, totalCount } = await response.json();
      setPosts(Array.isArray(posts) ? posts : []);
      setTotalPages(Math.ceil(totalCount / postsPerPage));
    } catch (error) {
      console.error('Error searching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortToggle = () => {
    const newSortByVotes = !sortByVotes;
    setSortByVotes(newSortByVotes);
    setCurrentPage(1);
    fetchPosts(1, newSortByVotes);
  };

  const handleFirstPage = () => setCurrentPage(1);
  const handleLastPage = () => setCurrentPage(totalPages);
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  if (loading)
    return (
      <div className="dark bg-gray-900 min-h-screen text-gray-300 flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );

    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background to-secondary text-foreground p-6">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <input
                type="text"
                placeholder="Search blog posts..."
                className="w-full p-2 rounded-md bg-secondary text-muted placeholder-muted focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={handleSearch}
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90"
              >
                Search
              </button>
            </div>
  
            {/* Actions */}
            <div className="flex gap-4 mb-6">
              {isLoggedIn && (
                <button
                  onClick={() => router.push('/new-post')}
                  className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90"
                >
                  Add New Post
                </button>
              )}
              <button
                onClick={handleSortToggle}
                className="bg-accent text-white px-4 py-2 rounded-md hover:bg-accent/90"
              >
                {sortByVotes ? 'Clear Sort' : 'Sort by Total Votes'}
              </button>
            </div>
  
            {/* Posts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.length ? (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-secondary p-4 rounded-md shadow-md hover:shadow-lg transition"
                  >
                    <h3 className="text-xl font-semibold mb-2">
                      <Link href={`/blog/${post.id}`} legacyBehavior>
                        <a className="hover:underline text-accent">{post.title}</a>
                      </Link>
                    </h3>
                    <p className="text-muted mb-4">{post.description}</p>
                    <div className="flex gap-2 flex-wrap mb-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-accent text-white text-sm px-2 py-1 rounded-md"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    {post.isHidden && (
                      <div className="flex gap-2">
                        <FaEyeSlash className="text-error h-5 w-5" title="Hidden" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted">No blog posts found</p>
              )}
            </div>
  
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={handleFirstPage}
                disabled={currentPage === 1}
              >
                <FaAngleDoubleLeft />
              </button>
              <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <FaAngleLeft />
              </button>
              <span className="text-muted">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <FaAngleRight />
              </button>
              <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={handleLastPage}
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

export default Blog;
