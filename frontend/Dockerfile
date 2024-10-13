FROM node:20 AS prod-builder

WORKDIR /home/docker/code

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build


FROM node:20-slim AS prod-runner

WORKDIR /home/docker/code
RUN useradd --create-home docker

COPY --from=prod-builder /home/docker/code/node_modules ./
COPY --from=prod-builder /home/docker/code/package.json /home/docker/code/package-lock.json ./
COPY --from=prod-builder /home/docker/code/.next ./.next

USER docker
EXPOSE 3000

CMD ["npm", "run", "start"]


FROM node:20 AS dev

WORKDIR /home/docker/code
RUN useradd --create-home docker

COPY package.json package-lock.json ./
RUN npm i

COPY . .

RUN chown -R docker:docker /home/docker/code

USER docker
EXPOSE 3000

CMD ["npm", "run", "dev"]
