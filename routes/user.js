import { Router } from "express";
const router = Router();
import { registerUser, loginUser, testUser } from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";

// Definir las rutas
router.get('/test-user', ensureAuth, testUser);
router.post('/register', registerUser);
router.post('/login', loginUser);

// Exportar el Router
export default router;
