const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Configuración del servidor de archivos
const FILE_SERVER_URL = 'http://201.116.27.119:3000';
const UPLOAD_ENDPOINT = '/api/files/upload';

exports.uploadTemario = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha enviado el archivo de temario." });
    }

    const file = req.file;
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);
    
    // Subir el archivo al servidor de archivos
    const response = await axios.post(
      `${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=temarios_cursos`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Enviar la URL del archivo
    res.status(201).json({ fileUrl: response.data.url });
  } catch (error) {
    console.error("Error al subir el temario:", error.message);
    res.status(500).json({ 
      message: "Error al subir el temario.", 
      error: error.message 
    });
  }
};

exports.uploadImageProfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha enviado una imagen." });
    }

    const file = req.file;
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);
    
    const response = await axios.post(
      `${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=perfiles_docentes`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ image: response.data.url });
  } catch (error) {
    console.error("Error al subir la imagen:", error.message);
    res.status(500).json({ 
      message: "Error al subir la imagen.", 
      error: error.message 
    });
  }
};

exports.uploadCedula = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha enviado el archivo de cédula." });
    }

    const file = req.file;
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);
    
    const response = await axios.post(
      `${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=cedulas_docentes`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ fileUrl: response.data.url });
  } catch (error) {
    console.error("Error al subir la cédula:", error.message);
    res.status(500).json({ 
      message: "Error al subir la cédula.", 
      error: error.message 
    });
  }
};

exports.uploadCurriculum = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha enviado el archivo del currículum." });
    }

    const file = req.file;
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);
    
    const response = await axios.post(
      `${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=curriculum_docentes`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ fileUrl: response.data.url });
  } catch (error) {
    console.error("Error al subir el currículum:", error.message);
    res.status(500).json({ 
      message: "Error al subir el currículum.", 
      error: error.message 
    });
  }
};

exports.uploadDocumentoIdentificacion = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No se ha enviado el archivo del documento de identificación.",
      });
    }

    const file = req.file;
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path), file.originalname);
    
    const response = await axios.post(
      `${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=documentos_identificacion_docentes`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    // Eliminar el archivo temporal
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({ fileUrl: response.data.url });
  } catch (error) {
    console.error("Error al subir el documento de identificación:", error.message);
    res.status(500).json({
      message: "Error al subir el documento de identificación.",
      error: error.message,
    });
  }
};