var assert = require('assert'), 
    _ = require('underscore')._,
    vows = require('vows'),
    helper = require('./helper'),
    BackboneMongoDb = require('../backbone-mongodb'),
    Backbone = require('backbone');

var Monkey = Backbone.Document.extend({ 
});
    
var MonkeyCollection = Backbone.Collection.extend({
  model : Monkey,
});

var Document = Backbone.Document.extend({
  collectionName: 'document',
  models : { 'monkeys': MonkeyCollection },
});

vows.describe('Collection').addBatch({

// Set up the database
// -------------------

  'open database': {
    topic: function() { helper.db(this.callback); },
    'is available': function(err, db) {
      assert.isNull(err);
      assert.isNotNull(db);
    }
  }

// Validate object type assignment
// -------------------------------
}).addBatch({
  'a new document with monkeys': {
    topic: function() {
      var document = new Document({ monkeys: [ { name: 'Monkey 1' }, { name : 'Monkey 2' } ] });
      document.save(null, this.callback);
    },
    'should have a monkey collection': function(err, document) {
      assert.isTrue(document.get('monkeys') instanceof MonkeyCollection);
    },
    'monkey collection should have monkeys': function(err, document) {
      assert.isTrue(document.get('monkeys').at(0) instanceof Monkey);
    },
    'monkey in collection should be the right monkey': function(err, document) {
      assert.equal(document.get('monkeys').at(0).get('name'), 'Monkey 1');
    }
  }

}).export(module);
