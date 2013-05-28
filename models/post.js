/**
 * User: vaishali
 * Date: 5/27/13
 * Time: 8:07 PM
 * Description:
 *      Definicion del modelo Post: id, authorId, title, body, createdAt, updatedAt
 *      id, createdAt, updatedAt se crea automáticamente
 */
//

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Post',
    { authorId: {
        type: DataTypes.INTEGER,
        validate: {
            notEmpty: {msg: "El campo autor no puede estar vacio"}
        }
    },
        title: {
            type: DataTypes.STRING,
                validate: {
                notEmpty: {msg: "El campo del titulo no puede estar vacio"}
            }
        },
        body: {
            type: DataTypes.TEXT,
                validate: {
                notEmpty: {msg: "El cuerpo del post no puede estar vacio"}
            }
        }
    });
}