import express, { Router } from "express";

import checkAuth from "../middleware/cheackAuth.js";

const usuarioRoutes = express.Router();

import { registrar,
         autenticar,
         confirmar,
         olvidePassword,
         comprobarToken,
         nuevoPassword,
         perfil
        } from "../controllers/usuarioControllers.js";

// Creación, Registro y Confirmación d Usuarios

usuarioRoutes.post('', registrar);
usuarioRoutes.post('/login', autenticar);
usuarioRoutes.get('/confirmar/:token', confirmar);
usuarioRoutes.post('/olvide-password', olvidePassword);
usuarioRoutes.get('/olvide-password/:token', comprobarToken);
usuarioRoutes.post('/olvide-password/:token', nuevoPassword);

usuarioRoutes.get("/perfil", checkAuth, perfil);

export default usuarioRoutes;