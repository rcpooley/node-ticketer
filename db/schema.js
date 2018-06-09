const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
    createdAt: {type: Date, default: Date.now},
    tags: {type: [String], default: []},
    fields: {type: Schema.Types.Mixed, default: {}},
    sprintID: Schema.Types.ObjectId,
}, {minimize: false});

const sprintSchema = new Schema({
    start: Date,
    end: Date,
    ticketIDs: {type: [Schema.Types.ObjectId], default: []},
    fields: {type: Schema.Types.Mixed, default: {}},
}, {minimize: false});

module.exports = {
    ticketSchema,
    sprintSchema
};