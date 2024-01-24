FROM public.ecr.aws/lambda/nodejs:18

WORKDIR /var/task

COPY ./dist/ /var/task/
COPY package.* /var/task/
RUN npm install --production

RUN ls -l $(which ffmpeg)

CMD ["index.handler"]
