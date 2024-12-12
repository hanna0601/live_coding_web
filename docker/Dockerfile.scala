FROM eclipse-temurin:11

# Install SBT and Scala
RUN apt-get update && \
    apt-get install -y curl gnupg2 && \
    echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | tee /etc/apt/sources.list.d/sbt.list && \
    echo "deb https://repo.scala-sbt.org/scalasbt/debian /" | tee /etc/apt/sources.list.d/sbt_old.list && \
    curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | apt-key add && \
    apt-get update && \
    apt-get install -y sbt scala coreutils && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# set non-privileged user
RUN useradd -m runner
USER runner

ENV HOME=/app
ENV PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ENV CLASSPATH="/app:${CLASSPATH}"