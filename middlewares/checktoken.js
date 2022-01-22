const jwt = require('jsonwebtoken')
const account = require('../models/accountModel')
const Event = require('../models/eventModel')
const moment = require("moment");
const { consumers } = require('nodemailer/lib/xoauth2');

function checktoken(app){


    app.use(async (req, res, next)=>{
      var event = await Event.find()
      res.locals.event = event
      next()
    })
    app.use(async (req, res, next)=>{
      var event = await Event.find({ "registerEvent.pay": true })
      res.locals.data_count = event
      next()
    })
    app.use(async (req, res, next)=>{
      if(typeof req.cookies.token !== 'undefined'){
        const token = req.cookies.token
        var data = jwt.verify(token, process.env.passtoken);     
        const user = await account.findOne({sub: data.sub})
        var role_user = 0
        user.join.forEach(val => {
          role_user = val.role
        });
        res.locals.role_user = role_user
      }  
      next()
    })
    app.use(async function (req, res, next) {
      if(typeof req.cookies.token !== 'undefined'){
        const token = req.cookies.token
        var data = jwt.verify(token, process.env.passtoken);     
        const user = await account.findOne({sub: data.sub})
        const eventsign = await Event.find({"registerEvent.userid": user._id})
        res.locals.eventsign = eventsign
      }  
      next()
    })
    app.use(async function (req, res, next) {
        if(typeof req.cookies.token !== 'undefined'){
          const token = req.cookies.token
          var data = jwt.verify(token, process.env.passtoken);     
          const user = await account.findOne({sub: data.sub})
          if( user.report === -2 ){
            res.clearCookie('token')
          }else{
            res.locals.user = user
          }
        }  
        next()
      })
}
module.exports = checktoken