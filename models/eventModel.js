const mongoose = require('mongoose')
// const { Schema } = mongoose;
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');
mongoose.plugin(slug);

const eventchema = new Schema({
    name: String,
    number: Number,
    fee: Number,
    limitAge: Number,
    startday: Date,
    endday: Date,
    image: String,
    limitedRegister: {type: Date, default: new Date('2099-12-12T06:29:32.555+00:00')},
    details: [{
        userid: ObjectId,
        content: Array,
        daycreat: { type: Date, default: Date.now() }
    }],
    userPoster: { type: ObjectId, ref: "account" },
    posts: [{
        content: Array,
        dayPosts: {type: Date, default: Date.now()}
    }],
    registerEvent: [{
        userid: { type: ObjectId, ref: "account" },
        pay: { type: Boolean, default: false },
        dayRegister: {type: Date, default: Date.now()}
    }],
    registerEvent_look: [ ObjectId ],

    personCharge: [{
        userid: { type: ObjectId, ref: "account" },
        dayPerson: {type: Date, default: Date.now()}
    }],
    personCharge_look: [ ObjectId ],
    slug: { type: String, slug: "name", unique: true }
},
{
    timestamps: true
}
);

module.exports = mongoose.model('event', eventchema, 'event')