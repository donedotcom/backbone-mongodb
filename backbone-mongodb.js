//  backbone-mongodb.js
//  (c) 2011 Done.

(function() {

  // Save a reference to the global object.
  var root = this;
  
  // Require Backbone and Underscore if we're on the server, and it's not already present
  var Backbone = root.Backbone;
  var _ = root._;
  if(!Backbone && (typeof require !== 'undefined')) Backbone = require('backbone');
  if (!_ && (typeof require !== 'undefined')) _ = require('underscore')._;
  
  var MongoDb = {};
  
  // Support events for MongoDb so we can manage the database state from an external observer
  _.extend(MongoDb, Backbone.Events);
  
  // MongoDb options
  MongoDb.options = {
    
    // Database options, for connection to the MongoDB (only used on server-side implementation)
    database: {
      name: 'test',
      host: '127.0.0.1',
      port: '27017'
    },
    
  };
  
  // MongoDb models
  // --------------  
  MongoDb.models = {

    Document: Backbone.Model.extend({
      idAttribute: '_id',  // provides the mongo _id for documents
      
      fetch: function(callback) {
        return (this.sync || MongoDb.sync).call(this, 'read', this, callback);
      },
      
      save: function(attrs, callback) {
        var method = this.isNew() ? 'create' : 'update'; // Note: isNew() is using .id instead of idAttribute
        if (attrs && !this.set(attrs)) return false;
        
        return (this.sync || MongoDb.sync).call(this, method, this, callback);
      },
      
      destroy: function(callback) {
        if (this.isNew()) return this.trigger('destroy', this, this.collection, {});

        var model = this;
        return (this.sync || MongoDb.sync).call(this, 'delete', this, callback);
      },      
    }),
    
    EmbeddedDocument: Backbone.Model.extend({
      idAttribute: '_id',  // should be overridden for embedded documents that use their own ID type
      
      initialize: function(parent, attributes) {
        attributes = attributes || {};
        
        this.parent = parent;
        this.set(attributes);
      },
      
      fetch: function(callback) {
        var model = this,
            document = parentDocument(model);
            
        if(!document) { return callback("No parent document", null); }

        parentDocument.fetch(function(err, parent) {
          callback(err, model);
        });
      },
      
      save: function(attrs, callback) {
        var model = this;
            document = parentDocument(model);

        if(!document) { return callback("No parent document", null); }

        if (attrs && !this.set(attrs)) return false;
        document.save({}, function(err, parent) {
          callback(err, model);
        });
      },
      
      destroy: function(callback) {
      },   
    }),
    
  };
  
  // MongoDb collections
  // -------------------
  MongoDb.collections = {
    
    DocumentCollection: Backbone.Collection.extend({
      model: MongoDb.models.Document,
      
      fetch: function(options) {
        this.__super__.fetch(options);
      },
      
      create: function(model, options) {
        this.__super__.create(model, options);
      },
      
      remove: function(models, options) {
        this.__super__.remove(models, options);        
      },
      
    }),
    
    EmbeddedDocumentCollection: Backbone.Collection.extend({
      model: MongoDb.models.EmbeddedDocument,
      
      fetch: function(options) {
        this.__super__.fetch(options);
      },
      
      create: function(model, options) {
        this.__super__.create(model, options);
      },
      
      remove: function(models, options) {
        this.__super__.remove(models, options);        
      },
      
    }),
      
  };
  
  // MongoDb sync
  // ------------
  MongoDb.sync = function(method, model, callback) {
    if(!model.collectionName) {
      return callback('A collection name must be specified for sync', this);
    }

    this.db.collection(model.collectionName, function(err, collection) {
      if(err) { return callback(err); }
      
      switch(method) {
        case 'read':
          collection.findOne({ _id: model.id }, function(err, dbModel) {
            if (!dbModel) {
              err = 'Could not find id ' + model.id;
            } else if(!err) {
              model.set(dbModel);            
            }
            callback(err, model);
          });
          break;
        case 'create':
          collection.insert(model.attributes, function(err, dbModel) {
            if(!err) {
              model.set(dbModel[0]);
            }
            callback(err, model);
          });
          break
        case 'update':
          collection.update({ _id: model.id }, model.attributes, function(err) {
            callback(err, model);
          });
          break;
        case 'delete':
          collection.remove({ _id: model.id }, function(err, result) {
            callback(err);
          });
          break;
        default:
          callback('Unknown sync method ' + method, null);
          break;
      }
    });
  }.bind(MongoDb);
  
  // MongoDb database connection
  // ---------------------------
  if(typeof require !== 'undefined') {
    (function() {
      var Mongo = require('mongodb').Db,
          Server = require('mongodb').Server,
          options = this.options.database,
          db;
          
      db = new Mongo(options.name, new Server(options.host, options.port, {})); 
      db.open(function(err, database) {
        if(err) {
          this.trigger('database', 'error', err);
        } else {
          this.db = database;
          this.trigger('database', 'open');
        }
      }.bind(this));
    }).call(MongoDb);
  }  
  
  // Utility Functions
  // -----------------
  var parentDocument = function(embeddedDocument) {
    if(embeddedDocument instanceof MongoDb.models.Document) {
      return embeddedDocument;
    }
    
    if(embeddedDocument.parent) {
      return parentDocument(embeddedDocument.parent);
    }
    
    return null;
  }
    
  // Patch Backbone
  // --------------
  Backbone.MongoDb = MongoDb;
  _.extend(Backbone, MongoDb.models);
  _.extend(Backbone, MongoDb.collections);
  
}).call(this);