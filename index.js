import express from "express";
import connection from "./database/connection.js";

// Mensaje de bienvenida para verificar que ejecuta bien la API de Node
console.log("API Node is running...");

// Conexión a la BD
connection();

//Crear el servidor de Node
const app = express();
const port = process.env.PORT || 3900;



// Configuración del servidor de Node
app.listen(port, () => {
    console.log(`Node Server running on port ${port}`);
    /* console.log(`Node Server running on port`, `port`); */
});

export default app;