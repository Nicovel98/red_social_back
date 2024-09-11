import { Router } from "express";
const router = Router();
import {
    registerUser, loginUser, testUser, showUserProfile,
    showUserList, editUserProfile, uploadAvatar, showAvatar, counters
} from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from "multer";
import User from "../models/user.js"
import { checkEntityExists } from "../middlewares/checkEntityExists.js"

// Configuración de subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars');
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const uploads = multer({ storage });

// Definir las rutas
router.get('/test-user', ensureAuth, testUser);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile/:id', ensureAuth, showUserProfile);
router.get('/userlist/:page?', showUserList);
router.put('/update', ensureAuth, editUserProfile);
router.post('/upload-avatar', [ensureAuth, checkEntityExists(User, 'user_id'), uploads.single("file0")], uploadAvatar);
router.get('/avatar/:file', showAvatar)
router.get('/counters/:id?', ensureAuth, counters)

// Exportar el Router
export default router;
