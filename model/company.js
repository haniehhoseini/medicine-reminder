const db = require('../utils/database');

class Company{

    async getCompany(){
        const query = "select * from company";
        let [ list ] = await db.connection.execute(query);
        return list;
    }

    async searchCompanyByName(req, res) {
        const { firstname } = req.params;
        const query = "SELECT * FROM company WHERE firstname LIKE ?";
        const searchValue = `%${firstname}%`; // برای جستجوی تطبیقی
        let [list] = await db.connection.execute(query, [searchValue]);
        return list;
    }
}

module.exports = new Company();