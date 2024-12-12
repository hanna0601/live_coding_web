import React, { useEffect, useState } from 'react';
import Layout from './component/layout'; // Update with your actual layout component path
import Link from 'next/link';
import {
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaEyeSlash
} from 'react-icons/fa';

interface Post {
  id: number;
  title: string;
  description: string;
  author: { id: number; firstName: string; lastName: string };
  tags: { id: number; name: string }[];
  isHidden: boolean;
}

const MyPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const postsPerPage = 9;

  const fetchPosts = async () => {
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
        `/api/posts/myposts?page=${currentPage}&limit=${postsPerPage}`,
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
      setPosts(data.posts);
      setTotalPosts(data.total);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch posts.');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized. Please log in.');
      return;
    }

    try {
      const response = await fetch(`/api/posts/modify/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete post: ${response.statusText}`);
      }

      // Update the post list after deletion
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      setTotalPosts((prevTotal) => prevTotal - 1);
    } catch (error: any) {
      setError(error.message || 'Failed to delete post.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= Math.ceil(totalPosts / postsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen text-foreground p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Posts</h1>
          {loading && <p>Loading posts...</p>}
          {error && <p className="text-error">{error}</p>}
          {!loading && !error && posts.length === 0 && (
            <p className="text-muted">No posts found. Create one to get started!</p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-secondary p-4 rounded-lg shadow-lg hover:bg-secondary/90 transition">
                <h3 className="text-xl font-semibold mb-2">
                  <Link href={`/blog/${post.id}`} legacyBehavior>
                    <a className="hover:underline text-accent">{post.title}</a>
                  </Link>
                </h3>
                <p className="text-muted mb-2">{post.description}</p>
                <div className="text-muted mb-2">
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="bg-accent text-white px-2 py-1 rounded-md mr-2">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-right gap-4">
                  {post.isHidden ? (
                    <div className="flex gap-2 text-red-600">
                      <FaEyeSlash className="text-red-600 h-5 w-5 mr-auto" title="Hidden" />
                      Hidden, You cannot edit
                    </div>
                  ) : (
                    <div>
                      <Link href={`/edit-blog?id=${post.id}`}>
                        <button className="px-4 py-2 bg-accent text-white rounded-md hover:bg-error/90">
                          Edit Post
                        </button>
                      </Link>
                    </div>
                  )}
                  <button
                    onClick={() => deletePost(post.id)}
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
    Page {currentPage} of {Math.ceil(totalPosts / postsPerPage)}
  </span>
  <button
    className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
    onClick={() => handlePageChange(currentPage + 1)}
    disabled={currentPage === Math.ceil(totalPosts / postsPerPage)}
  >
    <FaAngleRight />
  </button>
  <button
    className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
    onClick={() => handlePageChange(Math.ceil(totalPosts / postsPerPage))}
    disabled={currentPage === Math.ceil(totalPosts / postsPerPage)}
  >
    <FaAngleDoubleRight />
  </button>
</div>

        </div>
      </div>
    </Layout>
  );
};

export default MyPosts;