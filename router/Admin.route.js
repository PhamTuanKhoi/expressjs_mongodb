const express = require('express')
const router = express.Router()
const AdminController = require('../controllers/AdminController')

router.get('/isloguot',  AdminController.isloguot)
router.get('/login',  AdminController.login)
router.post('/login',  AdminController.signin)



module.exports = router;
