/**
 * Comment model
 * User: vaishali
 * Date: 6/1/13
 * Time: 6:23 PM
 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Comment',
        { authorId: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: { msg: "Field authorId can not be empty" }
            }
        },
            postId: {
                type: DataTypes.INTEGER,
                validate: {
                    notEmpty: { msg: "Field postId can not be empty" }
                }
            },
            body: {
                type: DataTypes.TEXT,
                validate: {
                    notEmpty: { msg: "The Comment Body Field can not be empty" }
                }
            }
        });
}