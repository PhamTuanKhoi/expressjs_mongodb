const express = require('express')
const router = express.Router()
const DeputyController = require('../controllers/DeputyController')


router.get('/eventsignchat',  DeputyController.eventsignchat)
router.get('/manage-event-chat',  DeputyController.eventchat)
router.get('/deletePosts',  DeputyController.deletePosts)
router.get('/Details/delete',  DeputyController.deletedetails)
router.post('/up-details',  DeputyController.updetails)
router.get('/Details/update',  DeputyController.updatedetails)
router.post('/limitedRegister',  DeputyController.limitedRegister)
router.post('/add-details',  DeputyController.saveDetails)
router.get('/add-details',  DeputyController.addDetails)
router.get('/Details',  DeputyController.Details)
router.get('/events',  DeputyController.events)
router.get('/memberRegis',  DeputyController.registerEvent)
router.get('/',  DeputyController.display)
router.get('/addPost',  DeputyController.addPost)
router.post('/addPost',  DeputyController.save)
router.get('/upload',  DeputyController.upload)
router.post('/up',  DeputyController.up)




module.exports = router;
