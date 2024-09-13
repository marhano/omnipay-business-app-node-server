//@desc Get all product
//@route GET /api/products
//@access public
const getSession = (req, res) => {
    if(req.session.user){
        res.json({ session: true, message: `Active session: ${req.session.user.username}` });
    }else{
        res.json({ session: false, message: 'No active session' });
    }
}

module.exports = {
    getSession
}