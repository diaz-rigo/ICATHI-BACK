const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.uploadImageProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado una imagen.' });
    }

    const file = req.file;

    // Subir la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(file.path, { folder: 'perfiles_docentes' });

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ image: result.secure_url });
  } catch (error) {
    console.error('Error al subir la imagen:', error.message);
    res.status(500).json({ message: 'Error al subir la imagen.', error: error.message });
  }
};


exports.uploadCedula = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado el archivo de cédula.' });
    }

    const file = req.file;

    // Subir el archivo a Cloudinary (puede ser imagen o PDF)
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'cedulas_docentes',
            resource_type: 'raw'

    });

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Enviar la URL del archivo (para descarga o vista previa)
    res.status(201).json({ fileUrl: result.secure_url });
  } catch (error) {
    console.error('Error al subir la cédula:', error.message);
    res.status(500).json({ message: 'Error al subir la cédula.', error: error.message });
  }
};



exports.uploadCurriculum = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado el archivo del currículum.' });
    }

    const file = req.file;

    // Subir el archivo a Cloudinary (específicamente un PDF)
    const result = await cloudinary.uploader.upload(file.path, { 
      folder: 'curriculum_docentes',            resource_type: 'raw'

    });

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ fileUrl: result.secure_url });
  } catch (error) {
    console.error('Error al subir el currículum:', error.message);
    res.status(500).json({ message: 'Error al subir el currículum.', error: error.message });
  }
};


exports.uploadDocumentoIdentificacion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha enviado el archivo del documento de identificación.' });
    }

    const file = req.file;

    // Subir el archivo a Cloudinary (puede ser imagen o PDF)
    const result = await cloudinary.uploader.upload(file.path, { folder: 'documentos_identificacion_docentes',            resource_type: 'raw'
    });

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ fileUrl: result.secure_url });
  } catch (error) {
    console.error('Error al subir el documento de identificación:', error.message);
    res.status(500).json({ message: 'Error al subir el documento de identificación.', error: error.message });
  }
};
