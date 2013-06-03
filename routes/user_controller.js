/**
 * Usercontroller with it's seven basic actions
 * User: vaishali
 * Date: 5/31/13
 * Time: 10:14 PM
 */

var models = require('../models/models.js');
var crypto = require('crypto');


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

/*
 * Comprueba que el usuario logeado es el usuario alque se refiere esta ruta.
 */
exports.loggedUserIsUser = function(req, res, next) {

    if (req.session.user && req.session.user.id == req.user.id) {
        next();
    } else {
        console.log('Forbidden Route: The logged user is not the author of this post..');
        res.send(403);
    }
};


/*
 * Updates de time field in the model to check if session has expired...
 */

exports.updateTimeColumn = function(req, res, next) {

    models.User.find({where:{id:req.session.user.id}})
        .success(function(user){
            if(user && req.session && req.session.user){
                user.time = req.session.user.time;
                user.save(['time'])
                    .success(function() {
                        console.log('User time updated to: ' + req.session.user.time);
                    })
                    .error(function(error) {
                        next(error);
                    });
            }
        })
        .error(function(err){
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
                users: users
            });
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users/33
exports.show = function(req, res, next) {

    res.render('users/show', {
        user: req.user
    });
};

// GET /users/new
exports.new = function(req, res, next) {

    var user = models.User.build(
        { login: '',
            name:  '',
            email: ''
        });

    res.render('users/new', {user: user});
};

// POST /users
exports.create = function(req, res, next) {

    var user = models.User.build(
        { login: req.body.user.login,
            name:  req.body.user.name,
            email: req.body.user.email
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
                        }
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
                        validate_errors: validate_errors
                    });
                    return;
                }

                // El password no puede estar vacio
                if ( ! req.body.user.password) {
                    req.flash('error', 'Password field can not be empty');
                    res.render('users/new', {user: user});
                    return;
                }

                user.salt = createNewSalt();
                user.hashed_password = encriptarPassword(req.body.user.password, user.salt);



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

    res.render('users/edit', {user: req.user});
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
            validate_errors: validate_errors});
        return;
    }

    var fields_to_update = ['name','email'];

    // ¿Cambio el password?
    if (req.body.user.password) {
        console.log('Password has to be updated');
        req.user.salt = createNewSalt();
        req.user.hashed_password = encriptarPassword(req.body.user.password,
            req.user.salt);
        fields_to_update.push('salt');
        fields_to_update.push('hashed_password');
    }

    req.user.save(fields_to_update)
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



// ----------------------------------
// Authentication
// ----------------------------------

/*
 * Crea un string aleatorio para usar como salt.
 */
function createNewSalt() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
};

/*
 * Encripta un password en claro.
 * Mezcla un password en claro con el salt proporcionado, ejecuta un SHA1 digest,
 * y devuelve 40 caracteres hexadecimales.
 */
function encriptarPassword(password, salt) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

/*
 * Autenticar un usuario.
 *
 * Busca el usuario con el login dado en la base de datos y comprueba su password.
 * Si everything es correcto ejecuta callback(null,user).
 * Si la autenticación falla o hay errores se ejecuta callback(error).
 */
exports.autenticar = function(login, password, callback) {

    models.User.find({where: {login: login}})
        .success(function(user) {
            if (user) {
                console.log('User Found.');

                if (user.hashed_password == "" && password == "") {
                    callback(null,user);
                    return;
                }

                var hash = encriptarPassword(password, user.salt);

                if (hash == user.hashed_password) {
                    callback(null,user);
                } else {
                    callback('Wrong password.');
                };
            } else {
                callback('Username does not exit.');
            }
        })
        .error(function(err) {
            callback(err);
        });
};

//  ----------------------------------