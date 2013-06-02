/**
 * Attachment Model
 * User: vaishali
 * Date: 6/2/13
 * Time: 8:06 PM
 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Attachment',
        { postId: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: { msg: "postId Field can not be empty" }
            }
        },
            public_id: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: { msg: "public_id Field can not be empty" }
                }
            },
            url: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: { msg: "url Field can not be empty" }
                }
            },
            filename: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: { msg: "filename Field can not be empty" }
                }
            },
            mime: {
                type: DataTypes.STRING,
                validate: {
                    notEmpty: { msg: "mime Field can not be empty" }
                }
            }
        });
}