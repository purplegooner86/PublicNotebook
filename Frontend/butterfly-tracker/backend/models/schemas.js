const mongoose = require("mongoose")
const Schema = mongoose.Schema

const butterflySchema = new Schema({
    species: String,
    wingspan: Number,
    color: String,
    date: Date,
});


const Butterflies = mongoose.model('Butterflies', butterflySchema, 'butterflylist');

const mySchemas = { 'Butterflies':Butterflies };

module.exports = mySchemas;
