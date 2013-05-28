
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , partials = require ('express-partials')
  , count = require('./count')
  , postController = require('./routes/post_controller.js');

var util = require('util');

var app = express();

//installl middleware to renderpartial
app.use(partials());
app.use(count.count_mw());

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

//middleware para capturar errores.

app.use(function(err, req, res, next) {
    if (util.isError(err)) {
        next(err);
    } else {
        console.log(err);
        res.redirect('/');
    }
});


if ('development' == app.get('env')) {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
} else {
    app.use(express.errorHandler());
}




// Helper estatico:
app.locals.escapeText =  function(text) {
    return String(text)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/\n/g, '<br>');
};


//ROUTES
app.get('/', routes.index);
app.get('/users', user.list);

//---------------------

app.param('postid', postController.load);

app.get('/posts.:format?', postController.index);
app.get('/posts/new', postController.new);
app.get('/posts/:postid([0-9]+).:format?', postController.show);
app.post('/posts', postController.create);
app.get('/posts/:postid([0-9]+)/edit', postController.edit);
app.put('/posts/:postid([0-9]+)', postController.update);
app.delete('/posts/:postid([0-9]+)', postController.destroy);
app.post('/posts/search.:format?', postController.search);



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
