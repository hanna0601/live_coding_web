import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const comments = [];

  // Fetch existing users and blog posts
  const users = await prisma.user.findMany();
  const blogPosts = await prisma.blogPost.findMany();

  // Helper function to get random items
  const getRandomItems = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Create 50 comments
  for (let i = 1; i <= 50; i++) {
    const randomAuthor = users[Math.floor(Math.random() * users.length)];
    const randomPost = blogPosts[Math.floor(Math.random() * blogPosts.length)];

    // Determine if the comment will have a parent
    const parentComment = Math.random() > 0.5 && comments.length > 0
      ? comments[Math.floor(Math.random() * comments.length)]
      : null;

    // If it has a parent, ensure it belongs to the same post
    const postId = parentComment ? parentComment.postId : randomPost.id;

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: `This is comment ${i}${parentComment ? ` in reply to comment ${parentComment.id}` : ''}.`,
        author: { connect: { id: randomAuthor.id } },
        post: { connect: { id: postId } },
        parent: parentComment ? { connect: { id: parentComment.id } } : undefined, // Use `parent` instead of `parentId`
        upvotes: Math.floor(Math.random() * 50), // Random upvotes
        downvotes: Math.floor(Math.random() * 10), // Random downvotes
        isHidden: Math.random() > 0.9, // 10% chance of being hidden
      },
    });

    comments.push(comment);

    // Create votes for the comment
    const voters = getRandomItems(users, Math.floor(Math.random() * 10)); // Random number of voters
    for (const voter of voters) {
      await prisma.commentVote.create({
        data: {
          commentId: comment.id,
          userId: voter.id,
          voteType: Math.random() > 0.5 ? 'upvote' : 'downvote',
        },
      });
    }

    // Create reports for the comment (5% chance for each comment)
    if (Math.random() > 0.95) {
      const reporter = users[Math.floor(Math.random() * users.length)];
      await prisma.commentReport.create({
        data: {
          explanation: `This comment violates the guidelines.`,
          reporter: { connect: { id: reporter.id } },
          comment: { connect: { id: comment.id } },
          contentType: "Comment",
        },
      });
    }
  }

  console.log('✨ 50 Comments created successfully with relationships');
}

main()
  .catch((e) => {
    console.error('Error in comment creation script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
