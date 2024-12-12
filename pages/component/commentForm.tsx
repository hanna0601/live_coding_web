import React, { useState } from 'react';

interface CommentFormProps {
  onSubmit: (comment: string) => void;
  isAuthenticated: boolean; // Pass authentication state
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (comment.trim()) {
      onSubmit(comment); // Call the parent function
      setComment(''); // Clear the input field
    } else {
      alert('Comment cannot be empty');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        className="w-full p-2 rounded-md bg-secondary text-foreground placeholder-muted border border-border focus:outline-none focus:border-accent"
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      ></textarea>
      <button
        type="submit"
        className="mt-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition"
      >
        Submit
      </button>
    </form>
  );
};

export default CommentForm;
