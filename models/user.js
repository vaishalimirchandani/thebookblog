/**
 * Definicion de la clase User
 * User: vaishali
 * Date: 5/31/13
 * Time: 9:33 PM
 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('User',
        { login: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: { msg: "The Username Field can not be blank" }
            }
        },
            name: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: { msg: "The Name Field can not be blank" }
                }
            },
            email: {
                type: DataTypes.TEXT,
                validate: {
                    isEmail: { msg: "The Email format is not correct" },
                    notEmpty: { msg: "The Email Field can not be blank" }
                }
            },
            hashed_password: {
                type: DataTypes.STRING
            },
            salt: {
                type: DataTypes.STRING
            }

        });
}