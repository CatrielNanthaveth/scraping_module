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
            const oldPrice = JSON.parse(recordAttributes['product.dtoDescuentos']?.[0] || '[]')[0]?.precioDescuento?.match(/\d+/g)?.join('.');

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
                old_price: Number(oldPrice),
                currency: 'ARS',
                image: imageUrl,
                url: 'https://www.cotodigital.com.ar/sitios/cdigi/productos' + data.detailsAction.recordState.split('?')[0]
            };
        } catch (err) {
            console.error("Error parsing individual Coto product", err);
            return null;
        }
    }

    private scrapeProductDetail(data: any, url: string): ProductDetail | null {

        try {

            const attributes = data.record.attributes || {};

            const rawPrice = attributes['sku.activePrice'] ? attributes['sku.activePrice'][0] : 0;
            const oldPrice = JSON.parse(attributes['product.dtoDescuentos']?.[0] || '[]')[0]?.precioDescuento?.match(/\d+/g)?.join('.');

            let imageUrl = attributes['product.mediumImage.url']
                ? attributes['product.mediumImage.url'][0]
                : null;

            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = "https://static.cotodigital3.com.ar/" + imageUrl;
            }

            const description = attributes['product.ldescr'][0];

            return new ProductDetail({
                id: attributes['product.repositoryId'][0],
                title: attributes['product.displayName'] ? attributes['product.displayName'][0] : 'Unknown Product',
                price: parseFloat(rawPrice),
                old_price: Number(oldPrice),
                currency: 'ARS',
                image: imageUrl,
                url: url,
                description: description,
                isAvailable: data["json-ld"].includes('InStock')
            });

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

        const url = idOrUrl + '?format=json';

        const response = await this.httpClient.get<any>(url);

        if (!response || !response.contents || !response.contents[0]) {
            console.warn(`Coto returned unexpected JSON structure.`);
            return null;
        }

        const product = this.scrapeProductDetail(response.contents[0].Main[0], idOrUrl);

        return product;
    }
}