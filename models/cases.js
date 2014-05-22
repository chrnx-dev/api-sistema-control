var mongoose = require('mongoose'),
    schema = require('../schemas/cases'),
    schema_user = require('../schemas/user'),
    User = require('./users'),
    opts = { db: { native_parser: true }},
    db = mongoose.createConnection('mongodb://localhost/sistema-casos', opts);

var Users = db.model('User', schema_user);
var Cases = db.model('Case', schema);

module.exports = Cases;