# # Use an Amazon Linux base image for compatibility with Lambda
# FROM amazonlinux:2 AS builder

# # Set working directory
# WORKDIR /build

# # Install necessary build dependencies
# RUN yum install -y \
#     gcc \
#     gcc-c++ \
#     make \
#     autoconf \
#     automake \
#     libtool \
#     pkgconfig \
#     zlib-devel \
#     bzip2-devel \
#     libogg \
#     libvorbis \
#     freetype-devel \
#     libtheora \
#     openssl-devel \
#     libvpx-devel \
#     xz \
#     lame-devel \
#     wget \
#     tar \
#     git

# RUN wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz && \
#     tar -xJf ffmpeg-release-amd64-static.tar.xz && \
#     mv ffmpeg-*/ ffmpeg && \
#     rm ffmpeg-release-amd64-static.tar.xz

# RUN chmod +x /build/ffmpeg

# Clone FFmpeg source code
# RUN git clone --depth 1 https://github.com/FFmpeg/FFmpeg.git /build/ffmpeg

# Build FFmpeg
# WORKDIR /build/ffmpeg
# RUN ./configure && make
# RUN ./configure --enable-libmp3lame && make
# RUN ./configure --disable-yasm --enable-static --disable-shared --enable-libmp3lame && make


# Stage 2: Build Node.js environment
FROM public.ecr.aws/lambda/nodejs:18

# Set working directory in the Lambda environment
WORKDIR /var/task

# Copy FFmpeg from the builder stage
# COPY --from=builder /build/ffmpeg /var/task/ffmpeg

# ENV PATH="/var/task:$PATH"
# ENV PATH="/var/task/ffmpeg:$PATH"

# Copy your Node.js application files
COPY ./dist/ /var/task/
COPY package.* /var/task/
# COPY ./node_modules /var/task/node_modules

# Install npm dependencies
RUN npm install --production

RUN ls -l $(which ffmpeg)

# Lambda handler
CMD ["index.handler"]
