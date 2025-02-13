FROM alpine:latest

RUN apk add --update nodejs npm
RUN npm install -g serve

RUN addgroup -S node && adduser -S node -G node
USER node

RUN mkdir /home/node/butterfly-tracker
RUN mkdir /home/node/butterfly-tracker/frontend
RUN mkdir /home/node/butterfly-tracker/backend

WORKDIR /home/node/butterfly-tracker/frontend
COPY --chown=node:node frontend/package-lock.json frontend/package.json ./
RUN npm install --silent
COPY --chown=node:node frontend/ .

WORKDIR /home/node/butterfly-tracker/backend
COPY --chown=node:node backend/package-lock.json backend/package.json ./
RUN npm install --silent
COPY --chown=node:node backend/ .
EXPOSE 3000

CMD echo "REACT_APP_BACKEND_URL = \"http://$(hostname -i):4000\"" >> /home/node/butterfly-tracker/frontend/.env && npm start & cd /home/node/butterfly-tracker/frontend && npm run build && serve -s build
