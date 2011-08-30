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
      'has correct value': function(err, document) {
        assert.equal(document.get('monkey').get('name'), 'Lame Monkey');
      },
      'when saved and fetched': {
        topic: function(document) {
          var self = this;
          document.save(null, function(err, document) {
            document.fetch(self.callback);
          });
        },
        'has correct data': function(err, document) {
          assert.equal(document.get('monkey').get('name'), 'Lame Monkey');
        }
      }
    }
  }

}).export(module);
