#TODO: automate the building
FROM node:latest

COPY . ./
RUN npm install
RUN npm run dist

FROM nginx:latest
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist /usr/share/nginx/html
EXPOSE 80
