FROM nginx:1.15.2-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]

