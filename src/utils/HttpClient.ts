import axios, { type AxiosInstance, type AxiosRequestConfig} from "axios";

export class HttpClient {

    private client: AxiosInstance;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            timeout: 20000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "text/html,application/json,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9,es;q=0.8"
            }
        });
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const response = await this.client.get<T>(url, config);
            return response.data;
        } catch (error) {
            console.error(`[HttpClient] Failed to GET ${url}:`, error);
            throw error;
        }
    }
}