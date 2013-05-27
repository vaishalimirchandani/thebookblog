/**
 * Created by:
 * User: vaishali
 * Date: 5/27/13
 * Time: 9:07 PM
 */
var models = require('../models/models.js');


// GET /posts
exports.index = function(req, res, next) {
    models.Post
        .findAll({order: 'updatedAt DESC'})
        .success(function(posts) {
            res.render('posts/index', {
                posts: posts
            });
        })
        .error(function(error) {
            console.log("Error: No puedo listar los posts.");
            res.redirect('/');
        });
};




// GET /posts/33
exports.show = function(req, res, next) {

    var id = req.params.postid;
    models.Post
        .find({where: {id:Number(id)}})
        .success(function(post) {
            if (post) {
                res.render('posts/show', {
                    post: post
                });
            } else {
                console.log('No existe ningun post con id='+id+'.');
                res.redirect('/posts');
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
        });


};


// GET /posts/new
exports.new = function(req, res, next) {
    var post = models.Post.build(
        { title: 'Introduzca el titulo',
            body: 'Introduzca el texto del articulo'
        });
    res.render('posts/new', {post: post});
};



// POST /posts
exports.create = function(req, res, next) {

    //sacar las variables del formulario post (setAttributes)
    var post = models.Post.build(
        { title: req.body.post.title,
            body: req.body.post.body,
            authorId: 0
        });

    var validate_errors = post.validate();
    if (validate_errors) {
        console.log("Errores de validacion:", validate_errors);
        res.render('posts/new', {post: post});
        return;
    }

    post.save()
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            console.log("Error: No puedo crear el post:", error);
            res.render('posts/new', {post: post});
        });
};



// GET /posts/33/edit
exports.edit = function(req, res, next) {
    var id =
        req.params.postid;
    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                res.render('posts/edit', {post: post});
            } else {
                console.log('No existe ningun post con id='+id+'.');
                res.redirect('/posts');
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
        });
};


// PUT /posts/33
exports.update = function(req, res, next) {
    var id = req.params.postid;
    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                post.title = req.body.post.title;
                post.body = req.body.post.body;
                var validate_errors = post.validate();
                if (validate_errors) {
                    console.log("Errores de validacion:", validate_errors);
                    res.render('posts/edit', {post: post});
                    return;
                }
                post.save(['title','body'])
                    .success(function() {
                        res.redirect('/posts');
                    })
                    .error(function(error) {
                        console.log("Error: No puedo editar el post:", error);
                        res.render('posts/edit', {post: post});
                    });
            } else {
                console.log('No existe ningun post con id='+id+'.');
                res.redirect('/posts');
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
        });
};



// DELETE /posts/33
exports.destroy = function(req, res, next) {
    var id =
        req.params.postid;
    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                post.destroy()
                    .success(function() {
                        res.redirect('/posts');
                    })
                    .error(function(error) {
                        console.log("Error: No puedo eliminar el post:", error);
                        res.redirect('back');
                    });
            } else {
                console.log('No existe ningun post con id='+id+'.');
                res.redirect('/posts');
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
        });
};