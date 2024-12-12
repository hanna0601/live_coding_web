# docker-images/Dockerfile.cpp

FROM gcc:latest

RUN apt-get update && apt-get install -y coreutils
WORKDIR /app

# set non-privileged user
RUN useradd -m runner
USER runner

# set default C++ standard to C++17
ENV CXXFLAGS="-std=c++17"

# set /app as runner's home directory
ENV HOME=/app
