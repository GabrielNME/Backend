var pool = require('./bd');

async function getProductos(user, password) {
    try {
        var query = 'select * from productos order by id DESC';
        var rows = await pool.query(query);
        return rows;
    } catch (error) {
        console.log(error)

    }
}

async function insertProductos(obj) {
    try {
        var query = "insert into productos set ?";
        var rows = await pool.query(query, [obj]);
        return rows;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function deleteProductoById(id) {
    var query = ' delete from productos where id=?';
    var rows = await pool.query(query, [id]);
    return rows;
}

async function getProductosById(id) {
    var query = 'select * from productos where id =?';
    var rows = await pool.query(query, [id]);
    return rows[0];
}


async function modificarProductoById(obj, id) {
    try {
        var query = 'update productos set ? where id=?';
        var rows = await pool.query(query, [obj, id]);
        return rows;
    } catch (error) {
        throw error;
    }
}
module.exports = { getProductos, insertProductos, deleteProductoById, getProductosById, modificarProductoById };