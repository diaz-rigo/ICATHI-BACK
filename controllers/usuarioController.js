
const Usuario = require('../models/usuario');




exports.crearUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await Usuario.crearUsuario(req.body);
    res.status(201).json({ message: 'Usuario creado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
  
}

exports.obtenerUsuario = async (req, res) => {
  const { email, username } = req.query;
  try {
      const usuario = await Usuario.obtenerUsuarioPorEmailOUsername(email, username);
      if (!usuario) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
  }
  exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
      const usuarioActualizado = await Usuario.actualizarUsuario(id, req.body);
      res.status(200).json({ message: 'Usuario actualizado exitosamente', usuario: usuarioActualizado });
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
  }

  exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
      const usuarioEliminado = await Usuario.eliminarUsuario(id);
      res.status(200).json({ message: 'Usuario eliminado exitosamente', usuario: usuarioEliminado });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
  }

