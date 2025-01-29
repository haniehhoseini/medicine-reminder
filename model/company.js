const db = require('../utils/database');

class Company{

    async getCompany(){
        const query = "select * from company";
        let [ list ] = await db.connection.execute(query);
        return list;
    }

    async searchCompanyByName(firstname) {
        let query;
        let params = [];
    
        if (!firstname || firstname.trim() === "") {
            // اگر ورودی خالی باشد، کل لیست بازگردانده می‌شود
            query = "SELECT * FROM company";
        } else {
            // جستجوی تطبیقی
            query = "SELECT * FROM company WHERE firstname LIKE ?";
            params = [`%${firstname}%`];
        }
    
        let [list] = await db.connection.execute(query, params);
        return list;
    }
    
    
}

module.exports = new Company();