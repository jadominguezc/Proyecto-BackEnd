# Utiliza una imagen base de Node.js
FROM node:18-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos del proyecto al contenedor
COPY package*.json ./
COPY . .

# Instala las dependencias
RUN npm install

# Expone el puerto en el que corre tu aplicación
EXPOSE 8080

# Comando para iniciar tu aplicación
CMD ["npm", "start"]

