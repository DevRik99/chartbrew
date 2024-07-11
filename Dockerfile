FROM node:20-slim

WORKDIR /code
COPY . .

RUN cd ../server && npm install
RUN npm run prepareSettings

EXPOSE 4019

ENTRYPOINT ["./entrypoint.sh"]
