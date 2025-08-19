module.exports = function requireAdmin(req, res, next) {
    if (!req.user || req.user.rol !== "ADMIN") {
        return res.status(403).json({ ok: false, message: "No autorizado." });
    }
    next();
};