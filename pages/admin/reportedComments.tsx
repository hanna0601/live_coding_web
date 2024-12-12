import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../component/layout';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';
import Link from 'next/link';

interface Comment {
  id: number;
  author: {
    username: string;
  };
  content: string;
  _count: {
    reports: number;
  };
  isHidden: boolean;
  postId: number;
}

const ReportedCommentsPage = () => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/sorted?page=${currentPage}&limit=${itemsPerPage}&type=comments`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch reported comments');
        const { results, total } = await response.json();
        setComments(results || []);
        setTotalPages(Math.ceil(total / itemsPerPage));
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handleHide = async (contentId: number) => {
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
        body: JSON.stringify({ contentId, contentType: 'Comment' }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to hide content');
      }

      alert('Content hidden successfully');
      setComments((prevComments) => prevComments.filter((comment) => comment.id !== contentId));
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
        <h1 className="text-3xl font-extrabold mb-6 text-accent">Manage Comments</h1>
        <ul className="list-none pl-0">
          {Array.isArray(comments) && comments.map((comment: Comment) => (
            <li key={comment.id} className="mb-4">
              <div className="bg-secondary p-4 rounded shadow-lg flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-accent">Comment ID: {comment.id}</h2>
                  <p className="text-sm text-muted">Username: {comment.author.username}</p>
                  <p className="text-sm text-muted">Content: {comment.content}</p>
                  <p className="text-sm text-muted">Reports: {comment._count.reports}</p>
                  <p className="text-sm text-muted">Is Hidden: {comment.isHidden ? 'Yes' : 'No'}</p>
                  <Link href={`/blog/${comment.postId}`} className="text-accent hover:underline">View Post</Link>
                </div>
                <button
                  className="mt-2 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-all duration-200"
                  onClick={() => handleHide(comment.id)}
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

export default ReportedCommentsPage;