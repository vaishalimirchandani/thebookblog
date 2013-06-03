/**
 * Session expire middleware
 * User: vaishali
 * Date: 6/1/13
 * Time: 10:48 PM
 */
var user_controller = require('.././routes/user_controller.js');

exports.sessionTime_mw = function(){
    return function(req, res, next){
        if(req.session && req.session.user){
            var timeInSeconds = new Date().getTime()/1000;
            if (timeInSeconds - req.session.user.time > 60000){
                console.log('Session has expired. User: '+req.session.user.name)
                delete req.session.user;
                req.flash('info','Session has expired. Please login again');
            }else{
                req.session.user.time = timeInSeconds;
                user_controller.updateTimeColumn(req,res,next);
            }
        }
        next();
    }
}

