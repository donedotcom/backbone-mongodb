//    backbone-mongodb mongodb-document.js
//    (c) 2011 Done.
var _ = require('underscore')._,
    Backbone = require('backbone'),
    Db = require('./db');

//  Document provides the server-side implementation of various functions for the MongoDocument.
//  It is included in the backbone-mongodb implementation when running on the server.
var Document = module.exports = {

  //  Document Public API
  //  -------------------
  initialize : function() {},  // called on subclasses

  // Refresh the contents of this document from the database
  fetch : function(callback) {
    var self = this;
    
    if (!self._requireRoot()) return;

    self._withCollection(function(err, collection) {
      if (err) { return callback(err); }
      
      collection.findOne({ _id: self.id }, function(err, dbModel) {
        if (!dbModel) {
          err = 'Could not find id ' + self.id;
        } else if(!err) {
          self.set(dbModel);            
        }
        callback(err, self);
      });      
    });
  },
  
  // Validate and save the contents of this document to the database
  save : function(attrs, callback) {
    var self = this,
        options = {
          error: function(model, error, options) {
            callback(error, model);
          }
        };
        
    if (!self._requireRoot()) return;
    
    // options.error configures the callback
    if (attrs) {
      if (!this.set(attrs, options)) return;
    } else {
      if (self.validate && !self._performValidation(self.attributes, options)) return;
    }
    
    self._withCollection(function(err, collection) {
      if (err) { return callback(err); }
      
      if (self.isNew()) {
        collection.insert(self.attributes, function(err, dbModel) {
          if(!err) { self.set(dbModel[0]); }          
          callback(err, self);
        });
      } else {
        collection.update({ _id: self.id }, self.attributes, function(err) {
          callback(err, self);
        });
      }
    });
  },

  // Remove this document from the database 
  destroy : function(callback) {
    var self = this;

    if (!self._requireRoot()) return;
    
    self._withCollection(function(err, collection) {
      if (err) { return callback(err); }
      
      collection.remove({ _id: self.id }, callback);
    });    
  },              
    
  //  Private API functions
  //  ---------------------

  // Obtain a database connection or die
  _requireConnection : function() {
    var connection = Db.getConnection();
    if (!connection) {
      throw 'FATAL: Database not connected', this;
    }
    return connection;    
  },
  
  // Request the Database collection associated with this Document
  _withCollection : function(callback) {
    var connection = this._requireConnection();
    connection.collection(this.collectionName, function(err, collection) {
      callback(err, collection);
    });
  },
  
  // Must be the root
  _requireRoot : function(callback) {
    if (this.container) {
      callback('This function cannot be called on an embedded document');
      return false;
    }
    return true;
  }
     
};

