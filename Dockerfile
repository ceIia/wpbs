FROM debian:buster AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    wget \
    git \
    build-essential \
    libpcre3-dev \
    libssl-dev \
    zlib1g-dev \
    perl \
    curl \
    bison

# Download and extract OpenResty
WORKDIR /usr/local/src
RUN wget https://openresty.org/download/openresty-1.19.9.1.tar.gz && \
    tar -xvf openresty-1.19.9.1.tar.gz

# Install sregex
RUN git clone https://github.com/openresty/sregex.git && \
    cd sregex && \
    make && \
    make install

# Get replace-filter module
RUN git clone https://github.com/openresty/replace-filter-nginx-module.git

# Build OpenResty with module
WORKDIR /usr/local/src/openresty-1.19.9.1
RUN ./configure \
    --with-pcre-jit \
    --with-http_sub_module \
    --add-module=/usr/local/src/replace-filter-nginx-module \
    -j2 && \
    make -j2 && \
    make install

# Final stage
FROM debian:buster

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libpcre3 \
    libssl1.1 \
    zlib1g \
    curl

# Copy OpenResty from builder
COPY --from=builder /usr/local/openresty /usr/local/openresty
# Copy sregex library
COPY --from=builder /usr/local/lib/libsregex.so* /usr/local/lib/
RUN ldconfig

# Add OpenResty binaries to PATH
ENV PATH=$PATH:/usr/local/openresty/bin:/usr/local/openresty/nginx/sbin

# Copy config
COPY nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

EXPOSE 80

CMD ["openresty", "-g", "daemon off;"]