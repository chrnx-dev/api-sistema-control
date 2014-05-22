var restify = require('restify'),
    User = require('./routes/v1/users'),
    Case = require('./routes/v1/cases'),
    Folio = require('./routes/v1/folios');

var ip_addr = '127.0.0.1';
var port    =  '8080';

var server = restify.createServer({
    name : "sistema-control-api",
    version: '0.0.1'
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.fullResponse());
server.use(restify.CORS();

server.get('/v1', function(req, res, next){
  res.send({
    server: 'Sistema Control API',
    version: '0.0.1'
  });
  next();
});


server.get('/v1/users/list', User.list);
server.post('/v1/users/add', User.add);
server.post('/v1/users/login', User.login);
server.post('/v1/users/check', User.check);


server.get('/v1/cases/list', Case.list);
server.get('/v1/cases/pdf', Case.pdf);
server.post('/v1/cases/status', Case.seen);
server.get('/v1/cases/count', Case.counts);
server.get('/v1/cases/:folio', Case.get);
server.post('/v1/cases/add', Case.add);
server.get('/v1/cases/search/:search', Case.search);



server.get('/v1/folio/:module', Folio.get);
server.post('/v1/folio/:module/increase', Folio.increase);
server.get('/v1/folio/:module/reset', Folio.reset);

function unknownMethodHandler(req, res) {
  if (req.method.toLowerCase() === 'options') {
      console.log('received an options method request');
    var allowHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'Origin', 'X-Requested-With']; // added Origin & X-Requested-With

    if (res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');

    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', allowHeaders.join(', '));
    res.header('Access-Control-Allow-Methods', res.methods.join(', '));
    res.header('Access-Control-Allow-Origin', req.headers.origin);

    return res.send(204);
  }
  else
    return res.send(new restify.MethodNotAllowedError());
}

server.on('MethodNotAllowed', unknownMethodHandler);

server.listen(port , function(){
    console.log('%s listening at %s ', server.name , server.url);
});