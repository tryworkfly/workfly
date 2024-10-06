FROM node:20 AS builder-image

WORKDIR /home/docker/

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-slim AS runner-image

RUN useradd --create-home docker
COPY --from=builder-image /home/docker/.next /home/docker/.next
COPY --from=builder-image /home/docker/node_modules /home/docker/node_modules
COPY --from=builder-image /home/docker/package.json /home/docker/package-lock.json /home/docker/

USER docker
RUN mkdir /home/docker/code
WORKDIR /home/docker/code

EXPOSE 3000


# /dev/shm is mapped to shared memory and should be used for gunicorn heartbeat
# this will improve performance and avoid random freezes
CMD ["npm", "run", "start"]
