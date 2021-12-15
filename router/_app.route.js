const homerouter = require('./Home.route')
const checktoken = require('../middlewares/checktoken')
const adminrouter = require('./Admin.route')
const deputyrouter = require('./Deputy.route')
const eventrouter = require('./Event.route')
const membersrouter = require('./Member.route')
const account = require('../models/accountModel')
const Event = require('../models/eventModel')
const moment = require('moment')
const checkmanage = require('../middlewares/checkmanage')


function appRouter(app){
    app.use((req, res, next)=>{
        res.locals.moment = moment;
        next();
      });
    app.use( async (req, res, next)=>{
        var role = await account.find({join:{$elemMatch:{role:'1'}}})
        res.locals.role = role
        next()
    })
    app.use( async (req, res, next)=>{
        var roleTV = await account.find({join:{$elemMatch:{role:'2'}}})
        res.locals.roleTV = roleTV
        next()
    })

    app.use('/manage', adminrouter)
  
    app.use('/manage/events', checkmanage.checkadmin, eventrouter)
    app.use('/manage/members', checkmanage.checkadmin, membersrouter)
    // checkmanage.checkmanage
    app.use('/manage/posts', checkmanage.checkmanage, deputyrouter)
    app.use('/manage/registerEvent', checkmanage.checkmanage, deputyrouter)


    checktoken(app)
    app.use('/pages', homerouter)
}
module.exports = appRouter;




