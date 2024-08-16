import { Router } from "express";
const router = Router();
import { testUser, registerUser } from "../controllers/user.js";

// Definir las rutas
router.get('/test-user', testUser);
router.get('/register', registerUser);

// Exportar el Router
export default router;
