# docker-images/Dockerfile.swift

FROM swift:5.8
RUN apt-get update && apt-get install -y coreutils
WORKDIR /app
RUN mkdir -p /app/.cache && \
    chmod 777 /app/.cache

# set non-privileged user
RUN useradd -m runner
USER runner

ENV HOME=/app
