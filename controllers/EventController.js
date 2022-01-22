const Event = require('../models/eventModel')
const UploadSingle = require('../middlewares/singlefile')
const multer = require('multer')

class EventController{
    async display(req, res){
        const event = await Event.find()
        res.render('admin/admin', {page: 'displayEvent', event})
    }
    async add(req,res){
        res.render('admin/admin', {page: 'addEvent'})
    }
    async save(req, res){
        UploadSingle(req, res, function (err) {
            if (err instanceof multer.MulterError) {
              console.log('Err 500: A Multer error occurred when uploading.')
            } else if (err) {
              console.log('Err 500: An unknown error occurred when uploading.')
            }
            var body = req.body
            const event = new Event({
                name: body.name,
                number: body.number,
                fee: body.fee,
                limitAge: body.limit,
                startday: body.startday,
                endday: body.endday,
                image: req.file.filename
            })
            event.save()
            res.redirect('/manage/events')
          })
    }
    async upload(req, res){
        var data = await Event.findOne({slug: req.query.slug})
        res.render('admin/admin', {page: 'uploadEvent', data})
    }
    up(req, res){
        var body = req.body
        Event.updateOne({_id:body.id}, {
            name: body.name,
            number: body.number,
            fee: body.fee,
            limitAge: body.limitage,
            startday: body.startday,
            endday: body.endday
        })
        .then(()=> res.redirect('/manage/events'))
        .catch(err => console.log(err))
    }
    async delete(req, res){
        var del = await Event.deleteOne({slug: req.query.slug})
        res.redirect('/manage/events')
    }
    async searchevent(req, res){
        var key = req.body.key.trim()
        var event = await Event.find({ name: {
          $regex: new RegExp('^'+ key + '.*', 'i')  
        }})
        res.render('admin/pages/displayEventSrc', {event})
    }
}


module.exports = new EventController