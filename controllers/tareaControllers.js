import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";
import mongoose from "mongoose";

const agregarTarea = async (req, res) => {
    const {proyecto} = req.body;

    try {
        const existeProyecto = await Proyecto.findById(proyecto);
     
        if(existeProyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("No Tienes los Permisos");
            return res.status(403).json({msg: error.message});
        };

        try {
            const tareaAlmacenada = await Tarea.create(req.body);

            //Almacenar l ID en el proyecto
            existeProyecto.tareas.push(tareaAlmacenada._id);
            await existeProyecto.save();

            res.json(tareaAlmacenada);
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
       res.status(404).json({msg: "El Proyecto No Existe"});
    };
};

const obtenerTarea = async (req, res) => {
    const {id} = req.params;

    try {
        const tarea = await Tarea.findById(id).populate('proyecto');
     
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("No Tienes los Permisos");
            return res.status(403).json({msg: error.message});
        };

        res.json(tarea);
    } catch (error) {
       res.status(404).json({msg: "La Tarea No Existe"});
    };
};

const actualizarTarea = async (req, res) => {
    const {id} = req.params;

    try {
        const tarea = await Tarea.findById(id).populate('proyecto');
     
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("No Tienes los Permisos");
            return res.status(403).json({msg: error.message});
        };

        tarea.nombre = req.body.nombre || tarea.nombre;
        tarea.descripcion = req.body.descripcion || tarea.descripcion;
        tarea.prioridad = req.body.prioridad || tarea.prioridad;
        tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

        try {
            const tareaAlmacenada = await tarea.save();
            res.json(tareaAlmacenada);
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
       res.status(404).json({msg: "La Tarea No Existe"});
    };
};

const eliminarTarea = async (req, res) => {
    const {id} = req.params;

    try {
        const tarea = await Tarea.findById(id).populate('proyecto');
     
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()){
            const error = new Error("No Tienes los Permisos");
            return res.status(403).json({msg: error.message});
        };

        try {
            const proyecto = await Proyecto.findById(tarea.proyecto);
            proyecto.tareas.pull(tarea._id);
            await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()]);
            res.json({msg: "Tarea ha sido Eliminada"});
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
       res.status(404).json({msg: "La Tarea No Existe"});
    };
};

const cambiarEstado = async (req, res) => {
    const {id} = req.params;

    try {
        const tarea = await Tarea.findById(id).populate('proyecto');
     
        if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
            const error = new Error("No Tienes los Permisos");
            return res.status(403).json({msg: error.message});
        };

        tarea.estado = !tarea.estado;
        tarea.completado = req.usuario._id;
        await tarea.save();

        const tareaAlmacenada = await Tarea.findById(id).populate('proyecto').populate("completado");

        res.json(tareaAlmacenada);
        
    } catch (error) {
       res.status(404).json({msg: "La Tarea No Existe"});
    };
};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}