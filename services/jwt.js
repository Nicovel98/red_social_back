import jwt from 'jwt-simple';
import moment from 'moment';

// Configuración JWT
const secretKey = 'secret';
const expiresIn = '30'; // Tiempo de expiración del token en días

// Función para generar un token JWT
const createToken = (user) => {
    const expiresAt = moment().add(expiresIn, 'days').unix();
    const payload = {
        id: user._id,
        role: user.role,
        expiresAt: expiresAt
    };
    // Devuelve el token codificado
    return jwt.encode(payload, secretKey);
};

export {
    createToken,
    secretKey,
    expiresIn
}