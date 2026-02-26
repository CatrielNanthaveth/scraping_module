export class ProductDetail {

    public id: string;
    public title: string;
    public price: number;
    public old_price: number;
    public image: string;
    public currency: string;
    public url: string;
    public description: string;
    public brand: string | null;
    public isAvailable: boolean;


    constructor(data: {id: string, title: string, price: number, old_price: number | null, image: string, currency: string, url: string, description: string, isAvailable: boolean, brand?: string}) {
        this.id = data.id;
        this.title = data.title;
        this.price = data.price;
        this.old_price = data.old_price;
        this.image = data.image;
        this.currency = data.currency;
        this.url = data.url;
        this.description = data.description;
        this.brand = data.brand ?? null;
        this.isAvailable = data.isAvailable;
    }
}