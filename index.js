import express from "express";
import connection from "./database/connection.js";
import bodyParser from "body-parser";
import cors from "cors";
// Mensaje de bienvenida para verificar que ejecuta bien la API de Node
console.log("API Node is running...");

// Conexión a la BD
connection();

//Crear el servidor de Node
const app = express();
const port = process.env.PORT || 3900;

// Configurar Cors
app.use(cors());

//Decodificar los datos desde los formularios para convertirlos en JS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas de la API

app.get('/ruta-prueba', (req, res) => {
    return res.status(200).json(
        {
            'id': 1,
            'name': 'Nico',
            'username': 'Nicovel'
        }
    );
});

// Configuración del servidor de Node
app.listen(port, () => {
    console.log(`Node Server running on port ${port}`);
    /* console.log(`Node Server running on port`, `port`); */
});

export default app;