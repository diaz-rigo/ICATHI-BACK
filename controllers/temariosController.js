const TemariosModel = require('../models/temariosModel');

exports.getAll = async (req, res) => {
    try {
        const temarios = await TemariosModel.getAll();
        res.status(200).json(temarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const temario = await TemariosModel.getById(id);
        if (!temario) {
            return res.status(404).json({ error: 'Temario no encontrado' });
        }
        res.status(200).json(temario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const nuevoTemario = await TemariosModel.create(req.body);
        res.status(201).json(nuevoTemario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const temarioActualizado = await TemariosModel.update(id, req.body);
        if (!temarioActualizado) {
            return res.status(404).json({ error: 'Temario no encontrado' });
        }
        res.status(200).json(temarioActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const temarioEliminado = await TemariosModel.delete(id);
        if (!temarioEliminado) {
            return res.status(404).json({ error: 'Temario no encontrado' });
        }
        res.status(200).json(temarioEliminado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};