import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const UserSchema = Schema({
    name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    image: {
        type: String,
        default: 'default_user.png'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Añadir el plugin de paginación de Mongo
UserSchema.plugin(mongoosePaginate);

export default model("User", UserSchema, "user");

//User nombre del modelo
//UserSchema nombre del esquema
// user nombre de la coleción en Mongo
