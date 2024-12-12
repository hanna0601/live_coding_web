#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting setup process..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ and try again."
    exit 1
fi

# Check for required compilers
for cmd in gcc g++ java python3; do
    if ! command -v $cmd &> /dev/null; then
        echo "❌ $cmd is not installed. Please install it and try again."
        exit 1
    fi
done

# Create or overwrite .env file
echo "📝 Setting up .env file..."
cat <<EOL > .env
DATABASE_URL=file:./dev.db
JWT_SECRET=7b71df1035a26d291eec65b129e6f469d1a15b50f48c64a372ea03f24b2d4efb
JWT_REFRESH_SECRET=1c890f823569fc851a7de169ca44ad8ba3dcff76d4a77b9d38f2eae2fcbab0a6
EOL

echo "📦 Installing dependencies..."
npm install

echo "🗃️ Setting up database..."
# # Clean up existing database and migrations
# rm -rf prisma/migrations
# rm -f prisma/dev.db
# rm -f prisma/dev.db-journal

# Generate Prisma client
echo "⚙️ Generating Prisma client..."
npx prisma generate

# Create new migration and apply it
echo "🔄 Creating and applying database migration..."
npx prisma migrate dev --name init --skip-seed

# # Seed the database
# npx tsx prisma/seed.ts

# # run generate user
# npx tsx prisma/generateUser.ts

# # run generate test data
# npx tsx prisma/generateTemplate.ts

# # run generate posts
# npx tsx prisma/generatePosts.ts

# # run generate comments
# npx tsx prisma/generateComments.ts

# # run generate test data
# npx tsx prisma/generateT.ts

# run build image
./build_images.sh

# run prepare all dir
./prepare_all_dir.sh

echo "✅ Setup complete! You can now start the development server with './run.sh'"

echo "admin"
echo "email: admin@pp1.com"
echo "admin123!@#"