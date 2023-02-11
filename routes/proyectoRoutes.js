import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    buscarColaborador,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador
} from "../controllers/proyectoControllers.js";

import checkAuth from "../middleware/cheackAuth.js";
import express from 'express';

const proyectoRoutes = express.Router();

proyectoRoutes.route("/")
    .get(checkAuth, obtenerProyectos)
    .post(checkAuth, nuevoProyecto);

proyectoRoutes.route("/:id")
    .get(checkAuth, obtenerProyecto)
    .put(checkAuth, editarProyecto)
    .delete(checkAuth, eliminarProyecto);
    
proyectoRoutes.post("/colaboradores/:id", checkAuth, agregarColaborador);
proyectoRoutes.post('/colaboradores', checkAuth, buscarColaborador);
proyectoRoutes.post("/eliminar-colaborador/:id", checkAuth, eliminarColaborador);

export default proyectoRoutes;