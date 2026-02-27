## Shalion Challenge – Coto Scraper

This project is a small TypeScript/Node.js scraper that integrates with **Coto Digital** (Argentinian supermarket) and exposes a simple, typed interface to:

- **Search products** by keyword
- **List products from a category** URL
- **Fetch detailed information** for a single product

The main implementation is in `CotoScraper`, which conforms to the generic `RetailerAdapter` interface so it can be reused or extended for other retailers.

---

### Tech stack

- **Runtime**: Node.js (ES modules)
- **Language**: TypeScript
- **HTTP client**: `axios`
- **Runner**: `tsx` for directly executing TypeScript

---

### Project structure

- **`src/index.ts`**: Entry point with a demo workflow using `CotoScraper`.
- **`src/scrapers/CotoScraper.ts`**: Coto-specific scraper implementation (search, category, product detail).
- **`src/utils/HttpClient.ts`**: Thin wrapper around `axios` with default headers and timeout.
- **`src/interfaces/RetailerAdapter.ts`**: Contract that any retailer scraper must implement.
- **`src/models/ProductListItem.ts`**: Lightweight product list item shape.
- **`src/models/ProductListPage.ts`**: Container for a list of products tied to a keyword or category.
- **`src/models/ProductDetail.ts`**: Rich product detail model (description, availability, etc.).

---

### Getting started

#### Prerequisites

- **Node.js** ≥ 18 (recommended 18+)
- **npm** (or another Node package manager)

#### Install dependencies

```bash
npm install
```

#### Run the example

The `start` script runs `src/index.ts`, which:

- Searches for `"arroz"` on Coto
- Logs the first 3 results
- Fetches products for a hardcoded category URL
- Logs the first 3 category results
- Fetches and prints details for the first product from the search

```bash
npm run start
```

You should see logs similar to:

- `Starting Coto Scraper...`
- `Searching for 'arroz'...`
- `Found X products!`
- JSON output with product list items and product details.

---

### Using `CotoScraper` in your own code

The scraper is exposed as the `CotoScraper` class. You can reuse it from your own script instead of `src/index.ts`.

```ts
import { CotoScraper } from "./src/scrapers/CotoScraper";

async function main() {
  const retailer = new CotoScraper();

  // Search products
  const searchResult = await retailer.searchProducts("arroz");
  console.log(searchResult.products);

  // Category products
  const categoryUrl =
    "https://www.cotodigital.com.ar/sitios/cdigi/productos/categorias/catalogo-bebidas-bebidas-con-alcohol-cerveza/catv00001527";
  const categoryResult = await retailer.getCategoryProducts(categoryUrl);
  console.log(categoryResult.products);

  // Product details
  if (searchResult.products.length > 0) {
    const productUrl = searchResult.products[0].url;
    const details = await retailer.getProductDetails(productUrl);
    console.log(details);
  }
}

main().catch((err) => {
  console.error("Error running scraper:", err);
});
```

All three methods are defined by the `RetailerAdapter` interface:

- **`searchProducts(keyword: string): Promise<ProductListPage>`**
- **`getCategoryProducts(categoryUrl: string): Promise<ProductListPage>`**
- **`getProductDetails(idOrUrl: string): Promise<ProductDetail>`**

---

### Implementation details

- **HTTP layer**: `HttpClient` sets:
  - Base URL `https://www.cotodigital.com.ar`
  - A realistic `User-Agent`
  - Sensible timeout and accept headers
- **Parsing**:
  - `scrapeProductSearch` parses search API records into `ProductListItem`.
  - `scrapeProductCategory` parses category API results into `ProductListItem`.
  - `scrapeProductDetail` parses a product detail response into `ProductDetail`, including availability (`isAvailable`) and description.
- **Error handling**:
  - Logs warnings when the remote JSON structure is unexpected.
  - Catches parsing errors per-product and continues with valid items when possible.

---

### Extending to other retailers

The `RetailerAdapter` interface (`src/interfaces/RetailerAdapter.ts`) defines the contract for any retailer integration. To support a new retailer:

1. **Create a new scraper class** (for example, `AnotherRetailerScraper`) that implements `RetailerAdapter`.
2. **Use `HttpClient`** or your own client to hit the retailer’s APIs or HTML pages.
3. **Map the remote data** into `ProductListItem`, `ProductListPage`, and `ProductDetail`.

This keeps calling code independent of each retailer’s specific API or HTML layout.

---

### Notes and limitations

- No persistence or database is included; results are simply logged to stdout. You can adapt the code to store data wherever you need.

---

