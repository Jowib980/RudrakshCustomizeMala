import fetch from "node-fetch";



const SHOPIFY_API = `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2025-07/script_tags.json`;

const createScriptTag = async () => {
  const body = {
    script_tag: {
      event: "onload",
      src: "https://customize-mala.cardiacambulance.com/floatingButton?shop=rudrasamrat.myshopify.com",
    },
  };

  const res = await fetch(SHOPIFY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("Script tag created:", data);
  return data;
};

// Call this function once on app install
createScriptTag();
