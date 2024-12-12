# docker-images/Dockerfile.c

FROM gcc:latest

RUN apt-get update && apt-get install -y coreutils
WORKDIR /app

# set non-root user
RUN useradd -m runner
USER runner

# set home directory
ENV HOME=/app
