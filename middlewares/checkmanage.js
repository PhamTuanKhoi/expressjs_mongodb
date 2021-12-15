const account = require('../models/accountModel')
const jwt = require('jsonwebtoken')
const Event = require('../models/eventModel')

module.exports.checkadmin = async(req, res, next) => {
  if(typeof req.cookies.tokenmanage !== 'undefined'){
    const token = req.cookies.tokenmanage
    var data = jwt.verify(token, process.env.passtoken);     
    var user_manage = await account.findOne({_id: data.id})
    user_manage.join.forEach(val =>{
      if(val.role === '-7'){
        res.locals.user_manage = user_manage
      }else{
        res.redirect('/manage/registerEvent/events')
      }
    })
  }else{
    res.redirect('/manage/login')
  } 
  next()
}

module.exports.checkmanage = async(req, res, next) => {
  if(typeof req.cookies.tokenmanage !== 'undefined'){
    const token = req.cookies.tokenmanage
    var data = jwt.verify(token, process.env.passtoken);     
    var user_manage = await account.findOne({_id: data.id})
    user_manage.join.forEach(val =>{
      if( val.role !== '-7'){
        res.locals.user_manage = user_manage
        next()
      }else{
        res.redirect('/manage/events')
      }
    })
  }else{
    res.redirect('/manage/login')
  } 
  next()
}

module.exports.islogin = (req, res, next) =>{
  if(typeof req.cookies.tokenmanage === 'undefined'){
    next()
  }
}