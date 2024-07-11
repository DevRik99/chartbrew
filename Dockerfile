FROM node:20-slim

# Establece el directorio de trabajo en /code
WORKDIR /code

# Copia todo el código al directorio de trabajo
COPY . .

# Instala las dependencias del servidor backend
RUN cd server && npm install

# Prepara la configuración necesaria (si es necesario)
RUN npm run prepareSettings

# Expone el puerto necesario para el backend (ajusta según tus necesidades)
EXPOSE 4019

# Define el comando de entrada para iniciar el servidor backend
CMD cd server && npm run start
