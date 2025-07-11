// const multer = require('multer');
// const path = require('path');

// // Configuración del almacenamiento
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/'); // Asegúrate de que este directorio existe
//   },
//   filename: function (req, file, cb) {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// // Validación para aceptar imágenes y PDFs
// const fileFilter = (req, file, cb) => {
//   // Aceptar imágenes (JPEG, PNG) y PDF
//   if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
//     cb(null, true);
//   } else {
//     cb(new Error('Solo se permiten archivos de imagen o PDF.'));
//   }
// };

// // Configuración de Multer
// const upload = multer({
//   storage,
//   fileFilter,
//   // limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB
// });

// module.exports = upload;
