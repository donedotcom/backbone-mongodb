Extensions to Backbone.js to support MongoDB use as a back-end data store. 

# Overview

Adds Backbone.Document and Backbone.EmbeddedDocument for working with MongoDB data:

1.  embedded documents are wrapped in the correct objects if desired; nesting is supported
2.  embedded documents support a minimum of features for accessing the root
3.  all changes are made through the root document

Co-exists with Backbone Models, which remain unchanged.

# Server Side (node.js)

When loaded on a node.js server (where node-mongodb-native is available), provides:

1. save, fetch, and delete methods that follow the standard node callback pattern: callback(err, response)
2. support for loading from and saving to the mongodb


# Client Side

When loaded on the browser, provides:

1. access to the same methods (validation, etc) that the server has
2. Backbone.js sync support for document-level


# Credit

Structural credit and general props for writing beautiful code to jashkenas and the Backbone.js crew.