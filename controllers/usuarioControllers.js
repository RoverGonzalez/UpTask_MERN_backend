import Usuario from "../models/Usuario.js";
import generarId from "../helpers/generarId.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailRegistro, emailOlvidePassword } from "../helpers/email.js";

const registrar = async (req, res) => {

    // Evitar usuarios Duplicados
    const {email} = req.body;
    const existeUsuario = await Usuario.findOne({email});

    if(existeUsuario){
        const error = new Error('Usuario ya Registrado');
        return res.json({msg: error.message});
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        await usuario.save();

        // Enviar email para confirmar
        const {email, nombre, token} = usuario;
        emailRegistro({email, nombre, token});

        res.json({msg: 'Usuario Creado Correctamente, Revisa tu email para confirmar tu Cuenta'});
    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req, res) => {

    const {email, password} = req.body;

    // Comprobar si el usuario existe
    const usuario = await Usuario.findOne({email});
    if(!usuario){
        const error = new Error('El Usuario No Existe');
        return res.status(404).json({msg: error.message});
    }

    // Comprobar si el usuario está confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu Cuenta no ha sido Confirmada');
        return res.status(403).json({msg: error.message});
    }

    // Comprobar su Password
    if(await usuario.comprobarPassword(password)){
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    }else{
        const error = new Error('El password es Incorrecto');
        return res.status(403).json({msg: error.message});
    }
}

const confirmar = async (req, res) => {
    const {token} = req.params;
    const usuarioConfirmar = await Usuario.findOne({token});
    if(!usuarioConfirmar){
        const error = new Error("Token No Válido");
        return res.json({msg: error.message});
    }

    try {
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";

        await usuarioConfirmar.save();

        res.json({msg: "Usuario Confirmado Correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const olvidePassword = async (req, res) => {
    const {email} = req.body;
    const usuario = await Usuario.findOne({email});

    if(!usuario){
        const error = new Error('El Usuario No Existe');
        return res.status(404).json({msg: error.message});
    }

    try {
        usuario.token = generarId();
        await usuario.save();

        // Enviar el Email
        const {email, nombre, token} = usuario;
        emailOlvidePassword({email, nombre, token});

        res.json({msg: "Hemos enviado un correo con las instrucciones"});
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => {
    const {token} = req.params;
    const tokenValido = await Usuario.findOne({token});

    if(!tokenValido){
        const error = new Error('Token No Válido');
        return res.status(403).json({msg: error.message});
    }

    res.json({msg: "Token valido y el Usuario Existe"});
}

const nuevoPassword = async (req, res) => {
    const {token} = req.params;
    const {password} = req.body;

    const usuario = await Usuario.findOne({token});

    if(!usuario){
        const error = new Error('Token No Válido');
        return res.status(403).json({msg: error.message});
    }

    try {
        usuario.password = password;
        usuario.token = "";

        await usuario.save();

        res.json({msg: "Password Modificado Correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const perfil = async (req, res) => {
    const {usuario} = req;

    res.json(usuario);
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil
};