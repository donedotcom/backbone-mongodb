var assert = require('assert'), 
    vows = require('vows'),
    helper = require('./helper'),
    BackboneMongoDb = require('../backbone-mongodb'),
    Backbone = require('backbone');

var Monkey = Backbone.Document.extend({});

var TestDocument = Backbone.Document.extend({
  collectionName: 'TestDocument',
  models: { 'monkey': Monkey },
});

vows.describe('Embedded Document').addBatch({
  
// Set up the database
// -------------------

  'open database': {
    topic: function() { helper.db(this.callback); },
    'is available': function(err, db) {
      assert.isNull(err);
      assert.isNotNull(db);
    }
  }

// Attributes that have models
// ---------------------------

}).addBatch({
  'document attribute with a model': {
    topic: new TestDocument(),
    'valid data set from an object': {
      topic: function(document) {
        document.set({ monkey: { name: 'Super Monkey' } });
        this.callback(null, document);
      },
      'has correct value': function(err, document) {
        assert.equal(document.get('monkey').get('name'), 'Super Monkey');
      },
      'has correct model type': function(err, document) {
        assert.isTrue(document.get('monkey') instanceof Monkey);
      },
      'has correct container': function(err, document) {
        assert.equal(document.get('monkey').container, document);
      },
      'when saved and fetched': {
        topic: function(document) {
          var self = this;
          document.save(null, function(err, document) {
            document.fetch(self.callback);
          });
        },
        'has correct data': function(err, document) {
          assert.equal(document.get('monkey').get('name'), 'Super Monkey');
        }
      }
    },
    'set from a Document': {
      topic: function(document) {
        document.set({ monkey: new Monkey({ name: 'Super Monkey' }) });
        this.callback(null, document);
      },
      'has correct value': function(err, document) {
        assert.equal(document.get('monkey').get('name'), 'Super Monkey');
      },
      'has correct model type': function(err, document) {
        assert.isTrue(document.get('monkey') instanceof Monkey);
      },
      'has correct container': function(err, document) {
        assert.equal(document.get('monkey').container, document);
      },
      'when saved and fetched': {
        topic: function(document) {
          var self = this;
          document.save(null, function(err, document) {
            document.fetch(self.callback);
          });
        },
        'has correct data': function(err, document) {
          assert.equal(document.get('monkey').get('name'), 'Super Monkey');
        }
      }
    },
  }

// Changing values of attribute models from the sub-model
// ------------------------------------------------------

}).addBatch({ 
  'document attribute with a model': {
    topic: new TestDocument(),  
    'set from the attribute model': {
      topic: function(document) {
        document.set({ monkey: new Monkey({ name: 'Super Monkey' }) });
        document.get('monkey').set({ name: 'Lame Monkey' });
        this.callback(null, document);
      },
      'should not change': function(err, document) {
        assert.equal(document.get('monkey').get('name'), 'Super Monkey');
      },
    }
  }


}).export(module);
