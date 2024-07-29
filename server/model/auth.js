const db = require('../utils/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = require('../config/keys').secretOrKey;
const Roles = require('../shared/role');




class Auth {

    

    formatDate(date) {
        // Check if date is a valid string or empty
        if (!date || date.trim() === '') {
            return null; // Set to null or an appropriate default value
        }
    
        // Try to parse and format the date
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

    // Utility function to format integers
    formatInteger(value) {
        const parsedValue = parseInt(value, 10);
        return isNaN(parsedValue) || value.trim() === '' ? null : parsedValue;
    }
    

    async exitRegister(items) {
        const { codemeli } = items;
        const query = 'SELECT * FROM user WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async register(items) {
        if (await this.exitRegister(items)) {
            const { codemeli, password, firstname, lastname, mobile, address, gender, image_url, birthday, relatives_id, role } = items;
            const query = 'INSERT INTO user (codemeli, password, firstname, lastname, mobile, address, gender, image_url, birthday, relatives_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const hashpassword = await bcrypt.hash(password, 10);
            const formattedBirthday = this.formatDate(birthday);
            const formattedRelativesId = this.formatInteger(relatives_id);

            const values = [
                codemeli ?? null,
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                mobile ?? null,
                address ?? null,
                gender ?? null,
                image_url ?? null,
                formattedBirthday,
                formattedRelativesId,
                role ?? Roles.PATIENT 
            ];

            try {
                const [res] = await db.connection.execute(query, values);
                return res;
            } catch (error) {
                console.error('Error executing query:', error);
                throw error;  // or handle the error as needed
            }
        } else {
            console.log('User exists');
            return { message: 'User already exists' };
        }
    }


    async login(items) {
        const { codemeli, password } = items;
        const query = 'SELECT password, role FROM user WHERE codemeli = ?';

        try {
            const [list] = await db.connection.execute(query, [codemeli]);
            if (list.length === 0) {
                console.log('Invalid credentials');
                return { message: 'Invalid credentials' };
            }

            const truePassword = await bcrypt.compare(password, list[0].password);
            if (truePassword) {
                const token = jwt.sign({ codemeli, role: list[0].role }, secret, { expiresIn: '1h' });
                console.log('Success');
                return { token };
            } else {
                console.log('Invalid credentials');
                return { message: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;  // or handle the error as needed
        }
    }
}

module.exports = new Auth();