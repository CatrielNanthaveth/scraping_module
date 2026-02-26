import type { RetailerAdapter } from "../interfaces/RetailerAdapter.ts";
import { ProductListPage } from "../models/ProductListPage.ts";
import { ProductDetail } from "../models/ProductDetail.ts";
import { HttpClient } from "../utils/HttpClient.ts";
import type { ProductListItem } from "../models/ProductListItem.ts";

export class CotoScraper implements RetailerAdapter {

    private httpClient: HttpClient;

    constructor() {
        this.httpClient = new HttpClient("https://www.cotodigital.com.ar");
    }

    private scrapeProduct(data: any): ProductListItem | null {
        
        try {
    
            const attributes = data.attributes || {};
            const firstRecord = data.records && data.records[0] ? data.records[0] : {};
            const recordAttributes = firstRecord.attributes || {};
    
            const rawPrice = recordAttributes['sku.activePrice'] ? recordAttributes['sku.activePrice'][0] : 0;
            
            let imageUrl = recordAttributes['product.mediumImage.url'] 
                ? recordAttributes['product.mediumImage.url'][0] 
                : null;
    
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = "https://static.cotodigital3.com.ar/" + imageUrl;
            }
    
            return {
                id: data.attributes['product.repositoryId'][0],
                title: attributes['product.displayName'] ? attributes['product.displayName'][0] : 'Unknown Product',
                price: parseFloat(rawPrice),
                currency: 'ARS',
                image: imageUrl,
                url: 'https://www.cotodigital.com.ar/sitios/cdigi/productos' + data.detailsAction.recordState
            };
        } catch (err) {
            console.error("Error parsing individual Coto product", err);
            return null;
        }
    }

    private scrapeProductDetail(data: any): ProductListItem | null {
        
        try {
    
            const attributes = data.attributes || {};
            const firstRecord = data.records && data.records[0] ? data.records[0] : {};
            const recordAttributes = firstRecord.attributes || {};
    
            const rawPrice = recordAttributes['sku.activePrice'] ? recordAttributes['sku.activePrice'][0] : 0;
            
            let imageUrl = recordAttributes['product.mediumImage.url'] 
                ? recordAttributes['product.mediumImage.url'][0] 
                : null;
    
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = "https://static.cotodigital3.com.ar/" + imageUrl;
            }
    
            return {
                id: data.attributes['product.repositoryId'][0],
                title: attributes['product.displayName'] ? attributes['product.displayName'][0] : 'Unknown Product',
                price: parseFloat(rawPrice),
                currency: 'ARS',
                image: imageUrl,
                url: 'https://www.cotodigital.com.ar/sitios/cdigi/productos' + data.detailsAction.recordState
            };
        } catch (err) {
            console.error("Error parsing individual Coto product", err);
            return null;
        }
    }


    public async searchProducts(keyword: string): Promise<ProductListPage> {
        try {
            const url = `https://www.cotodigital.com.ar/sitios/cdigi/categoria?_dyncharset=utf-8&Dy=1&Ntt=${keyword}&idSucursal=200&format=json`
    
            const response = await this.httpClient.get<any>(url);
    
            if (!response || !response.contents || !response.contents[0]) {
                console.warn(`Coto returned unexpected JSON structure for keyword ${keyword}.`);
                return new ProductListPage(keyword, []);
            }
    
            const mainContent = response.contents[0].Main.find((e: any) => e["@type"] == "Main_Slot");
    
            if (!mainContent || !mainContent.contents[0]) {
                console.log(`No results found on Coto for keyword ${keyword}.`);
                return new ProductListPage(keyword, []);
            }
    
            const products = mainContent.contents[0].records;

            const items: ProductListItem[] = products.map((product: any) => {
                return this.scrapeProduct(product); 
            }).filter((item: ProductListItem | null): item is ProductListItem => item !== null);
    
            return new ProductListPage(keyword, items);
        } catch (error) {
            console.error(`Failed to search products for keyword ${keyword}:`, error);
            throw error;
        }
    
    }

    public async getCategoryProducts(categoryUrl: string): Promise<ProductListPage> {
        // Implementation here
        return new ProductListPage(categoryUrl, []);
    }

    public async getProductDetails(idOrUrl: string): Promise<ProductDetail> {
        // Implementation here
        return new ProductDetail({
            title: "Product Title",
            price: 100,
            image: "https://example.com/image.jpg",
            url: "https://example.com/product",
            description: "Product Description",
            isAvailable: true,
        });
    }
}