export interface ProductListItem {
    id: string;
    title: string;
    price: number;
    old_price: number | null;
    image: string;
    url: string;    
    currency: string;
}