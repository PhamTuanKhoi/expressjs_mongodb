const mongoose = require('mongoose')
// const { Schema } = mongoose;
const Schema = mongoose.Schema;


const chatchema = new Schema({
    chat: Object
},{
    timestamps: true
});

module.exports = mongoose.model('chat', chatchema, 'chat')




