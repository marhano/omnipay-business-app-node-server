const { 
    run,
    get,
    all
} = require('../services/dbService');
const {
    productSchema,
    salesInfoSchema,
    inventoryInfoSchema,
    inventoryInfoArraySchema
} = require('../schema');

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

//@desc Insert product
//@route POST /api/product/createproduct
//@access public
const createProduct = async (req, res) => {
    const { value, error } = productSchema.validate(req.body.product);

    if (error) {
        return res.status(400).json({ 
            error: 'Invalid data', 
            details: productValue.error 
        });
    }

    try{
        const salesInfoResult = await run(
            `INSERT INTO tblSalesInfo (
                CostPerUnit, 
                SKU,
                Status) 
                VALUES (?, ?, ?)`,
            [
                value.salesInfo.unitPrice, 
                value.salesInfo.sku, 
                1, 
            ]
        );

        const productResult = await run(
            `INSERT INTO tblProducts (
                ProductName, 
                CategoryID, 
                SubCategoryID,
                UnitOfMeasureID,
                SalesInfoID,
                ProductDescription, 
                DateCreated, 
                TotalQuantity, 
                Tags, 
                ProductType,
                Status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                value.productName, 
                value.productCategory, 
                value.productSubCategory, 
                value.unitOfMeasure,
                salesInfoResult.id, 
                value.productDescription, 
                new Date().toISOString(), 
                value.totalQuantity, 
                value.productTags, 
                "Product",
                1,
            ]
        );
        
        value.inventoryInfos.forEach(async (element) => {
            const inventoryInfoResult = await run(
                `INSERT INTO tblInventoryInfo (
                    WarehouseID, 
                    Quantity, 
                    ProductID, 
                    Status) 
                    VALUES (?, ?, ?, ?)`,
                [
                    element.warehouse, 
                    element.quantity, 
                    productResult.id, 
                    1, 
                ]
            );
        });

        res.status(200).json(productResult);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

//@desc Insert product
//@route POST /api/product/createproduct
//@access public
const createInventoryInfo = async (req, res) => {
    const { error, value } = inventoryInfoSchema.validate(req.body);

    try{
        const result = await run(
            `INSERT INTO tblInventoryInfo (
                WarehouseID, 
                Quantity, 
                ProductID, 
                Status) 
                VALUES (?, ?, ?, ?)`,
            [
                value.warehouseID, 
                value.quantity, 
                value.unitOfMeasureID, 
                1, 
            ]
        );

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

const getUnitOfMeasures = async (req, res) => {
    try{
        const unitofmeasures = await all('SELECT * FROM tblUnitOfMeasure');
        
        res.status(200).json(unitofmeasures);
    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getProducts,
    getCategories,
    getUnitOfMeasures,
    createProduct
}