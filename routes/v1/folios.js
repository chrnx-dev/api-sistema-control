var mongoose = require('mongoose'),
    Case = require('../../models/folios'),
    _ = require('underscore');

module.exports = {
  get: function(req, res, next){
    var module = req.params.module || false;

    if (! module){
      res.send(404,{message: 'Unable to find a '+ module +' module'});
      return next();
    }

    Case.find({module: module},{folio:true, _id:false}).exec(function(err, cases){
      if (_.isEmpty(cases)){
        res.send(404,{message: 'Unable to find a '+ module +' module'});
        return next();
      }
      res.send(cases[0]);
      return next();
    });
  },
  increase:function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    var _id = req.params.module || false;

    if (! _id){
      res.send(404,{message: 'Unable to find a '+_id+' module'});
      return next();
    }

    Case.find({module: _id}).exec(function(err, cases){

      cases = cases[0];
      var folio = cases.folio + 1;

      Case.update({_id: cases._id},{$set:{folio:folio}},function(err, numberAffected, raw){
        if (err){
          res.send(404,{message: handleError(err)});
        }

        res.send({
          affected: numberAffected,
          mongo: raw
        });

        return next;
      });

    });

  },
  reset:function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "*");
    var _id = req.params.module || false;

    if (! _id){
      res.send(404,{message: 'Unable to find a '+_id+' module'});
      return next();
    }

    Case.find({module: _id}).exec(function(err, cases){

      cases = cases[0];
      var folio = 1;

      Case.update({_id: cases._id},{$set:{folio:folio}},function(err, numberAffected, raw){
        if (err){
          res.send(404,{message: handleError(err)});
        }

        res.send({
          affected: numberAffected,
          mongo: raw
        });

        return next;
      });

    });

  }
}
