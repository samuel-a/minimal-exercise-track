#TODO: automate the building
FROM node:latest AS builder

COPY . /clientbuild
WORKDIR /clientbuild
RUN npm install
RUN npm run dist

FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /clientbuild/dist /usr/share/nginx/html
EXPOSE 80
