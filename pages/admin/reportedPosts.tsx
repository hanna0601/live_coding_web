import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../component/layout';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';
import Link from 'next/link';

const ReportedPostsPage = () => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/sorted?page=${currentPage}&limit=${itemsPerPage}&type=posts`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch reported posts');
        const { results, total } = await response.json();
        setPosts(results || []);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleHide = async (contentId: number, contentType: 'BlogPost' | 'Comment') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not logged in');
      }

      const response = await fetch('/api/admin/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId, contentType }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to hide content');
      }

      alert('Content hidden successfully');
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== contentId));
    } catch (err: any) {
      console.error('Error hiding content:', err.message);
      alert(err.message || 'An unexpected error occurred');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <Layout>
      <div className="container mx-auto p-8 bg-gradient-to-r from-secondary to-background text-foreground rounded-lg shadow-2xl">
      <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push('/admin')}
            className="bg-accent text-white px-6 py-3 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-md"
          >
            Back to Admin Dashboard
          </button>
        </div>
        <h1 className="text-3xl font-extrabold mb-6 text-accent">Manage Blog Posts</h1>
        <ul className="list-none pl-0">
          {Array.isArray(posts) && posts.map((post: any) => (
            <li key={post.id} className="mb-4">
              <div className="bg-secondary p-6 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Post Title: {post.title}</h2>
                  <p className="text-sm text-muted">Username: {post.author.username}</p>
                  <p className="text-sm text-muted">Content: {post.content}</p>
                  <p className="text-sm text-muted">Reports: {post._count.reports}</p>
                  <p className="text-sm text-muted">Is Hidden: {post.isHidden ? 'Yes' : 'No'}</p>
                  <Link href={`/blog/${post.id}`} className="text-accent hover:underline">View Post</Link>
                </div>
                <button
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all duration-200"
                  onClick={() => handleHide(post.id, 'BlogPost')}
                >
                  Hide
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex justify-center mt-4 space-x-2">
          <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            title="First Page"
          >
            <FaAngleDoubleLeft />
          </button>
          <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            title="Previous Page"
          >
            <FaAngleLeft />
          </button>
          <span className="flex items-center p-2 text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            title="Next Page"
          >
            <FaAngleRight />
          </button>
          <button
            className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            title="Last Page"
          >
            <FaAngleDoubleRight />
          </button>
        </div>
       
      </div>
    </Layout>
  );
};

export default ReportedPostsPage;