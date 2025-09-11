import 'dotenv/config';
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import { fileURLToPath } from "url";
import path from "path";

import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-07";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";
import cors from "cors";


const allowedOrigins = [
  "https://customize-mala.myshopify.com",
  "https://customize-mala.cardiacambulance.com"
];

const prisma = new PrismaClient();

const sessionStorage = new PrismaSessionStorage(prisma, {
  tableName: "Session",
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();


// --- Shopify App Config ---
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || '',   // full URL with https://
  hostName: process.env.HOST || '',
  restResources,
  sessionStorage,
  authPathPrefix: "/auth",
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      // Allow non-browser requests or Postman etc.
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: This origin is not allowed."));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.options("*", cors());

app.use(
  "/assets",
  cors(),
  express.static(path.join(process.cwd(), "build/client/assets"), {
    immutable: true,
    maxAge: "1y",
  })
);

app.use('/apps/customize-mala', (req, res, next) => {
  req.url = req.url.replace(/^\/apps\/customize-mala/, '/mala-builder');
  next();
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Example proxy route for draft order ---
app.post("/proxy", async (req, res) => {
      try {
        const body = req.body;
        console.log("âœ… /proxy endpoint hit!", body);
    
        const line_items = [
          {
            title: "Custom Mala",
            quantity: body.quantity || 1,
            price: body.totalPrice?.toFixed(2) || "10.00",
            properties: [
              { name: "Design", value: body.selections?.Design || "" },
              { name: "Beads", value: body.selections?.Beads || "" },
              { name: "Thread", value: body.selections?.Thread || "" },
              { name: "Chain", value: body.selections?.Chain || "" },
              { name: "Cap", value: body.selections?.Cap || "" },
            ],
          },
        ];
    
        const draftOrderPayload = {
          draft_order: { line_items, use_customer_default_address: true },
        };
    
        const shopifyRes = await fetch(
          `https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2025-07/draft_orders.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
            },
            body: JSON.stringify(draftOrderPayload),
          }
        );
    
        const data = await shopifyRes.json();
        console.log("ðŸ”Ž Shopify draft order response:", data);
    
        return res.json({ checkoutUrl: data.draft_order?.invoice_url || null });
      } catch (err) {
        console.error("ðŸ”¥ /proxy action error:", err);
        return res.status(500).json({ error: err.message });
      }
});

// --- Remix handles everything else ---
app.all("*", async (req, res, next) => {
  return createRequestHandler({
    build: await import("./build/server/index.js"),
    mode: process.env.NODE_ENV,
  })(req, res, next);
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`âœ… Server running on port ${port}`);
});

export default shopify;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const sessionStorageExport = shopify.sessionStorage;