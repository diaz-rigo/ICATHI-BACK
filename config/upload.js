const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Aceptar solo ciertos tipos de archivos
    const filetypes = /jpeg|jpg|png|webp|pdf|doc|docx/; // 👈 agregamos webp
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Error: Solo se permiten imágenes (JPEG, JPG, PNG, WEBP) o documentos (PDF, DOC, DOCX)'));
};

// Configuración de Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // limits: {
    //   fileSize: 20 * 1024 * 1024 // Aumenta el límite a 20MB (ajusta según necesites)
    // }
});

module.exports = upload;