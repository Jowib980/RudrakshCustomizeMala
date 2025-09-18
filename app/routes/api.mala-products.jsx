// app/routes/api/mala-products.jsx
import { json } from "@remix-run/node";


export const loader = async () => {
  const query = `
    query {
      beads: products(first: 250, query: "tag:beads") {
        edges {
          node {
            id
            title
            tags
            description
            images(first: 1) { edges { node { url altText } } }
            variants(first: 50) { edges { node { id title price { amount currencyCode } } } }
          }
        }
      }
      accessories: products(first: 250, query: "tag:accessories") {
        edges {
          node {
            id
            title
            tags
            description
            images(first: 1) { edges { node { url altText } } }
            variants(first: 50) { edges { node { id title price { amount currencyCode } } } }
          }
        }
      }
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
      yantras: collectionByHandle(handle: "vedic-yantras") {
        id
        title
        description
        products(first: 250) {
          edges {
            node {
              id
              title
              tags
              description
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
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
  console.log(data);
  return json(data);
};
