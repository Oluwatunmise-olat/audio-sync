FROM public.ecr.aws/lambda/python:3.8 AS python-builder

# Install Python dependencies (if any)
# RUN pip install --upgrade pip 

# Stage 2: Build Node.js environment
FROM public.ecr.aws/lambda/nodejs:16

# Copy Python executables from the builder stage
COPY --from=python-builder /var/lang/bin /var/lang/bin
COPY --from=python-builder /var/lang/lib /var/lang/lib

ENV LD_LIBRARY_PATH="/var/lang/lib:$LD_LIBRARY_PATH"

# symbolic link for convenience ie. calling python3 maps to python3.8
RUN ln -sf /var/lang/bin/python3.8 /usr/local/bin/python3 && \
    ln -sf /var/lang/bin/pip3.8 /usr/local/bin/pip3

WORKDIR /var/task

COPY ./dist/ /var/task/
COPY package.* /var/task/

RUN npm install

# Lambda handler
CMD ["index.handler"]