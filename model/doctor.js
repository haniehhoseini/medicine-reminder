const db = require('../utils/database');

class Doctor {

    async getDoctors() {
        const query = "SELECT * FROM doctor";
        let [list] = await db.connection.execute(query);
        return list;
    }

    async getDoctorspatients() {
        const query = "SELECT p.* FROM patient p INNER JOIN doctor d ON p.codeMeli_patient = d.codeMeli_patient";
        
        try {
            const [rows] = await db.connection.execute(query);
            return rows;
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }

    async searchDoctors(items) {
        const { firstname , expertise } = items;
        let query = "SELECT * FROM doctor WHERE 1=1";
        let queryParams = [];

        if (firstname) {
            query += " AND firstname LIKE ?";
            queryParams.push(`%${firstname}%`);
        }

        if (expertise) {
            query += " AND expertise LIKE ?";
            queryParams.push(`%${expertise}%`);
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
    
    async getDoctorById(id) {
        const query = "SELECT * FROM doctor WHERE doctor_id = ?";
        try {
            const [rows] = await db.connection.execute(query, [id]);
            return rows[0];
        } catch (error) {
            console.error("Error executing query:", error);
            throw error;
        }
    }
}

module.exports = new Doctor();
