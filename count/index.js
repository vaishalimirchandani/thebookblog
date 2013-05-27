var cont = 0;
exports.count_mw = function(){
    return function (req,res,next){
        var referer = req.header('referer');
        var host = req.host;
        if ((referer == undefined) || (referer.indexOf(host) < 0)){
            cont++;
            console.log("Visitas: " + cont);
        }
        //req.cont = cont;
        next();
    }
}

exports.getCount = function(){
    return cont
}
