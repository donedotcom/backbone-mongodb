var Db = require('../lib/db');

var _connection = null;

var database = new Db({
  name: 'test',
  host: '127.0.0.1',
  port: 27017
});
    
exports.db = function(callback) {
  if (_connection) { 
    return callback(null, _connection);
  }
  
  database.on('database', function(status) {
    var error = status === 'open' ? null : status;
    _connection = Db.getConnection();
    callback(error, _connection);    
  });
}