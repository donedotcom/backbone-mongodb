var assert = require('assert'), 
    vows = require('vows'),
    helper = require('./helper'),
    BackboneMongoDb = require('../backbone-mongodb'),
    Backbone = require('backbone');

var TestDocument = Backbone.Document.extend({
  collectionName: 'TestDocument',
});

vows.describe('Document').addBatch({

// Set up the database
// -------------------

  'open database': {
    topic: function() { helper.db(this.callback); },
    'is available': function(err, db) {
      assert.isNull(err);
      assert.isNotNull(db);
    }
  }

// Saving documents
// ----------------

}).addBatch({
  'an unsaved Document': {
    topic: new TestDocument(),
    'is new': function(document) {
      assert.isTrue(document.isNew());
    },
    'when saved': {
      topic: function(document) {
        document.save(null, this.callback);
      },
      'is not new': function(err, document) {
        assert.isFalse(document.isNew());
      },      
      'has assigned the id': function(err, document) {
        assert.ok(document.id);
      },
    },
    'when updated inside save': {
      topic: function(document) {
        document.save({spaceMonkeyCaptain: true}, this.callback);
      },
      'has parameter saved': function(err, document) {
        assert.isNull(err);
        assert.isTrue(document.get('spaceMonkeyCaptain'));
      }
    },
    'when updated': {
      topic: function(document) {
        document.set({spaceMonkeyTrainee: true});
        document.save({}, this.callback);
      },
      'has parameter saved': function(err, document) {
        assert.isNull(err);
        assert.isTrue(document.get('spaceMonkeyTrainee'));
      }
    }
  }
  
// Fetching documents
// ------------------

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
  
}).export(module);
