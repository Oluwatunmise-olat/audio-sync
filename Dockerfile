FROM public.ecr.aws/lambda/nodejs:18

WORKDIR /var/task

COPY ./dist/ /var/task/
COPY package.* /var/task/
RUN npm install --production


CMD ["index.handler"]
