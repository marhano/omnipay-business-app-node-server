const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const saltRounds = 10; // Number of salt rounds

// Connect to the SQLite database
const db = new sqlite3.Database('./db/obdb.sqlite');

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.post('/loginUser', (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM tblUser WHERE Username = ?', [username], (err, row) => {
        if(err){
            return res.status(500).json({ error: err.message });
        }

        if(row){
            // Check if the user is inactive
            if (row.Inactive) {
                return res.status(403).json({ error: 'Account is inactive' });
            }

            bcrypt.compare(password, row.Password, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (result) {
                    res.json({ success: true, user: row });
                } else {
                    let newAttempt = row.Attempt + 1;

                    let inactive = newAttempt >= 5 ? 1 : 0;

                    db.run(
                        'UPDATE tblUser SET Attempt = ?, Inactive = ? WHERE Username = ?',
                        [newAttempt, inactive, username],
                        function (err) {
                          if (err) {
                            return res.status(500).json({ error: err.message });
                          }
            
                          res.status(401).json({ error: 'Invalid username or password' });
                        }
                    );
                }
            });
        }else{
            res.status(401).json({ success: false, error: 'Invalid username or password' });
        }
    });
});

app.post('/registerUser', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
  
    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
  
      // Insert the new user with the hashed password
      db.run(
        'INSERT INTO tblUser (Username, Password, DateCreated, Inactive, FirstTime, Attempt) VALUES (?, ?, ?, ?, ?, ?)',
        [username, hashedPassword, new Date().toISOString(), 0, 1, 0],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: 'User registered successfully' });
        }
      );
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});