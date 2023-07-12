require('dotenv').config()
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');

const controller = require("./controllers/Controller");
const connection = require("./config/db");
const isAuth = require("./middlewares/isAuth");


const app = express();

// ----- EJS -----
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
// folder for static resources
app.use(express.static("public"));

// ----- DB -----
const MONGO_URI = process.env.DB_URI;
let connect = connection.connection;
connect();


// ----- Session -----
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, useCredentials: true },
    store: MongoStore.create({ mongoUrl: MONGO_URI })
}));


// ----- Home -----
app.get("/", controller.home_get);


// ----- Register -----
app.get("/register", controller.register_get);

app.post("/register", controller.register_post);


// ----- Login -----
app.get("/login", controller.login_get);

app.post("/login", controller.login_post);


// ----- Dashboard -----
app.get("/dashboard", isAuth.isAuth, controller.dashboard_get);


// ----- Logout -----
app.post("/logout", controller.logout_post);


// ----- Reset Password -----
app.post("/forgot-password", controller.forgotpassword_post);

app.get("/reset-password/:username/:token", controller.resetpassword_get);

app.post("/reset-password/:username/:token", controller.resetpassword_post);


// ----- Server -----
app.listen(process.env.PORT, ()=> {
    console.log(`Server has started successfully at port ${process.env.PORT}...`);
});