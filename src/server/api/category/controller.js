
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

function getDocs(conditions, selects){
  conditions = conditions || {};
  selects = selects || {};

  var defaultObj = {};
   _.defaults (selects, selects, defaultObj);

  return Model.find(conditions).select(selects).lean().exec()
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
    .then(function(docs){
      return docs.treeData();
    })
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
  save(req.body)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

exports.update = function(req, res, next){
  res.send("TO-DO");
}


Array.prototype.treeData = function treeData(options){
  var array = this;
  options = options || {};
  var parentKey   = options.parentKey || "parent";
  var idKey       = options.idKey   || "_id";

  // valication for idKey
  var test = array.filter(function(a){
    return !_.get(a,idKey);
  });
  if(test.length!=0){
    const err = new Error(`missing ${idKey} for ${JSON.stringify(test)}`);
    console.log(err);
    return;
  }

  // start process

  var parents = [];
  var childrens = [];

  // separate parents & childrens
  array.forEach(function(data){
    if( !data.hasOwnProperty(parentKey) )
      parents.push(data);
    else
      childrens.push(data);
  });

  // recorsive function
  (function addChild(nodes){
    nodes.forEach(function(node){
      var _childrens = childrens.filter(function(data){
        return _.get(data,parentKey).toString() == _.get(node,idKey).toString()
      });
      node["childrens"] = _childrens;  
      addChild(node["childrens"]);
    });
  })(parents);

  return parents;
};
