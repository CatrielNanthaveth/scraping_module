import type { ProductDetail } from "../models/ProductDetail.ts";
import type { ProductListPage } from "../models/ProductListPage.ts";

export interface RetailerAdapter {
    searchProducts(keyword: string): Promise<ProductListPage>;
    getCategoryProducts(categoryUrl: string): Promise<ProductListPage>;
    getProductDetails(idOrUrl: string): Promise<ProductDetail>;
}