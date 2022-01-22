const account = require('../models/accountModel')
const Event = require('../models/eventModel')
const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken')
const Chat = require('../models/chat')

class MemberController{
    async agree(req, res){
        var data = await account.updateOne({_id: req.query.id}, {join: {role: 2}})
        var val = await account.findOne({_id: req.query.id})
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'huynhanhpham734@gmail.com',
            pass: process.env.passwmail
            }
        });
        
        var mailOptions = {
            from: '"CTUT" <huynhanhpham734@gmail.com>',
            to: val.email,
            subject: 'CÂU LẠC BỘ CNTT CTUT',
            text: 'That was easy!',
            html: "<p><i>Hi!  "+val.name+"</i></p><b>Yêu cầu tham gia câu lạc bộ CNTT CTUT của bạn đã dược duyệt!</b>"
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });
        res.redirect('/manage/events')
    }
    async memberRegister(req, res){
        var data = await account.find({
            "join.role": 1
        })
        res.render('admin/admin', {page: 'displaymemberRegister', data})
    }
    async members(req, res){
        var data = await account.find({
            "join.role": {
                $gte: 2
            }
        })
        res.render('admin/admin', {page:'displayMembers', data})
    }
    async sendmail(req, res){
        var data = await Event.find()
        var usereml = await account.find()
        res.render('admin/admin', { page: 'displaySendmail', data, usereml })
    }
    sendall(req, res){
        account.find({ "join.role": {
            $gte: 2
        } }, (err, data)=>{
            if(err) console.log(err);
            data.forEach(val =>{
                if(err) console.log(err);
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                    user: 'huynhanhpham734@gmail.com',
                    pass: process.env.passwmail
                    }
                });
                
                var mailOptions = {
                    from: '"CTUT" <huynhanhpham734@gmail.com>',
                    to: val.email,
                    subject: req.body.themeall,
                    text: 'That was easy!',
                    html: "<b><i>Hi!  "+val.name+"</i></b><br><i>"+req.body.contentall+"</i>"
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email sent: ' + info.response);
                    }
                });
                res.end('Email đã được gửi!')
            })
        })
    }
    sendevent(req, res){
        Event.findOne({_id: req.body.id})
        .populate({
            path: 'registerEvent',
            populate: {
                path: 'userid'
            }
        })
        .then(data => {
            data.registerEvent.forEach(val=>{
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                    user: 'huynhanhpham734@gmail.com',
                    pass: process.env.passwmail
                    }
                });
                
                var mailOptions = {
                    from: '"CTUT" <huynhanhpham734@gmail.com>',
                    to: val.userid.email,
                    subject: req.body.themeevent,
                    text: 'That was easy!',
                    html: "<b><i>Hi!  "+val.userid.name+"</i></b><br><i>"+req.body.contentevent+"</i>"
                };
                
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email sent: ' + info.response);
                    }
                });
                res.end('Email đã được gửi!')
            })
        })
        .catch(err => console.log(err))
    }
    async sendmember(req, res){
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            user: 'huynhanhpham734@gmail.com',
            pass: process.env.passwmail
            }
        });
        
        var mailOptions = {
            from: '"CTUT" <huynhanhpham734@gmail.com>',
            to: req.body.emailmember,
            subject: req.body.thememember,
            text: 'That was easy!',
            html: "<b><i>Hi!</i></b><br><i>"+req.body.contentmember+"</i>"
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });
        res.end('Email đã được gửi!')
    }
    async active(req, res){
        var active = await account.find({"join.role":{$gte: '2'}}).sort({"join.role": -1})
        res.render('admin/admin', { page: 'displayMemberActive', active })
    }
    async keyupPerson(req, res){
        var key = req.body.payload.trim()
        var search = await account.find({ name: {
          $regex: new RegExp('^'+ key + '.*', 'i')  
        }, "join.role":{
            $gte: 2
        }})
        res.send({payload: search})
    }
    async personCharge(req, res){
        var userCharge = await account.find({"join.role":{$gte: 2}}).sort({"join.role":-1})
        var eventCharge = await Event.aggregate([{
            $lookup:{     // trong excel tim kiem
                from:"account", //from2
                localField:"personCharge_look",
                foreignField:"_id",   //id cap2
                as:"Con_user" 
            }       
        }])
        // console.log(eventCharge)
        res.render('admin/admin', {page: 'displayPerson', eventCharge, userCharge})
    }
    async addPerson(req, res){
        var data = await Event.updateOne({_id: req.body.id_event}, {$push:{personCharge_look:req.body.id_user}})
        var value = await Event.updateOne({_id: req.body.id_event}, {$push:{personCharge:{userid: req.body.id_user}}})
        var user = await account.findOne({_id: req.body.id_user})
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
            subject: 'Xác nhận quyền quản lý hoạt động câu lạc bộ',
            text: 'That was easy!',
            html: "<b><i>Hi!  "+user.name+"</i></b><br><i>Đăng nhập tài khoản để kiểm tra quyền quản lý.</i>"
        };
        
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
            console.log(error);
            } else {
            console.log('Email sent: ' + info.response);
            }
        });
        res.redirect('/manage/members/personCharge')
    }
    async chat(req, res){
        var chat = await Chat.find()
        res.render('admin/admin', {page: 'displayChat', chat})
    }
    async deletePerson(req, res){
        // console.log(req.query)
        var delPsl = await Event.updateOne({_id: req.query.idevent}, {$pull:{
            personCharge_look: req.query.iduser
        }})
        var delPs = await Event.updateOne({_id: req.query.idevent}, {$pull:{
            personCharge: {userid: req.query.iduser}
        }})
        res.redirect('/manage/members/personCharge')
    }
}
module.exports = new MemberController;

