import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../component/layout';
import CommentList from '../component/commentList';
import CommentForm from '../component/commentForm';
import ReactMarkdown from 'react-markdown';

import { FaThumbsUp, FaThumbsDown, FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight, FaFlag, FaEyeSlash } from 'react-icons/fa';

interface BlogPost {
  id: number;
  title: string;
  description: string;
  content: string;
  tags: { name: string }[];
  upvotes: number;
  downvotes: number;
  isHidden: boolean;
}

interface Comment {
  id: number;
  content: string;
  author: { firstName: string; lastName: string};
  createdAt: string;
  upvotes: number;
  downvotes: number;
  replies: Comment[];
  isHidden: boolean;
  avatarUrl: string;
}

const BlogPostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [sortByVotes, setSortByVotes] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const postResponse = await fetch(`/api/posts/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!postResponse.ok) throw new Error('You are not authorized to view this post');
        const postData = await postResponse.json();
        setPost(postData);

        const commentsResponse = await fetch(`/api/comments?postId=${id}&page=${currentPage}&limit=${commentsPerPage}&sortBy=${sortByVotes ? 'total_votes' : ''}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        
        if (!commentsResponse.ok) throw new Error('Failed to fetch comments');
        const { comments, total } = await commentsResponse.json();
        setComments(comments);
        setTotalPages(Math.max(1, Math.ceil(total / commentsPerPage)));
      } catch (err: any) {
        console.error('Error fetching data:', err.message);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentPage, sortByVotes]);

  const handleSortToggle = () => {
    setSortByVotes((prev) => !prev);
    setCurrentPage(1);
  };

  const handleAddComment = async (newComment: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not logged in');
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment, postId: id }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to add comment');
      }

      const addedComment = await response.json();
      setComments((prevComments) => (Array.isArray(prevComments) ? [...prevComments, addedComment] : [addedComment]));
    } catch (err: any) {
      console.error('Error adding comment:', err.message);
      alert(err.message || 'An unexpected error occurred');
    }
  };

  const handleVote = async (commentId: number, voteType: 'upvote' | 'downvote') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not logged in');
      }
  
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to vote');
      }
  
      const updatedComment = await response.json();
      console.log('Updated comment from API:', updatedComment);
  
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, upvotes: updatedComment.upvotes, downvotes: updatedComment.downvotes }
            : comment
        )
      );
    } catch (err: any) {
      console.error('Error voting on comment:', err.message);
      alert(err.message || 'An unexpected error occurred');
    }
  };

  const handleReport = async (contentId: number, contentType: 'BlogPost' | 'Comment', explanation: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not logged in');
      }
  
      const confirmReport = window.confirm("Are you sure you want to report this content? This action cannot be undone.");
  if (!confirmReport) return;

      const response = await fetch('/api/reports/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contentId, contentType, explanation }),
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to report content');
      }
  
      alert('Report submitted successfully');
    } catch (err: any) {
      console.error('Error reporting content:', err.message);
      alert(err.message || 'An unexpected error occurred');
    }
  };

  
  const handlePostVote = async (voteType: 'upvote' | 'downvote') => {
    if (!post) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not logged in');
      }

      const response = await fetch(`/api/posts/${post.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voteType }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to vote on post');
      }

      const updatedPost = await response.json();
      setPost((prevPost) => (prevPost ? { ...prevPost, ...updatedPost } : null));
    } catch (err: any) {
      console.error('Error voting on post:', err.message);
      alert(err.message || 'An unexpected error occurred');
    }
  };

  const handleReply = async (parentId: number, replyContent: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not logged in');
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: replyContent, postId: id, parentId }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to add reply');
      }

      const addedReply = await response.json();
      setComments((prevComments) => (Array.isArray(prevComments) ? [...prevComments, addedReply] : [addedReply]));
    } catch (err: any) {
      console.error('Error adding reply:', err.message);
      alert(err.message || 'An unexpected error occurred');
    }
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  if (loading) return <p>Loading...</p>;

  console.log(post);

  return (
    <Layout>
      <div className="container mx-auto p-8 rounded-lg shadow-2xl" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        {error ? (
          <p className="text-red-500 text-center text-lg">{error}</p>
        ) : !post ? (
          <p className="text-center text-lg">Post not found.</p>
        ) : (
          <>
            {post.isHidden && (
              <div className="flex items-center text-red-300 mb-4">
                <FaEyeSlash className="h-5 w-5 mr-2" title="Hidden" />
                <p>This post is hidden.</p>
              </div>
            )}

            <div className="p-8 rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ background: 'var(--secondary)' }}>
              <h1 className="text-5xl font-extrabold mb-6" style={{ color: 'var(--accent)' }}>{post.title}</h1>
              <p className="mb-6" style={{ color: 'var(--muted)' }}>{post.description}</p>
              <div className="prose prose-invert" style={{ color: 'var(--foreground)' }}>
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
              <p className="mt-6 mb-6 text-sm italic" style={{ color: 'var(--muted)' }}>
                By <span className="font-semibold">{post.author.firstName} {post.author.lastName}</span>
              </p>

              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag.name} className="px-3 py-1 rounded-full shadow-md" style={{ background: 'var(--accent)', color: 'white' }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 items-center text-sm mb-8" style={{ color: 'var(--muted)' }}>
                <button
                  className="flex items-center hover:text-green-500 transition-colors duration-200"
                  onClick={() => handlePostVote('upvote')}
                  style={{ color: 'var(--accent)' }}
                >
                  <FaThumbsUp className="mr-1" />
                  {post.upvotes}
                </button>
                <button
                  className="flex items-center hover:text-red-500 transition-colors duration-200"
                  onClick={() => handlePostVote('downvote')}
                  style={{ color: 'var(--accent)' }}
                >
                  <FaThumbsDown className="mr-1" />
                  {post.downvotes}
                </button>
                <button
                  className="flex items-center hover:text-gray-500 transition-colors duration-200"
                  onClick={() => handleReport(post.id, 'BlogPost', 'Inappropriate content')}
                  style={{ color: 'var(--muted)' }}
                >
                  <FaFlag className="mr-1" />
                  Report
                </button>
              </div>
            </div>

            <div className="my-8">
              <h2 className="text-3xl font-bold mb-6">Comments</h2>
              <CommentForm onSubmit={handleAddComment} />
              <div className="flex justify-end mt-6 mb-6">
              <button
                onClick={handleSortToggle}
                className="bg-green-600 text-white px-5 py-2 rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-200"
              >
                {sortByVotes ? 'Clear Sort' : 'Sort by total votes'}
              </button>
            </div>
              <CommentList
                comments={comments || []}
                onVote={handleVote}
                onReply={handleReply}
                onReport={(commentId) => handleReport(commentId, 'Comment', 'Inappropriate content')}
              />
              <div className="flex justify-center mt-6 space-x-3">
                <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={handleFirstPage}
                  disabled={currentPage === 1}
                  title="First Page"
                >
                  <FaAngleDoubleLeft />
                </button>
                <button
                className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
                onClick={handlePreviousPage}
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
            onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  title="Next Page"
                >
                  <FaAngleRight />
                </button>
                <button
            className="bg-secondary text-muted px-3 py-2 rounded-md hover:bg-secondary/90 disabled:bg-secondary/80 disabled:cursor-not-allowed"
            onClick={handleLastPage}
                  disabled={currentPage === totalPages}
                  title="Last Page"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default BlogPostPage;
