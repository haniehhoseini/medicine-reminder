const db = require('../utils/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = require('../config/keys').secretOrKey;
const Roles = require('../shared/role');




class Auth {
    
    formatDate(date) {
        
        if (!date || date.trim() === '') {
            return null; 
        }
           
        const parsedDate = new Date(date);
        return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }

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
            const { 
                    codemeli, 
                    password, 
                    firstname, 
                    lastname, 
                    mobile, 
                    address, 
                    gender, 
                    image_url, 
                    birthday, 
                    relatives_id, 
                    role,
                    ensurance 
                } = items;

            const query = `INSERT INTO user (
                                codemeli, 
                                password, 
                                firstname, 
                                lastname, 
                                mobile, 
                                address, 
                                gender, 
                                image_url, 
                                birthday, 
                                relatives_id, 
                                role,
                                ensurance ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
                role ?? Roles.PATIENT ,
                ensurance 
            ];

            try {
                const [res] = await db.connection.execute(query, values);
                return res;
            } catch (error) {
                console.error('Error executing query:', error);
                throw error;  
            }
        } else {
            console.log('User exists');
            return { message: 'User already exists' };
        }
    }


    async login(items) {
        const { codemeli, password } = items;
        const query = 'SELECT password, role, firstname ,lastname, ensurance FROM user WHERE codemeli = ?';

        try {
            const [list] = await db.connection.execute(query, [codemeli]);
            if (list.length === 0) {
                console.log('Invalid credentials');
                return { message: 'Invalid credentials' };
            }

            const user = list[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
    
            if (isPasswordValid) {
                const token = jwt.sign(
                    { 
                        codemeli, 
                        role: user.role, 
                        firstname: user.firstname, 
                        lastname: user.lastname ,
                        ensurance: user.ensurance
                    },
                    secret,
                    { expiresIn: '1h' }
                );
                console.log('Success');
                return { token };
            } else {
                console.log('Invalid credentials');
                return { message: 'Invalid credentials' };
            }
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;  
        }
    }

   
    async getMe(req, res) {
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
    
        try {
            const decoded = jwt.verify(token, secret);
            const query = 'SELECT codemeli, firstname, lastname, mobile, address, gender, image_url, birthday, relatives_id, role FROM user WHERE codemeli = ?';
            const [rows] = await db.connection.execute(query, [decoded.codemeli]);
    
            if (rows.length === 0) {
                return res;
            }
    
            const user = rows[0];
            return user;
        } catch (error) {
            
            return res;
        }
    }
    
    


}

module.exports = new Auth();