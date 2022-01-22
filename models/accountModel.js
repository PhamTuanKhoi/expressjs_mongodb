const db = require('../db/config')
const mongoose = require('mongoose')
// const { Schema } = mongoose;
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const accountchema = new Schema({
    sub: String,
    name: String,
    email: String,
    picture: String,
    mssv: String,
    password: String,
    class: String,
    phone: Number,
    address: String,
    birthday: Date,
    gender: String,
    join: [{
        role: Number,
        joinday: { type: Date, default: Date.now() }
    }],
    posts: [{
        content: String,
        image: Array,
        dayPosts: { type: Date, default: Date.now() }
    }],
    slug: { type: String, slug: "name", unique: true },
    report: {type: Number, default: 0}
},
{
    timestamps: true
}   
);

module.exports = mongoose.model('account', accountchema, 'account')




