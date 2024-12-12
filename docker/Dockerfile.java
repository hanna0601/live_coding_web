# docker-images/Dockerfile.java

FROM openjdk:21-slim
RUN apt-get update && apt-get install -y coreutils
WORKDIR /app

# set non-privileged user
RUN useradd -m runner
USER runner

ENV HOME=/app
