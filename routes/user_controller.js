/**
 * Usercontroller with it's seven basic actions
 * User: vaishali
 * Date: 5/31/13
 * Time: 10:14 PM
 */

var models = require('../models/models.js');
var count = require('.././count');


/*
 *  Auto-loading con app.param
 */
exports.load = function(req, res, next, id) {

    models.User
        .find({where: {id: Number(id)}})
        .success(function(user) {
            if (user) {
                req.user = user;
                next();
            } else {
                req.flash('error', 'There is no user with id = '+id+'.');
                next('There is no user with id = '+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};

// ----------------------------------
// Rutas
// ----------------------------------

// GET /users
exports.index = function(req, res, next) {

    models.User
        .findAll({order: 'name'})
        .success(function(users) {
            res.render('users/index', {
                users: users, counter: count.getCount()
            });
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users/33
exports.show = function(req, res, next) {

    res.render('users/show', {
        user: req.user, counter: count.getCount()
    });
};

// GET /users/new
exports.new = function(req, res, next) {

    var user = models.User.build(
        { login: 'Your Username',
            name:  'Your Name',
            email: 'Your Email'
        });

    res.render('users/new', {user: user, counter: count.getCount()});
};

// POST /users
exports.create = function(req, res, next) {

    var user = models.User.build(
        { login: req.body.user.login,
            name:  req.body.user.name,
            email: req.body.user.email,
            hashed_password: '',
            salt: ''
        });

    // El login debe ser unico:
    models.User.find({where: {login: req.body.user.login}})
        .success(function(existing_user) {
            if (existing_user) {
                console.log("Error: Username \""+ req.body.user.login +"\" already exists: "+existing_user.values);
                req.flash('error', "Error: Username \""+ req.body.user.login +"\" already exists.");
                res.render('users/new',
                    { user: user,
                        validate_errors: {
                            login: 'Username \"'+ req.body.user.login +'\" already exists.'
                        },
                        counter: count.getCount()
                    });
                return;
            } else {

                var validate_errors = user.validate();
                if (validate_errors) {
                    console.log("Validation Errors:", validate_errors);
                    req.flash('error', 'One or more fields in the form are invalid.');
                    for (var err in validate_errors) {
                        req.flash('error', validate_errors[err]);
                    };
                    res.render('users/new', {user: user,
                        validate_errors: validate_errors,
                        counter: count.getCount()
                    });
                    return;
                }

                user.save()
                    .success(function() {
                        req.flash('success', 'User created Successfully.');
                        res.redirect('/users');
                    })
                    .error(function(error) {
                        next(error);
                    });
            }
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users/33/edit
exports.edit = function(req, res, next) {

    res.render('users/edit', {user: req.user, counter: count.getCount()});
};

// PUT /users/33
exports.update = function(req, res, next) {

    // req.user.login = req.body.user.login;  // No se puede editar.
    req.user.name  = req.body.user.name;
    req.user.email = req.body.user.email;

    var validate_errors = req.user.validate();
    if (validate_errors) {
        console.log("Validation Errors:", validate_errors);
        req.flash('error', 'One or more fields in the form are invalid.');

        for (var err in validate_errors) {
            req.flash('error', validate_errors[err]);
        };
        res.render('users/edit', {user: req.user,
            validate_errors: validate_errors, counter: count.getCount()});
        return;
    }

    req.user.save(['name','email'])
        .success(function() {
            req.flash('success', 'User Updated Successfully.');
            res.redirect('/users');
        })
        .error(function(error) {
            next(error);
        });
};

// DELETE /users/33
exports.destroy = function(req, res, next) {

    req.user.destroy()
        .success(function() {
            req.flash('success', 'User Deleted Successfully.');
            res.redirect('/users');
        })
        .error(function(error) {
            next(error);
        });
};