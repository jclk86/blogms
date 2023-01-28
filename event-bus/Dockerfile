FROM node:alpine

WORKDIR /usr/app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]
# If different versions of node or something, you must customize each file for each service. But for this project, we don't need to.