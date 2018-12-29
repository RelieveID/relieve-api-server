const { Schema, model } = require('mongoose');
const uuid = require('uuid');

const FamilySchema = new Schema({
    uuid: {
        type: String,
        default: uuid.v4,
        required: true
    },
    user_id: {
        type: String,
        required: true
    },
    family_id: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: null
    },
    nick: {
        type: String,
        default: null
    }
}, { versionKey: false, toJSON: { virtuals: true } });

// Relation to user
FamilySchema.virtual('family', {
    ref: 'User',
    localField: 'family_id',
    foreignField: 'uuid',
    justOne: true
});

// Relation to position
FamilySchema.virtual('condition', {
    ref: 'Position',
    localField: 'family_id',
    foreignField: 'user_id',
    options: { sort: { _id: -1 } }, // sort desc
    justOne: true // take latest one
});

module.exports = model('Family', FamilySchema, 'families');
