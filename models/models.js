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



// Importar la definicion de los modelos:
//    - Post desde post.js.
//    - User desde user.js.
//    - Comment desde comment.js.
//    - Attachment desde attachment.js.
//    - Favourites desde favourite.js

var Post = sequelize.import(path.join(__dirname,'post'));
var User = sequelize.import(path.join(__dirname,'user'));
var Comment = sequelize.import(path.join(__dirname,'comment'));
var Attachment = sequelize.import(path.join(__dirname,'attachment'));
var Favourite = sequelize.import(path.join(__dirname,'favourite'));

// Relaciones

// La llamada User.hasMany(Post);
//  - crea un atributo llamado UserId en el modelo de Post
//  - y en el prototipo de User se crean los metodos getPosts, setPosts,
//    addPost, removePost, hasPost y hasPosts.
//
// Como el atributo del modelo Post que apunta a User se llama authorId
// en vez de UserId, he añadido una opcion que lo indica.
User.hasMany(Post, {foreignKey: 'authorId'});

User.hasMany(Comment, {foreignKey: 'authorId'});
Post.hasMany(Comment, {foreignKey: 'postId'});

Post.hasMany(Attachment, {foreignKey: 'postId'});

User.hasMany(Favourite, {foreignKey: 'authorId'});
Post.hasMany(Favourite, {foreignKey: 'postId'});



// La llamada Post.belongsTo(User);
//  - crea en el modelo de Post un atributo llamado UserId,
//  - y en el prototipo de Post se crean los metodos getUser y setUser.
//
// Como el atributo del modelo Post que apunta a User se llama authorId
// en vez de UserId, he añadido una opcion que lo indica. Asi la
// foreignkey del modelo Post es authorId, y los metodos creados son
// setAuthor y getAuthor.
Post.belongsTo(User, {as: 'Author', foreignKey: 'authorId'});

Comment.belongsTo(User, {as: 'Author', foreignKey: 'authorId'});
Comment.belongsTo(Post, {foreignKey: 'postId'});
Attachment.belongsTo(Post, {foreignKey: 'postId'});

Favourite.belongsTo(Post, {foreignKey: 'postId'});
Favourite.belongsTo(User, {foreignKey: 'userId'});

// Exportar los modelos:
exports.Post = Post;
exports.User = User;
exports.Comment = Comment;
exports.Attachment = Attachment;
exports.Favourite = Favourite;

// No hace falta si migración se hace a mano
//Si no existe la BBDD y las tablas, se crean solitas
sequelize.sync() ;