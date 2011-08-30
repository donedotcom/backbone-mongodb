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
      models: {},          // mapping of attributes to models (optional)
      
      initialize : function(attributes, options) {
        if (options && options.container) {
          // Crashes
          this.container = options.container;
        }
      },
      
      set : function(attrs, options) {    
        // Create any sub-models
        this._prepareModels(attrs);
        return Backbone.Model.prototype.set.call(this, attrs, options);
      },
      
      fetch : function(callback) {
        if (this.container) {
          return callback('Must call fetch on the root document', this);
        } else {
          return (this.sync || MongoDb.sync).call(this, 'read', this, callback);
        }
      },
      
      save : function(attrs, callback) {
        var model = this;
            root = this;

        while (root.container) { root = root.container; }
        
        var method = root.isNew() ? 'create' : 'update';

        var options = {
          error: function(model, error, options) { callback(error, model); }
        };

        if (attrs && !model.set(attrs, options)) return model;  
        if (model.validate && !model._performValidation(model.attributes, options)) return model;
                
        return (root.sync || MongoDb.sync).call(root, method, root, function(err, rootDb) {
          callback(err, model);
        });
      },
      
      destroy : function(callback) {
        if (this.container) {
          return callback('Must call destroy on the root document', this);
        }
        
        if (this.isNew()) return this.trigger('destroy', this, this.collection, {});

        var model = this;
        return (this.sync || MongoDb.sync).call(this, 'delete', this, callback);
      },    
      
      toJSON : function() {
        return this._cleanAttributes();
      },
      
      // Marshall all the errors into one object and send them back together
      _performValidation : function(attrs, options) {
        var errors = {},
            cb = options.error;
        
        _.each(_.keys(attrs), function(attr) {
          var modelErrors = {};
          options.error = function(model, error, options) {
            _.extend(modelErrors, error);
          };
          
          if(this._isModel(attr)) {
            var model = attrs[attr];
            if(model && model.validate) {
              model._performValidation(model.attributes, options);
            }
          }
          
          if(_.keys(modelErrors).length) {
            errors[attr] = modelErrors;
          }          
        }.bind(this));
        
        options.error = function(model, error, options) {
          _.extend(errors, error);
        }
        
        Backbone.Model.prototype._performValidation.call(this, attrs, options);
        
        if(_.keys(errors).length) {          
          if(cb) {
            cb(this, errors, options);
          } else {
            this.trigger('error', this, errors, options);
          }
          return false;
        }
        return true;
      },
      
      _isModel : function(attr) {
        return attr in this.models;
      },
      
      // Create models for attributes that have one defined, and update the container
      _prepareModels : function(attrs) {
        _.each(_.keys(attrs), function(attr) {
          var value = attrs[attr];
          
          if(attr in this.models) {
            if(!(value instanceof Backbone.Model)) {
              attrs[attr] = new this.models[attr](value, { container: this });
            } else {
              value.container = this;
            }
          }
        }.bind(this));
      },
      
      // Recursively strip the sub-models out of the attributes so that they can be saved without circular references
      _cleanAttributes : function(attributes) {
        attributes = attributes || _.clone(this.attributes);
        
        _.each(_.keys(attributes), function(attr) {
          var value = attributes[attr];
          if(value && value.attributes) {
            value = this._cleanAttributes(value.attributes);
          }
          attributes[attr] = value;
        }.bind(this));
        return attributes;
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
    var root = model;

    if(!root.collectionName) {
      return callback('A collection name must be specified at the root for sync', this);
    }

    this.db.collection(root.collectionName, function(err, collection) {
      if (err) { return callback(err); }
      
      switch(method) {
        case 'read':          
          collection.findOne({ _id: root.id }, function(err, dbModel) {
            if (!dbModel) {
              err = 'Could not find id ' + root.id;
            } else if(!err) {
              root.set(dbModel);            
            }
            callback(err, model);
          });
          break;
        case 'create':
          collection.insert(model._cleanAttributes(), function(err, dbModel) {
            if(!err) {
              root.set(dbModel[0]);
            }
            callback(err, model);
          });
          break
        case 'update':
          collection.update({ _id: root.id }, root._cleanAttributes(), function(err) {
            callback(err, model);
          });
          break;
        case 'delete':
          collection.remove({ _id: root.id }, function(err, result) {
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
    
  // Patch Backbone
  // --------------
  Backbone.MongoDb = MongoDb;
  _.extend(Backbone, MongoDb.models);
  _.extend(Backbone, MongoDb.collections);
  
}).call(this);