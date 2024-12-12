import React from 'react';

interface PostContentProps {
  title: string;
  description: string;
  content: string;
}

const PostContent: React.FC<PostContentProps> = ({ title, description, content }) => (
  <div className="bg-gray-800 p-6 rounded-md shadow-md hover:shadow-lg transition">
    <h1 className="text-3xl font-bold text-white mb-4 text-blue">{title}</h1>
    <p className="text-gray-400 mb-4">{description}</p>
    <div className="prose prose-invert text-gray-300">{content}</div>
    <p className="text-gray-400 mt-4">By </p>
  </div>
);

export default PostContent;
