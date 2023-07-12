const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    managerID: {type: String, required: true},
    history: []
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);