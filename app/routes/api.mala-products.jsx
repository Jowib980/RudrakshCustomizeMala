// app/routes/api/mala-products.jsx
import { json } from "@remix-run/node";

const SHOPIFY_DOMAIN = "customize-mala.myshopify.com";
const STOREFRONT_ACCESS_TOKEN = "79b3b24d80031c9e6e17f53fdd81eb4a";

export const loader = async () => {
  const query = `
    query {
      beads: products(first: 20, query: "tag:beads") {
        edges {
          node {
            id
            title
            tags
            description
            images(first: 1) { edges { node { url altText } } }
            variants(first: 10) { edges { node { id title price { amount currencyCode } } } }
          }
        }
      }
      accessories: products(first: 20, query: "tag:accessories") {
        edges {
          node {
            id
            title
            tags
            description
            images(first: 1) { edges { node { url altText } } }
            variants(first: 10) { edges { node { id title price { amount currencyCode } } } }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2025-07/graphql.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = await response.json();
  return json(data);
};
