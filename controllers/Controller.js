require('dotenv').config()

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const gwh = require("../middlewares/gw_history.js");
const is_league_manager = require("../middlewares/is_league_manager.js");
const gameweek_rank = require("../middlewares/get_manager_rank.js");

const User = require("../models/User");

const sendEmail = require("../middlewares/sendEmail.js");


const JWT_SECRET = process.env.JWT_SECRET;


// ------- HOME -------
exports.home_get = async (req, res) => {
    res.render("home");
}


// ------- REGISTER -------
exports.register_get = (req, res)=> {
    res.render("register");
}

exports.register_post = async (req, res)=> {
    const { username, password, managerID } = req.body;

    let user = await User.findOne({ username });

    // check if user already exists
    if(user) {
        return res.redirect("/login");
    }

    // Check if the user is a league manager
    const league_manager = await is_league_manager.is_league_manager(Number(managerID));

    // Reject registration if manager is not in league
    if(!league_manager) {
        console.log("Manager Unauthorised");
        return res.redirect("/")
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // call FPL API for the manager and save {gameweek, Points} only in history
    const user_gw_history = await gwh.get_gw_history(managerID);

    user = new User({
        username: username,
        password: hashedPassword,
        managerID: managerID,
        history: user_gw_history
    });

    await user.save();

    res.redirect("/login");
}


// ------- LOGIN -------
exports.login_get = async (req, res)=> {
    res.render("login");
}

exports.login_post = async (req, res)=> {
    const { username, password, managerID } = req.body;

    const user = await User.findOne({ username });

    if(!user) {
        return res.send("<a href='/'>User does not Exist! CLICK here to Register<a>");
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    if(!passwordMatched) {

        return res.send("<a href='/'>Wrong Password! CLICK here to try again<a>");
    }

    req.session.isAuth = true;
    req.session.username = username;
    res.redirect("/dashboard");

}


// ------- DASHBOARD -------
exports.dashboard_get = async (req, res)=> {
    
    const username = req.session.username;

    const user = await User.findOne({ username });

    // Array of manager's rank for individial gameweek
    let rankArr = [];

    for(let i=0; i<=37; i++) {
        rankArr.push(await gameweek_rank.create_gw_rank(user.managerID, i));
    }

    // total money accumulated by manager over all gameweeks
    let total = rankArr.reduce((n, {amount}) => n + amount, 0);
    
    res.render("dashboard", { 
        gw_rank: rankArr,
        total_amount: total,
        session_user: user.username, 
        session_id: user.managerID,
    });

}


// ------- Password Reset -------
exports.forgotpassword_post = async (req, res) => {

    // get the email to send the link to
    const { username } = req.body;

    // check if email exists
    const user = await User.findOne({ username });

    if (!user) {
        res.send("Email is not registered");
    }

    // create new secret for token
    const secret = JWT_SECRET + user.password;

    const payload = {
        email: user.username
    }

    const token = jwt.sign(payload, secret, { expiresIn: "10m" });

    const link = `http://localhost:3000/reset-password/${user.username}/${token}`;

    sendEmail.sendEmail(user.username, link);

    return res.send("<a href='/'>Password Reset link sent to your email. CLICK here to login<a>");

}


// handle get request from the link
exports.resetpassword_get = async (req, res) => {

    // get email and token from parameters
    const { username, token } = req.params;

    // get the corresponding user from the database
    const user = await User.findOne({ username });

    // create secret from the database
    const secret = JWT_SECRET + user.password;

    // verify both token??
    jwt.verify(token, secret);

    res.render("reset-password", {email: username});
    
}

// handle reset password post request
exports.resetpassword_post = async (req, res) => {

    // get the email
    const { username, token } = req.params;

    const { newPass, newPassConfirm } = req.body;

    if (newPass !== newPassConfirm) {
        return res.send("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);

    // Update password in database
    await User.findOneAndUpdate({username: username}, {password: hashedPassword});

    res.send("Passwoed Updated");

}


// ------- LOGOUT -------
exports.logout_post = async (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/");
    });
}