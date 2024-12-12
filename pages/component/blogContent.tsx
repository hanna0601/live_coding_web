const PostContent = ({ title, description, content }: { title: string; description: string; content: string }) => (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-blue">{title}</h1>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="prose prose-lg mb-8">
        <p>{content}</p>
      </div>
    </div>
  );
  
  export default PostContent;
  