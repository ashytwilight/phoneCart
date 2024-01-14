const mongoose = require("mongoose");

const user = mongoose.Schema({
    firstname:{
        type: String,
    },
    lastname:{
        type: String,
    },
    firstName:{
        type: String,
        //required: true
    },
    lastName:{
        type: String,
        //required: true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    isValid:{
        type: Boolean
    },
    uniqueString:{
        type: String
    },
    shoppingCart: [
        {
            quantity:{
                type: Number,
                required: true
            },
            phoneID:{
                type: String,
                required: true
            }
        }
    ]
});

const User = mongoose.model("User",user);
module.exports = User;
