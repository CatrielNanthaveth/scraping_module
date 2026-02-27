import { CotoScraper } from "./scrapers/CotoScraper.ts";

async function run() {
    console.log("Starting Coto Scraper...");
    const retailer = new CotoScraper();
    
    try {
        console.log("Searching for 'arroz'...");
        const productList = await retailer.searchProducts("arroz");
        
        console.log(`\nFound ${productList.products.length} products!`);
        console.log("--- FIRST 3 PRODUCTS ---");
        console.log(JSON.stringify(productList.products.slice(0, 3))); 

        const categoryUrl = 'https://www.cotodigital.com.ar/sitios/cdigi/productos/categorias/catalogo-bebidas-bebidas-con-alcohol-cerveza/catv00001527'
        
        console.log(`Searching for '${categoryUrl}'...`);
        const productCategoryList = await retailer.getCategoryProducts(categoryUrl);

        console.log(`\nFound ${productCategoryList.products.length} products!`);
        console.log("--- FIRST 3 PRODUCTS ---");
        console.log(JSON.stringify(productCategoryList.products.slice(0, 3))); 
        

        if (productList.products.length > 0) {
            console.log("\nFetching details for the first product...");
            const firstProductUrl = productList.products[0]?.url;
            if (!firstProductUrl) {
                console.error("No product URL found");
                return;
            }
            
            const productDetail = await retailer.getProductDetails(firstProductUrl);
            console.log("--- PRODUCT DETAILS ---");
            console.log(JSON.stringify(productDetail));
        }

    } catch (error) {
        console.error("Scraping failed:", error);
    }
}

run();