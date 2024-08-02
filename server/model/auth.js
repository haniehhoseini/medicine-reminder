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

            const defaultMaleImageUrl = 'https://www.svgrepo.com/show/382101/male-avatar-boy-face-man-user.svg';
            const defaultFemaleImageUrl = 'https://cdn.icon-icons.com/icons2/2643/PNG/512/female_woman_avatar_people_person_white_tone_icon_159370.png';
    
            // Set default image based on gender if image_url is empty
            let finalImageUrl = image_url;
            if (!finalImageUrl) {
                if (gender === 'مذکر') {
                    finalImageUrl = defaultMaleImageUrl;
                } else if (gender === 'مونث') {
                    finalImageUrl = defaultFemaleImageUrl;
                } else {
                    // Optional: handle cases where gender is not specified or is other
                    finalImageUrl = 'https://www.svgrepo.com/show/382101/male-avatar-boy-face-man-user.svg';
                }
            }

            const values = [
                codemeli ?? null,
                hashpassword,
                firstname ?? null,
                lastname ?? null,
                mobile ?? null,
                address ?? null,
                gender ?? null,
                finalImageUrl,
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
        const query = 'SELECT password, role, firstname ,lastname, ensurance, image_url FROM user WHERE codemeli = ?';

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
                        ensurance: user.ensurance,
                        image_url: user.image_url
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