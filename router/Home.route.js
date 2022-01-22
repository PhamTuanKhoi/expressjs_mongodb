const express = require('express')
const router = express.Router()
const HomeController = require('../controllers/HomeController')
const APIGgController = require('../controllers/_APIGgController')




router.get('/members',  HomeController.members)
router.get('/chat/eventsign',  HomeController.eventsign)
router.get('/view-details',  HomeController.viewdetails)
router.post('/search/postsMembers',  HomeController.searchMember)
router.get('/search_slug/:slug',  HomeController.search_slug)
router.post('/search_event',  HomeController.search_event)
router.post('/search',  HomeController.search)
router.get('/debt',  HomeController.debt)
router.get('/paypost',  HomeController.paypost)
router.post('/pay',  HomeController.pay)
router.post('/yourpost',  HomeController.yourpost)
router.get('/memberpost',  HomeController.memberpost)
router.get('/join',  HomeController.join)
router.get('/event',  HomeController.event)
router.get('/post',  HomeController.post)
router.get('/posting',  HomeController.posting)
router.get('/chat',  HomeController.chat)
// router.get('/person',  HomeController.person)
router.post('/personal',  HomeController.personal)
router.post('/eventRegister',  HomeController.eventRegister)
router.get('/home',  HomeController.home)
router.get('/posts',  HomeController.posts)
router.post('/login_mssv',  HomeController.login_mssv)
router.get('/eventout', APIGgController.eventout)
router.post('/login', APIGgController.login)



module.exports = router;
