const mongoose = require("mongoose");
const phone = mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    brand:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required:true
    },
    stock:{
        type: Number,
        required:true
    },
    seller:{
        type: String,
        required:true
    },
    price:{
        type: String,
        required:true
    },
    disabled:{
        type: String,
        required:false
    },
    reviews: [
        {
          _id: false,
          review_id: {
            type: String,
            required: true
          },
          reviewer: {
            type: String,
            required: true
          },
          rating:{
            type: String,
            required: true
          },
          comment:{
            type: String,
            required: true
          }, 
          hidden:{
            type: String
          }
        }
      ],
});
const Phone = mongoose.model("Phone",phone);
module.exports = Phone;
