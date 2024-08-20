import User from "../models/user.js";
import bcrypt from "bcrypt";

// Método Registro de Usuarios
export const registerUser = async (req, res) => {
    try {
        // Obtener los datos de la petición
        let params = req.body;

        // Validaciones de los datos obtenidos
        if (!params.name || !params.last_name || !params.email || !params.password || !params.nickname) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Crear el objeto de usuario con los datos que ya validamos
        let user_to_save = new User(params);
        // Convierte el email del objeto en Minúsculas
        user_to_save.email = params.email.toLowerCase();
        // Busca si ya existe un usuario con el mismo email o nick
        const existingUser = await User.findOne({
            $or: [
                { email: user_to_save.email.toLowerCase() },
                { nickname: user_to_save.nickname.toLowerCase() }
            ]
        });

        // Si encuentra un usuario, devuelve un mensaje indicando que ya existe
        if (existingUser) {
            return res.status(409).send({
                status: "error",
                message: "!El usuario ya existe!"
            });
        }

        // Cifra la contraseña antes de guardarla en la base de datos
        const salt = await bcrypt.genSalt(10); // Genera una sal para cifrar la contraseña
        const hashedPassword = await bcrypt.hash(user_to_save.password, salt); // Cifra la contraseña
        user_to_save.password = hashedPassword; // Asigna la contraseña cifrada al usuario

        // Guardar el usuario en la base de datos
        await user_to_save.save();

        // Devolver el usuario registrado
        return res.status(200).json({
            status: "success",
            message: "Registro de usuario exitoso",
            params,
            user_to_save
        });


    } catch (error) {
        // Manejo de errores
        console.log("Error en el registro de usuario:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error en el registro de usuario"
        });
    }
}

// Método Login de Usuarios
export const loginUser = async (req, res) => {
    try {
        // Obtener los datos de la petición
        let params = req.body;

        // Validaciones de los datos obtenidos
        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Busca un usuario con el email que se pasa en la petición
        const user = await User.findOne({ email: params.email.toLowerCase() });

        // Si no encuentra un usuario, devuelve un mensaje indicando que el usuario no existe
        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "!El usuario no existe!"
            });
        }

        // Compara la contraseña cifrada del usuario
        const matchPass = await bcrypt.compare(params.password, user.password);

        // Si no coincide la contraseña, devuelve un mensaje indicando que la contraseña es incorrecta
        if (!matchPass) {
            return res.status(401).send({
                status: "error",
                message: "!La contraseña es incorrecta!"
            });
        }

        // Devolver el usuario logueado
        return res.status(200).json({
            status: "success",
            message: "Login exitoso",
            user
        });
    } catch (error) {
        // Manejo de errores
        console.log("Error en el login de usuario:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error en el login de usuario"
        });
    }
}