import { Router } from "express";
const router = Router();
import { registerUser } from "../controllers/user.js";

// Definir las rutas
/*router.get('/test-user', testUser);*/
router.post('/register', registerUser);

// Exportar el Router
export default router;
