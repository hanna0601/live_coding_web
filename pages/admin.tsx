import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from './context/useAuth';
import Layout from './component/layout';
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from 'react-icons/fa';

const AdminPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postPage, setPostPage] = useState(1);
  const [commentPage, setCommentPage] = useState(1);
  const [postTotalPages, setPostTotalPages] = useState(1);
  const [commentTotalPages, setCommentTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchData = async () => {
      try {
        const postResponse = await fetch(`/api/admin/sorted?type=posts&page=${postPage}&limit=${itemsPerPage}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        const commentResponse = await fetch(`/api/admin/sorted?type=comments&page=${commentPage}&limit=${itemsPerPage}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (!postResponse.ok || !commentResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const postsData = await postResponse.json();
        const commentsData = await commentResponse.json();

        setPosts(postsData || []);
        setComments(commentsData || []);
        setPostTotalPages(Math.ceil((postsData.total || 0) / itemsPerPage));
        setCommentTotalPages(Math.ceil((commentsData.total || 0) / itemsPerPage));
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, postPage, commentPage]);

  const handleHideContent = async (contentId: number, contentType: 'BlogPost' | 'Comment') => {
    try {
      const response = await fetch('/api/admin/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ contentId, contentType }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to hide content');
      }

      alert('Content hidden successfully');
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
        <h1 className="text-3xl font-extrabold mb-6 text-accent">Admin Dashboard</h1>
        
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => router.push('/admin/reportedPosts')}
            className="bg-accent text-white px-6 py-3 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-md"
          >
            Manage Posts
          </button>
          <button
            onClick={() => router.push('/admin/reportedComments')}
            className="bg-accent text-white px-6 py-3 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-md"
          >
            Manage Comments
          </button>
        </div>

        {/* Add more admin functionalities here */}
      </div>
    </Layout>
  );
};

export default AdminPage;

