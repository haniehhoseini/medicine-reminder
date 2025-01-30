const db = require('../utils/database');


class Company{

    async getCompany(){
        const query = "select * from company";
        let [ list ] = await db.connection.execute(query);
        return list;
    }

    async searchCompanyByName(items) {
        const { firstname } = items;
        let query = "SELECT * FROM company WHERE 1=1";
        let queryParams = [];
    
        if (firstname) {
            query += " AND firstname LIKE ?";
            queryParams.push(`%${firstname}%`);
        }
    
        console.log(query);
        console.log(queryParams);
        try {
            const [rows] = await db.connection.execute(query, queryParams);
            return rows;
        } catch (message) {
            throw message;
        }
    }
    
}

module.exports = new Company();