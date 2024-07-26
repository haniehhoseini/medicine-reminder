//const db = require('../utlis/database');

class Company{

    async getCompany(){
        const query = "select * from company";
        let [ list ] = await db.connection.execute(query);
        return list;
    }
}

module.exports = new Company();