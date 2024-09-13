const bcrypt = require('bcrypt');
const { 
    run,
    get,
    all
} = require('../services/dbService');


//@desc Get all user
//@route GET /api/user
//@access public
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
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try{
        const row = await get('SELECT * FROM tblUser WHERE Username = ?', [username]);

        if(row){
            if (row.Inactive) {
                return res.status(403).json({ error: 'Account is inactive' });
            }

            const isPasswordValid = await bcrypt.compare(password, row.Password);

            if(isPasswordValid){
                req.session.user = { username };

                return res.json({ success: true, user: req.session.user });
            }else{
                let newAttempt = row.Attempt + 1;
                let inactive = newAttempt >= 5 ? 1 : 0;

                await runQuery(
                    'UPDATE tblUser SET Attempt = ?, Inactive = ? WHERE Username = ?',
                    [newAttempt, inactive, username]
                );

                return res.status(401).json({ error: 'Invalid username or password' });
            }
        }else{
            res.status(401).json({ success: false, error: 'Invalid username or password' });
        }
    }catch(error){
        res.status(500).json({ error: err.message });
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
//@access public
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