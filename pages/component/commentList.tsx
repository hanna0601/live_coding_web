import React, { useState } from 'react';
import { FaThumbsUp, FaThumbsDown, FaReply, FaFlag, FaEyeSlash } from 'react-icons/fa';
import Image from 'next/image';
const defaultAvatarUrl = '/uploads/avatars/hacker.png';

interface Comment {
  id: number;
  content: string;
  author: { firstName: string; lastName: string; avatarUrl: string };
  createdAt: string;
  upvotes: number;
  downvotes: number;
  parentId?: number;
  isHidden: boolean;
  avatarUrl: string;
}

interface CommentListProps {
  comments: Comment[];
  onVote: (commentId: number, voteType: 'upvote' | 'downvote') => void;
  onReply: (commentId: number, replyContent: string) => void;
  onReport: (commentId: number) => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onVote, onReply, onReport }) => {
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});

  const handleReplyChange = (commentId: number, content: string) => {
    setReplyContent((prev) => ({ ...prev, [commentId]: content }));
  };

  const handleReplySubmit = (commentId: number) => {
    if (replyContent[commentId]) {
      onReply(commentId, replyContent[commentId]);
      setReplyContent((prev) => {
        const updated = { ...prev };
        delete updated[commentId];
        return updated;
      });
    }
  };

  return (
    <ul className="space-y-4">
      {comments.map((comment) => (
        <li key={comment.id} className="bg-secondary p-4 rounded-md shadow-md hover:shadow-lg transition">
          {comment.isHidden && (
            <div className="flex items-center text-red-300 mb-2">
              <FaEyeSlash className="mr-2" title="Hidden" />
              <p>This comment is hidden.</p>
            </div>
          )}

          <div className="flex items-center mb-4">
            <div className="relative w-12 h-12 mr-4">
              <Image
                src={comment.author.avatarUrl || defaultAvatarUrl}
                alt={`${comment.author.firstName} ${comment.author.lastName}'s avatar`}
                layout="fill"
                objectFit="cover"
                className="rounded-full border-2 border-accent shadow-lg"
              />
            </div>
            <div className="flex flex-col">
              <p className="font-bold text-lg text-accent">
                {comment.author.firstName} {comment.author.lastName}
              </p>
              <p className="text-sm text-muted">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <p className="text-foreground mb-2">{comment.content || 'No content provided.'}</p>
          <div className="flex gap-4 text-muted text-sm">
            <span className="flex items-center">
              <FaThumbsUp
                className="cursor-pointer text-green-300 hover:text-green-500"
                onClick={() => onVote(comment.id, 'upvote')}
              />
              <span className="ml-1">{comment.upvotes}</span>
            </span>
            <span className="flex items-center">
              <FaThumbsDown
                className="cursor-pointer text-red-300 hover:text-red-500"
                onClick={() => onVote(comment.id, 'downvote')}
              />
              <span className="ml-1">{comment.downvotes}</span>
            </span>
            <span className="flex items-center">
              <FaReply
                className="cursor-pointer text-accent hover:text-blue-500"
                onClick={() => setReplyContent((prev) => ({ ...prev, [comment.id]: `@${comment.author.firstName} ${comment.author.lastName} ` }))}
              />
            </span>
            <span className="flex items-center">
              <FaFlag
                className="cursor-pointer text-muted hover:text-gray-500"
                onClick={() => onReport(comment.id)}
              />
            </span>
          </div>
          {replyContent[comment.id] !== undefined && (
            <div className="mt-2">
              <textarea
                className="w-full border rounded p-2 bg-editor-background text-editor-foreground"
                value={replyContent[comment.id]}
                onChange={(e) => handleReplyChange(comment.id, e.target.value)}
              />
              <button
                className="mt-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => handleReplySubmit(comment.id)}
              >
                Reply
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default CommentList;
