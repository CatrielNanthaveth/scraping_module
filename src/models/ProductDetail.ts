export class ProductDetail {

    public title: string;
    public price: number;
    public image: string;
    public currency: string;
    public url: string;
    public description: string;
    public brand: string | null;
    public isAvailable: boolean;


    constructor(data: {title: string, price: number, image: string, url: string, description: string, isAvailable: boolean, brand?: string}) {
        this.title = data.title;
        this.price = data.price;
        this.image = data.image;
        this.url = data.url;
        this.description = data.description;
        this.brand = data.brand ?? null;
        this.isAvailable = data.isAvailable;
    }
}