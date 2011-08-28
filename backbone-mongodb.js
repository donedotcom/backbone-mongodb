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
  
  var MongoDB = {};
  
  // MongoDB models
  // --------------  
  MongoDB.models = {

    Document: {
      
    },
    
    EmbeddedDocument: {
      
    },
    
  };
  
  // Patch Backbone
  // --------------
  
  // TODO: extend Backbone.Model to have Backbone.Document, Backbone.EmbeddedDocument
  
}).call(this);