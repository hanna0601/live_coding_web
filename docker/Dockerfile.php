# docker-images/Dockerfile.php

FROM php:8.2-cli
RUN apt-get update && apt-get install -y coreutils
WORKDIR /app

# set non-privileged user
RUN useradd -m runner
USER runner

ENV HOME=/app
