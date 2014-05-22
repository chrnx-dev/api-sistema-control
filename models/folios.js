var mongoose = require('mongoose'),
    schema = require('../schemas/folios'),
    opts = { db: { native_parser: true }},
    db = mongoose.createConnection('mongodb://localhost/sistema-casos', opts);

module.exports = db.model('Folio', schema);