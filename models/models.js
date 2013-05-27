/**
 * User: vaishali
 * Date: 5/27/13
 * Time: 8:07 PM
 * To change this template use File | Settings | File Templates.
 */
// Modelos ORM
var path = require('path');
var Sequelize = require('sequelize');


// Para usar SQLite:
var sequelize = new Sequelize(null,null,null,
    {dialect:"sqlite",
        storage:"blog.sqlite"});


// Importar la definicion de la clase Post desde post.js.
// Y que este modulo exporta la clase Post:
exports.Post = sequelize.import(path.join(__dirname,'post'));


// No hace falta si migración se hace a mano
//Si no existe la BBDD y las tablas, se crean solitas
sequelize.sync() ;