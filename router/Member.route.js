const express = require('express')
const router = express.Router()
const MemberController = require('../controllers/MemberController')


// router.get('/registerEvent',  MemberController.registerEvent)
router.get('/chat',  MemberController.chat)
router.post('/addPerson',  MemberController.addPerson)
router.get('/personCharge',  MemberController.personCharge)
router.post('/keyupPerson',  MemberController.keyupPerson)
router.get('/',  MemberController.members)
router.get('/active',  MemberController.active)
router.get('/agree',  MemberController.agree)
router.get('/member-register',  MemberController.memberRegister)
router.get('/sendmail',  MemberController.sendmail)
router.post('/sendall',  MemberController.sendall)
router.post('/sendevent',  MemberController.sendevent)




module.exports = router;
