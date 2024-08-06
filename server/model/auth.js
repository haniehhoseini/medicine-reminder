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

    async exitRegisterPatient(items) {
        const { codemeli } = items;
        const query = 'SELECT * FROM user WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerPatient(items) {
        if (await this.exitRegisterPatient(items)) {
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
                ensurance ?? null,
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

    async exitRegisterDoctor(items) {
        const { codemeli } = items;
        const query = 'SELECT * FROM doctor WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerDoctor(items){
        if (await this.exitRegisterDoctor(items)) {
        const { 
            codemeli, 
            password, 
            firstname, 
            lastname, 
            address,
            city,
            hospital, 
            gender, 
            image_url, 
            birthday, 
            expertise,
            code,
            role
        } = items;

        const query = `INSERT INTO doctor (
            codemeli, 
            password, 
            firstname, 
            lastname, 
            address,
            city,
            hospital, 
            gender, 
            image_url, 
            birthday, 
            expertise,
            code,
            role ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const hashpassword = await bcrypt.hash(password, 10);
            const formattedBirthday = this.formatDate(birthday);

    
            let finalImageUrl = image_url;
            if (!finalImageUrl) {
                finalImageUrl = 'https://icones.pro/wp-content/uploads/2021/03/symbole-du-docteur-icone-png-vert.png';
            }

            const values = [
                codemeli ?? null, 
                hashpassword, 
                firstname ?? null, 
                lastname ?? null, 
                address ?? null,
                city ?? null,
                hospital ?? null, 
                gender ?? null, 
                finalImageUrl, 
                formattedBirthday, 
                expertise ?? null,
                code ?? null,
                role ?? Roles.DOCTOR
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

    async exitRegisterCompany(items){
        const { codemeli } = items;
        const query = 'SELECT * FROM company WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerCompany(items){
        if (await this.exitRegisterCompany(items)) {
            const { 
                codemeli, 
                password, 
                firstname, 
                lastname,
                license_code, 
                mobile,
                role,
                image_url
            } = items;
    
            const query = `INSERT INTO company (
                codemeli, 
                password, 
                firstname,
                lastname, 
                license_code, 
                mobile,
                role,
                image_url ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
                const hashpassword = await bcrypt.hash(password, 10);
    
        
                let finalImageUrl = image_url;
                if (!finalImageUrl) {
                    finalImageUrl = 'https://i.pngimg.me/thumb/f/720/m2i8A0K9A0b1G6H7.jpg';
                }
    
                const values = [
                    codemeli ?? null, 
                    hashpassword, 
                    firstname ?? null, 
                    lastname ?? null,
                    license_code ?? null, 
                    mobile ?? null,
                    role ?? Roles.PHARMACIST,
                    finalImageUrl
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

    async exitRegisterRelatives(items){
        const { codemeli } = items;
        const query = 'SELECT * FROM relatives WHERE codemeli = ?';
        const [rows] = await db.connection.execute(query, [codemeli]);
        return rows.length === 0;
    }

    async registerRelatives(items){
        if (await this.exitRegisterRelatives(items)) {
            const { 
                codemeli, 
                password, 
                firstname, 
                lastname, 
                mobile,
                user_id, 
                image_url, 
                role
            } = items;
            const query = `INSERT INTO relatives (
                codemeli, 
                password, 
                firstname, 
                lastname, 
                mobile,
                user_id, 
                image_url, 
                role ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                const hashpassword = await bcrypt.hash(password, 10);
    
        
                let finalImageUrl = image_url;
                if (!finalImageUrl) {
                    finalImageUrl = 'https://cdn-icons-png.flaticon.com/512/11263/11263421.png';
                }
    
                const values = [
                    codemeli ?? null, 
                    hashpassword, 
                    firstname ?? null, 
                    lastname ?? null, 
                    mobile ?? null,
                    user_id ?? null, 
                    finalImageUrl, 
                    role ?? Roles.RELATIVES
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
        const { codemeli, password, role } = items;
        
        console.log(items);
        let tableName;
        switch (role) {
            case 'doctor':
                tableName = 'doctor';
                break;
            case 'pharmacist':
                tableName = 'company';
                break;
            case 'relatives':
                tableName = 'relatives';
                break;
            case 'patient':
                tableName = 'user';
                break;
            default:
                throw new Error('Unknown role');
        }
        const query = `SELECT password, role, firstname ,lastname, image_url FROM ${tableName} WHERE codemeli = ?`;

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
            
            
            let tableName;
            switch (decoded.role) {
                case 'doctor':
                    tableName = 'doctor';
                    break;
                case 'pharmacist':
                    tableName = 'company';
                    break;
                case 'relatives':
                    tableName = 'relatives';
                    break;
                case 'patient':
                    tableName = 'user';
                    break;
                default:
                    throw new Error('Unknown role');
            }
    
            const query = `SELECT * FROM ${tableName} WHERE codemeli = ?`;
            const [rows] = await db.connection.execute(query, [decoded.codemeli]);
    
            if (rows.length === 0) {
                return { error: 'User not found' };
            }
    
            const user = rows[0];
            return user;
        } catch (error) {
            console.error('Error verifying token or executing query:', error);
            
            if (error.name === 'TokenExpiredError') {
                return { error: 'Token has expired' };
            } else if (error.name === 'JsonWebTokenError') {
                return { error: 'Invalid token' };
            } else {
                return { error: 'Internal server error' };
            }
        }
    }
    
}
module.exports = new Auth();