const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Phone = require('../models/phoneModel');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");


router.get('/', async (req, res) => {
    res.json(await User.find());
});

router.post('/signUp', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const exist = await User.findOne({ email: email });
    if(exist){
        res.status(500).json({ error: 'Error occured when creating user'});
    }else{
        const hashedPassword = hash(password);
        uniqueString=randString();
        const uniqueStringExist = await User.findOne({ uniqueString:uniqueString });
        while(uniqueStringExist){
            uniqueString=randString();
            uniqueStringExist = await User.findOne({ uniqueString:uniqueString });
        }
        const isValid=false;
        const newUser = new User({ firstName: firstName,lastName: lastName, email: email, password: hashedPassword, isValid: isValid, uniqueString: uniqueString});
        res.json(await newUser.save());
        sendMail(email,uniqueString);
    }
});

router.post('/signIn', async (req, res) => {
    const {email, password} = req.body;
    hashedPassword = hash(password);
    const validUser = await User.findOne({email: email, password: hashedPassword});
    if(validUser){
        if (validUser.isValid){
            const token = jwt.sign({ id: validUser._id }, process.env.JWT_KEY);
            res.json({token,validUser});
        } else {
            res.status(404).json({error: "unauthenticated"});
        }
    }else{
        res.status(404).json({error: "Invalid"});
    }
});

router.get('/id/:id', async (req, res) => {
    res.json(await User.findById(req.params.id));
});

router.put('/:id', async (req, res) => {
    res.json(await User.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/:id', async (req, res) => {
    res.json(await User.findByIdAndDelete(req.params.id));
});

router.get('/email/:email', async (req, res) => {
    const user = await User.findOne({ email: req.params.email });
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

//authenticate email
router.get('/verify/:uniqueString',async(req,res)=>{
    var {uniqueString}=req.params;
    uniqueString=uniqueString.substring(2,uniqueString.length-1);
    const user=await User.findOne({uniqueString:uniqueString});
    if (user){
        user.isValid=true;
        user.uniqueString=randString();
        const exist = await User.findOne({ uniqueString:user.uniqueString });
        while(exist){
            user.uniqueString=randString();
            exist = await User.findOne({ uniqueString:user.uniqueString });
        }
        await user.save();
        res.send("Successfully authenticate!");
    }else{
        res.send('You have already authenticated');
    }
})


//send mail to change password
router.post('/sendmail',async(req,res)=>{
    const {email} = req.body;
    const user =await User.findOne({email: email});
    if(!user){
        res.status(404).send({error:'invalid email'});
    }else{
        sendMailPassword(email);
        res.send('We have already sent changing password email to your email account');
    }
})

//direct to forgetPassword.html
router.get('/passwordEmail/:email',async(req,res)=>{
    var {email}=req.params;
    email=email.substring(2,email.length-1);
    res.sendFile('back/forgetPassword.html', {'root': '../'});
})

//change password when user not login
router.post('/forgetPassword',async(req,res)=>{
    var {email, password}=req.body;
    password=hash(password)
    const user =await User.findOne({email: email});
    user.password=password;
    await user.save();
    res.json(user);
})

//change password in user profile(login)
router.post('/password/:id',auth,async(req,res)=>{
    var {oldpassword,newpassword}=req.body;
    oldpassword=hash(oldpassword);
    newpassword=hash(newpassword);
    const p=await User.findOne({_id: req.params.id});
    if(p.password==oldpassword){
        p.password=newpassword;
        await p.save();
        sendMailNotification(p.email);
        res.send('change password finished');
    }else{
        res.status(404).send({error:'wrong original password'});
    }
})

//verify password before change account details
router.post('/verifyPassword/:id', auth, async(req,res)=>{
    var {typeInPassword}=req.body;
    const user = await User.findById(req.params.id);
    var password=user.password;
    if (password==typeInPassword){
        res.json(user);
    }else{
        res.status(404).json({error: "Your password is not correct"});
    }
})


//change user information
router.post('/change/:id',auth, async(req,res)=>{
    var {firstName, lastName, email}=req.body; //user tpyed info (new)
    const user = await User.findOne({email:email});
    const u = await User.findById(req.params.id);  //original info

    if(u.email==email){
        u.firstName=firstName; 
        u.lastName=lastName;
        u.email=email;
        await u.save();
        res.json(u);
    }else{
        if(user){
            res.status(404).json({error: "This email has been used"});
        }else{
            u.firstName=firstName; 
            u.lastName=lastName;
            u.email=email;
            await u.save();
            res.json(u);
            }
    }
})


//add phone to user shoopingCart
//userID in the URL, phoneID and quantity in the req.body
//this api set the quantity and item(quantity does not increase)
router.post('/addToCart/:userID',async (req, res) => {
    const userID = req.params.userID;

    for(const item of req.body){
        const { phoneID, quantity } = item;
        console.log(quantity);
        //check if the item exist
        const alreadyExist = await User.findOne(
            {_id: userID, "shoppingCart.phoneID": phoneID}
        )
        if(alreadyExist){
             //if the shopping cart include the phone
            let result = await User.updateOne(
            { _id: userID, "shoppingCart.phoneID": phoneID },
            { $set: { "shoppingCart.$.quantity": quantity } },
            {new: true},
         );
        }else{
            result = await User.updateOne(
                { _id: userID},
                { $push: { shoppingCart: {phoneID:phoneID,quantity:quantity} } },
                {new: true},
            );
            
        }
    }
    const updatedUser = await User.findById(userID);
    res.json(updatedUser.shoppingCart);
});

//detele the specified item in shoppingcart
router.put('/deleteCartItem/:userID/:phoneID', async (req, res) => {
    const userID = req.params.userID;
    const phoneID = req.params.phoneID;
    const user = await User.findByIdAndUpdate(userID, { $pull: { shoppingCart: { phoneID: phoneID } } }, { new: true });
    if(user){
        res.json(user);
    }else{
        res.status(500).json("item not found");
    }
});


//get the specified phone quantity in the specified shoppingCart
router.get('/quantityInCart/:userID/:phoneID', async (req, res) => {
    const user = await User.findById(req.params.userID);
    let quantity = 0;
    for( const phone of user.shoppingCart){
        if(phone.phoneID == req.params.phoneID){
            quantity = phone.quantity;
        }
    }
    res.json({"quantity": quantity});
});


//get specified shoppingCart
router.get('/getCart/:userID', async (req, res) => {
    const user = await User.findById(req.params.userID);
    res.json(user.shoppingCart);
});

//get the total price of the specified user shoppingCart
router.get('/cartTotal/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    let total = 0;

    for( const phone of user.shoppingCart){
        const item = await Phone.findById(phone.phoneID);
        if(!item){
            res.json("Phone not found:"+phone.phoneID);
        }
        const price = item.price;
        total+= price*phone.quantity;
    }
    res.json(total);
});


//clear the shoppingCart and reduce the stock
router.post('/checkout/:id', async (req, res) => {
    const userID = req.params.id;
    let user = await User.findById(userID);
    const shoppingCart = user.shoppingCart;
    for(const item of shoppingCart){
        const phoneID = item.phoneID;
        const phone = await Phone.findById(phoneID);
        await Phone.findByIdAndUpdate(phoneID, {$inc: {stock: -item.quantity}});
    }
    user = await User.findByIdAndUpdate(
        userID,
        { $set: { shoppingCart: [] } },
        { new: true })
    res.json(user);
});



function hash(password){
    const hash = crypto.createHash('sha256');
    hash.update(password);
    return hash.digest('hex');
}
const randString=()=>{
    const len=8;
    let randStr='';
    for(let i=0; i<len;i++){
        const ch=Math.floor((Math.random()*10)+1);
        randStr+=ch;
    }
    return randStr;
}

const sendMail=(mail,uniqueString)=>{
    var transporter = nodemailer.createTransport({
        service:"gmail",
        host:'smtp.gmail.com',
        auth:{
            user:"harrisonashytwilight@gmail.com",
            pass: "hhckidtlcfqequoz"
        }
    });

    var options={
        from: "harrisonashytwilight@gmail.com", // sender address
        to: mail, // list of receivers
        subject: "Please authenticate your account", // Subject line
        html: "Please click<a href='http://localhost:3000/users/verify/&{"+ uniqueString+"}'> here </a>  to authenticate your account"
        };
    transporter.sendMail(options,function(err,info){
        if (err){
            console.log(err);
            return;
        }
        console.log("Sent: "+info.response);
    })
}

const sendMailPassword=(mail)=>{
    var transporter = nodemailer.createTransport({
        service:"gmail",
        host:'smtp.gmail.com',
        auth:{
            user:"harrisonashytwilight@gmail.com",
            pass: "hhckidtlcfqequoz"
        }
    });


    var options={
        from: "harrisonashytwilight@gmail.com", // sender address
        to: mail, // list of receivers
        subject: "Change Password", // Subject line
        html: "Please click<a href='http://localhost:3000/users/passwordEmail/&{"+ mail+"}'> here </a>  to change your password"
        };
    transporter.sendMail(options,function(err,info){
        if (err){
            console.log(err);
            return;
        }
        console.log("Sent: "+info.response);
    })
}

const sendMailNotification=(mail)=>{
    var transporter = nodemailer.createTransport({
        service:"gmail",
        host:'smtp.gmail.com',
        auth:{
            user:"harrisonashytwilight@gmail.com",
            pass: "hhckidtlcfqequoz"
        }
    });

    var options={
        from: "harrisonashytwilight@gmail.com", // sender address
        to: mail, // list of receivers
        subject: "Changed Password Notification", // Subject line
        html: "You have successfully changed password"
        };
    transporter.sendMail(options,function(err,info){
        if (err){
            console.log(err);
            return;
        }
        console.log("Sent: "+info.response);
    })
}
module.exports = router;
