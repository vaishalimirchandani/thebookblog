/**
 * Favourites model
 * User: vaishali
 * Date: 6/4/13
 * Time: 5:06 PM
 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Favourite',
        { userId: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: { msg: "Field userId can not be empty" }
            }
        },
            postId: {
                type: DataTypes.INTEGER,
                validate: {
                    notEmpty: { msg: "Field postId can not be empty" }
                }
            }
        });
}