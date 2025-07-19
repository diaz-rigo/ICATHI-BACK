
const express = require("express");
const router = express.Router();
const upload = require('../config/upload');
const archivos__ = require('../controllers/archivos.Controller');
router.post('/upload-temario_curso', upload.single('temario'), archivos__.uploadTemario);
router.get('/descargar-temario', archivos__.descargarTemario);



router.post("/upload-profile_docente", upload.single('profileImage'), archivos__.uploadImageProfile);

router.post('/upload-documento-identificacion_docente', upload.single('documentoIdentificacion'), archivos__.uploadDocumentoIdentificacion);
// Rutas para subir los diferentes documentos
router.post('/upload-cedula_docente', upload.single('cedula'), archivos__.uploadCedula);
router.post('/upload-curriculum_docente', upload.single('curriculum'), archivos__.uploadCurriculum);
// Nueva ruta para subir temarios


module.exports = router;
