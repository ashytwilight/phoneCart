const express = require('express');
const router = express.Router();
const Phone = require('../models/phoneModel');
const User = require('../models/userModel');
const { Types } = require('mongoose');
const { ObjectId } = Types;
const multer = require('multer');




router.get('/', async (req, res) => {
    res.json(await Phone.find());
});

router.get('/brands', async (req, res) => {
    const brands = await Phone.distinct('brand');
    res.json(brands);
});

router.get('/id/:id', async (req, res) => {
    const phone = await Phone.findById(req.params.id);
    
    if(!phone){
        res.status(404).json({error: "Phone not found"})
    }
    res.json(phone);
});

router.post('/', async (req, res) => {
    const newPhone = new Phone( req.body);
    res.json(await newPhone.save());
});

const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './dataset_dev/phone_default_images');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now()+file.originalname);
    },
  });

const uploader = multer({storage:localStorage});

router.post('/upload', uploader.single('photo'), async (req, res) => {
    const fileUrl = `http://localhost:3000/phone_default_images/${req.file.filename}`;
    res.json(fileUrl);
});

router.delete('/:id', async (req, res) => {
    const phone = await Phone.findById(req.params.id);

    if(!phone){
        res.status(404).json({error: "Phone not found"})
    }else{
        res.json(await Phone.findByIdAndDelete(req.params.id));
    }
});



router.put('/enable/:id', async (req, res) => {
    const phone = await Phone.findById(req.params.id);
    console.log(phone)
    if(phone.toObject().hasOwnProperty('disabled')){
        const result = await Phone.findByIdAndUpdate(req.params.id, { $unset: { disabled: 1 } }, { new: true });
        res.json(result);
    }else{
        res.json({error: "The phone is already enabled"});
    }
});

router.put('/disable/:id', async (req, res) => {
    const phone = await Phone.findById(req.params.id);
    console.log(phone)
    if(!phone.toObject().hasOwnProperty('disabled')){
        const result = await Phone.findByIdAndUpdate(req.params.id, { $set: { disabled: "" } }, { new: true });
        res.json(result);
    }else{
        res.json({error: "The phone is already disabled"});
    }
});


//get phone by seller
router.get('/seller/:seller', async (req, res) => {
    const phone = await Phone.find({ seller: req.params.seller });

    if(!phone){
        res.status(404).json({error: "No phones belongs to this seller"});
    }else{
        res.json(phone);
    }
});

//get review by userID
router.get('/review/user/:id', async (req, res) => {
    const userID = req.params.id;
    const reviews = await Phone.aggregate([
        {
            $unwind: "$reviews"
        },
        {
            $match: {
                "reviews.reviewer": userID
            }
        }
    ]);

    if(!reviews){
        res.status(404).json({error: "No review belongs to this user"});
    }else{
        res.json(reviews);
    }
});


//search based on searchTerm, brand and price filtering
router.get('/search/:search/:price/:brand',async (req,res) => {

    let max;
    let brand;
    const searchTerm = RegExp(req.params.search, "i");

    if(req.params.brand==="ALL"){
        brand = RegExp('.*','i');
    }else{
        brand = req.params.brand;
    }

    if(req.params.price=="ALL"){
        max=Infinity;
    }else{
        max = req.params.price;
    }

    const phone = await Phone.aggregate([
        {
          $match: {
            title: searchTerm,
            brand: brand,
          },
        },
        {
          $addFields: {
            priceInDouble: { $toDouble: '$price' }, 
          },
        },
        {
          $match: {
            priceInDouble: { $lte: parseFloat(max) }, 
          },
        },
    ])

    if (phone) {
        res.json(phone);
    } else {
        res.status(404).json({ error: 'phone not found' });
    }
});

//search based on price and brand
router.get('/search/:price/:brand',async (req,res) => {

    let max;
    let brand;

    if(req.params.brand==="ALL"){
        brand = RegExp('.*','i');
    }else{
        brand = req.params.brand;
    }

    if(req.params.price=="ALL"){
        max=Infinity;
    }else{
        max = req.params.price;
    }
    
    const phone = await Phone.aggregate([
        {
          $match: {
        
            brand: brand,
          },
        },
        {
          $addFields: {
            priceInDouble: { $toDouble: '$price' }, 
          },
        },
        {
          $match: {
            priceInDouble: { $lte: parseFloat(max) }, 
          },
        },
    ])

    if (phone) {
        res.json(phone);
    } else {
        res.status(404).json({ error: 'phone not found' });
    }
});


//find the top 5 rating phone and not disabled 
router.get('/bestSeller', async (req, res) => {
    const bestSeller = await Phone.aggregate([
        {$match: {
            disabled: {$exists: false},
            $expr: { $gt: [{ $size: "$reviews" }, 2] }
        },
    },
        { $unwind: "$reviews" },
        { $group: {
            _id: "$_id",
            title: { $first: "$title"},
            brand: {$first: "$brand"},
            img: {$first: "$img"},
            stock: {$first: "$stock"},
            seller: {$first: "$seller"},
            price: {$first: "$price"},
            reviews:{$first: "$reviews"},
            avg: {$avg: "$reviews.rating"}
        }},
        { $sort: { avg: -1 } },
        { $limit: 5 }
      ]);
    
    if(!bestSeller){
        res.status(404).json({ error: 'No matched phones' });
    }else{
        res.json(bestSeller);
    }
});

//find the least quantity phone, which is not disabled
router.get('/soldOutSoon', async (req, res) => {
    const soldOutSoon = await Phone.aggregate([
        {$match:{
            stock: { $gt: 0 },
            disabled: {$exists: false}
        }},
        { $sort: { stock: 1 } },
        { $limit: 5 }
    ]);
    if(!soldOutSoon){
        res.status(404).json({ error: 'No matched phones' });
    }else{
        res.json(soldOutSoon);
    }
    
});

// find reviews on phone with given ID
router.get('/review/:phoneID/:userID/:sellerID', async (req, res) => {
    const showUser = [req.params.userID, req.params.sellerID];
    const phone = await Phone.findById(req.params.phoneID);
    if (!phone) {
      res.status(404).json({ error: 'phone not found' });
    } else {
      const reviewWithName = await Promise.all(
        phone.reviews.map(async (review) => {
          const reviewer = await User.findById(review.reviewer);
          let show;
          if(phone.seller==req.params.userID){
            show=true;
          }else{
            show = showUser.includes(String(review.reviewer));
            }
          return {
            ...review.toObject(),
            firstName: reviewer.get('firstName'),
            lastName: reviewer.get('lastName'),
            show,
          };
        })
      );
      res.json(reviewWithName);
    }
  });
  

//delete review
router.delete('/review/:phoneID/:reviewID', async (req, res) => {
    const phoneID = req.params.phoneID;
    const reviewID = req.params.reviewID;
    const phone = await Phone.findByIdAndUpdate(phoneID, {$pull: {reviews:{_id: reviewID}}}, {new: true});
    if(!phone){
        res.json({message:"Phone/review not found"});
    }else{
        res.status(404).json({ error: 'Phone/Review not found' });
    }
});

//post comment on phone, 
//phoneID in the URL and comments in the req body
router.post('/comment/:phoneID', async (req, res) => {
    const p=await Phone.findOne(
        {"_id": req.params.phoneID}
    );
    let review=req.body;
    review['review_id']=p.reviews.length;
    const phone = await Phone.findByIdAndUpdate(req.params.phoneID,{ $push: {reviews: req.body} },{ new: true});
    res.json(phone);
});

//add hidden attribute in review
router.put('/review/hide/:phoneID/:reviewID', async (req, res) => {
    const phoneID = req.params.phoneID;
    const reviewID = req.params.reviewID;
    let enter=0;
    try{
        const phone=await Phone.findOne(
            {"_id": phoneID}
        );
        for (let i=0;i<phone.reviews.length;i++){
            if(phone.reviews[i].review_id==reviewID){
                enter=1;
                if (phone.reviews[i]['hidden']==''){
                    res.status(404).json({ error: 'This review has already been hidden' });
                }else{
                    phone.reviews[i]['hidden']='';
                    await phone.reviews[i].save({ suppressWarning: true });
                    res.json(phone.reviews[i]);
                }
            }
        }
        await phone.save();
        if(enter==0){
            res.status(404).json({ error: 'Review not found' });
        }  
    }catch (error) {
        res.status(404).json({ error: 'Phone not found' });
      }
});

//delete hidden attribute in review
router.put('/review/show/:phoneID/:reviewID', async (req, res) => {
    const phoneID = req.params.phoneID;
    const reviewID = req.params.reviewID;
    let enter=0;
    try{
        const phone=await Phone.findOne(
            {"_id": phoneID}
        );
        for (let i=0;i<phone.reviews.length;i++){
            if(phone.reviews[i].review_id==reviewID){
                enter=1;
                if(phone.reviews[i].hidden==undefined){
                    res.status(404).json({ error: 'This review has already been showed' });
                }else{
                    phone.reviews[i].hidden = undefined;
                    await phone.reviews[i].save({ suppressWarning: true });
                    res.json(phone.reviews[i]);
                }
            }
        }
        await phone.save();
        if(enter==0){
            res.status(404).json({ error: 'Review not found' });
        }
    }catch(error){
        res.status(404).json({ error: 'Phone not found' });
    }
});

module.exports = router;
