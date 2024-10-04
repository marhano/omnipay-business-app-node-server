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
    const type = req.params.type;

    try {
        // Execute SQL query
        const result = await all(`SELECT
            a.ProductID,
            a.ProductRefID,
            a.ProductName,
            a.CategoryID,
            b.CategoryDescription AS CategoryName,
            a.SubCategoryID,
            c.SubCategoryDescription AS SubCategoryName,
            a.ProductDescription,
            a.DateCreated,
            a.DateModified,
            SUM(f.Quantity) OVER (PARTITION BY a.ProductID) AS TotalQuantity,
            a.Tags,
            a.ProductType,
            a.UnitOfMeasureID,
            d.Description AS UnitOfMeasure,
            a.Status,
            COALESCE(e.SalesInfoID, h.SalesInfoID) AS SalesInfoID,
            COALESCE(e.CostPerUnit, h.CostPerUnit) AS UnitPrice,
            COALESCE(e.RetailPrice, h.RetailPrice) AS RetailPrice,
            COALESCE(e.SKU, h.SKU) AS SKU,
            COALESCE(e.Status, f.Status) AS SalesInfoStatus,
            f.InventoryID,
            f.WarehouseID,
            g.Description AS Warehouse,
            f.Quantity,
            f.Status AS InventoryStatus,
            f.Hold,
            f.Deleted
        FROM tblProducts a
        LEFT JOIN tblCategory b ON a.CategoryID = b.CategoryID
        LEFT JOIN tblSubCategory c ON a.SubCategoryID = c.SubCategoryID
        LEFT JOIN tblUnitOfMeasure d ON a.UnitOfMeasureID = d.UnitOfMeasureID
        LEFT JOIN tblSalesInfo e ON a.SalesInfoID = e.SalesInfoID
        LEFT JOIN tblInventoryInfo f ON a.ProductID = f.ProductID
        LEFT JOIN tblWarehouse g ON f.WarehouseID = g.WarehouseID
        LEFT JOIN tblSalesInfo h ON a.ProductID = h.ProductID AND e.SalesInfoID IS NULL
        WHERE a.ProductType = "${type}"`);

        // Process the result to match the Product model
        const products = result.reduce((acc, row) => {
            // Find or create the product entry
            let product = acc.find(p => p.productID === row.ProductID);
            if (!product) {
                product = {
                    productID: row.ProductID,
                    productRefID: row.ProductRefID,
                    productName: row.ProductName,
                    categoryID: row.CategoryID,
                    categoryName: row.CategoryName,
                    subCategoryID: row.SubCategoryID,
                    subCategoryName: row.SubCategoryName,
                    productDescription: row.ProductDescription,
                    dateCreated: row.DateCreated,
                    dateModified: row.DateModified,
                    totalQuantity: row.TotalQuantity,
                    tags: row.Tags,
                    productType: row.ProductType,
                    unitOfMeasureID: row.UnitOfMeasureID,
                    unitOfMeasure: row.UnitOfMeasure,
                    status: row.Status,
                    salesInfo: null,
                    inventoryInfos: []
                };
                acc.push(product);
            }

            // Assign sales info
            if (row.SalesInfoID) {
                product.salesInfo = {
                    salesInfoID: row.SalesInfoID,
                    unitPrice: row.UnitPrice,
                    retailPrice: row.RetailPrice,
                    sku: row.SKU,
                    status: row.SalesInfoStatus
                };
            }

            // Add inventory info
            if (row.InventoryID) {
                product.inventoryInfos.push({
                    inventoryID: row.InventoryID,
                    warehouseID: row.WarehouseID,
                    warehouse: row.Warehouse,
                    quantity: row.Quantity,
                    status: row.InventoryStatus,
                    hold: row.Hold,
                    deleted: row.Deleted
                });
            }

            return acc;
        }, []);

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//@desc Get product
//@route GET /api/product:id
//@access public
const getProduct = async (req, res) => {
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }

    try {
        // Execute SQL query
        const result = await all(`SELECT
            a.ProductID,
            a.ProductRefID,
            a.ProductName,
            a.CategoryID,
            b.CategoryDescription AS CategoryName,
            a.SubCategoryID,
            c.SubCategoryDescription AS SubCategoryName,
            a.ProductDescription,
            a.DateCreated,
            a.DateModified,
            SUM(f.Quantity) OVER (PARTITION BY a.ProductID) AS TotalQuantity,
            a.Tags,
            a.ProductType,
            a.UnitOfMeasureID,
            d.Description AS UnitOfMeasure,
            a.Status,
            COALESCE(e.SalesInfoID, h.SalesInfoID) AS SalesInfoID,
            COALESCE(e.CostPerUnit, h.CostPerUnit) AS UnitPrice,
            COALESCE(e.RetailPrice, h.RetailPrice) AS RetailPrice,
            COALESCE(e.SKU, h.SKU) AS SKU,
            COALESCE(e.Status, f.Status) AS SalesInfoStatus,
            f.InventoryID,
            f.WarehouseID,
            g.Description AS Warehouse,
            f.Quantity,
            f.Status AS InventoryStatus,
            f.Hold,
            f.Deleted
        FROM tblProducts a
        LEFT JOIN tblCategory b ON a.CategoryID = b.CategoryID
        LEFT JOIN tblSubCategory c ON a.SubCategoryID = c.SubCategoryID
        LEFT JOIN tblUnitOfMeasure d ON a.UnitOfMeasureID = d.UnitOfMeasureID
        LEFT JOIN tblSalesInfo e ON a.SalesInfoID = e.SalesInfoID
        LEFT JOIN tblInventoryInfo f ON a.ProductID = f.ProductID
        LEFT JOIN tblWarehouse g ON f.WarehouseID = g.WarehouseID
        LEFT JOIN tblSalesInfo h ON a.ProductID = h.ProductID AND e.SalesInfoID IS NULL
        WHERE a.ProductID = ?`, [productId]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Process the result to match the Product model
        const products = result.reduce((acc, row) => {
            // Find or create the product entry
            let product = acc.find(p => p.productID === row.ProductID);
            if (!product) {
                product = {
                    productID: row.ProductID,
                    productRefID: row.ProductRefID,
                    productName: row.ProductName,
                    categoryID: row.CategoryID,
                    categoryName: row.CategoryName,
                    subCategoryID: row.SubCategoryID,
                    subCategoryName: row.SubCategoryName,
                    productDescription: row.ProductDescription,
                    dateCreated: row.DateCreated,
                    dateModified: row.DateModified,
                    totalQuantity: row.TotalQuantity,
                    tags: row.Tags,
                    productType: row.ProductType,
                    unitOfMeasureID: row.UnitOfMeasureID,
                    unitOfMeasure: row.UnitOfMeasure,
                    status: row.Status,
                    salesInfo: null,
                    inventoryInfos: []
                };
                acc.push(product);
            }

            // Assign sales info
            if (row.SalesInfoID) {
                product.salesInfo = {
                    salesInfoID: row.SalesInfoID,
                    unitPrice: row.UnitPrice,
                    retailPrice: row.RetailPrice,
                    sku: row.SKU,
                    status: row.SalesInfoStatus
                };
            }

            // Add inventory info
            if (row.InventoryID) {
                product.inventoryInfos.push({
                    inventoryID: row.InventoryID,
                    warehouseID: row.WarehouseID,
                    warehouse: row.Warehouse,
                    quantity: row.Quantity,
                    status: row.InventoryStatus,
                    hold: row.Hold,
                    deleted: row.Deleted
                });
            }

            return acc;
        }, []);

        res.status(200).json(products[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


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
    getProduct,
    getCategories,
    getUnitOfMeasures,
    createProduct
}