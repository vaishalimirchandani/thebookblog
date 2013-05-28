/**
 * Created by:
 * User: vaishali
 * Date: 5/27/13
 * Time: 9:07 PM
 */
var models = require('../models/models.js');
var count = require('.././count');

// GET /posts
exports.index = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();

    models.Post
        .findAll({order: 'updatedAt DESC'})
        .success(function(posts) {
            switch (format) {
                case 'html':
                case 'htm':
                    res.render('posts/index', {
                        posts: posts,
                        counter: count.getCount()
                    });
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
        })
        .error(function(error) {
            console.log("Error: No puedo listar los posts.");
            res.redirect('/');
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
    var format = req.params.format || 'html';
    format = format.toLowerCase();

    var id =  req.params.postid;

    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            switch (format) {
                case 'html':
                case 'htm':
                    if (post) {
                        res.render('posts/show', { post: post , counter: count.getCount()});
                    } else {
                        console.log('No existe ningun post con id='+id+'.');
                        res.redirect('/posts');
                    }
                    break;
                case 'json':
                    res.send(post);
                    break;
                case 'xml':
                    res.send(post_to_xml(post));
                    break;
                case 'txt':
                    res.send(post.title+' ('+post.body+')');
                    break;
                default:
                    console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
                    res.send(406);
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
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
        { title: 'Write in the book title',
            body: 'Write in the book synopsis and your Comments'
        });
    res.render('posts/new', {post: post, counter: count.getCount()});
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
        res.render('posts/new', {post: post, counter: count.getCount()});
        return;
    }

    post.save()
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            console.log("Error: No puedo crear el post:", error);
            res.render('posts/new', {post: post, counter: count.getCount()});
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
                res.render('posts/edit', {post: post, counter: count.getCount()});
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
                    res.render('posts/edit', {post: post, counter: count.getCount()});
                    return;
                }
                post.save(['title','body'])
                    .success(function() {
                        res.redirect('/posts');
                    })
                    .error(function(error) {
                        console.log("Error: No puedo editar el post:", error);
                        res.render('posts/edit', {post: post, counter: count.getCount()});
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