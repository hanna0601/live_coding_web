import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tags = [];
  const templates = [];

  // Define tag categories
  const languageTags = [
    { name: 'Python 3', codeSample: `print("Hello, Python!")`, value: 'python3' },
    { name: 'JavaScript', codeSample: `console.log("Hello, JavaScript!");`, value: 'javascript' },
    { name: 'TypeScript', codeSample: `const message: string = "Hello, TypeScript!";\nconsole.log(message);`, value: 'typescript' },
    { name: 'Java', codeSample: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}`, value: 'java' },
    { name: 'C', codeSample: `#include <stdio.h>\nint main() {\n  printf("Hello, C!\\n");\n  return 0;\n}`, value: 'c' },
    { name: 'C++', codeSample: `#include <iostream>\nint main() {\n  std::cout << "Hello, C++!" << std::endl;\n  return 0;\n}`, value: 'cpp' },
    { name: 'Ruby', codeSample: `puts "Hello, Ruby!"`, value: 'ruby' },
    { name: 'PHP', codeSample: `<?php\necho "Hello, PHP!";`, value: 'php' },
    { name: 'Swift', codeSample: `print("Hello, Swift!")`, value: 'swift' },
    { name: 'Rust', codeSample: `fn main() {\n  println!("Hello, Rust!");\n}`, value: 'rust' },
    { name: 'Scala', codeSample: `object Main extends App {\n  println("Hello, Scala!")\n}`, value: 'scala' },
  ];

  const levelTags = ['Beginner', 'Intermediate', 'Advanced'];
  const purposeTags = [
    'Web Development',
    'Data Science',
    'Machine Learning',
    'API Development',
    'Game Development',
    'Debugging',
    'Algorithms',
    'Cloud Computing',
  ];

  // Create all tags
  const allTags = [...languageTags.map((tag) => tag.name), ...levelTags, ...purposeTags];
  for (const name of allTags) {
    const tag = await prisma.tag.create({
      data: { name },
    });
    tags.push(tag);
  }

  console.log('✨ Tags created successfully');

  // Fetch existing users for assigning to templates
  const users = await prisma.user.findMany();

  // Create templates dynamically
  for (let i = 1; i <= 30; i++) {
    const randomLanguageTag = languageTags[Math.floor(Math.random() * languageTags.length)];
    const randomLevelTag = levelTags[Math.floor(Math.random() * levelTags.length)];
    const randomPurposeTag = purposeTags[Math.floor(Math.random() * purposeTags.length)];
    const randomAuthor = users[Math.floor(Math.random() * users.length)];

    // Randomly decide if this template is a fork
    const forkFromTemplate = Math.random() > 0.3 && templates.length > 0
      ? templates[Math.floor(Math.random() * templates.length)]
      : null;

    const template = await prisma.template.create({
      data: {
        title: `Template ${i} - ${randomLanguageTag.name}`,
        explanation: `This template demonstrates ${randomPurposeTag} using ${randomLanguageTag.name} for ${randomLevelTag} developers.`,
        codeContent: randomLanguageTag.codeSample,
        language: randomLanguageTag.value,
        author: { connect: { id: randomAuthor.id } },
        tags: {
          connect: [
            { name: randomLanguageTag.name },
            { name: randomLevelTag },
            { name: randomPurposeTag },
          ],
        },
        forkFrom: forkFromTemplate ? { connect: { id: forkFromTemplate.id } } : undefined,
      },
    });

    templates.push(template);

    console.log(`✨ Template ${i} created successfully`);

    // Optionally create forks for the current template
    if (Math.random() > 0.7 && templates.length < 30) {
      const forkedTemplate = await prisma.template.create({
        data: {
          title: `Forked from Template ${i} - ${randomLanguageTag.name}`,
          explanation: `This is a fork of Template ${i}, customized for additional use cases.`,
          codeContent: randomLanguageTag.codeSample.replace(
            'Hello',
            `Hello, Forked Template ${i}`
          ),
          language: randomLanguageTag.value,
          author: { connect: { id: randomAuthor.id } },
          tags: {
            connect: [
              { name: randomLanguageTag.name },
              { name: randomLevelTag },
              { name: randomPurposeTag },
            ],
          },
          forkFrom: { connect: { id: template.id } },
        },
      });

      templates.push(forkedTemplate);

      console.log(`✨ Forked Template from ${i} created successfully`);
    }
  }

  console.log('✨ Templates created successfully');
}

main()
  .catch((e) => {
    console.error('Error in tag/template creation script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
