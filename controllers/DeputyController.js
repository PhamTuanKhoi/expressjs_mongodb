const uploadarray = require('../middlewares/arrayfiles')
const multer = require('multer')
const Event = require('../models/eventModel')
const jwt = require('jsonwebtoken')
const { find, updateOne } = require('../models/eventModel')
var mongoose = require('mongoose');
const nodemailer = require('nodemailer')
const schedule = require('node-schedule');
const account = require('../models/accountModel')

class PostsController{
    async display(req, res){
        // const data = await Event.find()
        const token = req.cookies.tokenmanage
        var user = jwt.verify(token, 'shhhhh');    
        var data = await Event.find({"personCharge_look": user.id})
        res.render('admin/admin', {page: 'displayPosts', data})
    }
    async addPost(req, res){
        const token = req.cookies.tokenmanage
        var user = jwt.verify(token, 'shhhhh');    
        var data = await Event.find({"personCharge_look":user.id})
        res.render('admin/admin', {page: 'addPost', data})
    }
    async save(req, res){
        var data = await Event.updateOne({_id:req.body.id}, {$push:{posts: {
            content: req.body.posts
        }}})
        res.redirect('/manage/posts')
    }
    upload(req, res){
        Event.findOne({"posts._id":req.query.id}, {posts: {$elemMatch:{_id: req.query.id}}},(err, data)=>{
            if(err) console.log(err);
            Event.findOne({posts: {$elemMatch:{_id: req.query.id}}}, (err, eventone)=>{
                if(err) console.log(err);
                Event.find()
                .then(event => res.render('admin/admin', {page: 'uploadPosts', data, event, eventone}))
                .catch((err)=> console.log(err))
            })
        })
    }
    up(req, res){
        Event.findOne({_id: req.body.id}, {posts: {$elemMatch:{_id: req.body._id}}},(err, data)=>{
            if(data.posts.length === 0){
                Event.findOne({"posts._id":req.body._id}, (err, row)=>{
                    if(err) console.log(err);
                    Event.updateOne({_id: row.id}, {$pull:{posts:{_id:req.body._id}}}, (err, val)=>{
                        if(err) console.log(err);
                        console.log('drop Object in Array successsss')
                    })
                    Event.updateOne({_id: req.body.id}, {$push:{posts:{content: req.body.posts}}})
                    .then(()=> res.redirect('/manage/posts'))
                    .catch(err => console.log(err))
                })
            }else{
                Event.updateOne({"posts._id":req.body._id},{$set:{"posts.$.content":req.body.posts, "posts.$.dayPosts": new Date()}})
                .then(()=> res.redirect('/manage/posts'))
                .catch(err =>console.log(err))
            }
        })

    }
    async registerEvent(req, res){
        const token = req.cookies.tokenmanage
        var data = jwt.verify(token, 'shhhhh');    
        var eventPerson = await Event.find({"personCharge.userid":data.id})
        var eventRegis = await Event.aggregate([{
            $lookup:{     // trong excel tim kiem
                from:"account", //from2
                localField:"registerEvent_look",
                foreignField:"_id",   //id cap2
                as:"Con_user" 
            }       
        }])
        res.render('admin/admin', {page: 'dispalyRegisterEvent', eventPerson, eventRegis})
    }
    async events(req, res){
        const token = req.cookies.tokenmanage
        var data = jwt.verify(token, 'shhhhh');    
        var deputyEvent = await Event.find({"personCharge_look":data.id})
        res.render('admin/admin', {page:'displayDeputyEvent', deputyEvent})
    }
    async Details(req, res){
        const token = req.cookies.tokenmanage
        var data = jwt.verify(token, 'shhhhh');    
        var details = await Event.find({"personCharge_look": data.id})
        res.render('admin/admin', {page: 'displayDetails', details})
    }
    async addDetails(req, res){
        const token = req.cookies.tokenmanage
        var data = jwt.verify(token, 'shhhhh');    
        var eventDetails = await Event.find({"personCharge_look": data.id})
        res.render('admin/admin', {page:'addDetails', eventDetails})
    }
    async saveDetails(req, res){
        const token = req.cookies.tokenmanage
        var data = jwt.verify(token, 'shhhhh');   
        var data = await Event.updateOne({_id: req.body.id}, {$push:{details:{userid: data.id, content: req.body.content}}})
        res.redirect('/manage/registerEvent/Details')
    }
    async limitedRegister(req, res){
        var body = req.body;
        //ngay hom qua
        var yesterday = new Date(body.time);
        var date = yesterday.setDate(yesterday.getDate() - 1);
        var dated = new Date(date);

        var event = await Event.updateOne({_id: body.idevent}, {limitedRegister: body.time});
        var id = mongoose.Types.ObjectId(body.idevent);
        var findevent = await Event.aggregate([{
            $lookup:{     // trong excel tim kiem
                from:"account", //from2
                localField:"registerEvent_look",
                foreignField:"_id",   //id cap2
                as:"ConUser" 
            }       
        },{$match : { _id : id }}]);
        findevent.forEach(value =>{
            value.ConUser.forEach(data =>{
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                    user: 'huynhanhpham734@gmail.com',
                    pass: process.env.passwmail
                    }
                });
                
                var mailOptions = {
                    from: '"CTUT" <huynhanhpham734@gmail.com>',
                    to: data.email,
                    subject: 'CÂU LẠC BỘ CNTT CTUT',
                    text: 'That was easy!',
                    html: "<p><i>Hi!  "+data.name+"</i></p><b>Thành viên chú ý đóng tiền tham gia hoạt động đúng thời hạn!</b>"
                };
                
                schedule.scheduleJob(dated, function(){
                    console.log('send email....')
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                        console.log(error);
                        } else {
                        console.log('Email sent: ' + info.response);
                        }
                    });
                  });
            })
            schedule.scheduleJob(body.time, function(){
                value.registerEvent.forEach(val =>{
                    if(val.pay === false){
                        account.find({_id: val.userid}, (err, row)=>{
                            row.forEach(user =>{
                                if(user.report === 0){
                                    account.updateOne({_id: user._id}, {report: -1})
                                    .then(()=>{console.log('save....')})
                                    .catch(err => console.log(err))

                                    var transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                        user: 'huynhanhpham734@gmail.com',
                                        pass: process.env.passwmail
                                        }
                                    });
                                    
                                    var mailOptions = {
                                        from: '"CTUT" <huynhanhpham734@gmail.com>',
                                        to: user.email,
                                        subject: 'CÂU LẠC BỘ CNTT CTUT',
                                        text: 'That was easy!',
                                        html: "<p><i>Cảnh báo!  "+user.name+"</i></p><b>Bạn không đóng tiền hoạt động "+value.name+" đúng hẹn nếu còn tái phạm sẻ bị khóa tài khoản!</b>"
                                    };
                                    
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                        console.log(error);
                                        } else {
                                        console.log('Email sent: ' + info.response);
                                        }
                                    });

                                }
                                if(user.report === -1){
                                    account.updateOne({_id: user._id}, {report: -2})
                                    .then(()=>{console.log('save....')})
                                    .catch(err => console.log(err))

                                    var transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                        user: 'huynhanhpham734@gmail.com',
                                        pass: process.env.passwmail
                                        }
                                    });
                                    
                                    var mailOptions = {
                                        from: '"CTUT" <huynhanhpham734@gmail.com>',
                                        to: user.email,
                                        subject: 'CÂU LẠC BỘ CNTT CTUT',
                                        text: 'That was easy!',
                                        html: "<p><i>Cảnh báo!  "+user.name+"</i></p><b>Bạn không đóng tiền hoạt động "+value.name+" đúng hẹn!</b><p style='color: red;'>Tài khoản bị khóa 14 ngày.</p>"
                                    };
                                    
                                    transporter.sendMail(mailOptions, function(error, info){
                                        if (error) {
                                        console.log(error);
                                        } else {
                                        console.log('Email sent: ' + info.response);
                                        }
                                    });
                                }
                            })
                        })
                    }
                })
                Event.updateOne({_id: value._id}, {$pull: {registerEvent:{pay:false}}})
                .then(()=>{'remove...'})
                .catch(err => console.log(err))
            });
        })
        res.end('Limited register save success !')
    }
    async updatedetails(req, res){
        var updatedetails = await Event.findOne({slug: req.query.slug})
        res.render('admin/admin', {page:'updateDetails', updatedetails})
    }
    async updetails(req, res){
        var up = await Event.updateOne({ _id: req.body.id ,"details.userid": req.body.iduser}, {$set:{
            "details.$.content": req.body.content
        }})
        res.redirect('/manage/registerEvent/Details')
    }
    async deletedetails(req, res){
        var query = req.query
        var del = await Event.updateOne({_id:query.idevent}, {
            $pull: {details: {
                _id: query.iddetails
            }}
        })
        res.redirect('/manage/registerEvent/Details')
    }
    async deletePosts(req, res){
        var query = req.query
        var del = await Event.updateOne({_id:query.idevent}, {
            $pull: {posts: {
                _id: query.idposts
            }}
        })
        res.redirect('/manage/posts')
    }
    async eventchat(req, res){
        res.render('admin/admin', {page: 'displayChatEvent'})
    }
    async eventsignchat(req, res){
        var eventsignchat = await Event.findOne({slug: req.query.slug})
        res.render('admin/admin', {page: 'displayChatEvent', eventsignchat})
    }
}
module.exports = new PostsController


