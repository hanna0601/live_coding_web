#!/bin/bash

set -e

echo "Building Docker images..."

docker build -t myrunner:c -f docker/Dockerfile.c .
docker build -t myrunner:cpp -f docker/Dockerfile.cpp .
docker build -t myrunner:csharp -f docker/Dockerfile.csharp .
docker build -t myrunner:java -f docker/Dockerfile.java .
docker build -t myrunner:python3 -f docker/Dockerfile.python3 .
docker build -t myrunner:node -f docker/Dockerfile.node .
docker build -t myrunner:typescript -f docker/Dockerfile.typescript .
docker build -t myrunner:php -f docker/Dockerfile.php .
docker build -t myrunner:swift -f docker/Dockerfile.swift .
docker build -t myrunner:ruby -f docker/Dockerfile.ruby .
docker build -t myrunner:scala -f docker/Dockerfile.scala .
docker build -t myrunner:rust -f docker/Dockerfile.rust .

echo "All Docker images built successfully."
