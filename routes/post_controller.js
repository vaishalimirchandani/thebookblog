/*
* Created by:
* User: vaishali
* Date: 5/27/13
* Time: 9:07 PM
*/

var models = require('../models/models.js');

// Comprueba que el usuario logeado es el author.


    exports.loggedUserIsAuthor = function(req, res, next) {

    if (req.session.user && req.session.user.id == req.post.authorId) {
        next();
    } else {
        console.log('Forbidden: The logged user is not the author of this post.');
        res.send(403);
    }
};

//  Auto-loading con app.param


exports.load = function(req, res, next, id) {

    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                req.post = post;
                next();
            } else {
                req.flash('error', 'There is no book with id='+id+'.');
                next('There is no book with id='+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};

// GET /posts
exports.index = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();

    function render_synchronously(posts){
        switch (format) {
            case 'html':
            case 'htm':
                res.render('posts/index', {posts: posts});
                break;
            case 'json':
                res.send(posts);
                break;
            case 'xml':
                res.send(posts_to_xml(posts));
                break;
            case 'txt':
                res.send(posts.map(function(post) {
                    return post.title+' ('+post.body+')';
                }).join('\n'));
                break;
            default:
                console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
                res.send(406);
        }
    }

    models.Post
        .findAll({order: 'updatedAt DESC', include: [ { model: models.User, as: 'Author' } ]})
        .success(function(posts) {

            //http://stackoverflow.com/questions/6597493/synchronous-database-queries-with-node-js
            if (posts.length > 0){
                for (var i in posts) iteratePosts(i);

                function iteratePosts(i){

                    models.Comment.count({ where: {postId: posts[i].id}})
                        .success(function(c) {
                            posts[i].numberOfComments = c;

                            if (req.session.user ){

                                models.Favourite.find({where: {userId: req.session.user.id, postId: posts[i].id}})
                                    .success(function(fav) {
                                        posts[i].isFavourite = (fav != null);
                                        if(i == posts.length - 1) render_synchronously(posts);
                                    })
                                    .error(function(error) {next(error);});
                            }
                            else{
                                if(i == posts.length - 1) render_synchronously(posts);
                            }


                        })
                        .error(function(error) {next(error);})
                    ;
                }
            }
            else{
                render_synchronously(posts);
            }
        })
        .error(function(error) {
            next(error);
        });
};

function posts_to_xml(posts) {
    return '<posts>\n' +
        posts.map(function(post) {
            return '<post>'+
                ' <title>'+post.title+'</title>'+
                ' <body>'+post.body+'</body>'+
                '</post>';
        }).join('\n') + ('\n</posts>');
}


// GET /posts/33
exports.show = function(req, res, next) {

    // Buscar el autor
    models.User
        .find({where: {id: req.post.authorId}})
        .success(function(user) {

            // Si encuentro al autor lo añado como el atributo author, sino añado {}.
            req.post.author = user || {};

            // Buscar Adjuntos
            req.post.getAttachments({order: 'updatedAt DESC'})
                .success(function(attachments) {

                    // Buscar comentarios
                    models.Comment
                        .findAll({where: {postId: req.post.id},
                            order: 'updatedAt DESC',
                            include: [ { model: models.User, as: 'Author' } ]
                        })
                        .success(function(comments) {

                            var format = req.params.format || 'html';
                            format = format.toLowerCase();

                            models.Comment.count({ where: {postId: req.post.id}})
                                .success(function(c) {

                                    var user_id = req.session.user ? req.session.user.id : null;

                                    models.Favourite.find({where: {userId: user_id, postId: req.post.id}})
                                        .success(function (fav){
                                            var isFav = (fav != null);
                                            switch (format) {
                                                case 'html':
                                                case 'htm':
                                                    var new_comment = models.Comment.build({
                                                        body: 'Write your Comment'
                                                    });
                                                    res.render('posts/show', {
                                                        post: req.post,
                                                        comments: comments,
                                                        commentsNumber:c,
                                                        comment: new_comment,
                                                        attachments: attachments,
                                                        isFav : isFav
                                                    });
                                                    break;
                                                case 'json':
                                                    res.send(req.post);
                                                    break;
                                                case 'xml':
                                                    res.send(post_to_xml(req.post));
                                                    break;
                                                case 'txt':
                                                    res.send(req.post.title+' ('+req.post.body+')');
                                                    break;
                                                default:
                                                    console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
                                                    res.send(406);
                                            }

                                        })
                                        .error(function(error) {
                                            next(error);
                                        });
                                })
                                .error(function(error) {
                                    next(error);
                                });
                        })
                        .error(function(error) {
                            next(error);
                        });
                })
                .error(function(error) {
                    next(error);
                });
        })
        .error(function(error) {
            next(error);
        });
};


function post_to_xml(post) {
    if (post) {
        return '<post>'+
            ' <title>'+post.title+'</title>'+
            ' <body>'+post.body+'</body>'+
            '</post>';
    } else {
        return '<error>post no existe</error>';
    }
}

// GET /posts/new
exports.new = function(req, res, next) {
    var post = models.Post.build(
        { title: '',
            body: ''
        });
    res.render('posts/new', {post: post});
};



// POST /posts
exports.create = function(req, res, next) {

    //sacar las variables del formulario post (setAttributes)
    var post = models.Post.build(
        { title: req.body.post.title,
            body: req.body.post.body,
            authorId: req.session.user.id
        });

    var validate_errors = post.validate();
    if (validate_errors) {
        console.log("Validation errors:", validate_errors);

        req.flash('error', 'One or more fields in the form are invalid.');
        for (var err in validate_errors) {
            req.flash('error', validate_errors[err]);
        };

        res.render('posts/new', {post: post,
            validate_errors: validate_errors});
        return;
    }

    post.save()
        .success(function() {
            req.flash('success', 'The review for your new book has been created.');
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
};



// GET /posts/33/edit
exports.edit = function(req, res, next) {
    res.render('posts/edit', {post: req.post});
};


// PUT /posts/33
exports.update = function(req, res, next) {
    req.post.title = req.body.post.title;
    req.post.body = req.body.post.body;

    var validate_errors = req.post.validate();
    if (validate_errors) {
        console.log("Errores de validacion:", validate_errors);

        req.flash('error', 'One or more fields in the form are invalid.');
        for (var err in validate_errors) {
            req.flash('error', validate_errors[err]);
        };

        res.render('posts/edit', {post: req.post,
            validate_errors: validate_errors});
        return;
    }
    req.post.save(['title', 'body'])
        .success(function() {
            req.flash('success', 'The review for your new book has been updated.');
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
};



// DELETE /posts/33
exports.destroy = function(req, res, next) {

    var Sequelize = require('sequelize');
    var chainer = new Sequelize.Utils.QueryChainer

    var cloudinary = require('cloudinary');

    // Obtener los comentarios
    req.post.getComments()
        .success(function(comments) {
            for (var i in comments) {
                // Eliminar un comentario
                chainer.add(comments[i].destroy());
            }

            // Obtener los adjuntos
            req.post.getAttachments()
                .success(function(attachments) {
                    for (var i in attachments) {
                        // Eliminar un adjunto
                        chainer.add(attachments[i].destroy());

                        // Borrar el fichero en Cloudinary.
                        cloudinary.api.delete_resources(attachments[i].public_id,
                            function(result) {},
                            {resource_type: 'raw'});
                    }

                    // Obtener los favoritos
                    req.post.getFavourites()
                        .success(function(favs) {
                            for (var i in favs) {
                                // Eliminar un comentario
                                chainer.add(favs[i].destroy());
                            }
                            // Eliminar el post
                            chainer.add(req.post.destroy());

                            // Ejecutar el chainer
                            chainer.run()
                                .success(function(){
                                    req.flash('success', 'The book and its related comments was deleted.');
                                    res.redirect('/posts');
                                })
                                .error(function(errors){
                                    next(errors[0]);
                                })
                        })
                        .error(function(error) {
                            next(error);
                        });
                })
                .error(function(error) {
                    next(error);
                });
        })
        .error(function(error) {
            next(error);
        });
};




// GET /posts/search/
exports.search = function(req, res, next) {
    var written = req.body.search_text;
    var formatted_query = replace_for_query(written);
    models.Post
        .findAll({where: ["title like ? OR body like ?", formatted_query, formatted_query], order: "updatedAt DESC"})
        .success(function(posts) {
            res.render('posts/search', {
                written: written,
                posts: posts
            });
        })
        .error(function(error) {
            console.log("Error: No puedo listar los posts.");
            res.redirect('/');
        });

};

function replace_for_query(text) {
    if (text) {
        return "%".concat(text.replace(/ /g,"%"),"%");
    } else {
        return '<error>No hay texto</error>';
    }
}
