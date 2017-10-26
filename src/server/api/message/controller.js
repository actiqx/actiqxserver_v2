
var _ = require('lodash');
var Model = require('./model');

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(204).end();
      return null;
    }
    return entity;
  };
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function getDocs(conditions, selects, options){
  conditions = conditions || {};
  selects = selects || {};
  options = options || {};

  // default select
  var defaultObj = {};
   _.defaults (selects, selects, defaultObj);

  // default skip & limit
  var defaultObj = {skip:0,limit:20};
   _.defaults (options, options, defaultObj);

  var query = Model.find(conditions).select(selects).lean();
  query.skip(options.skip).limit(options.limit);
  return query.exec();
}

function getDoc(options){
  options = options || {};
  var selects = options.selects || {},
      condition = options.condition || {};

  var defaultObj = {};
   _.defaults (selects, selects, defaultObj);

  return Model.findOne(condition).select(selects).exec();
}
exports.getDoc = getDoc;


function save(docs){
  return Model.create(docs);
}
exports.save = save;

exports.index = function(req, res) {
  return getDocs()
    .then(respondWithResult(res))
    .catch(handleError(res));
};

exports.show = function (req, res, next) {
  return getDoc({_id:req.params.id})
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
};

exports.create = function(req, res, next){
  req.body.from = req.user._id;
  save(req.body)
    .then(function(doc){
      process.nextTick(function(){
        doc.from = req.user;
        require("../event/emitter").emitter.emit("msg:new-msg", doc);
      });
      return docs;
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

exports.conversations = function(req,res,next){
  var userId = req.user.id.toString();
  Model.aggregate([
    { $match: { $or:[{from: userId}, {to: userId}] } },
    { $sort:{ _id:1 } },
        { $group: { 
        "_id": {
            "last_message_between":{
                $cond:[
                    {
                        $gt:[
                        {$substr:["$to",0,1]},
                        {$substr:["$from",0,1]}]
                    },
                    {$concat:["$to"," and ","$from"]},
                    {$concat:["$from"," and ","$to"]}
                ]
            }
        },"message":{ $first:"$$ROOT" }
      }
    },{
        $project : {
            _id: 0,
            document : "$message"
        }
    },
    { $limit: 10 }
  ])
  .exec()
  .then(function(data){
    return data.map(function(d){ return d.document })
  })
  .then(respondWithResult(res))
  .catch(handleError(res));
}


exports.conversation = function(req,res,next){
  var condition = {
    $or: [{
      from : req.user.id,
      to   : req.params.userId
    }, { 
      from : req.params.userId,
      to   : req.user.id
    }]
  };

  getDocs(condition, {}, {skip:req.query.skip,limit:req.query.limit})
    .then(respondWithResult(res))
    .catch(handleError(res));
}


