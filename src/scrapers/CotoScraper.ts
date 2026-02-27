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

    private scrapeProductSearch(data: any): ProductListItem | null {

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

    private scrapeProductCategory(data: any): ProductListItem | null {

        try {

            const rawPrice = Number(data.discounts?.[0]?.discountPrice?.match(/\d+/g)?.join('.') || '0');
            const listPrice = data.price.find(p => p.store == '200')?.listPrice;

            let imageUrl = data.product_large_image_url;

            const slug = data.sku_description.toLowerCase().replaceAll(' ', '-');

            const url = `https://www.cotodigital.com.ar/sitios/cdigi/productos/${slug}/${data.url}`

            return {
                id: data.id,
                title: data.sku_display_name || 'Unknown Product',
                price: rawPrice < listPrice ? rawPrice : listPrice,
                old_price: rawPrice < listPrice ? listPrice : null,
                currency: 'ARS',
                image: imageUrl,
                url
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
                return this.scrapeProductSearch(product);
            }).filter((item: ProductListItem | null): item is ProductListItem => item !== null);

            return new ProductListPage(keyword, items);
        } catch (error) {
            console.error(`Failed to search products for keyword ${keyword}:`, error);
            throw error;
        }

    }

    public async getCategoryProducts(categoryUrl: string): Promise<ProductListPage> {

        const categoryId = categoryUrl.split('?')[0].split('/').at(-1);

        const url = `https://api.coto.com.ar/api/v1/ms-digital-sitio-bff-web/api/v1/products/categories/${categoryId}?key=key_r6xzz4IAoTWcipni&num_results_per_page=24&pre_filter_expression=%7B%22name%22:%22store_availability%22,%22value%22:%22200%22%7D`
        const response = await this.httpClient.get<any>(url);

        if (!response.response || !response.response.results || !response.response.results[0]) {
            console.warn(`Coto returned unexpected JSON structure for url ${categoryUrl}.`);
            return new ProductListPage(categoryUrl, []);
        }

        const products = response.response.results.map(e => e.data);

        if (!products.length) {
            console.log(`No results found on Coto for url ${categoryUrl}.`);
            return new ProductListPage(categoryUrl, []);
        }

        const items: ProductListItem[] = products.map((product: any) => {
            return this.scrapeProductCategory(product);
        }).filter((item: ProductListItem | null): item is ProductListItem => item !== null);

        return new ProductListPage(categoryUrl, items);
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