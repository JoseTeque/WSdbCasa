var mssql = require('mssql');

var config = {
  user:'sa',
  password:'beisbol18',
  server:'localhost',
  database:'dbCasa'
};

const poolPromised = new mssql.ConnectionPool(config).connect()
.then(pool => {console.log('Conectado a MSSQL') 
return pool}).catch(err => console.log('Conexion fallida', err));

module.exports = {mssql, poolPromised};
