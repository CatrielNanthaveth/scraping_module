import type { ProductListItem } from "./ProductListItem.js";

export class ProductListPage {
    public keyword: string;
    public products: ProductListItem[];

    constructor(keyword: string, products: ProductListItem[]) {
        this.keyword = keyword;
        this.products = products;
    }
}