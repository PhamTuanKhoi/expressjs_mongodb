const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = process.env.CLIENT_ID
const client = new OAuth2Client(CLIENT_ID);
const account = require('../models/accountModel')
var jwt = require('jsonwebtoken');

class APIGgController{
    eventout(req, res){
        res.clearCookie('token')
        res.redirect('/pages/home')
    }
    login(req, res){
        const token = req.body.token
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID, 
            });
            const payload = ticket.getPayload();      
            account.findOne({sub: payload.sub})
            .then(emtity => {
                if(!emtity){
                const data = new account({
                    sub: payload.sub,
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture,
                    join: {role: '0'}
                })
                data.save()
                .then(data => console.log(`save email ${data.name} success`))
                .catch(err => console.log(err))
                }
            })
            var older_token = jwt.sign({ sub: payload.sub}, process.env.passtoken); //{ expiresIn: 30*60}
            res.cookie('token', older_token)  
          }
          verify()
          .then(()=> { 
              res.send('success')
            })
          .catch(console.error);
    }
}

module.exports = new APIGgController;

