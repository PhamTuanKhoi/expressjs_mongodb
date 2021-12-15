const express = require('express')
const router = express.Router()
const EventController = require('../controllers/EventController')

router.get('/',  EventController.display)
router.get('/delete',  EventController.delete)
router.get('/upload',  EventController.upload)
router.post('/up',  EventController.up)
router.get('/addEvent',  EventController.add)
router.post('/save',  EventController.save)
// router.get('/personCharge', EventController.personCharge)
// router.get('/addPerson', EventController.addPerson)
// router.post('/savePerson', EventController.savePerson)


module.exports = router;
