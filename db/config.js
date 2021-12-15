const mongoose = require('mongoose')
async function connectdb() {
    try {
        var data = await mongoose.connect('mongodb://127.0.0.1:27017/expressmanage');
        if(!data){
            console.log('mongoose connect fail')
        }else{
            console.log('mongoose connect success')
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectdb;
