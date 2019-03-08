FROM node:alpine
LABEL Author "Charles Stover <docker@charlesstover.com>"
WORKDIR /var/www
COPY package.json yarn.lock ./
RUN yarn
COPY src .
EXPOSE 8080
ENTRYPOINT [ "node", "twitter-bot.js" ]
