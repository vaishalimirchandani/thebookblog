/**
 * Controller for Favourites: index, create, destroy.
 * No auto-load needed, coz our search will never be through the id, but with user_id & post_id
 * Question: can we make Auto-load with these params or does it always have to be with just id?
 * User: vaishali
 * Date: 6/4/13
 * Time: 5:18 PM
 */

var models = require('../models/models.js');

// GET /users/25/favourites
exports.index = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();

    function render_synchronously(posts){
        switch (format) {
            case 'html':
            case 'htm':
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
    }

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
                                                models.Comment.count({ where: {postId: posts[i].id}})
                                                    .success(function(c) {
                                                        posts[i].numberOfComments = c;
                                                        if(i == posts.length - 1) render_synchronously(posts);
                                                    })
                                                    .error(function(error) {next(error);});
                                            })
                                            .error(function(error) {next(error);});
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