const express = require('express');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();
let Categoria = require('../models/categoria');

/**
 * Show all the categories
 */
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                categorias
            });
        });
});

/**
 * Show categories by ID
 */
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById();
    let id = req.params.id;
    Categoria.findById(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/**
 * Create new category
 */
app.post('/categoria', verificaToken, (req, res) => {
    // Return the new category
    // req.usuario._id
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/**
 * Update a category
 */
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let descripcionCategoria = {
        descripcion: body.descripcion
    }
    Categoria.findByIdAndUpdate(id, descripcionCategoria, { new: true, runValidators: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

/**
 * Delete a category
 */
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {
    // Only an Administrator can delete a category
    // Categoria.findByIdAndRemove()
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            });
        }
        res.json({
            ok: true,
            message: 'Categoria Borrada'
        });
    });
});


module.exports = app;