var assert = require('assert'), 
    vows = require('vows'),
    helper = require('./helper'),
    BackboneMongoDb = require('../backbone-mongodb'),
    Backbone = require('backbone');

var TestDocument = Backbone.Document.extend({collectionName: 'TestDocument'});

vows.describe('EmbeddedDocument').addBatch({

// Set up the database
// -------------------

  'open database': {
    topic: function() { helper.db(this.callback); },
    'is available': function(err, db) {
      assert.isNull(err);
      assert.isNotNull(db);
    }
  }

// Saving embedded documents
// -------------------------

}).addBatch({
  'an unsaved Document': {
    topic: function() {
      var document = new TestDocument();
      var eDocument = new Backbone.EmbeddedDocument(document);
      this.callback(null, eDocument);
    },
    'is new': function(eDocument) {
      assert.isTrue(eDocument.parent.isNew());
    },
    'when saved': {
      topic: function(eDocument) {
        eDocument.save({}, this.callback);
      },
      'is not new': function(err, eDocument) {
        assert.isFalse(eDocument.parent.isNew());
      },      
      'has assigned the id': function(err, eDocument) {
        assert.ok(eDocument.parent.id);
      },
    },
    'when updated inside save': {
      topic: function(eDocument) {
        eDocument.save({spaceMonkeyCaptain: true}, this.callback);
      },
      'has parameter saved': function(err, eDocument) {
        assert.isNull(err);
        assert.isTrue(eDocument.get('spaceMonkeyCaptain'));
      }
    },
    'when updated': {
      topic: function(eDocument) {
        eDocument.set({spaceMonkeyTrainee: true});
        eDocument.save({}, this.callback);
      },
      'has parameter saved': function(err, eDocument) {
        assert.isNull(err);
        assert.isTrue(eDocument.get('spaceMonkeyTrainee'));
      }
    }
  }
  
// Fetching documents
// ------------------
/*
}).addBatch({
  'an existing document': {
    topic: function() {
      var document = new TestDocument();
      document.save({spaceMonkeyCaptain: true}, this.callback);
    },
    'exists': function(document) {
      assert.isFalse(document.isNew());
      assert.isTrue(document.get('spaceMonkeyCaptain'));
    },
    'when fetched': {
      topic: function(document) {
        var fetchedDocument = new TestDocument();
        fetchedDocument.id = document.id;
        fetchedDocument.fetch(this.callback);
      },
      'is found': function(err, fetched) {
        assert.isNull(err);
        assert.ok(fetched);
      },
      'is populated': function(err, fetched) {
        assert.isTrue(fetched.get('spaceMonkeyCaptain'));
      }
    }
  }

// Removing documents
// ------------------
  
}).addBatch({
  'an existing document': {
    topic: function() {
      var document = new TestDocument();
      document.save({}, this.callback);
    },
    'exists': function(document) {
      assert.isFalse(document.isNew());
    },
    'when deleted': {
      topic: function(document) {
        document.destroy(this.callback);
      },
      'succeeds': function(err) {
        // without 'safe' mode the return is undefined
        assert.isUndefined(err);
      },
      'cannot be fetched': {
        topic: function(document) {
          document.fetch(this.callback);
        },
        'fail': function(err, document) {
          assert.ok(err);
        }
      }
    }
  }
  */
  
// Embedded Document Collections
// -----------------------------

// TODO

}).export(module);
