const dotenv = require("dotenv");
dotenv.config('${process.env.JWT_KEY}');
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const server = express();
const cors=require("cors")

mongoose.connect("mongodb://127.0.0.1:27017/phone_Distributor", {useNewUrlParser: true, useUnifiedTopology: true});

server.use(express.urlencoded({ extended: true }));
server.use(cors());
server.use(bodyParser.json());
server.use(express.json());
server.use(express.static('./dataset_dev'));
server.use('/users',require('./controllers/userController'));
server.use('/phones',require('./controllers/phoneController'));


const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('success');
});

