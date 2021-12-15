const multer = require('multer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/upload')
    },
    filename: function (req, file, cb) {
    //   cb(null, Date.now()  + "-" + file.originalname)
    cb(null,Date.now()  + "-" + file.originalname)
    }
});  
var uploadss = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        // console.log(file);
        if(file.mimetype=="image/bmp" || file.mimetype=="image/png" || file.mimetype=="image/jpeg" || file.mimetype=="image/jpg" || file.mimetype=="image/gif"){
            cb(null, true)
        }else{
            return cb(new Error('Only image are allowed!'))
        }
    }
}).array('image', 12);

module.exports = uploadss;