var Backbone = require('backbone'),
    BackboneMongoDb = require('../backbone-mongodb');
    
exports.db = function(callback) {
  if (Backbone.MongoDb.db) { return callback(null, Backbone.MongoDb.db); }
  
  Backbone.MongoDb.bind('database', function(status) {
    var error = status === 'open' ? null : status;
    callback(error, Backbone.MongoDb.db);
  });
}