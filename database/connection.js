import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connection = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("MongoDB connected to red_social");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        /* res.status(500).send("Server Error"); */
        throw new Error("Error connecting to MongoDB!");
    }
}

export default connection;