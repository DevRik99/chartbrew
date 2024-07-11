FROM node:20-slim

WORKDIR /code
COPY . .

RUN cd server && npm install
RUN npm run prepareSettings

EXPOSE 4018
EXPOSE 4019
EXPOSE 4020
EXPOSE 10000

ENTRYPOINT ["./entrypoint.sh"]
