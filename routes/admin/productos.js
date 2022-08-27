var express = require('express');
var router = express.Router();
var productosModel = require('../../models/productosModel')
const util = require('util');
const cloudinary = require('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload)
const destroy = util.promisify(cloudinary.uploader.destroy)

/* GET home page. */


router.get('/', async function (req, res, next) {

  var productos = await productosModel.getProductos();

  productos = productos.map(producto => {
    if (producto.imagen_id) {
      const imagen = cloudinary.image(producto.imagen_id, {
        width: 50,
        height: 75,
        crop: 'fill'
      });
      return {
        ...producto,
        imagen
      }
    } else {
      return {
        ...producto,
        imagen: ''
      }
    }
  });

  res.render('admin/productos', {
    layout: 'admin/layout',
    usuario: req.session.nombre,
    productos
  });
});

router.get('/agregar', async function (req, res, next) {
  res.render('admin/agregar', {
    layout: 'admin/layout'
  })
})

router.post('/agregar', async (req, res, next) => {
  try {

    var imagen_id = '';
    if (req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      imagen_id = (await uploader(imagen.tempFilePath)).public_id;

    }

    if (req.body.nombre != "" && req.body.precio != "" && req.body.cuerpo != "") {
      await productosModel.insertProductos({
        ...req.body,
        imagen_id
      });
      res.redirect('/admin/productos')
    } else {
      res.render('admin/agregar', {
        layout: 'admin/layout',
        error: true,
        message: 'Todos los campos deben ser llenados'
      })
    }
  } catch (error) {
    console.log(error)
    res.render('admin/agregar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se cargo al sistema'
    })
  }
})

router.get('/eliminar/:id', async (req, res, next) => {
  var id = req.params.id;
  await productosModel.deleteProductoById(id);
  res.redirect('/admin/productos');
})
module.exports = router;

router.get('/modificar/:id', async (req, res, next) => {
  var id = req.params.id;
  var producto = await productosModel.getProductosById(id);
  if(producto.imagen_id){
    await (destroy(producto.imagen_id));
  }
  
  await productosModel.getProductosById(id);

  res.render('admin/modificar', {
    layout: 'admin/layout',
    producto
  })
})

router.post('/modificar', async (req, res, next) => {
  try {
    let imagen_id = req.body.imagen_original;
    let borrar_imagen_vieja = false;

    if (req.body.imagen_delete === "1") {
      imagen_id = null;
      borrar_imagen_vieja = true;
    } else {
      if (req.files && Object.keys(req.files).length > 0) {
        imagen = req.files.imagen;
        imagen_id = (await uploader(imagen.tempFilePath)).public_id;
        borrar_imagen_vieja = true;
      }
    }
    if (borrar_imagen_vieja && req.body.img_orignal) {
      await (destroy(req.body.img_original));
    }

    var obj = {
      nombre: req.body.nombre,
      precio: req.body.precio,
      stock: req.body.stock,
      imagen_id
    }
    console.log(obj)

    await productosModel.modificarProductoById(obj, req.body.id);
    res.redirect('/admin/productos');
  } catch (error) {
    console.log(error)
    res.render('admin/modificar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se ha podido modificar'
    })
  }
})