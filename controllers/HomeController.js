const Account = require('../models/accountModel')
const Event = require('../models/eventModel')
const jwt = require('jsonwebtoken')
const upload = require('../middlewares/arrayfiles')
const multer = require('multer')
var paypal = require('paypal-rest-sdk');
const { findOne } = require('../models/accountModel')

class HomeController{
    async login_mssv(req, res){
        var body = req.body
        var data = await Account.findOne({ mssv: body.mssv })
        if(!data){
            res.redirect('/pages/home')
        }
        else{
            if(data.password !== body.password){
            res.redirect('/pages/home')
            }else{
                var older_token = jwt.sign({ sub: data.sub}, 'shhhhh'); //{ expiresIn: 30*60}
                res.cookie('token', older_token)  
                res.redirect('/pages/home')
            }
        }
    }
    async home(req, res){
        var event = await Event.find()
        if(!req.query.save){
            res.render('client/home', {page: 'event', event})
        }else{
            res.render('client/home', {page: 'event', event, save:req.query.save})
        }
    }
    posts(req, res){
        Event.find()
        .populate('userPoster')
        .then(posts => res.render('client/home', {page: 'main', posts})) 
    }
    join(req, res){
        const token = req.cookies.token
        var data = jwt.verify(token, 'shhhhh');
        Account.updateOne({sub: data.sub}, {join: {role: '1'}})
        .then(()=> res.redirect('/pages/home'))
        .catch(err => console.log(err))
    }
    async personal(req, res){
        const body = req.body
        var personal = await Account.updateOne({_id: req.query.id},{
            mssv: body.mssv,
            password: body.password,
            class: body.class,
            phone: body.phone,
            address: body.address,
            birthday: body.birthday,
            gender: body.gender
        })
        .then(()=> res.redirect('/pages/home'))
        .catch(err => console.log(err))
    }
    async eventRegister(req, res){
        var save = false
        var data = await Account.findOne({mssv: req.body.mssv, password: req.body.password})
        if(!data){
            res.redirect('/pages/home')
        }else{
            Event.findOne({_id: req.body.id, "registerEvent.userid": data._id}, (err, event)=>{
                if(err) console.log(err);
                if(!event){
                    save = true
                    Event.updateOne({_id: req.body.id},{$push: {registerEvent:{userid: data._id}}}, (err)=>{
                        if(err) console.log(err)
                    })
                    Event.updateOne({_id: req.body.id},{$push: {registerEvent_look: data._id}}, (err)=>{
                        if(err) console.log(err)
                    })
                    res.redirect('/pages/home?save=' + save)
                }else{
                    res.redirect('/pages/home?save='+ save)
                }
            })
        }
    }
    async chat(req, res){
        res.render('client/home', { page: 'chat' })
    }
    // async person(req, res){
    //     var event = await Event.findOne({slug: req.query.slug})
    //     res.render('client/home', {page:'personCharge', event})
    // }
    async event(req, res){
        var data = await Event.findOne({slug: req.query.slug})
        const event = [data]
        res.render('client/home', {page:'event', event})
    }
    async post(req, res){
        var data = await Event.findOne({slug: req.query.slug})
        var posts = [data]
        res.render('client/home', {page: 'main', posts})
    }
    async posting(req, res){
        res.render('client/home', {page: 'posting'})
    }
    yourpost(req, res){
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
              console.log('A Multer error occurred when uploading.')
            } else if (err) {
              console.log('An unknown error occurred when uploading.')
            }else{
                Account.updateOne({_id: req.body.id}, {$push:{posts:{
                    content: req.body.content,
                    image: req.files
                }}})
                .then(()=> res.redirect('/pages/posting'))
                .catch(err => console.log(err))
            }
        })
    }
    async memberpost(req, res){
        var data = await Account.find()
        res.render('client/home', {page: 'postmembers', data})
    }
    debt(req, res){
        if(typeof req.cookies.token !== 'undefined'){
            var token = req.cookies.token
            var data = jwt.verify(token, 'shhhhh')
            Account.findOne({sub: data.sub}, (err, user)=>{
                if(err) console.log(err);
                Event.find({registerEvent:{$elemMatch:{userid: user._id}}}, (err, debt)=>{
                    if(err) console.log(err);
                    if(!req.query.pay){
                        res.render('client/home', {page: 'debt', debt})
                    }else{
                        res.render('client/home', {page: 'debt', debt, pay:req.query.pay})
                    }
                })
            })
        }
    }
    pay(req, res){
        var total = req.body.total
        var quantity = req.body.quantity
        paypal.configure({
            'mode': 'sandbox', //sandbox or live = thanh toan that
            'client_id': process.env.clientPaypal_id,
            'client_secret': process.env.clientPaypal_secret
          });
          
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `http://localhost:3000/pages/paypost?total=${total}&quantity=${quantity}`,
                "cancel_url": "http://localhost:3000/pages/fail"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "to pho",
                        "sku": "item",
                        "price": total,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": total
                },
                "description": "This is the payment description."
            }]
        };
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                res.redirect('/pages/debt?money=isnotfound')
            } else {
                for(var i=0; i < payment.links.length; i++){
                    if(payment.links[i].rel === 'approval_url'){
                        res.redirect(payment.links[i].href)
                    }
                }
            }
        });
    }
    paypost(req, res){
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const res_quantity = req.query.quantity
          
            const execute_payment_json = {
              "payer_id": payerId,
              "transactions": [{
                  "amount": {
                      "currency": "USD",
                      "total": req.query.total
                  }
              }]
            };
          
            paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
                var pay = false
              if (error) {
                 res.render('cancle');
              } else {
                  pay = true;
                  console.log(JSON.stringify(payment));
                    const token = req.cookies.token
                    var data = jwt.verify(token, 'shhhhh');     
                    Account.findOne({sub: data.sub}, (err, user)=>{
                        if(err) console.log(err);
                        Event.find({registerEvent:{$elemMatch:{userid:user._id}}}, (err, data)=>{
                            if(err) console.log(err);
                            data.forEach(val =>{
                                Event.updateMany({_id: val._id},{$pull:{registerEvent:{userid:user._id}}}, err => {
                                    if(err) console.log(err);
                                    Event.updateMany({_id: val._id},{$push: {registerEvent:{
                                        userid: user._id,
                                        pay: true
                                    }}})
                                    .catch(err => console.log(err))
                                })
                            }) 
                        })
                        user.join.forEach(row =>{
                            var quantity = new Number(res_quantity)
                            var role = new Number(row.role)
                            var level = quantity + role
                            Account.updateOne({"join._id":row._id},{$set:{ "join.$.role": level}})
                            .catch(err => console.log(err))
                        })
                    })
                    res.redirect('/pages/debt?pay=' + pay)
              }
          });
    }
    search(req, res){
        var key = req.body.key
        Event.find({
            "name": {
                $regex: new RegExp('.*'+ key +'.*', 'i')
            }
        })
        .then(event => res.render('client/home', {page:'event', event}))
        .catch(err => console.log(err))
    }
    searchMember(req, res){
        var key = req.body.key
        Account.find({
            "posts.content": new RegExp('.*'+ key +'.*')
        })
        .then(data => res.render(data))
        .catch(err => console.log(err))
    }
    async search_event(req, res){
        var key = req.body.payload.trim()
        var search = await Event.find({ name: {
          $regex: new RegExp('^'+ key + '.*', 'i')  
        }})
        res.send({payload: search})
    }
    async search_slug(req, res){
        var event = await Event.find({ slug: req.params.slug })
        res.render('client/home', {page: 'event', event})
    }
    async viewdetails(req, res){
        var viewdetails = await Event.aggregate([{
            $lookup:{     // trong excel tim kiem
                from:"account", //from2
                localField:"personCharge_look",
                foreignField:"_id",   //id cap2
                as:"Con_user" 
            }       
        }, {$match:{slug: req.query.slug}}])
        res.render('client/home', {page:'viewdetails', viewdetails})
    }
}
module.exports = new HomeController;
