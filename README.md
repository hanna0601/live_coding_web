# Scriptorium Project Documentation

## Model Design

### `User` Model
```prisma
model User {
  id           Int           @id @default(autoincrement())
  firstName    String
  lastName     String
  email        String        @unique
  passwordHash String
  avatarUrl    String?
  phoneNumber  String?
  templates    Template[]    @relation("UserTemplates")
  blogPosts    BlogPost[]
  comments     Comment[]
  commentReports CommentReport[]
  postReports    PostReport[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  isAdmin      Boolean       @default(false)
  commentVotes CommentVote[]
  PostVote     PostVote[]
  savedTemplates   Template[]    @relation("UserSavedTemplates") // Direct relation to saved templates
}
```

### `Template` Model
```prisma
model Template {
  id          Int        @id @default(autoincrement())
  title       String
  explanation String
  tags        Tag[]      @relation("TemplateTags")
  codeContent String
  language    String
  author      User       @relation("UserTemplates", fields: [authorId], references: [id])
  authorId    Int
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  blogPosts   BlogPost[] @relation("BlogPostTemplates")
  usersSaved     User[]     @relation("UserSavedTemplates") // Direct relation to users who saved this template
}
```

### `BlogPost` Model
```prisma
model BlogPost {
  id          Int        @id @default(autoincrement())
  title       String
  description String
  tags        Tag[]      @relation("BlogPostTags")
  content     String
  author      User       @relation(fields: [authorId], references: [id])
  authorId    Int
  comments    Comment[]
  upvotes     Int        @default(0)
  downvotes   Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  isHidden    Boolean    @default(false)
  templates   Template[] @relation("BlogPostTemplates")
  votes       PostVote[]
  reports     PostReport[] @relation("BlogPostReports")
}
```

### `Comment` Model
```prisma
model Comment {
  id        Int           @id @default(autoincrement())
  content   String
  author    User          @relation(fields: [authorId], references: [id])
  authorId  Int
  post      BlogPost      @relation(fields: [postId], references: [id])
  postId    Int
  parentId  Int?
  parent    Comment?      @relation("CommentToComment", fields: [parentId], references: [id])
  replies   Comment[]     @relation("CommentToComment")
  upvotes   Int           @default(0)
  downvotes Int           @default(0)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  isHidden  Boolean       @default(false)
  votes     CommentVote[]
  reports   CommentReport[] @relation("CommentReports")
}
```

### `Tag` Model
```prisma
model Tag {
  id        Int        @id @default(autoincrement())
  name      String     @unique
  templates Template[] @relation("TemplateTags")
  blogPosts BlogPost[] @relation("BlogPostTags")
}
```

### `CommentVote` Model
```prisma
model CommentVote {
  id        Int      @id @default(autoincrement())
  comment   Comment  @relation(fields: [commentId], references: [id])
  commentId Int
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  voteType  String // 'upvote' or 'downvote'
  createdAt DateTime @default(now())

  @@unique([userId, commentId])
}
```

### `PostVote` Model
```prisma
model PostVote {
  id        Int      @id @default(autoincrement())
  post      BlogPost @relation(fields: [postId], references: [id])
  postId    Int
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  voteType  String // 'upvote' or 'downvote'
  createdAt DateTime @default(now())

  @@unique([userId, postId])
}
```

### `CommentReport` Model
```prisma
model CommentReport {
  id          Int      @id @default(autoincrement())
  explanation String
  reporter    User     @relation(fields: [reporterId], references: [id])
  reporterId  Int
  contentId   Int
  contentType String // 'BlogPost' or 'Comment'
  createdAt   DateTime @default(now())
  comment     Comment    @relation("CommentReports", fields: [contentId], references: [id]) // Added relation back to Comment
}
```

### `PostReport` Model
```prisma
model PostReport {
  id          Int      @id @default(autoincrement())
  explanation String
  reporter    User     @relation(fields: [reporterId], references: [id])
  reporterId  Int
  contentId   Int
  contentType String // 'BlogPost' or 'Comment'
  createdAt   DateTime @default(now())
  blogPost    BlogPost  @relation("BlogPostReports", fields: [contentId], references: [id]) // Added relation back to BlogPost
}
```

## Start Up

1. run `./startup.sh`
2. run `./run.sh`

## Admin 
-  `username`: `admin@pp1.com`
-  `password`: `admin123!@#`
   
## API Endpoints

### Auth

### 1. Endpoint: `/api/auth/signup`
- **Description**: Create a new user
- **URL**: `http://localhost:3000/api/auth/signup`
- **Method**: `POST`
- **Payload**:
```json
 {
    "firstName": "user1",
    "lastName": "Doe",
    "email": "user1@example.com",
    "password": "user1password",
    "phoneNumber": "1234567890",
    "avatarUrl": "https://www.google.com/imgres?q=cat&imgurl=https%3A%2F%2Fi.natgeofe.com%2Fn%2F548467d8-c5f1-4551-9f58-6817a8d2c45e%2FNationalGeographic_2572187_3x4.jpg&imgrefurl=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&docid=K6Qd9XWnQFQCoM&tbnid=H4qVWYbvIIAtvM&vet=12ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA..i&w=2304&h=3072&hcb=2&ved=2ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA"
  }
```
- **Response**:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTczMDY3NDQzNCwiZXhwIjoxNzMwNjgxNjM0fQ.kaWRG_lqFnvMB7p1pnOBZD5H48_qMvwB6YP7Csc61hQ"
}
```

### 2. Endpoint: `/api/auth/login`
- **Description**: Login with email and password
- **URL**: `http://localhost:3000/api/auth/login`
- **Method**: `POST`
- **Payload**:
```json
{
    "email": "user1@example.com",
    "password": "user1password"
}
```
- **Response**:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTczMDY3NDQzNCwiZXhwIjoxNzMwNjgxNjM0fQ.kaWRG_lqFnvMB7p1pnOBZD5H48_qMvwB6YP7Csc61hQ"
}
```
### 3. Endpoint: `/api/token/refresh`
- **Description**: Refresh the access token and refresh token
- **URL**: `http://localhost:3000/api/token/refresh`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header

- **Response**:
```json
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTczMDY3NDQzNCwiZXhwIjoxNzMwNjgxNjM0fQ.kaWRG_lqFnvMB7p1pnOBZD5H48_qMvwB6YP7Csc61hQ",
}
```

## Users

### 1. Endpoint: `/api/users/self`
- **Description**: Get the current user's information
- **URL**: `http://localhost:3000/api/users/me`
- **Method**: `GET`
- **Authentication**: Requires Bearer Token in the request header
- **Response**:
```json
{
    "id": 2,
    "firstName": "user1",
    "lastName": "Doe",
    "email": "user1@example.com",
    "phoneNumber": "1234567890",
    "avatarUrl": "https://www.google.com/imgres?q=cat&imgurl=https%3A%2F%2Fi.natgeofe.com%2Fn%2F548467d8-c5f1-4551-9f58-6817a8d2c45e%2FNationalGeographic_2572187_3x4.jpg&imgrefurl=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&docid=K6Qd9XWnQFQCoM&tbnid=H4qVWYbvIIAtvM&vet=12ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA..i&w=2304&h=3072&hcb=2&ved=2ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA",
    "createdAt": "2024-11-03T22:53:54.908Z",
    "updatedAt": "2024-11-03T22:53:54.908Z"
}
```

### 2. Endpoint: `/api/users/self`
- **Description**: Update the current user's information
- **URL**: `http://localhost:3000/api/users/self`
- **Method**: `PUT`
- **Authentication**: Requires Bearer Token in the request header
- **Payload**:
```json
{
    "firstName": "NewFirstName",
    "lastName": "NewLastName",
    "phoneNumber": "0000",
    "avatarUrl": "http://example.com/new-avatar.jpg"
}
```
- **Response**:
```json
{
    "message": "Profile updated successfully"
}
```

### 3. Endpoint: `/api/users/me/avatar`
- **Description**: Update the current user's avatar
- **URL**: `http://localhost:3000/api/users/me/avatar`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Payload**:
image file
- **Response**:
```json
{
    "message": "Avatar uploaded successfully",
    "avatarUrl": "/uploads/avatars/avatar_2_1730675062221.jpg"
}
```

### Code Execution

### 1. Endpoint: `/api/execute`
- **Description**: Execute the code for a given language
- **URL**: `http://localhost:3000/api/execute`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Payload**:
```json
{
  "code": "#include <iostream>\nusing namespace std;\nint factorial(int n) { return (n == 1 || n == 0) ? 1 : n * factorial(n - 1); }\nint main() { int num; cin >> num; cout << factorial(num); return 0; }",
  "language": "cpp",
  "stdin": "5"
}
```
- **Response**:
```json
{
    "stdout": "120\n",
    "stderr": ""
}
```

### Templates

### 1. Endpoint: `/api/templates/`
- **Description**: Create a code template
- **URL**: `http://localhost:3000/api/templates/`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
    -   `Authorization`: `Bearer <access_token>`
- **Payload**:
```json
{
  "title": "My Template",
  "explanation": "This is a sample explanation for the template.",
  "tags": ["tag1"],
  "codeContent": "console.log('Hello, World!');",
  "language": "JavaScript"
}
```
- **Response**:
```json
{
    "data": {
        "id": 1,
        "title": "My Template",
        "explanation": "This is a sample explanation for the template.",
        "codeContent": "console.log('Hello, World!');",
        "language": "JavaScript",
        "authorId": 1,
        "createdAt": "2024-11-03T23:03:20.916Z",
        "updatedAt": "2024-11-03T23:03:20.916Z",
        "forkFromId": null
    },
    "message": "Template saved successfully"
}
```

### 2. Endpoint: `/api/templates/[id]`
- **Description**: Fetch/update/delete an existing code template by id
- **URL**: `http://localhost:3000/api/templates/[id]`
- **Method**: `GET` `PUT` `DELETE`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
    -   `Authorization`: `Bearer <access_token>`
- **Payload (only for `PUT` method)**:
```json
{
  "title": "Updated Template Title",
  "explanation": "Updated explanation",
  "tags": ["updatedTag1", "updatedTag2"],
  "codeContent": "console.log('Updated code');",
  "language": "TypeScript"
}
```
- **Response**:

for `GET`:
```json
{
    "data": {
        "id": 1,
        "title": "My Template",
        "explanation": "This is a sample explanation for the template.",
        "codeContent": "console.log('Hello, World!');",
        "language": "JavaScript",
        "authorId": 1,
        "createdAt": "2024-11-03T20:55:55.462Z",
        "updatedAt": "2024-11-03T20:55:55.462Z",
        "forkFromId": null
    }
}
```
for `PUT`:
```json
{
    "data": {
        "id": 1,
        "title": "Updated Template Title",
        "explanation": "Updated explanation",
        "codeContent": "console.log('Updated code');",
        "language": "TypeScript",
        "authorId": 1,
        "createdAt": "2024-11-03T21:02:58.020Z",
        "updatedAt": "2024-11-03T23:10:21.306Z",
        "forkFromId": null
    }
}
```
for `DELETE`:
```json
{
    "message": "Template deleted successfully"
}
```

### 3. Endpoint: `/api/templates/public`
- **Description**: Retrieve a list of public templates based on search criteria.
- **URL**: `http://localhost:3000/api/templates/public/?<key>=<keyword>`
- **Method**: `GET`

- **Query Parameters**:
  - `title` (optional): Filters templates by title containing this string.
  - `tags` (optional): Filters templates by tags, separated by commas.
  - `language` (optional): Filters templates by programming language.
  - `page` (optional, default = 1): Page number for pagination.
  - `limit` (optional, default = 10): Number of templates per page.

- **Example Request**: 
    -   Fetch templates writing in JavaScript:

    GET http://localhost:3000/api/templates/public/?language=JavaScript

- **Example Response**:
```json
{
    "data": [
        {
            "id": 1,
            "title": "Example Template",
            "explanation": "This is an example template.",
            "codeContent": "console.log('Hello, World!');",
            "language": "JavaScript",
            "createdAt": "2024-11-03T20:55:55.462Z",
            "author": {
                "id": 1,
                "firstName": "John",
                "lastName": "Doe"
            }
        }
    ]
}
```

### 4. Endpoint: `/api/templates/saved`
- **Description**: Retrieve the list of templates saved by the authenticated user.
- **URL**: `http://localhost:3000/api/templates/saved?<key>=<keyword>`
- **Method**: `GET` `POST` `DELETE`
- **Authentication**: Requires Bearer Token in the request header.
- **Headers**:
    - `Authorization`: `Bearer <access_token>`

- **Query Parameters (only for GET)**:
  - `title` (optional): Filters templates by title containing this string.
  - `tags` (optional): Filters templates by tags, separated by commas.
  - `language` (optional): Filters templates by programming language.
  - `page` (optional, default = 1): Page number for pagination.
  - `limit` (optional, default = 10): Number of templates per page.

- **Example GET Request**: 

GET http://localhost:3000/api/templates/saved?language=JavaScript

- **Example Response**:

for `GET`:
```json
{
    "data": [
        {
            "id": 6,
            "title": "My Template6",
            "explanation": "This is a sample explanation for the template.",
            "tags": [
                {
                    "name": "tag123"
                }
            ]
        }
    ],
    "pagination": {
        "currentPage": 1,
        "totalPages": 1,
        "totalSavedTemplates": 1
    }
}
```
- **Payload (only for `POST` method)**:
```json
{
  "title": "Updated Title for blog post1",
  "description": "Updated description",
  "content": "Updated content",
  "tags": ["updatedTag1", "updatedTag2"],
  "templates": []
}
```
- **Example POST/DELETE Request**: 

POST http://localhost:3000/api/templates/saved

DELETE http://localhost:3000/api/templates/saved

- **Example Response**:

for `POST`:
```json
{
    "message": "Template added to saved templates"
}
```

for `DELETE`:
```json
{
    "message": "Template removed from saved templates"
}
```

### Blog Posts

### 1. Endpoint: `/api/posts/`
- **Description**: Create a blog post
- **URL**: `http://localhost:3000/api/posts/`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
    -   `Authorization`: `Bearer <access_token>`
- **Payload**:
```json
{
  "title": "Blog Post with template1",
  "description": "This post has a template",
  "content": "This post has a template",
  "tags": ["nextjs", "prisma"],
  "templateIds": [1]
}
```
- **Response**:
```json
{
    "id": 1,
    "title": "Blog Post with template1",
    "description": "This post has a template",
    "content": "This post has a template",
    "authorId": 1,
    "upvotes": 0,
    "downvotes": 0,
    "createdAt": "2024-11-03T22:13:42.346Z",
    "updatedAt": "2024-11-03T22:13:42.346Z",
    "isHidden": false
}
```

### 2. Endpoint: `/api/posts/[id]`
- **Description**: Fetch/update/delete an existing blog post by id
- **URL**: `http://localhost:3000/api/posts/[id]`
- **Method**: `GET` `PUT` `DELETE`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
    -   `Authorization`: `Bearer <access_token>`
- **Payload (only for `PUT` method)**:
```json
{
  "title": "Updated Title for blog post1",
  "description": "Updated description",
  "content": "Updated content",
  "tags": ["updatedTag1", "updatedTag2"],
  "templates": []
}
```
- **Response**:

for `GET`:
```json
{
    "id": 1,
    "title": "Blog Post with template1",
    "description": "This post has a template",
    "content": "This post has a template",
    "authorId": 1,
    "upvotes": 0,
    "downvotes": 0,
    "createdAt": "2024-11-03T22:13:42.346Z",
    "updatedAt": "2024-11-03T22:13:42.346Z",
    "isHidden": false,
    "tags": [
        {
            "id": 1,
            "name": "nextjs"
        },
        {
            "id": 2,
            "name": "prisma"
        }
    ],
    "author": {
        "id": 1,
        "firstName": "NewFirstName",
        "lastName": "NewLastName",
        "email": "user2@example.com",
        "passwordHash": "$2a$10$5dQwhDDP0L..2Dgx99WO7esdcEwOT6MQqjW6jxKJlE8ZzkzlaN88C",
        "avatarUrl": "http://example.com/new-avatar.jpg",
        "phoneNumber": "0000",
        "createdAt": "2024-11-03T20:54:47.540Z",
        "updatedAt": "2024-11-03T21:03:52.366Z",
        "isAdmin": false
    },
    "templates": [
        {
            "id": 1,
            "title": "My Template3",
            "explanation": "This is a sample explanation for the template.",
            "codeContent": "console.log('Hello, World333!');",
            "language": "JavaScript",
            "authorId": 1,
            "createdAt": "2024-11-03T20:55:55.462Z",
            "updatedAt": "2024-11-03T20:55:55.462Z",
            "forkFromId": null,
            "tags": [
                {
                    "id": 1,
                    "name": "tag123"
                }
            ],
            "author": {
                "id": 1,
                "firstName": "NewFirstName",
                "lastName": "NewLastName",
                "email": "user2@example.com",
                "passwordHash": "$2a$10$5dQwhDDP0L..2Dgx99WO7esdcEwOT6MQqjW6jxKJlE8ZzkzlaN88C",
                "avatarUrl": "http://example.com/new-avatar.jpg",
                "phoneNumber": "0000",
                "createdAt": "2024-11-03T20:54:47.540Z",
                "updatedAt": "2024-11-03T21:03:52.366Z",
                "isAdmin": false
            }
        }
    ]
}
```
for `PUT`:
```json
{
    "id": 1,
    "title": "Updated Title for blog post1",
    "description": "Updated description",
    "content": "Updated content",
    "authorId": 1,
    "upvotes": 0,
    "downvotes": 1,
    "createdAt": "2024-11-03T21:01:06.702Z",
    "updatedAt": "2024-11-03T22:29:06.889Z",
    "isHidden": false
}
```
for `DELETE`:
```json
{
    "message": "Post deleted successfully."
}
```

### 3. Endpoint: `/api/posts/search`

-   **Description**: Retrieve a list of blog posts based on search key word.

-   **URL**: `http://localhost:3000/api/posts/search?searchQuery=<keyword>`

-   **Method**: `GET`

-   **Query Parameters**:

    -   `searchQuery` (optional): The key word to search through blog posts by their title, content, tags, and also the code templates they contain.
-   **Example Requests**:

    -   Fetch posts searched by keyword 'template1':

        `GET http://localhost:3000/api/posts/search?searchQuery=template1
        `

-   **Example Response**:
```json
{
    "posts": [
        {
            "id": 6,
            "title": "Blog Post with template1",
            "description": "This post has a template",
            "content": "This post has a template",
            "authorId": 1,
            "upvotes": 0,
            "downvotes": 0,
            "createdAt": "2024-11-03T22:39:52.065Z",
            "updatedAt": "2024-11-03T22:39:52.065Z",
            "isHidden": false,
            "author": {
                "id": 1,
                "firstName": "NewFirstName",
                "lastName": "NewLastName",
                "email": "user2@example.com",
                "passwordHash": "$2a$10$5dQwhDDP0L..2Dgx99WO7esdcEwOT6MQqjW6jxKJlE8ZzkzlaN88C",
                "avatarUrl": "http://example.com/new-avatar.jpg",
                "phoneNumber": "0000",
                "createdAt": "2024-11-03T20:54:47.540Z",
                "updatedAt": "2024-11-03T21:03:52.366Z",
                "isAdmin": false
            },
            "tags": [
                {
                    "id": 2,
                    "name": "nextjs"
                },
                {
                    "id": 3,
                    "name": "prisma"
                }
            ],
            "comments": []
        }
    ],
    "totalCount": 1,
    "page": 1,
    "limit": 10
}
```

### 4. Endpoint: `/api/posts/sorted`

-   **Description**: Retrieve a list of blog posts sorted based on upvotes, downvotes, or total votes.

-   **URL**: `http://localhost:3000/api/posts/sorted?sortBy=<sort_option>&page=<page>&page_limit=<page_limit>`

-   **Method**: `GET`

-   **Query Parameters**:

    -   `sortBy` (optional): Determines how the blog posts are sorted. Options:
        -   `"upvotes"` - Sort by upvotes in descending order, with downvotes as a tiebreaker.
        -   `"downvotes"` - Sort by downvotes in descending order, with upvotes as a tiebreaker.
        -   `"total_votes"` - Sort by the sum of upvotes and downvotes in descending order.
    -   `page`
    -   `page_limit`
-   **Example Requests**:

    -   Fetch posts sorted by upvotes:

        `GET http://localhost:3000/api/posts/sorted?sortBy=upvotes&page=1&limit=10
        `

-   **Example Response**:
```json
[
  {
      "id": 1,
      "title": "Updated Title for blog post1",
      "description": "Updated description",
      "content": "Updated content",
      "authorId": 1,
      "upvotes": 2,
      "downvotes": 0,
      "createdAt": "2024-11-03T21:01:06.702Z",
      "updatedAt": "2024-11-03T22:29:06.889Z",
      "isHidden": false,
      "author": {
          "id": 1,
          "firstName": "NewFirstName",
          "lastName": "NewLastName",
          "email": "user2@example.com",
          "passwordHash": "$2a$10$5dQwhDDP0L..2Dgx99WO7esdcEwOT6MQqjW6jxKJlE8ZzkzlaN88C",
          "avatarUrl": "http://example.com/new-avatar.jpg",
          "phoneNumber": "0000",
          "createdAt": "2024-11-03T20:54:47.540Z",
          "updatedAt": "2024-11-03T21:03:52.366Z",
          "isAdmin": false
      },
      "tags": [],
      "comments": []
  },
  {
      "id": 2,
      "title": "New Blog Post",
      "description": "This is the description of my new blog post",
      "content": "This is the content of the blog post",
      "authorId": 1,
      "upvotes": 1,
      "downvotes": 0,
      "createdAt": "2024-11-03T21:02:58.104Z",
      "updatedAt": "2024-11-03T21:02:58.104Z",
      "isHidden": false,
      "author": {
          "id": 1,
          "firstName": "NewFirstName",
          "lastName": "NewLastName",
          "email": "user2@example.com",
          "passwordHash": "$2a$10$5dQwhDDP0L..2Dgx99WO7esdcEwOT6MQqjW6jxKJlE8ZzkzlaN88C",
          "avatarUrl": "http://example.com/new-avatar.jpg",
          "phoneNumber": "0000",
          "createdAt": "2024-11-03T20:54:47.540Z",
          "updatedAt": "2024-11-03T21:03:52.366Z",
          "isAdmin": false
      },
      "tags": [],
      "comments": []
  }
]
```


### 3. Endpoint: `/api/posts/[id]/vote`
- **Description**: Upvote or downvote a blog post
- **URL**: `http://localhost:3000/api/posts/1/vote`
- **Method**: `POST`
- **Payload**:
```json
{
  "voteType": "downvote"  // or "upvote" for downvoting
}
```
- **Response**:
```json
{
    "id": 1,
    "title": "First Post",
    "description": "This is the first blog post.",
    "content": "Hello, this is a post about technology!",
    "authorId": 1,
    "upvotes": 0,
    "downvotes": 1,
    "createdAt": "2024-10-24T22:10:43.515Z",
    "updatedAt": "2024-10-24T22:11:58.265Z",
    "isHidden": false
}
```


### Comments

### Endpoint: `/api/comments/`
- **Description**: Create a new comment on a blog post
- **URL**: `http://localhost:3000/api/comments`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
    -   `Authorization`: `Bearer <access_token>`
- **Payload**:
```json
{
  "content": "Great post",
  "authorId": 1,
  "postId": 2
}
```
- **Response**:
```json
{
    "id": 1,
    "content": "Great post",
    "authorId": 1,
    "postId": 2,
    "parentId": null,
    "upvotes": 0,
    "downvotes": 0,
    "createdAt": "2024-10-24T21:53:33.470Z",
    "updatedAt": "2024-10-24T21:53:33.470Z",
    "isHidden": false
}
```


### 2. Endpoint: `/api/comments/`
- **Description**: Reply to an existing comment on a blog post
- **URL**: `http://localhost:3000/api/comments`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
    -   `Authorization`: `Bearer <access_token>`
- **Payload**:
```json
{
  "content": "Thank you",
  "authorId": 2,
  "postId": 2,
  "parentId": 1
}
```
- **Response**:
```json
{
    "id": 2,
    "content": "Thank you",
    "authorId": 2,
    "postId": 2,
    "parentId": 1,
    "upvotes": 0,
    "downvotes": 0,
    "createdAt": "2024-10-24T21:55:34.909Z",
    "updatedAt": "2024-10-24T21:55:34.909Z",
    "isHidden": false
}
```


### 4. Endpoint: `/api/comments/[id]/vote`
- **Description**: Upvote or downvote a comment
- **URL**: `http://localhost:3000/api/comments/2/vote`
- **Method**: `POST`
- **Payload**:
```json
{
  "voteType": "upvote"  // or downvote
}
```
- **Response**:
```json
{
    "id": 2,
    "content": "Thank you",
    "authorId": 2,
    "postId": 2,
    "parentId": 1,
    "upvotes": 1,
    "downvotes": 0,
    "createdAt": "2024-10-24T22:10:58.924Z",
    "updatedAt": "2024-10-24T22:15:09.343Z",
    "isHidden": false
}
```


### 5. Endpoint: `/api/comments/sorted`

-   **Description**: Retrieve a list of comments for a specific blog post, sorted based on upvotes, downvotes, or total votes.

-   **URL**: `http://localhost:3000/api/comments/sorted?postId=<post_id>&sortBy=<sort_option>&page=<page>&page_limit=<page_limit>`

-   **Method**: `GET`

-   **Query Parameters**:

    -   `postId` (required): The ID of the blog post for which to retrieve comments.
    -   `sortBy` (optional): Determines how the comments are sorted. Options:
        -   `"upvotes"` - Sort by upvotes in descending order, with downvotes as a tiebreaker.
        -   `"downvotes"` - Sort by downvotes in descending order, with upvotes as a tiebreaker.
        -   `"total_votes"` - Sort by the sum of upvotes and downvotes in descending order.
    -   `page`
    -   `page_limit`
-   **Example Requests**:

    -   Fetch comments sorted by upvotes:
        
        `http://localhost:3000/api/comments/sorted?postId=1&sortBy=total_votes&page=1&limit=10`

-   **Example Response**:

```json
[
    {
        "id": 2,
        "content": "This is a test comment",
        "authorId": 3,
        "postId": 1,
        "parentId": null,
        "upvotes": 1,
        "downvotes": 0,
        "createdAt": "2024-11-04T00:00:42.004Z",
        "updatedAt": "2024-11-04T00:11:51.245Z",
        "isHidden": false,
        "author": {
            "id": 3,
            "firstName": "user2",
            "lastName": "Doe",
            "email": "user2@example.com",
            "passwordHash": "$2a$10$2wHFCPt5UFZdk23cJZ1B3uv97ta7wFs4y1OeLcvBeK4A1x4xtnWxu",
            "avatarUrl": "https://www.google.com/imgres?q=cat&imgurl=https%3A%2F%2Fi.natgeofe.com%2Fn%2F548467d8-c5f1-4551-9f58-6817a8d2c45e%2FNationalGeographic_2572187_3x4.jpg&imgrefurl=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&docid=K6Qd9XWnQFQCoM&tbnid=H4qVWYbvIIAtvM&vet=12ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA..i&w=2304&h=3072&hcb=2&ved=2ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA",
            "phoneNumber": "1234567890",
            "createdAt": "2024-11-03T23:56:46.074Z",
            "updatedAt": "2024-11-03T23:56:46.074Z",
            "isAdmin": false
        },
        "replies": []
    },
    {
        "id": 1,
        "content": "This is a test comment",
        "authorId": 3,
        "postId": 1,
        "parentId": null,
        "upvotes": 0,
        "downvotes": 0,
        "createdAt": "2024-11-04T00:00:41.192Z",
        "updatedAt": "2024-11-04T00:00:41.192Z",
        "isHidden": false,
        "author": {
            "id": 3,
            "firstName": "user2",
            "lastName": "Doe",
            "email": "user2@example.com",
            "passwordHash": "$2a$10$2wHFCPt5UFZdk23cJZ1B3uv97ta7wFs4y1OeLcvBeK4A1x4xtnWxu",
            "avatarUrl": "https://www.google.com/imgres?q=cat&imgurl=https%3A%2F%2Fi.natgeofe.com%2Fn%2F548467d8-c5f1-4551-9f58-6817a8d2c45e%2FNationalGeographic_2572187_3x4.jpg&imgrefurl=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&docid=K6Qd9XWnQFQCoM&tbnid=H4qVWYbvIIAtvM&vet=12ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA..i&w=2304&h=3072&hcb=2&ved=2ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA",
            "phoneNumber": "1234567890",
            "createdAt": "2024-11-03T23:56:46.074Z",
            "updatedAt": "2024-11-03T23:56:46.074Z",
            "isAdmin": false
        },
        "replies": []
    },
    {
        "id": 3,
        "content": "This is a test comment",
        "authorId": 3,
        "postId": 1,
        "parentId": null,
        "upvotes": 0,
        "downvotes": 0,
        "createdAt": "2024-11-04T00:00:42.549Z",
        "updatedAt": "2024-11-04T00:00:42.549Z",
        "isHidden": false,
        "author": {
            "id": 3,
            "firstName": "user2",
            "lastName": "Doe",
            "email": "user2@example.com",
            "passwordHash": "$2a$10$2wHFCPt5UFZdk23cJZ1B3uv97ta7wFs4y1OeLcvBeK4A1x4xtnWxu",
            "avatarUrl": "https://www.google.com/imgres?q=cat&imgurl=https%3A%2F%2Fi.natgeofe.com%2Fn%2F548467d8-c5f1-4551-9f58-6817a8d2c45e%2FNationalGeographic_2572187_3x4.jpg&imgrefurl=https%3A%2F%2Fwww.nationalgeographic.com%2Fanimals%2Fmammals%2Ffacts%2Fdomestic-cat&docid=K6Qd9XWnQFQCoM&tbnid=H4qVWYbvIIAtvM&vet=12ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA..i&w=2304&h=3072&hcb=2&ved=2ahUKEwjxlraW0cCJAxVvMDQIHYk0AFUQM3oECFQQAA",
            "phoneNumber": "1234567890",
            "createdAt": "2024-11-03T23:56:46.074Z",
            "updatedAt": "2024-11-03T23:56:46.074Z",
            "isAdmin": false
        },
        "replies": []
    }
]
```

### Reports

#### Endpoint: `/api/reports`
- **Description**: Create a report for a blog post or comment.
- **URL**: `http://localhost:3000/api/reports`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
    -   `Authorization`: `Bearer <access_token>`
- **Payload**:
  ```json
  {
    "contentId": 1,
    "contentType": "BlogPost", // or "Comment"
    "explanation": "Inappropriate content"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "contentId": 1,
    "contentType": "BlogPost",
    "explanation": "Inappropriate content",
    "reporterId": 2,
    "createdAt": "2024-10-24T21:53:33.470Z"
  }
  ```


### Admin 

### 1. Endpoint: `/api/admin/posts/reported`
- **Description**: Retrieve blog posts sorted by the number of reports.
- **URL**: `http://localhost:3000/api/admin/posts/reported`
- **Method**: `GET`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
  - `Authorization`: `Bearer <access_token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10)
- **Example Request**:
  ```
  GET http://localhost:3000/api/admin/posts/reported?page=1&limit=10
  ```
- **Example Response**:
  ```json
  [
    {
      "id": 1,
      "title": "Sample Post",
      "author": { "id": 1, "name": "Author Name" },
      "tags": ["Tag1", "Tag2"],
      "comments": [],
      "_count": { "reports": 5 }
    }
  ]
  ```


### 2. Endpoint: `/api/admin/hide`
- **Description**: Hide a blog post or comment.
- **URL**: `http://localhost:3000/api/admin/hide`
- **Method**: `POST`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
  - `Authorization`: `Bearer <access_token>`
- **Payload**:
  ```json
  {
    "contentId": 1,
    "contentType": "BlogPost" // or "Comment"
  }
  ```
- **Example Request**:
  ```
  POST http://localhost:3000/api/admin/hide
  Content-Type: application/json
  {
    "contentId": 1,
    "contentType": "BlogPost"
  }
  ```
- **Example Response**:
  ```json
  {
    "message": "Content hidden successfully"
  }
  ```


### 3. Endpoint: `/api/admin/sorted`
- **Description**: Retrieve sorted content (posts or comments) by the number of reports.
- **URL**: `http://localhost:3000/api/admin/sorted`
- **Method**: `GET`
- **Authentication**: Requires Bearer Token in the request header
- **Headers**:
  - `Authorization`: `Bearer <access_token>`
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10)
  - `type`: Type of content to sort (`posts` or `comments`)
- **Example Request**:
  ```
  GET http://localhost:3000/api/admin/sorted?type=posts&page=1&limit=10
  ```
- **Example Response**:
  ```json
[
    {
        "id": 2,
        "title": "New Blog Post",
        "description": "This is the description of my new blog post",
        "content": "This is the content of the blog post",
        "authorId": 3,
        "upvotes": 0,
        "downvotes": 0,
        "createdAt": "2024-11-04T01:01:15.778Z",
        "updatedAt": "2024-11-04T01:01:15.778Z",
        "isHidden": false,
        "author": {
            "id": 3,
            "firstName": "NewFirstName",
            "lastName": "NewLastName",
            "email": "user2@example.com",
            "passwordHash": "$2a$10$UjZJ1E0D1ckG5ARoaOkaM.kjHqopK6BVGOYDjdOlfdkFUjZ4PoXGi",
            "avatarUrl": "http://example.com/new-avatar.jpg",
            "phoneNumber": "0000",
            "createdAt": "2024-11-04T00:48:55.171Z",
            "updatedAt": "2024-11-04T01:00:08.274Z",
            "isAdmin": false
        },
        "tags": [
            {
                "id": 4,
                "name": "nextjs"
            },
            {
                "id": 5,
                "name": "prisma"
            }
        ],
        "comments": [
            {
                "id": 2,
                "content": "This is a reply",
                "authorId": 3,
                "postId": 2,
                "parentId": 1,
                "upvotes": 0,
                "downvotes": 0,
                "createdAt": "2024-11-04T01:01:56.485Z",
                "updatedAt": "2024-11-04T01:03:48.597Z",
                "isHidden": true
            }
        ],
        "_count": {
            "reports": 1
        }
    },
    {
        "id": 1,
        "title": "Updated Title for blog post1",
        "description": "Updated description",
        "content": "Updated content",
        "authorId": 3,
        "upvotes": 0,
        "downvotes": 1,
        "createdAt": "2024-11-04T01:00:54.216Z",
        "updatedAt": "2024-11-04T01:02:08.182Z",
        "isHidden": false,
        "author": {
            "id": 3,
            "firstName": "NewFirstName",
            "lastName": "NewLastName",
            "email": "user2@example.com",
            "passwordHash": "$2a$10$UjZJ1E0D1ckG5ARoaOkaM.kjHqopK6BVGOYDjdOlfdkFUjZ4PoXGi",
            "avatarUrl": "http://example.com/new-avatar.jpg",
            "phoneNumber": "0000",
            "createdAt": "2024-11-04T00:48:55.171Z",
            "updatedAt": "2024-11-04T01:00:08.274Z",
            "isAdmin": false
        },
        "tags": [
            {
                "id": 2,
                "name": "updatedTag1"
            },
            {
                "id": 3,
                "name": "updatedTag2"
            }
        ],
        "comments": [
            {
                "id": 1,
                "content": "This is a test comment",
                "authorId": 3,
                "postId": 1,
                "parentId": null,
                "upvotes": 0,
                "downvotes": 0,
                "createdAt": "2024-11-04T01:01:38.752Z",
                "updatedAt": "2024-11-04T01:01:38.752Z",
                "isHidden": false
            },
            {
                "id": 3,
                "content": "This is a test comment",
                "authorId": 3,
                "postId": 1,
                "parentId": null,
                "upvotes": 1,
                "downvotes": 0,
                "createdAt": "2024-11-04T01:02:02.355Z",
                "updatedAt": "2024-11-04T01:02:05.231Z",
                "isHidden": false
            }
        ],
        "_count": {
            "reports": 0
        }
    },
    {
        "id": 4,
        "title": "New Blog Post",
        "description": "This is the description of my new blog post",
        "content": "This is the content of the blog post",
        "authorId": 3,
        "upvotes": 0,
        "downvotes": 0,
        "createdAt": "2024-11-04T01:01:17.028Z",
        "updatedAt": "2024-11-04T01:01:17.028Z",
        "isHidden": false,
        "author": {
            "id": 3,
            "firstName": "NewFirstName",
            "lastName": "NewLastName",
            "email": "user2@example.com",
            "passwordHash": "$2a$10$UjZJ1E0D1ckG5ARoaOkaM.kjHqopK6BVGOYDjdOlfdkFUjZ4PoXGi",
            "avatarUrl": "http://example.com/new-avatar.jpg",
            "phoneNumber": "0000",
            "createdAt": "2024-11-04T00:48:55.171Z",
            "updatedAt": "2024-11-04T01:00:08.274Z",
            "isAdmin": false
        },
        "tags": [
            {
                "id": 4,
                "name": "nextjs"
            },
            {
                "id": 5,
                "name": "prisma"
            }
        ],
        "comments": [],
        "_count": {
            "reports": 0
        }
    }
]
  ```


