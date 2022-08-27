var express = require('express');
var router = express.Router();
var productosModel = require('../models/productosModel')
const cloudinary = require('cloudinary').v2;
var nodemailer = require('nodemailer');

router.get('/productos', async function (req, res, next) {
    let productos = await productosModel.getProductos();

    productos = productos.map(productos => {
        if (productos.imagen_id) {
            const imagen = cloudinary.url(productos.imagen_id, {
                width: 560,
                height: 1120,
                crop: 'fill'
            });
            return {
                ...productos,
                imagen
            }
        } else {
            return {
                ...productos,
                imagen: ''
            }
        }
    });

    res.json(productos);
});


router.post('/comparti', async (req, res) => {
    const mail = {
        to: 'gabitoestrada@yahoo.com',
        subject: 'comparti web',
        html: `${req.body.nombre} se contacto a traves de la web y quiere informacion a este 
        correo: ${req.body.email} <br>Además, hizo el siguiente comentario: ${req.body.mensaje}
        <br> Su tel es: ${req.body.telefono}`
    }

    const transport = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth:{
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transport.sendMail(mail)

    res.status(201).json({
        error:false,
        message: 'Mensaje enviado'
    });
    
});

module.exports = router;