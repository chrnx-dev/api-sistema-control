var mongoose = require('mongoose');

var Folios = mongoose.Schema({
  module: String,
  folio: Number
});


module.exports =  Folios;