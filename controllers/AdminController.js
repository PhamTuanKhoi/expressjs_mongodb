var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const User = require('../models/accountModel')
const jwt = require('jsonwebtoken')
const Event = require('../models/eventModel')

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ email: username }, function (err, data) {
      if (err) { return done(err); }
        if (!data) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (data.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, data);
    });
  }
));

class AdminController{
    login(req, res){
      if(!req.query.success){
        res.render('admin/login')
      }else{
        res.render('admin/login', { success: req.query.success })
      }
    }
    
    signin(req, res, next){
      var success = true;
      passport.authenticate('local', function(err, data, info) {
        if (err) { return res.status(500).json('err sever'); }
        if (!data) {
          success = false
           return res.redirect('/manage/login?success='+success); 
          }
        if(data){ 
          data.join.forEach(user => {
            if(user.role === '-7'){
              var older_token = jwt.sign({ id: data._id}, process.env.passtoken); //{ expiresIn: 30*60}
              res.cookie('tokenmanage', older_token)  
              res.redirect('/manage/events')
            }else{
              Event.find({personCharge_look: data._id}, (err, value)=>{
                if(value.length === 0){
                  success = 'No'
                  res.redirect('/manage/login?success='+success); 
                }else{
                  var deputy_token = jwt.sign({ id: data._id}, process.env.passtoken); //{ expiresIn: 30*60}
                  res.cookie('tokenmanage', deputy_token)  
                  res.redirect('/manage/registerEvent/events')
                }
              })
            }
          });
        }  
      })(req, res, next);
    }

    async isloguot(req, res){
      res.clearCookie('tokenmanage')
      res.redirect('/manage/login')
    }
}

module.exports = new AdminController;

