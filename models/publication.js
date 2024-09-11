import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const PublicationSchema = Schema({
    user_id: {
        type: Schema.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    file: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Añadir pluggin de paginación
PublicationSchema.plugin(mongoosePaginate);
// Se crea en la base de datos la colección publication
export default model("Publication", PublicationSchema, "publication");