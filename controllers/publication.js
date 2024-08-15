//Acciones de prueba

export const testPublication = (req, res) => {
    return res.status(200).send({
        message: "Publication test successfully"
    });
};