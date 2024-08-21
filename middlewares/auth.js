// Importar módulos
import jwt from 'jwt-simple';
import moment from 'moment';
// Importar la clave secreta
import { secretKey } from '../services/jwt.js';

// Función de autenticación
export const ensureAuth = (req, res, next) => {
    // Comprobar si llega la cabecera de autenticación
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: 'error',
            message: 'No hay autorización'
        });
    }
    //Limpiar el token y quitar comillas si las hay
    const token = req.headers.authorization.replace(/['"]+/g, '').replace("Bearer ", "");
    try {
        // Decodificar el token
        let payload = jwt.decode(token, secretKey);
        // Comprobar si el token ha expirado (Fecha de expirado es más antigua que la actual)
        if (payload.expiresAt < moment().unix()) {
            return res.status(401).send({
                status: 'error',
                message: 'Token expirado'
            });
        }
        // Si el token es válido, continuar con la ejecución
        // Agregamos datos de usuario al request
        req.user = payload;
        // Pasar a la siguiente acción (método)
        next();
    } catch (error) {
        return res.status(404).send({
            status: 'error',
            message: 'Token inválido'
        });
    }
}
