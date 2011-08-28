Extensions to Backbone.js to support MongoDB use as a back-end data store. 

# Overview

Adds Backbone.Document and Backbone.EmbeddedDocument for working with MongoDB data:

1.  support for validation
2.  support for recognizing changes to embedded documents properly
3.  Server/Client: support for using changes to send only the modified portions

Co-exists with Backbone Models, which remain unchanged.

# Server Side (node.js)

When loaded on a node.js server (where node-mongodb-native is available), provides:

1.  support for properly saving updates to embedded documents

# Client Side

When loaded on the browser, provides:

1.  Support for sending partial updates of embedded documents to the server

