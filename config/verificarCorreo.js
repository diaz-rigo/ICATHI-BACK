// Archivo actualizado que usa la nueva estructura
const EmailController = require("../controllers/email-controller")

// Exportar la función principal para mantener compatibilidad
const verificarCorreoAntesRegistro = EmailController.verificarCorreoAntesRegistro

module.exports = {
  verificarCorreoAntesRegistro,
}
