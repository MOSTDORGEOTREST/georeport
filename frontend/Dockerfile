FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG REACT_APP_SERVER_IP=/
ENV REACT_APP_SERVER_IP=${REACT_APP_SERVER_IP}
ENV DISABLE_ESLINT_PLUGIN=true
ENV NODE_OPTIONS=--max_old_space_size=512
ENV GENERATE_SOURCEMAP=false

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
