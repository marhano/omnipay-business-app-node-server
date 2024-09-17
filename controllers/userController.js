const bcrypt = require('bcrypt');
const { 
    run,
    get,
    all
} = require('../services/dbService');
const { generateToken } = require('../services/jwtService');
const { handleError, USER_ERRORS, SERVER_ERRORS } = require('../constants/errorConstants');


//@desc Get all user
//@route GET /api/user
//@access private
const getUsers = async (req, res) => {
    try {
        const users = await all('SELECT * FROM tblUser');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//@desc Login user
//@route POST /api/user/login
//@access public
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return handleError(res, 400, USER_ERRORS.MISSING_CREDENTIALS);
    }

    try{
        const row = await get('SELECT * FROM tblUser WHERE Username = ?', [username]);

        if(row){
            if (row.Inactive) {
                return handleError(res, 403, USER_ERRORS.ACCOUNT_INACTIVE);
            }

            const isPasswordValid = await bcrypt.compare(password, row.Password);

            if(isPasswordValid){
                req.session.user = { username };
                await run(
                    'UPDATE tblUser SET Attempt = ? WHERE Username = ?',
                    [0, username]
                );

                // Generate JWT token
                const token = generateToken({username, password});

                return res.json({ success: true, user: req.session.user, token: token });
            }else{
                let newAttempt = row.Attempt + 1;
                let inactive = newAttempt >= 5 ? 1 : 0;

                await run(
                    'UPDATE tblUser SET Attempt = ?, Inactive = ? WHERE Username = ?',
                    [newAttempt, inactive, username]
                );

                if (inactive) {
                    return handleError(res, 403, USER_ERRORS.ACCOUNT_LOCKED);
                }

                return handleError(res, 401, USER_ERRORS.INVALID_CREDENTIALS);
            }
        }else{
            return handleError(res, 401, USER_ERRORS.USER_NOT_FOUND);
        }
    }catch(error){
        return handleError(res, 500, SERVER_ERRORS.INTERNAL_SERVER_ERROR);
    }
    
}

//@desc Register user
//@route POST /api/user/register
//@access public
const registerUser = async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await run(
            'INSERT INTO tblUser (Username, Password, DateCreated, Inactive, FirstTime, Attempt) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, new Date().toISOString(), 0, 1, 0]
        );

        res.json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//@desc Logout user
//@route GET /api/user/logout
//@access private
const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
}

module.exports = { 
    getUsers,
    registerUser,
    loginUser,
    logoutUser
};