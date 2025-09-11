import fetch from "node-fetch";

const SHOP = "customize-mala.myshopify.com";
const ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

async function createStorefrontToken() {
  const res = await fetch(
    `https://${SHOP}/admin/api/2025-01/storefront_access_tokens.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ADMIN_TOKEN,
      },
      body: JSON.stringify({
        storefront_access_token: { title: "mala-builder-token" },
      }),
    }
  );

  const data = await res.json();
  console.log(data);
}

createStorefrontToken();
