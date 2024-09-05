import express from "express";
import connection from "./database/connection.js";
import bodyParser from "body-parser";
import cors from "cors";
import UserRoutes from "./routes/user.js";
import PublicationRoutes from "./routes/publication.js";
import FollowRoutes from "./routes/follow.js";
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Mensaje de bienvenida para verificar que ejecuta bien la API de Node
console.log("API Node is running...");

// Conexión a la BD
connection();

//Crear el servidor de Node
const app = express();
const port = process.env.PORT || 3900;

// Configurar cors para hacer las peticiones correctamente
app.use(cors({
    origin: '*', // Permitir solicitudes desde cualquier origen
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

//Decodificar los datos desde los formularios para convertirlos en JS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar rutas del aplicativo

app.use('/api/user', UserRoutes);
app.use('/api/publication', PublicationRoutes);
app.use('/api/follow', FollowRoutes);

// Rutas de la API

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración para servir archivos estáticos (imágenes de avatar)
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));

// Configuración para servir archivos estáticos (imágenes de publicaciones)
app.use('/uploads/publications', express.static(path.join(__dirname, 'uploads', 'publications')));

// Configuración del servidor de Node
app.listen(port, () => {
    console.log(`Node Server running on port ${port}`);
    /* console.log(`Node Server running on port`, `port`); */
});

export default app;