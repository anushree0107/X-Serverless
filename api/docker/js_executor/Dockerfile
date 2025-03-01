FROM node:16-slim

WORKDIR /usr/src/app

COPY package.json .

RUN npm install


COPY user_code.js .

CMD ["node", "user_code.js"]