module.exports = {
 "type": "mysql",
 "host": process.env.DATABASE_HOST,
 "port": 3306,
 "username": "root",
 "password": process.env.DATABASE_PASSWORD,
 "database": "hyunsub2",
 "synchronize": false,
 "logging": false,
 "entities": [
   "src/entity/**/*.ts"
 ]
}
