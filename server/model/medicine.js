const db = require('../utlis/database');

class Medicine{

    async getMedicine(){
        const query = "select * from medicine";
        let [ list ] = await db.connection.execute(query);
        return list;
    }

    async searchMedicine(items) {
        const { drug_name , ATCC_code } = items;
        let query = "SELECT * FROM medicine WHERE 1=1";
        let queryParams = [];

        if (drug_name) {
            query += " AND drug_name LIKE ?";
            queryParams.push(`%${drug_name}%`);
        }

        if (ATCC_code) {
            query += " AND ATCC_code LIKE ?";
            queryParams.push(`%${ATCC_code}%`);
        }
        console.log(query);
        console.log(queryParams);
        try {
            const [rows] = await db.connection.execute(query, queryParams);
            return rows;
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    async getMedicineById(id) {
        const query = "SELECT * FROM medicine WHERE ATCC_code = ?";
        try {
            const [rows] = await db.connection.execute(query, [id]);
            return rows[0];
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }
}

module.exports = new Medicine();