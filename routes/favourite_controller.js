/**
 * Controller for Favourites: index, create, destroy.
 * No auto-load needed, coz our search will never be through the id, but with user_id & post_id
 * Question: can we make Auto-load with these params or does it always have to be with just id?
 * User: vaishali
 * Date: 6/4/13
 * Time: 5:18 PM
 */

var models = require('../models/models.js');


// GET /users/1/favourites -> enders the list of favourites
exports.index = function(req, res, next) {

    //GET ALL FAVOURITES POST OF USER

    models.Favourite.findAll({where: {userId: req.user.id}})
        .success(function(favourites) {

            // generar array con postIds de los post favoritos
            var postIds = favourites.map(
                function(favourite)
                {return favourite.postId;}
            );

            // busca los posts identificados por array postIds
            models.Post.findAll({order: 'updatedAt DESC',
                where: {id: postIds},
                include: [{ model: models.User, as: 'Author'},
                    models.Favourite ]
            })
                .success(function(posts) {
                    switch (format) {
                        case 'html':
                        case 'htm':

                            res.render('posts/index', {posts: posts});
                            res.render('favourites/index', {posts: posts});
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
                    next(error);
                });


            res.render('favourites/index', {
                posts: posts
            });
        });
}


// PUT /users/1/post/1
exports.create = function(req, res, next) {

    var favourite = models.Favourite.build(
        { userId: req.user.id,
            postId: req.post.id
        });

    favourite.save()
        .success(function() {
            res.redirect('back');
        })
        .error(function(error) {
            next(error);
        });
}

// DELETE /users/1/post/1
exports.destroy = function(req, res, next) {

    models.Favourite
        .find({where: {userId: req.session.user.id, postId: req.post.id}})
        .success(function(favourite) {

            favourite.destroy()
                .success(function() {
                    res.redirect('back');
                })
                .error(function(error) {
                    next(error);
                });
        });
}