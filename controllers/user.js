import User from "../models/user.js";
import bcrypt from "bcrypt";
import { createToken } from "../services/jwt.js";
import fs from "fs";
import path from "path";
import { followThisUser } from "../services/followServices.js";
import Follow from "../models/follow.js";
import Publication from "../models/publication.js";

// Metodo de prueba de usuario para el Middleware
export const testUser = (req, res) => {
    return res.status(200).send({
        message: "User test successfully"
    });
}

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

        // Crear un token para el usuario
        const token = createToken(user);

        // Añadir el token al usuario
        user.token = token;
        await user.save();

        // Eliminar la contraseña del usuario para devolver solo los datos necesarios
        //user.password = null;

        // Devolver los datos del usuario logueado
        return res.status(200).json({
            status: "success",
            message: "Login exitoso",
            token,
            user: {
                id: user._id,
                name: user.name,
                last_name: user.last_name,
                email: user.email,
                nickname: user.nickname,
                image: user.image,
                created_at: user.created_at
            }
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

// Método para mostrar el perfil de usuario
export const showUserProfile = async (req, res) => {
    try {
        // Obtener el id del usuario de la petición
        const userId = req.params.id;

        //Verificar si el id del usuario autenticado esta disponible
        if (!req.user || !req.user.id) {
            return res.status(401).send({
                status: "Error",
                message: "Usuario no autenticado"
            });
        }

        // Información del seguimiento
        const followInfo = await followThisUser(req.user.id, userId);

        // Busca un usuario con el id que se pasa en la petición
        const userProfile = await User.findById(userId).select('-password -role -email -__v');

        // Si no encuentra un usuario, devuelve un mensaje indicando que el usuario no existe
        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "!El usuario no existe!"
            });
        }

        // Eliminar la contraseña del usuario para devolver solo los datos necesarios
        // user.password = null;

        // Devolver la información del perfil del usuario
        return res.status(200).json({
            status: "success",
            user: userProfile,
            followInfo
        });

    } catch (error) {
        // Manejo de errores
        console.log("Error al mostrar el perfil de usuario:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error al mostrar el perfil de usuario"
        });
    }
}

// Método para listar usuarios con la paginación de Mongo
export const showUserList = async (req, res) => {
    try {
        // Obtener los parámetros de la petición
        let page = parseInt(req.params.page) || 1;
        // Configurar los items por página
        let limit = parseInt(req.query.limit) || 3;

        // Busca todos los usuarios paginados
        const options = {
            page,
            limit,
            select: '-password -role -email -__v' // Eliminar los campos de contraseña, rol, email y versiones de MongoDB
            //sort: { created_at: -1 } // Ordenar los usuarios por fecha de creación en orden descendiente
        };

        const users = await User.paginate({}, options);

        // Si no hay usuarios disponibles en la base de datos
        if (!users.docs.length) {
            return res.status(404).send({
                status: "error",
                message: "!No hay usuarios disponibles!"
            });
        }

        // Devolver los usuarios paginados
        return res.status(200).json({
            status: "success",
            message: "Listado de usuarios",
            users: users.docs,
            totalDocs: users.totalDocs,
            totalPages: users.totalPages,
            currentPage: users.page,
            pagingCounter: users.pagingCounter
            //limit: users.limit
        });

    } catch (error) {
        // Manejo de errores
        console.log("Error al listar los usuarios:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error al listar los usuarios"
        });
    }
}

// Método para editar los datos del usuario
export const editUserProfile = async (req, res) => {
    try {
        // Obtener el id del usuario de la petición
        let userIdentity = req.user;
        //console.log(userIdentity);
        // Obtener los datos de la petición
        let userToUpdate = req.body;
        //console.log(userToUpdate);
        // Eliminar campos de la petición sobrantes
        delete userToUpdate.expiresAt;
        delete userToUpdate.role;

        // Comprobar si el usuario ya existe
        const currentUser = await User.findById(userIdentity.id).exec();
        //console.log(currentUser);
        if (!currentUser) {
            return res.status(404).send({
                status: "error",
                message: "No existe este usuario"
            });
        }

        const users = await User.find({
            $or: [
                { email: userToUpdate.email },
                { nickname: userToUpdate.nickname }
            ]
        }).exec();
        //console.log(users);
        // Comprobar si el usuario esta duplicado y evitar conflictos
        const isDuplicateUser = users.some(user => {
            return user && user._id.toString() !== userIdentity.id;
        });

        if (isDuplicateUser) {
            return res.status(400).send({
                status: "error",
                message: "Solo se puede actualizar los datos del usuario autenticado"
            });
        }

        // Cifrar la contraseña si se proporciona
        if (userToUpdate.password) {
            try {
                let pwd = await bcrypt.hash(userToUpdate.password, 10);
                userToUpdate.password = pwd;
                //console.log(pwd);
            } catch (hashError) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al cifrar la contraseña"
                });
            }
        } else {
            delete userToUpdate.password;
        }

        // Actualizar los datos del usuario
        let userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });
        //console.log(userUpdated);
        if (!userUpdated) {
            return res.status(400).send({
                status: "error",
                message: "Error al actualizar usuario"
            });
        }

        // Devolver los datos del usuario editado
        return res.status(200).send({
            status: "success",
            message: "Datos del usuario editados correctamente",
            user: userUpdated
        });

    } catch (error) {
        // Manejo de errores
        console.log("Error al editar los datos del usuario:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error al editar los datos del usuario"
        });
    }
}

// Metodo para subir un avatar y actualizar el campo image del usuario
export const uploadAvatar = async (req, res) => {
    try {
        // Obtener el archivo de la imagen y comprobar si existe
        if (!req.file) {
            return res.status(400).send({
                status: "error",
                message: "No se ha subido ningún archivo"
            });
        }
        // Validar el formato del archivo (debe ser una imagen)
        const ext = path.extname(req.file.originalname).toLowerCase();
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        if (!validExtensions.includes(ext)) {
            const filePath = req.file.path;
            fs.unlinkSync(filePath); // Borrar el archivo si no es una imagen
            return res.status(400).send({
                status: "error",
                message: "El archivo debe ser una imagen (JPG, JPEG, PNG o GIF)"
            });
        }
        // Comprobar tamaño del archivo (pj: máximo 1MB)
        const fileSize = req.file.size;
        const maxFileSize = 1 * 1024 * 1024; // 1 MB
        // Comprobar tamaño del archivo y lo borra si se excede en tamaño
        if (fileSize > maxFileSize) {
            const filePath = req.file.path;
            fs.unlinkSync(filePath);
            return res.status(400).send({
                status: "error",
                message: "El tamaño del archivo excede el límite (máx 1 MB)"
            });
        }
        // Guardar la imagen en la BD
        const userUpdated = await User.findOneAndUpdate(
            { _id: req.user.id },
            { image: req.file.filename },
            { new: true }
        );
        // verificar si la actualización fue exitosa
        if (!userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de la imagen"
            });
        }
        // Devolver respuesta exitosa
        return res.status(200).json({
            status: "success",
            message: "User avatar updated successfully",
            user: userUpdated,
            file: req.file
        });
    } catch (error) {
        // Manejo de errores
        console.log("Error al subir el avatar del usuario:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error al subir el avatar del usuario"
        });
    }
}

// Método para mostrar el avatar
export const showAvatar = async (req, res) => {
    try {
        // Obtener el nombre del archivo de la imagen
        const fileName = req.params.file;
        // Obtener la ruta del directorio de imágenes
        const avatarDir = path.join("./uploads/avatars/");
        // Comprobar si el archivo existe
        const filePath = path.join(avatarDir, fileName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).send({
                status: "error",
                message: "No se ha encontrado el avatar"
            });
        }
        // Devolver el archivo de imagen
        return res.sendFile(path.resolve(filePath));
    } catch (error) {
        // Manejo de errores
        console.log("Error al mostrar el avatar:", error);
        // Devuelve mensaje de error
        return res.status(500).send({
            status: "error",
            message: "Error al mostrar el avatar"
        });
    }
}

// Método para mostrar contador de seguidores y publicaciones
export const counters = async (req, res) => {
    try {
        // Obtener el Id del usuario autenticado (token)
        let userId = req.user.id;

        // Si llega el id a través de los parámetros en la URL tiene prioridad
        if (req.params.id) {
            userId = req.params.id;
        }

        // Obtener el nombre y apellido del usuario
        const user = await User.findById(userId, { name: 1, last_name: 1 });

        // Vericar el user
        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "Usuario no encontrado"
            });
        }

        // Contador de usuarios que yo sigo (o que sigue el usuario autenticado)
        const followingCount = await Follow.countDocuments({ "following_user": userId });

        // Contador de usuarios que me siguen a mi (que siguen al usuario autenticado)
        const followedCount = await Follow.countDocuments({ "followed_user": userId });

        // Contador de publicaciones del usuario autenticado
        const publicationsCount = await Publication.countDocuments({ "user_id": userId });

        // Devolver los contadores
        return res.status(200).json({
            status: "success",
            userId,
            name: user.name,
            last_name: user.last_name,
            followingCount: followingCount,
            followedCount: followedCount,
            publicationsCount: publicationsCount
        });

    } catch (error) {
        console.log("Error en los contadores", error)
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores"
        });
    }
}