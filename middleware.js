module.exports.loginRequired = (req,res,next)=>{

    if (!req.isAuthenticated()) {
        req.flash('error', 'please login first');
        res.redirect('/login');
    }
    else{
        next();
    }
}
module.exports.loginNotRequired = (req,res,next)=>{
    if (!req.isAuthenticated()) {
        next();
    }
    else{
        req.flash('error', 'You are already logged in, cant login or register!');
        res.redirect('/');
    }
}
