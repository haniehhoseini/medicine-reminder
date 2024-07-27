const db = require('../utlis/database');

class Medicine{

    async getMedicine(){
        const query = "select * from medicine";
        let [ list ] = await db.connection.execute(query);
        return list;
    }

    async searchMedicine(items) {
        const { name , code } = items;
        let query = "SELECT * FROM medicine WHERE 1=1";
        let queryParams = [];

        if (name) {
            query += " AND name LIKE ?";
            queryParams.push(`%${name}%`);
        }

        if (code) {
            query += " AND code LIKE ?";
            queryParams.push(`%${code}%`);
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
        const query = "SELECT * FROM medicine WHERE medicine_id = ?";
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