import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";

const obtenerProyectos = async (req, res) => {
    const proyectos = await Proyecto.find({
      '$or' : [
        {colaboradores: {$in: req.usuario}},
        {creador: {$in: req.usuario}}
      ]
    })
    .select('-tareas');

    res.json(proyectos);

}

const nuevoProyecto = async (req, res) => {
    const proyecto = new Proyecto(req.body);
    proyecto.creador = req.usuario._id;

    try {
        const proyectoAlmacenado = await proyecto.save();
        res.json(proyectoAlmacenado);
    } catch (error) {
        console.log(error);   
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params;
   
    try {
      const proyecto = await Proyecto.findById(id)
          .populate({path: 'tareas', populate: {path: 'completado', select: "nombre"}})
          .populate('colaboradores', 'nombre email');
   
      if(proyecto.creador.toString() !== req.usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString())){
        return res.status(403).json({msg: 'No tienes permisos'});
      };

      // Obtener las tareas del proyecto

      /*const tareas = await Tarea.find().where("proyecto").equals(proyecto._id);*/

      res.json(proyecto);
    } catch (error) {
      res.status(404).json({msg: 'Proyecto No Existe'});
    };
  };

const editarProyecto = async (req, res) => {
    const { id } = req.params;
   
    try {
      const proyecto = await Proyecto.findById(id);
   
      if(proyecto.creador.toString() !== req.usuario._id.toString()){
        return res.status(403).json({msg: 'No tienes permisos'});
      };

      proyecto.nombre = req.body.nombre || proyecto.nombre;
      proyecto.descripcion = req.body.descripcion || proyecto.descripcion;
      proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega;
      proyecto.cliente = req.body.cliente || proyecto.cliente;

      try {
          const proyectoAlmacenado = await proyecto.save();
          res.json(proyectoAlmacenado);
      } catch (error) {
          console.log(error);
      }
    } catch (error) {
      res.status(404).json({msg: 'Proyexto No Existe'});
    };

    
}

const eliminarProyecto = async (req, res) => {
    const { id } = req.params;
   
    try {
      const proyecto = await Proyecto.findById(id);
   
      if(proyecto.creador.toString() !== req.usuario._id.toString()){
        return res.status(403).json({msg: 'No tienes permisos'});
      };

      try {
        const proyecto = await Proyecto.findById(id);
        await proyecto.deleteOne();
        res.json({msg: "Proyecto Eliminado"});
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      res.status(404).json({msg: 'Proyecto No Existe'});
    };
}

const buscarColaborador = async (req, res) => {
  const {email} = req.body;

  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');

  if(!usuario){
    const error = new Error('Usuario No Encontrado');
    return res.json({msg: error.message});
  }

  res.json(usuario);
}

const agregarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if(!proyecto){
    const error = new Error('Proyecto No Encontrado');
    return res.json({msg: error.message});
  }

  if(proyecto.creador.toString() !== req.usuario._id.toString()){
    const error = new Error('Acción No Válida');
    return res.json({msg: error.message});
  }

  const {email} = req.body;

  const usuario = await Usuario.findOne({email}).select('-confirmado -createdAt -password -token -updatedAt -__v');

  if(!usuario){
    const error = new Error('Usuario No Encontrado');
    return res.json({msg: error.message});
  }

  // El colaborador NO es el admin del Proyecto
  if(proyecto.creador.toString() === usuario._id.toString()){
    const error = new Error('El creador del Proyecto NO puede ser Colaborador');
    return res.json({msg: error.message});
  }

  //Revisar que ya no esté agregado al proyecto
  if(proyecto.colaboradores.includes(usuario._id)){
    const error = new Error('El usuario ya pertenece al proyecto');
    return res.json({msg: error.message});
  }

  // Está todo bien, se puede agregar
  proyecto.colaboradores.push(usuario._id);
  await proyecto.save()
  res.json({msg: 'Colaborador Agregado Correctamente'});
}

const eliminarColaborador = async (req, res) => {
  const proyecto = await Proyecto.findById(req.params.id);

  if(!proyecto){
    const error = new Error('Proyecto No Encontrado');
    return res.json({msg: error.message});
  }

  if(proyecto.creador.toString() !== req.usuario._id.toString()){
    const error = new Error('Acción No Válida');
    return res.json({msg: error.message});
  }

  // Está todo bien, se puede eliminar
  proyecto.colaboradores.pull(req.body.id);
  await proyecto.save()
  res.json({msg: 'Colaborador Eliminado Correctamente'});
}

export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    buscarColaborador,
    eliminarColaborador
}