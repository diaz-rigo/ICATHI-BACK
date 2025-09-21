// routes/validacion.routes.js
const { Router } = require("express");
const { getDictamenBySolicitud } = require("../controllers/validacion.controller");
const ValidacionModel = require("../models/validacionModel");

const router = Router();

router.get("/:solicitudId", getDictamenBySolicitud);

module.exports = router;


// Por solicitud (tu ejemplo tiene id: 6):
// GET http://localhost:3000/validacion-dictamen/6

// Por curso (tu ejemplo muestra cursoId: 406):
// GET http://localhost:3000/validacion-dictamen/curso/406