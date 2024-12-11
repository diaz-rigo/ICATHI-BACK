const Docente = require("../models/docenteModel");

exports.manejarCambioDeRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  console.log("ID recibido:", id); // Verifica que este log muestre un ID válido
  console.log("Rol recibido:", rol); // Verifica que este log muestre un rol válido

  if (!id || !rol) {
    return res.status(400).json({ mensaje: "ID o rol faltante" });
  }

  try {
    const docente = await Docente.cambiarRol(id, rol); // Llama a tu método de modelo
    res.status(200).json({ mensaje: "Rol actualizado correctamente", docente });
  } catch (error) {
    console.error("Error al cambiar rol:", error.message);
    res.status(500).json({ mensaje: "Error al actualizar el rol", error: error.message });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Docente.listarUsuarios(); // Llama al modelo para obtener todos los usuarios
    res.status(200).json({ mensaje: "Usuarios listados exitosamente", usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al listar usuarios", error: error.message });
  }
};

exports.crearUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await Docente.crearUsuario(req.body);
    res.status(201).json({ mensaje: "Usuario creado exitosamente", usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear el usuario", error: error.message });
  }
};

exports.obtenerUsuario = async (req, res) => {
  const { email, username } = req.query;
  try {
    const usuario = await Docente.obtenerUsuarioPorEmailOUsername(email, username);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el usuario", error: error.message });
  }
};

exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioActualizado = await Docente.actualizarUsuario(id, req.body);
    res.status(200).json({ mensaje: "Usuario actualizado exitosamente", usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el usuario", error: error.message });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioEliminado = await Docente.eliminarUsuario(id);
    res.status(200).json({ mensaje: "Usuario eliminado exitosamente", usuario: usuarioEliminado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar el usuario", error: error.message });
  }
};
