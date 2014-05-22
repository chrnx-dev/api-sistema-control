var mongoose = require('mongoose'),
    schema = require('../schemas/user'),
    opts = { db: { native_parser: true }},
    db = mongoose.createConnection('mongodb://localhost/sistema-casos', opts);

module.exports = db.model('User', schema);