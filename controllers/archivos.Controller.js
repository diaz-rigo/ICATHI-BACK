const https = require('https'); // Añade esta línea al inicio del archivo

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const axiosInstance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false // ⚠️ Solo para desarrollo/testing
    })
});
const FILE_SERVER_URL = 'http://201.116.27.119:3000';
const UPLOAD_ENDPOINT = '/api/files/upload';


exports.uploadImageProfile = async(req, res) => {
    console.log("Subiendo imagen de perfil docente...");
    console.log("Archivo recibido:", req.file);
    try {
        if (!req.file) return res.status(400).json({ message: "No se ha enviado una imagen." });

        const folder = 'perfiles_docentes';
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const response = await axiosInstance.post(`${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=${folder}`, formData, {
            headers: formData.getHeaders()
        });

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        const uploadedUrl = response.data.url;
        const nombreArchivo = uploadedUrl.split('/').pop();
        const renderUrl = `https://${req.get('host')}/archivos/descargar?folder=${folder}&nombre=${nombreArchivo}`;

        res.status(201).json({ image: renderUrl });
    } catch (error) {
        // debugger;
        console.error("Error al subir la imagen:", error.message);
        res.status(500).json({ message: "Error al subir la imagen.", error: error.message });
    }
};

exports.descargarArchivoGeneral = async(req, res) => {
    const { folder, nombre } = req.query;

    if (!folder || !nombre) {
        return res.status(400).json({ message: 'Faltan parámetros: folder y/o nombre' });
    }

    try {
        const archivoURL = `${FILE_SERVER_URL}/uploads/${folder}/${nombre}`;

        const response = await axios.get(archivoURL, {
            responseType: 'stream'
        });

        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${nombre}"`);

        response.data.pipe(res);
    } catch (error) {
        console.error("Error al descargar archivo:", error.message);
        res.status(500).json({ message: "Error al descargar el archivo.", error: error.message });
    }
};




exports.descargarTemario = async(req, res) => {
    const { nombre } = req.query;

    if (!nombre) {
        return res.status(400).json({ message: 'Falta el nombre del archivo' });
    }

    try {
        // Llama al servidor de archivos en HTTP
        const archivoURL = `${FILE_SERVER_URL}/uploads/temarios_cursos/${nombre}`;

        const response = await axios.get(archivoURL, {
            responseType: 'stream'
        });

        // Reenviar headers relevantes
        res.setHeader('Content-Type', response.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${nombre}"`);

        // Transmitir el contenido del archivo
        response.data.pipe(res);
    } catch (error) {
        console.error("Error al descargar temario:", error.message);
        res.status(500).json({ message: "Error al descargar el archivo.", error: error.message });
    }
};




exports.uploadTemario = async(req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha enviado el archivo de temario." });
        }

        const file = req.file;

        // Crear FormData para enviar el archivo
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), file.originalname);

        // Subir el archivo al servidor de archivos
        const response = await axiosInstance.post(
            `${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=temarios_cursos`,
            formData, {
                headers: formData.getHeaders()
            }
        );

        // Eliminar archivo temporal
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Obtener el nombre del archivo
        const uploadedUrl = response.data.url;
        const nombreArchivo = uploadedUrl.split('/').pop();
        const renderUrl = `https://${req.get('host')}/archivos/descargar-temario?nombre=${nombreArchivo}`;

        // Enviar esa URL
        res.status(201).json({ fileUrl: renderUrl });
    } catch (error) {
        console.error("Error al subir el temario:", error.message);
        res.status(500).json({
            message: "Error al subir el temario.",
            error: error.message
        });
    }
};


// subir imagenes para formatos de cursos
exports.uploadImageFormat = async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No se ha enviado una imagen." });

        const folder = 'perfiles_docentes';
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const response = await axiosInstance.post(`${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=${folder}`, formData, {
            headers: formData.getHeaders()
        });

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        const uploadedUrl = response.data.url;
        const nombreArchivo = uploadedUrl.split('/').pop();
        const renderUrl = `https://${req.get('host')}/archivos/descargar?folder=${folder}&nombre=${nombreArchivo}`;

        res.status(201).json({ image: renderUrl });
    } catch (error) {
        console.error("Error al subir la imagen:", error.message);
        res.status(500).json({ message: "Error al subir la imagen.", error: error.message });
    }
};

exports.uploadCedula = async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No se ha enviado el archivo de cédula." });

        const folder = 'cedulas_docentes';
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const response = await axiosInstance.post(`${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=${folder}`, formData, {
            headers: formData.getHeaders()
        });

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        const uploadedUrl = response.data.url;
        const nombreArchivo = uploadedUrl.split('/').pop();
        const renderUrl = `https://${req.get('host')}/archivos/descargar?folder=${folder}&nombre=${nombreArchivo}`;

        res.status(201).json({ fileUrl: renderUrl });
    } catch (error) {
        console.error("Error al subir la cédula:", error.message);
        res.status(500).json({ message: "Error al subir la cédula.", error: error.message });
    }
};


exports.uploadCurriculum = async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No se ha enviado el archivo del currículum." });

        const folder = 'curriculum_docentes';
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const response = await axiosInstance.post(`${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=${folder}`, formData, {
            headers: formData.getHeaders()
        });

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        const uploadedUrl = response.data.url;
        const nombreArchivo = uploadedUrl.split('/').pop();
        const renderUrl = `https://${req.get('host')}/archivos/descargar?folder=${folder}&nombre=${nombreArchivo}`;

        res.status(201).json({ fileUrl: renderUrl });
    } catch (error) {
        console.error("Error al subir el currículum:", error.message);
        res.status(500).json({ message: "Error al subir el currículum.", error: error.message });
    }
};


exports.uploadDocumentoIdentificacion = async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({
            message: "No se ha enviado el archivo del documento de identificación.",
        });

        const folder = 'documentos_identificacion_docentes';
        const formData = new FormData();
        formData.append('file', fs.createReadStream(req.file.path), req.file.originalname);

        const response = await axiosInstance.post(`${FILE_SERVER_URL}${UPLOAD_ENDPOINT}?folder=${folder}`, formData, {
            headers: formData.getHeaders()
        });

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        const uploadedUrl = response.data.url;
        const nombreArchivo = uploadedUrl.split('/').pop();
        const renderUrl = `https://${req.get('host')}/archivos/descargar?folder=${folder}&nombre=${nombreArchivo}`;

        res.status(201).json({ fileUrl: renderUrl });
    } catch (error) {
        console.error("Error al subir el documento de identificación:", error.message);
        res.status(500).json({
            message: "Error al subir el documento de identificación.",
            error: error.message,
        });
    }
};