var mongoose = require('mongoose'),
		passwordHash = require('password-hash'),
		User = require('../../models/users'),
		opts = { db: { native_parser: true }},
		token = require('token');

token.defaults.secret = 'Castlev@ni@';
token.defaults.timeStep = 4 * 60 * 60; // 24h in seconds



module.exports = {
	list: function(req, res, next){
		User.find().exec(function(err, users){
			res.send(users);
			return next();
		});
	},

	check : function(req, res, next){
		var id = req.params.user_id || '',
				username = req.params.username || '',
				oauth= req.params.token || '';

				console.log(id, username, oauth);
				console.log(oauth, id + '|' + username);

		res.send({valid:token.verify( id + '|' + username, oauth)});
		return next();
	},

	login: function(req, res, next){
		var username = req.params.username || false,
				password = req.params.password || false,
				Search = {username:'', password:''};

		if (username){
			Search.username = username;
		}

		if(password){
			Search.password = passwordHash.generate(password);
		}

		User.findOne({username:username}).exec(function(err, User){
			var Response = {
						success : false
					};

			console.log(User);
			Response.success = passwordHash.verify(password, User.password);

			if (Response.success){
				Response.id = User._id;
				Response.user = User.username;
				Response.name = User.name;
				Response.lastname = User.lastname;
				Response.auth = token.generate(User._id + '|' + User.username);
				res.send(Response);
			} else {
				Response.msg = 'Usuario no encontrado o Contraseña inválida';
				res.send(404,Response);
			}



			next();
		});



	},
	add:function(req, res, next){


		var username = req.params.username || false,
				name = req.params.name || '',
				lastname = req.params.lastname || '',
				password = req.params.password || false,
				register_date = Date.now(),
				last_login = Date.now(),
				user;

		if (!username){
			res.send(404,{success:false, message:'Username is empty'});
		}

		if (!password){
			res.send(404,{success:false, message:'Should not be empty please write one.'});
		}

		user = new User({
			username: username,
			name: name,
			lastname: lastname,
			password: passwordHash.generate(password),
			register_date: register_date,
			last_login: last_login
		});

		user.save(function(err){
			if (!err){
				res.send({success: true});

			} else {
				res.send({success: false});
			}
			return next();
		});

	}
}
