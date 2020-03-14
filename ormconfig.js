module.exports = {
 "type": "mysql",
 "host": process.env.DATABASE_HOST,
 "port": 3306,
 "username": "root",
 "password": process.env.DATABASE_PASSWORD,
 "database": "hyunflix-api",
 "synchronize": false,
 "logging": false,
 "entities": [
   "src/entity/**/*.ts"
 ]
}
