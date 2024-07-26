const mysql = require('mysql2/promise');

class Database {
    constructor(){
        this.connection = undefined;
        this.createConnection();
    }
    async createConnection(){
        this.connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'my-secret-pw',
            database: 'daro'
        });
    }
}

module.exports = new Database();