import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const blogPosts = [];

  // Fetch existing users, templates, and tags
  const users = await prisma.user.findMany();
  const templates = await prisma.template.findMany();
  const tags = await prisma.tag.findMany();

  // Helper function to get random items
  const getRandomItems = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  for (let i = 1; i <= 30; i++) {
    // Select a random user as the author
    const author = users[Math.floor(Math.random() * users.length)];

    // Select 1-3 random templates and 2-4 random tags for the blog post
    const randomTemplates = getRandomItems(templates, Math.ceil(Math.random() * 3));
    const randomTags = getRandomItems(tags, Math.ceil(Math.random() * 4));

    // Create blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title: `Blog Post ${i}: ${randomTags[0]?.name || 'Coding Tips'}`,
        description: `An insightful blog post about ${randomTags[0]?.name || 'coding'}.`,
        content: `This blog post dives deep into ${randomTags[0]?.name || 'programming'} techniques and best practices.`,
        author: { connect: { id: author.id } },
        tags: { connect: randomTags.map((tag) => ({ id: tag.id })) },
        templates: { connect: randomTemplates.map((template) => ({ id: template.id })) },
        upvotes: Math.floor(Math.random() * 100), // Random upvotes
        downvotes: Math.floor(Math.random() * 10), // Random downvotes
        isHidden: Math.random() > 0.8, // 20% chance of being hidden
      },
    });

    blogPosts.push(blogPost);

    // Create votes for the blog post
    const voters = getRandomItems(users, Math.floor(Math.random() * 10)); // Random number of voters
    for (const voter of voters) {
      await prisma.postVote.create({
        data: {
          postId: blogPost.id,
          userId: voter.id,
          voteType: Math.random() > 0.5 ? 'upvote' : 'downvote',
        },
      });
    }

    // Create reports for the blog post (10% chance for each post)
    if (Math.random() > 0.9) {
      const reporter = users[Math.floor(Math.random() * users.length)];
      await prisma.postReport.create({
        data: {
          explanation: `This blog post violates the guidelines on ${randomTags[0]?.name || 'content quality'}.`,
          reporter: { connect: { id: reporter.id } },
          blogPost: { connect: { id: blogPost.id } }, // Explicitly connect to the created blog post
          contentType: "BlogPost", // Required contentType
        },
      });
    }
  }

  console.log('✨ 30 Blog Posts created successfully with relationships');
}

main()
  .catch((e) => {
    console.error('Error in blog post creation script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
