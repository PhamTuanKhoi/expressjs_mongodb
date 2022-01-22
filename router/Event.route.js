const express = require('express')
const router = express.Router()
const EventController = require('../controllers/EventController')



router.get('/',  EventController.display)
router.post('/searchevents',  EventController.searchevent)
router.get('/delete',  EventController.delete)
router.get('/upload',  EventController.upload)
router.post('/up',  EventController.up)
router.get('/addEvent',  EventController.add)
router.post('/save',  EventController.save)



module.exports = router;
