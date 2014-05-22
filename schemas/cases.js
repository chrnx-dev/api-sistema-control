var mongoose = require('mongoose'),
    mongoosastic = require('mongoosastic');

var Cases = new mongoose.Schema({
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  },
  name: {type:String, es_indexed:true},
  folio: {type:String, es_indexed:true},
  subject: {type:String, es_indexed:true},
  email: {type:String, es_indexed:true},
  phone: {type:String, es_indexed:true},
  description: {type:String, es_indexed:true},
  status: String,
  observacion: String,
  canalizacion: String,
  seen: Boolean,
  created: Date,
  updated: Date,
  tipo:{type:String, es_indexed:true},
  city:{type:String, es_indexed:true}
});

Cases.plugin(mongoosastic);
module.exports = Cases;

