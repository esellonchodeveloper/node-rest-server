const express = require('express');
const app = express();
const { verificaToken } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');

/**
 * Get all the products
 */
app.get('/producto', verificaToken, (req, res) => {
    // Return all the products with populate: usuario, categoria and paginate
    let desde = req.query.desde || 0;
    desde = Number(desde);
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

/**
 * Get one product by ID
 */
app.get('/producto/:id', verificaToken, (req, res) => {
    // Return the product with populate: usuario, categoria
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID del producto ingresado, no existe'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
});

/**
 * Search products
 */
app.get('/producto/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');
    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

/**
 * Create a new Product
 */
app.post('/producto', verificaToken, (req, res) => {
    // Save the user and category
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    });
});

/**
 * Update a Product
 */
app.put('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;
    let actualizarProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    }
    Producto.findByIdAndUpdate(id, actualizarProducto, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID del producto ingresado, no existe'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

/**
 * Delete a Product
 */
app.delete('/producto/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let productoDisponible = {
        disponible: false
    }
    Producto.findByIdAndUpdate(id, productoDisponible, { new: true, runValidators: true }, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID del producto ingresado, no existe'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto borrado'
        });
    });
});

module.exports = app;