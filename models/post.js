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
                notEmpty: {msg: "The Book Title field can not be blank"}
            }
        },
        body: {
            type: DataTypes.TEXT,
                validate: {
                notEmpty: {msg: "The Synopsis field can not be blank"}
            }
        }
    });
}