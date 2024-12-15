
const express = require("express");
const router = express.Router();
const upload = require('../config/upload');
const archivos__ = require('../controllers/archivos.Controller');
router.post("/upload-profile_docente", upload.single('profileImage'), archivos__.uploadImageProfile);

// Rutas para subir los diferentes documentos
router.post('/upload-cedula_docente', upload.single('cedula'), archivos__.uploadCedula);
router.post('/upload-curriculum_docente', upload.single('curriculum'), archivos__.uploadCurriculum);
router.post('/upload-documento-identificacion_docente', upload.single('documentoIdentificacion'), archivos__.uploadDocumentoIdentificacion);


module.exports = router;
