
exports.isAuth = (req, res, next) => {
    if(req.session.isAuth) {
        next();
    } else {
        console.log("No session, cannot access dashboard");
        res.redirect("/");
    }
}