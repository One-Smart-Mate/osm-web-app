# Etapa 1: Build de la app
FROM node:22 AS builder
WORKDIR /app

# Copiamos package.json
COPY package*.json ./

# Instalamos dependencias
RUN npm ci

# Copiamos el resto del proyecto
COPY . .

# Variables de entorno (se pasan como argumentos en el build)
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

# Creamos el .env con esas variables
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

# Etapa 2: Servir con Nginx
FROM nginx:1.27
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
