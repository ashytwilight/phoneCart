const crypto = require('crypto');
const User = require('./models/userModel');
const mongoose = require('mongoose');
const fs = require('fs');
const Phone = require('./models/phoneModel');

mongoose.connect('mongodb://127.0.0.1:27017/phone_Distributor', {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log('Connected to MongoDB...');

    // Read the data.
    const userList = JSON.parse(fs.readFileSync('./dataset_dev/userlist.json', 'utf-8'));
    const phoneList = JSON.parse(fs.readFileSync('./dataset_dev/phonelisting.json', 'utf-8'));

    // Preprocess the data.
    for(const phone of phoneList){
      let count=0;
      for(const review of phone.reviews){
        review.review_id=count.toString();
        count++;
      }
      for(const phone of phoneList){
        phone.image = `http://localhost:3000/phone_default_images/${phone.brand}.jpeg`
      }
    }


    for (const user of userList) {
        //convert object to string
        if (user._id && user._id.$oid) {
            user._id = user._id.$oid;
          }
        user.password = hash('Abcd!1234');
        user.isValid=true;
        let string=randString();
        for(i=0;i<userList.length;i++){
          if(string==userList[i].uniqueString){
            string=randString();
            i=0;
          }
        }
        user.uniqueString=string;
        user.firstName=user.firstname;
        user.lastName=user.lastname;
        user.firstname=undefined;
        user.lastname=undefined;
      }
    Phone.insertMany(phoneList)
    .then(() => {
      console.log('Import phone successfully.');
      User.insertMany(userList)
        .then(() => {
          console.log('Import user successfully.');
          mongoose.connection.close();
        })
        .catch(err => {
          console.error('Import user failed', err);
          mongoose.connection.close();
        });
    })
    .catch(err => {
      console.error('Import phone failed', err);
    });


  })
  .catch(err => {
    console.error('Connection failed', err);
  });




function hash(password){
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}

function randString(){
  const len=8;
  let randStr='';
  for(let i=0; i<len;i++){
    const ch=Math.floor((Math.random()*10)+1);
    randStr+=ch;
  }
  return randStr;
}
