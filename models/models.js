/**
 * User: vaishali
 * Date: 5/27/13
 * Time: 8:07 PM
 * To change this template use File | Settings | File Templates.
 */
// Modelos ORM
var path = require('path');

var Sequelize = require('sequelize');

// Usar BBDD definida en variables de entorno:
var sequelize = new Sequelize(process.env.DATABASE_NAME,
        process.env.DATABASE_USER,
        process.env.DATABASE_PASSWORD,
        { dialect: process.env.DATABASE_DIALECT,
            protocol: process.env.DATABASE_PROTOCOL,
            port: process.env.DATABASE_PORT,
            host: process.env.DATABASE_HOST,
            storage: process.env.DATABASE_STORAGE,
            omitNull: true});

// Importar la definicion de la clase Post desde post.js.
// Y que este modulo exporta la clase Post:

exports.Post = sequelize.import(path.join(__dirname,'post'));
exports.User = sequelize.import(path.join(__dirname,'user'));



// No hace falta si migración se hace a mano
//Si no existe la BBDD y las tablas, se crean solitas
sequelize.sync() ;