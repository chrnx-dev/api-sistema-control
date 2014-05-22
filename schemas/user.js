var mongoose = require('mongoose');

module.exports = mongoose.Schema({
  username: String,
  name: String,
  lastname: String,
  password: String,
  register_date: Date,
  last_login: Date
});