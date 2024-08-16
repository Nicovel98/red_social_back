//Acciones de prueba

export const testUser = (req, res) => {
    return res.status(200).send({
        message: "User test successfully"
    });
};

//Metodo Registro de Usuario
export const registerUser = async (req, res) => {
    return res.status(200).send({
        message: "User registration test successfully"
    });


    /* try {
        const { name, last_name, nickname, email, password } = req.body;

        // Validar que los datos sean correctos
        if (!name || !last_name || !nickname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Verificar que el email no esté en uso
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Crear el nuevo usuario
        const newUser = new User({ name, last_name, nickname, email, password });
        await newUser.save();

        // Enviar una respuesta de éxito
        return res.status(201).json
            ({
                message: "User registered successfully",
                user: newUser
            });

    } catch (error) {
        console.error("Error registering user:", error.message);
        /* res.status(500).send("Server Error"); */
    //throw new Error("Error registering user!");
    //}
    //Fin Metodo Registro de Usuario */
}