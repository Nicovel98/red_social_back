import { Router } from "express";
const router = Router();
import { registerUser, loginUser, testUser, showUserProfile, showUserList, editUserProfile } from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";

// Definir las rutas
router.get('/test-user', ensureAuth, testUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile/:id', ensureAuth, showUserProfile);
router.get('/userlist/:page?', showUserList);
router.put('/update', ensureAuth, editUserProfile);

// Exportar el Router
export default router;
