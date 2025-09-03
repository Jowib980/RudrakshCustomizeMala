// app/routes/proxy.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { appSettings } from "../data/settings";

// Shopify info
const SHOPIFY_DOMAIN = "customize-mala.myshopify.com";
const STOREFRONT_ACCESS_TOKEN = "79b3b24d80031c9e6e17f53fdd81eb4a"; // set in .env

export const loader = async () => {
  const query = `
    query {
      beads: products(first: 20, query: "tag:beads") {
        edges {
          node {
            id
            title
            description
            images(first: 1) {
              edges { node { url altText } }
            }
            variants(first: 1) {
              edges { node { price { amount currencyCode } } }
            }
          }
        }
      }
      accessories: products(first: 20, query: "tag:accessories") {
        edges {
          node {
            id
            title
            description
            images(first: 1) {
              edges { node { url altText } }
            }
            variants(first: 1) {
              edges { node { price { amount currencyCode } } }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2025-07/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    if (data.errors) throw new Error(JSON.stringify(data.errors));

    return json(data);
  } catch (err) {
    console.error("Loader fetch error:", err);
    return json({ error: err.message }, { status: 500 });
  }
};

export default function Proxy() {
  const data = useLoaderData();
  if (data.error) return <div>Error: {data.error}</div>;

  const beads = data.data.beads.edges;
  const accessories = data.data.accessories.edges;

  const designs = [
    { id: "design1", name: "Classic Rudraksh", img: "/images/design1.jpg" },
    { id: "design2", name: "Premium Rudraksh", img: "/images/design2.jpg" },
    { id: "design3", name: "Luxury Rudraksh", img: "/images/design3.jpg" },
  ];

  // Thread / Chain / Cap options per design
  const designOptions = {
    design1: {
      threads: appSettings.threads,
      chains: accessories.filter(a => a.node.title.toLowerCase().includes("silver chain")),
      caps: accessories.filter(a => a.node.title.toLowerCase().includes("silver cap")),
    },
    design2: {
      threads: appSettings.threads,
      chains: accessories.filter(a => a.node.title.toLowerCase().includes("indonasian")),
      caps: [],
    },
    design3: {
      threads: appSettings.threads,
      chains: [],
      caps: [],
    },
  };

  // States
  const [selectedDesign, setSelectedDesign] = useState("design1");
  const [selectedBeadId, setSelectedBeadId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedThread, setSelectedThread] = useState("");
  const [selectedChain, setSelectedChain] = useState(null); // store node
  const [selectedCap, setSelectedCap] = useState(false); // true/false for radio
  const [malaItems, setMalaItems] = useState([]);

  const options = designOptions[selectedDesign];

  const handleAdd = () => {
    if (!selectedBeadId) return alert("Select a bead!");
    const bead = beads.find(p => p.node.id === selectedBeadId).node;
    const price = parseFloat(bead.variants.edges[0].node.price.amount);
    const newItem = { id: bead.id, title: bead.title, quantity, price };

    const existing = malaItems.find(item => item.id === bead.id);
    if (existing) {
      setMalaItems(malaItems.map(item => item.id === bead.id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setMalaItems([...malaItems, newItem]);
    }
  };

  const handleRemove = (id) => setMalaItems(malaItems.filter(item => item.id !== id));

  // Compute total
  const beadsTotal = malaItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const chainPrice = selectedChain ? parseFloat(selectedChain.variants.edges[0].node.price.amount) : 0;
  const capPrice = selectedCap && options.caps.length > 0
    ? parseFloat(options.caps[0].node.variants.edges[0].node.price.amount)
    : 0;
  const totalPrice = beadsTotal + chainPrice + capPrice;

  const CUSTOM_PRODUCT_VARIANT_ID = "gid://shopify/ProductVariant/46091600363671"; // your variant ID

  const handleAddToCart = async () => {
    try {
      const lineItem = {
        quantity: 1,
        merchandiseId: CUSTOM_PRODUCT_VARIANT_ID, // must be merchandiseId, not variantId
        attributes: [
          { key: "Beads", value: malaItems.map(i => `${i.title} x${i.quantity}`).join(", ") },
          { key: "Thread", value: selectedThread || "None" },
          { key: "Chain", value: selectedChain?.title || "None" },
          { key: "Cap", value: selectedCap ? options.caps[0].node.title : "None" },
          { key: "Total Price", value: `$${totalPrice.toFixed(2)}` },
        ],
      };

      const query = `
        mutation cartCreate($lines: [CartLineInput!]!) {
          cartCreate(input: { lines: $lines }) {
            cart {
              id
              lines(first: 10) {
                edges { node { id quantity attributes { key value } } }
              }
            }
          }
        }
      `;

      const res = await fetch(`https://${SHOPIFY_DOMAIN}/api/2025-07/graphql.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables: { lines: [lineItem] } }),
      });

      const data = await res.json();
      if (data.errors) {
        console.error("Shopify GraphQL errors:", data.errors);
        return;
      }

      console.log("Cart response:", data.data.cartCreate.cart);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };


  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Rudraksh Mala Builder</h1>

      {/* Design Selection */}
      <h2>Select a Design:</h2>
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        {designs.map(d => (
          <label key={d.id} style={{
            border: selectedDesign === d.id ? "3px solid #007bff" : "2px solid #ccc",
            borderRadius: 10,
            padding: 10,
            textAlign: "center",
            cursor: "pointer",
            transition: "0.3s"
          }}>
            <input
              type="radio"
              name="malaDesign"
              value={d.id}
              checked={selectedDesign === d.id}
              onChange={() => {
                setSelectedDesign(d.id);
                setSelectedThread("");
                setSelectedChain("");
                setSelectedCap("");
              }}
              style={{ display: "none" }}
            />
            <img src={d.img} alt={d.name} width={120} style={{ marginBottom: 10, borderRadius: 8 }} />
            <div>{d.name}</div>
          </label>
        ))}
      </div>

      {/* Beads Selection */}
      <h2>Select Bead:</h2>
      <select value={selectedBeadId} onChange={e => setSelectedBeadId(e.target.value)} style={{ padding: 5, marginRight: 10 }}>
        <option value="">-- Select Bead --</option>
        {beads.map(p => (
          <option key={p.node.id} value={p.node.id}>
            {p.node.title} - ${p.node.variants.edges[0].node.price.amount}
          </option>
        ))}
      </select>
      <input type="number" min={1} value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} style={{ width: 60, marginRight: 10 }} />
      <button onClick={handleAdd} style={{ padding: "5px 10px" }}>Add</button>

      <h3>Thread / Chain / Cap:</h3>

      {/* Thread */}
      <select value={selectedThread} onChange={e => setSelectedThread(e.target.value)} style={{ marginRight: 10 }}>
        <option value="">-- Thread --</option>
        {options.threads.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Chain */}
      {options.chains.length > 0 && (
        <select
          value={selectedChain?.id || ""}
          onChange={e => {
            const chain = options.chains.find(c => c.node.id === e.target.value);
            setSelectedChain(chain?.node || null);
          }}
        >
          <option value="">-- Chain --</option>
          {options.chains.map(c => (
            <option key={c.node.id} value={c.node.id}>
              {c.node.title} (+${c.node.variants.edges[0].node.price.amount})
            </option>
          ))}
        </select>
      )}

      {/* Cap */}
      {options.caps.length > 0 && (
        <div style={{ display: "inline-block", marginLeft: 10 }}>
          <label>
            <input
              type="radio"
              name="capOption"
              value="with"
              checked={selectedCap === true}
              onChange={() => setSelectedCap(true)}
            /> With Cap (${capPrice})
          </label>
          <label style={{ marginLeft: 10 }}>
            <input
              type="radio"
              name="capOption"
              value="without"
              checked={selectedCap === false}
              onChange={() => setSelectedCap(false)}
            /> Without Cap
          </label>
        </div>
      )}


      {/* Selected Items */}
      {malaItems.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h2>Selected Beads:</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {malaItems.map(item => (
              <li key={item.id} style={{ marginBottom: 10 }}>
                {item.title} - Qty: {item.quantity} - Price: ${(item.quantity * item.price).toFixed(2)}
                <button onClick={() => handleRemove(item.id)} style={{ marginLeft: 10 }}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accessories Summary */}
      {(selectedThread || selectedChain || selectedCap) && (
        <>
          <h3>Accessories:</h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {selectedThread && <li>Thread: {selectedThread}</li>}
            {selectedChain && <li>Chain: {selectedChain.title} (+${chainPrice.toFixed(2)})</li>}
            {selectedCap && options.caps.length > 0 && (
              <li>Cap: {options.caps[0].node.title} (+${capPrice.toFixed(2)})</li>
            )}
          </ul>
        </>
      )}
      <h3>Total Price: ${totalPrice.toFixed(2)}</h3>

      <div style={{ marginTop: 30 }}>
        <button onClick={handleAddToCart}>Add To Cart</button>
      </div>
    </div>
  );
}
