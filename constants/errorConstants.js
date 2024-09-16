const USER_ERRORS = {
    MISSING_CREDENTIALS: {
      code: 1000,
      title: 'Missing Credentials',
      message: 'Username and password are required'
    },
    ACCOUNT_INACTIVE: {
      code: 1001,
      title: 'Account Inactive',
      message: 'Account is inactive'
    },
    ACCOUNT_LOCKED: {
      code: 1002,
      title: 'Account Locked',
      message: 'Account has been locked after multiple failed login attempts'
    },
    INVALID_CREDENTIALS: {
      code: 1003,
      title: 'Invalid Credentials',
      message: 'Invalid username or password'
    },
    USER_NOT_FOUND: {
      code: 1004,
      title: 'User Not Found',
      message: 'User not found'
    }
};
  
const SERVER_ERRORS = {
    INTERNAL_SERVER_ERROR: {
      code: 1500,
      title: 'Internal Server Error',
      message: 'An internal server error occurred'
    }
};

const handleError = (res, statusCode, error) => {
    return res.status(statusCode).json({
        title: error.title,
        message: error.message,
        status: error.code
    });
};
  
module.exports = {
    USER_ERRORS,
    SERVER_ERRORS,
    handleError
};