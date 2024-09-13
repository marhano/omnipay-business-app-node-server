const { 
    run,
    get,
    all
} = require('../services/dbService');

//@desc Get all warehouse
//@route GET /api/warehouse
//@access public
const getWarehouse = async (req, res) => {
    try{
        const result = await all('SELECT * FROM tblWarehouse');
        res.status(200).json(result);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getWarehouse,
}