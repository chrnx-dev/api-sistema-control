var mongoose = require('mongoose'),
    Case = require('../../models/cases'),
    async = require('async'),
    _ = require('underscore'),
    fs = require('fs'),
    pdf = require('pdfkit');

module.exports = {

  seen : function(req, res, next){
    var request = JSON.parse(req.params.request),
        id = request.id || 0,
        field = request.field || false,
        value = request.value ,
        ObjectID = mongoose.Types.ObjectId, temp;



    if (!id || !field || !value){
      res.send(404,'Id, Field or Value is not presented on request');
      return next();
    }

    Case.findOne({_id: id })
    .populate('_creator', {name:true, lastname:true})
    .exec(function(err, oCase){
      oCase[field] = value;
      oCase.save(function(err, Result){

        res.send({success: true});
        return next();
      });

    });
  },

  counts : function(req, res, next){
    var countSerialize = function(Filters){
          Filters = Filters || {tipo: type };

          return function(callback){
            Case.count(Filters, function(error, count){
              var response = {};
              response[Filters.tipo] = count;
              callback(false, response);
            });
          }
        },
        promises = [];

    promises.push(countSerialize({tipo:'educacion'}));
    promises.push(countSerialize({tipo:'salud'}));
    promises.push(countSerialize({tipo:'otros'}));
    promises.push(countSerialize({tipo:'social'}));

    async.parallel(promises, function(error, results){
        var response = {};
        _.each(results, function(result){
          _.extend(response, result);
        });
        res.send(response);
        return next();
      });

  },

  search:function(req, res, next){
    var search = req.params.search || false;

    if( !search){
      res.send(404,{message: 'No Search Selected'});
      return next();
    }
    Case.search({query: search}, function(err, results){
      res.send(results);
      return next();
    });
  },
  list: function(req, res, next){
    var ObjectID = mongoose.Types.ObjectId,
        type = req.params.tipo || 'otros',
        page = req.params.page || 1,
        pagination = req.params.p || 20,

        promises = [],
        SearchObject = {
          tipo : type
        },
        status = req.params.status || false,
        countSerialize = function(Filters, all){
          Filters = Filters || {tipo: type };
          all = all || -1;
          console.log(Filters, all);
          if( all === -1 ){
            Filters.seen = false;
          }


          return function(callback){
            Case.count(Filters, function(error, count){
              if (all === 1){
                Filters.status = 'all';
              }

              if (all === 2){
                Filters.status = 'none';
              }

              callback(false, {tipo:Filters.status , count:count});
            });
          }
        };

    if (status){
      SearchObject.status = status;
    }

    promises.push(countSerialize(_.extend({seen:false},SearchObject), 2));
    promises.push(countSerialize(_.extend({},SearchObject), 1));
    promises.push(countSerialize({tipo:type, status:'en-tramite'}));
    promises.push(countSerialize({tipo:type, status:'en-espera'}));
    promises.push(countSerialize({tipo:type, status:'resuelto'}));
    promises.push(countSerialize({tipo:type, status:'cancelado'}));

    async.parallel(promises, function(error, results){
      Case.find(_.extend({}, SearchObject)).sort({created: 'desc'})
      .limit(pagination)
      .skip((page-1)*pagination)
      .populate('_creator',{name:1, lastname:1})
      .exec(function(err, cases){
        var Cases = {
          page:parseInt(page),
          pagination: pagination,
          total: 0,
          unseen: 0
        }, Pages, NextPage, PriorPage;
        _.each(results, function(count){
          if (count.tipo === 'none'){
            Cases.unseen = count.count;
          }else if (count.tipo === 'all'){
            Cases.total = count.count;
            Pages = Math.ceil(Cases.total / Cases.pagination);
            Cases.next = Cases.page + 1;
            Cases.prior = Cases.page -1;

            if (Cases.next > Pages){
              Cases.next = -1;
            }

            if (Cases.prior <= 0){
              Cases.prior = -1;
            }
          }else{
            Cases[count.tipo] = count.count;
          }

        });
        Cases.results = cases;
        res.send(Cases);
        return next();
      });

    });

  },
  pdf: function (req, res, next){
    var doc = new pdf({margin:50, size:'Letter'}),
      lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam in suscipit purus.  Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vivamus nec hendrerit felis. Morbi aliquam facilisis risus eu lacinia. Sed eu leo in turpis fringilla hendrerit. Ut nec accumsan nisl.';


    doc.text(lorem, {align: 'justify'});

    doc.write('caso.pdf');

    var stream = fs.createReadStream('caso.pdf');
    var filename = "caso.pdf";
    // Be careful of special characters

    filename = encodeURIComponent(filename);
    // Ideally this should strip them

    res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
    res.setHeader('Content-type', 'application/pdf');

    stream.pipe(res);
  },
  get: function(req, res, next){
    var folio = req.params.folio || false;

    if (! folio){
      res.send(404,{message: 'Unable to find a '+ folio +' module'});
      return next();
    }

    Case.find({folio: folio}).exec(function(err, cases){
      if (_.isEmpty(cases)){
        res.send(404,{message: 'Unable to find a '+ module +' module'});
        return next();
      }
      res.send(cases[0]);
      return next();
    });
  },
  add:function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");

    var ObjectID = mongoose.Types.ObjectId,
        case_data = {
          _creator: new ObjectID(req.params._creator),
          name: req.params.name || '',
          lastname: req.params.lastname || '',
          folio: req.params.folio || '',
          subject: req.params.subject || '',
          email: req.params.email || '',
          phone: req.params.phone || '',
          description: req.params.description || '',
          status: req.params.status || '',
          observacion: req.params.observacion || '',
          canalizacion: req.params.canalizacion || '',
          seen: false,
          created: Date.now(),
          updated: Date.now(),
          tipo: req.params.tipo || 'otros'
        },
        nCase = new Case(case_data);

        nCase.save(function(error, data){
          if(error){
            res.send({success:false, error:error});
          }else{
            res.send({success:true, data: data});
          }
        });


    return next();
  }
}
