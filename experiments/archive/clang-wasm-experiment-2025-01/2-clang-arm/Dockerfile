# Dockerfile for building Clang to WebAssembly with ARM backend only
# This image can be used for local builds AND CI/CD pipelines

FROM emscripten/emsdk:3.1.50

# Install additional build dependencies
RUN apt-get update && apt-get install -y \
    cmake \
    ninja-build \
    python3 \
    python3-pip \
    git \
    curl \
    gzip \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /build

# Copy build script
COPY build-docker.sh /build/
RUN chmod +x /build/build-docker.sh

# Set environment variables
ENV LLVM_TARGETS_TO_BUILD=ARM
ENV CMAKE_BUILD_TYPE=MinSizeRel

# Default command
CMD ["/build/build-docker.sh"]

# Labels for CI/CD
LABEL maintainer="battlewithbytes"
LABEL description="Clang WASM builder with ARM-only backend for STM32"
LABEL version="1.0"
