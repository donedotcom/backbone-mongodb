var assert = require('assert'), 
    _ = require('underscore')._,
    vows = require('vows'),
    helper = require('./helper'),
    BackboneMongoDb = require('../backbone-mongodb'),
    Backbone = require('backbone');

var Monkey = Backbone.Document.extend({});

var TestDocument = Backbone.Document.extend({
  collectionName: 'TestDocument',
  models: { 'monkey': Monkey },
  validate : function(attrs) {
    var errors = {};

    if (!attrs.name || attrs.name.length === 0) { 
      errors.name = 'Document name must not be blank';
    }
    
    if(attrs.monkey) {
      if(!attrs.monkey.name || attrs.monkey.name.length === 0) {
        errors.monkey = {};
        errors.monkey.name = "Monkeys must have a name";
      }
    }
    return _.keys(errors).length === 0 ? null : errors;
  }
});

vows.describe('Validation').addBatch({
  
// Set up the database
// -------------------

  'open database': {
    topic: function() { helper.db(this.callback); },
    'is available': function(err, db) {
      assert.isNull(err);
      assert.isNotNull(db);
    }
  }

// Validate the top level document
// -------------------------------

}).addBatch({
  'an unsaved Document': {
    topic: new TestDocument(),
    'is new': function(document) {
      assert.isTrue(document.isNew());
    },
    'when not valid': { 
      topic: function(document) {
        document.save(null, this.callback);
      },
      'should have an error': function(err, document) {
        assert.ok(err);
      },
      'should have an error on name': function(err, document) {
        assert.equal(err.name, "Document name must not be blank");
      }
    },
  }
}).addBatch({
  'an unsaved Document': {
    topic: new TestDocument(),
    'is new': function(document) {
      assert.isTrue(document.isNew());
    },
    'when valid': {
      topic: function(document) {
        document.save({ name: 'Dox' }, this.callback);
      },
      'should not have an error': function(err, document) {
        assert.isNull(err);
      }
    }
  }

// Validate the embedded document
// ------------------------------

}).addBatch({
  'an unsaved Document': {
    topic: new TestDocument({ name: 'Dox' }),
    'is new': function(document) {
      assert.isTrue(document.isNew());
    },
    'when embedded value is not valid': { 
      topic: function(document) {
        document.save({ monkey: {} }, this.callback);
      },
      'should have an error': function(err, document) {
        assert.ok(err);
      },
      'should have an error on name': function(err, document) {
        assert.equal(err.monkey.name, 'Monkeys must have a name');
      }
    }
  }

}).export(module);
