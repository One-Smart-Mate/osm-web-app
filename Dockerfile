# ==============================
# Etapa 1: Build node app
# ==============================
FROM node:22 AS builder
WORKDIR /app

# copy package.json y package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the project
COPY . .

# Env variables
ARG VITE_AP_VERSION
ARG VITE_API_SERVICE
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_BUCKET
ARG VITE_FIREBASE_DOMAIN
ARG VITE_FIREBASE_MEASURE_ID
ARG VITE_FIREBASE_MESSAGING_ID
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_VAPID_KEY
ARG VITE_IMPORT_USERS_EXCEL
ARG VITE_PDF_MANUAL_LINK

# create the .env
RUN echo "VITE_AP_VERSION=$VITE_AP_VERSION" >> .env && \
    echo "VITE_API_SERVICE=$VITE_API_SERVICE" >> .env && \
    echo "VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY" >> .env && \
    echo "VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID" >> .env && \
    echo "VITE_FIREBASE_BUCKET=$VITE_FIREBASE_BUCKET" >> .env && \
    echo "VITE_FIREBASE_DOMAIN=$VITE_FIREBASE_DOMAIN" >> .env && \
    echo "VITE_FIREBASE_MEASURE_ID=$VITE_FIREBASE_MEASURE_ID" >> .env && \
    echo "VITE_FIREBASE_MESSAGING_ID=$VITE_FIREBASE_MESSAGING_ID" >> .env && \
    echo "VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID" >> .env && \
    echo "VITE_FIREBASE_VAPID_KEY=$VITE_FIREBASE_VAPID_KEY" >> .env && \
    echo "VITE_IMPORT_USERS_EXCEL=$VITE_IMPORT_USERS_EXCEL" >> .env && \
    echo "VITE_PDF_MANUAL_LINK=$VITE_PDF_MANUAL_LINK" >> .env

# Build de Vite
RUN npm run build

# ==============================
# Etapa 2: Setup nginx
# ==============================
FROM nginx:1.27

# copy the configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy the built app
COPY --from=builder /app/dist /usr/share/nginx/html

# expose port 80
EXPOSE 80

# start nginx
CMD ["nginx", "-g", "daemon off;"]
