

const Usuario = require('../models/usuario');


exports.manejarCambioDeEstatusYRol = async (req, res) => {
  const { id } = req.params; // ID del usuario recibido en los parámetros de la URL
  const { estatus, rol } = req.body; // Estatus y rol recibidos en el cuerpo de la solicitud

  console.log('ID recibido:', id);
  console.log('Estatus recibido:', estatus);
  console.log('Rol recibido:', rol);

  // Validación de entrada
  if (!id || estatus === undefined || !rol) {
    return res.status(400).json({ mensaje: 'ID, estatus o rol faltante' });
  }

  try {
    // Llama al método del modelo para actualizar el estatus y el rol
    const actualizado = await Usuario.actualizarEstatusYRol(id, estatus, rol);

    if (actualizado) {
      res.status(200).json({ mensaje: 'Estatus y rol actualizados correctamente' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar estatus y rol:', error.message);
    res.status(500).json({ mensaje: 'Error al actualizar estatus y rol', error: error.message });
  }
};


exports.manejarCambioDeRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  console.log('ID recibido:', id); // Verifica que este log muestre un ID válido
  console.log('Rol recibido:', rol); // Verifica que este log muestre un rol válido

  if (!id || !rol) {
    return res.status(400).json({ mensaje: 'ID o rol faltante' });
  }

  try {
    const usuario = await Usuario.cambiarRol(id, rol); // Llama a tu método de modelo
    res.status(200).json({ mensaje: 'Rol actualizado correctamente', usuario });
  } catch (error) {
    console.error('Error al cambiar rol:', error.message);
    res.status(500).json({ mensaje: 'Error al actualizar el rol', error: error.message });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.listarUsuarios(); // Llama al modelo para obtener todos los usuarios
    res.status(200).json({ message: 'Usuarios listados exitosamente', usuarios });
  } catch (error) {
    res.status(500).json({ message: 'Error al listar usuarios', error: error.message });
  }
};
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

