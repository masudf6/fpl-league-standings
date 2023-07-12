
const mongoose = require("mongoose");

// ----- Database -----
const MONGO_URI = "mongodb://127.0.0.1:27017/userDB";

// This is how to invoke a top level async function
module.exports.connection = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Database Connected");
    } catch (err) {
        console.error(err);
    }
}