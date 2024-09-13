const { 
    run,
    get,
    all
} = require('../services/dbService');

//@desc Get all product
//@route GET /api/product
//@access public
const getProducts = async (req, res) => {
    try{
        const result = await all('SELECT * FROM tblProducts');
        res.status(200).json(result);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

//@desc Get all category
//@route GET /api/product/categories
//@access public
const getCategories = async (req, res) => {
    try{
        const categories = await all('SELECT * FROM tblCategory');
        
        const subcategories = await all('SELECT * FROM tblSubCategory');
        
        const result = categories.map(category => {
            const subCategoryList = subcategories.filter(subCat => subCat.CategoryID === category.CategoryID);
            return {
                ...category,
                SubCategories: subCategoryList
            };
        });

        res.status(200).json(result);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getProducts,
    getCategories
}