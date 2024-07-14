# Church Visit App

Aplicación para registrar visitas a la iglesia durante una semana de campañas evangelísticas de 4 iglesias en conjunto.

## Configuración

1. Clona este repositorio.
2. Instala las dependencias con `npm install`.
3. Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno:
    ```
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=church_visits
    PORT=3000
    ```
4. Inicializa la base de datos ejecutando el script SQL proporcionado.
5. Inicia el servidor con `npm start`.

## Estructura del Proyecto

- `config/`: Contiene la configuración de la base de datos.
- `controllers/`: Contiene la lógica de negocio para manejar las solicitudes.
- `models/`: Contiene los modelos de datos.
- `routes/`: Contiene las definiciones de las rutas API.
- `public/`: Contiene los archivos estáticos del frontend.
- `app.js`: Inicializa y configura el servidor.
- `.env`: Contiene las variables de entorno.
- `package.json`: Lista las dependencias del proyecto.
- `README.md`: Documentación del proyecto.

## Uso

- Agrega visitantes desde `add_visitor.html`.
- Confirma la asistencia desde `confirm_attendance.html`.
- Visualiza los visitantes desde `view_visitors.html`.
