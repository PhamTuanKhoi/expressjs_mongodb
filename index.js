const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const appRouter = require('./router/_app.route')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const connectdb = require('./db/config')
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')
const multer  = require('multer')
const upload = multer({ dest: 'public/upload'})
const methodOverride = require('method-override')
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require('fs');
require('dotenv').config()
const moment = require('moment');

const Chat = require('./models/chat')
const Event = require('./models/eventModel')


app.use(session({
  secret : "secret",
  saveUninitialized: true,
  resave: true
}))
//connect db
connectdb()
//cookie
app.use(cookieParser())
//ejs
app.use(methodOverride('_method'))
app.use(methodOverride('X-HTTP-Method-Override'))
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'))
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
server.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`)
})


io.on('connection', (socket) => {
    Chat.find().then(msg => msg.forEach(msges =>{
      socket.emit('userchatload', msges)
  }))

  // console.log('a user connected');
  socket.on('on-chat', (data) => {
      var chat = new Chat({chat: data})
      chat.save()
      .then(() => { 
        io.emit('userchat', data) 
      })
  })
});

io.on('connection', (socket) => {

  Event.find({}, (err, value)=>{
    if(err) console.log(err);
    value.forEach(row =>{
      socket.emit(`${row.name}`, row) 
    })
  })

socket.on('chat event', (data) => {

  Event.updateOne({slug: data.texteventname}, {$push:{chat:{
    user: data.user,
    message: data.message
  }}}, err =>{
    if(err) console.log(err);
    io.emit(`${data.texteventname}`, data) 
  })
})
});


//ckediter upfile
app.post('/upload',multipartMiddleware,(req,res)=>{
  try {
      fs.readFile(req.files.upload.path, function (err, data) {
          var imgname = Date.now()+"_"+req.files.upload.name
          var newPath = __dirname + '/public/upload/' + imgname;
          fs.writeFile(newPath, data, function (err) {
              if (err) console.log({err: err});
              else {
                  console.log(req.files.upload.originalFilename);
               
                  let fileName = imgname;
                  let url = '/upload/'+fileName;                    
                  let msg = 'Upload successfully';
                  let funcNum = req.query.CKEditorFuncNum;
                  console.log({url,msg,funcNum});
                 
                  res.status(201).send("<script>window.parent.CKEDITOR.tools.callFunction('"+funcNum+"','"+url+"','"+msg+"');</script>");
              }
          });
      });
     } catch (error) {
         console.log(error.message);
     }
})

appRouter(app)

// app.get('/pages/chat/eventsign', (req, res)=>{
//   io.on('connection', (socket) => {
//     socket.on('du-hoc-germany', (msg) => {
//         io.emit('chatmessage', msg);
//       });
//   });  
// })


// let Event = require('./models/eventModel')
// let path = require('path')
// app.get('/search', (req, res)=>{
//     res.render(path.join(__dirname, 'total'))
// })


// app.post('/creatkey', async (req, res)=>{
//   var key = req.body.payload.trim()
//   var search = await Event.find({ name: {
//     $regex: new RegExp('^'+ key + '.*', 'i')  
//   }})
//   res.send({payload: search})
// })


// Event.find({"registerEvent.userid":'61974e27011c9d1716722d06'}, (err, data)=>{
//   data.forEach(val =>{
//     val.registerEvent.forEach(row=>{
//       console.log(row.pay)
//     })
//   })
// })






// app.get('/menu', function(req, res){
//     var cap1 = Event.aggregate([{
//         $lookup:{     // trong excel tim kiem
//             from:"account", //from2
//             localField:"personCharge",
//             foreignField:"_id",   //id cap2
//             as:"Con" 
//         }       
//     }],function(err, data){
//         if (err) {
//             res.send('fail')
//         }else{
//             res.json(data)
//         }
//     })
// })

// app.get('/delete', (req, res)=>{
//   Event.updateOne({_id: '61ae1c9bc5d02e5f1808e95a'}, {$pull:{personCharge: '61a9c84697a9ca12069e062d'}})
//   .then(()=> console.log('ok'))
//   .catch(err => console.log(err))
// })







