import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { appSettings } from "../data/settings";
import design1 from "../images/design1.jpg";
import design2a from "../images/design2a.jpg";
import design2b from "../images/design2b.jpg";
import design3 from "../images/design3.jpg";
import design4a from "../images/design4a.jpg";
import design4b from "../images/design4b.jpg";
import logo from "../images/logo.png";
import { useEffect } from "react";



export default function MalaBuilder() {
  const [beads, setBeads] = useState([]);
  const [accessories, setAccessories] = useState([]);

  const designs = [
    { id: "design1", name: "Type 1-Silver Capping Kawach", img: design1 },
    { id: "design2a", name: "Type 2A- Kawach in Rudraksh Mala", img: design2a },
    { id: "design2b", name: "Type 2B- Kawach in Rudraksh Mala with Silver", img: design2b },
    { id: "design3", name: "Type 3- Kawach in Thread", img: design3 },
    { id: "design4a", name: "Type 4A- Kawach In Rudraksh Sphatic Mala", img: design4a },
    { id: "design4b", name: "Type 4B- Kawach In Rudraksh Sphatic Mala with silver", img: design4b },
  ];


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/mala-products`)
      .then(res => res.json())
      .then(data => {
        setBeads(data.data.beads.edges);
        setAccessories(data.data.accessories.edges);
      });
  }, []);


  const designOptions = {
    design1: {
      threads: appSettings.threads,
      chains: accessories.filter(a => a.node.tags.includes("silver chain")),
      caps: accessories.filter(a => a.node.tags.includes("cap")),
    },
    design2a: { 
      threads: appSettings.threads,
      chains: accessories.filter(a => a.node.tags.includes("rudrakshmala")),
      caps: []
    },
    design2b: { 
      threads: [],
      chains: accessories.filter(a => a.node.tags.includes("rudrakshmalasilver")),
      caps: accessories.filter(a => a.node.tags.includes("cap")),
    },
    design3: { threads: appSettings.threads, chains: [], caps: [] },
    design4a: { 
      threads: appSettings.threads,
      chains: accessories.filter(a => a.node.tags.includes("sphaticmala")),
      caps: []
    },
    design4b: { 
      threads: appSettings.threads,
      chains: accessories.filter(a => a.node.tags.includes("sphaticmala")),
      caps: accessories.filter(a => a.node.tags.includes("cap")),
    },
  };

  const [selectedDesign, setSelectedDesign] = useState("design1");
  const [selectedBeadId, setSelectedBeadId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedThread, setSelectedThread] = useState("");
  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedCap, setSelectedCap] = useState(false);
  const [selectedCapVariant, setSelectedCapVariant] = useState(null);
  const [malaItems, setMalaItems] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState("");

  const options = designOptions[selectedDesign];

  useEffect(() => {
  if (options.caps.length > 0) {
    if (selectedDesign === "design1" || selectedDesign === "design2b" || selectedDesign === "design4b") {
      if (!selectedCap) setSelectedCap(true);

      if (!selectedCapVariant) {
        const firstCapVariant = options.caps[0]?.node.variants.edges[0]?.node || null;
        setSelectedCapVariant(firstCapVariant);
      }
    }
  }
}, [selectedDesign, options.caps]);


  const handleDesignChange = (designId) => {
    setSelectedDesign(designId);

    const newOptions = designOptions[designId];

    setMalaItems([]);
    setSelectedBeadId("");
    setSelectedVariantId("");

    setSelectedChain(null);

    setSelectedThread("");
    setSelectedChain(null);

    if (newOptions.chains.length > 0) {
      setSelectedChain(newOptions.chains[0].node);
    }

    if (!newOptions.caps.length) {
      setSelectedCap(false);
      setSelectedCapVariant(null);
    } else if (designId === "design2b" || designId === "design4b" || designId === "design1" ) {
      setSelectedCap(true); // auto select With Cap

      const firstCapVariant = newOptions.caps[0]?.node.variants.edge[0]?.node || null;
      setSelectedCapVariant(firstCapVariant);
    } else {
      setSelectedCap(false);
      setSelectedCapVariant(null);
    }

  };

  const handleAdd = () => {
    if (!selectedBeadId || !selectedVariantId) return alert("Select bead and bead type!");
    
    const bead = beads.find(p => p.node.id === selectedBeadId).node;
    const variant = bead.variants.edges.find(v => v.node.id === selectedVariantId).node;
    
    const newItem = {
      id: variant.id,
      title: `${bead.title} - ${variant.title}`,
      quantity,
      price: parseFloat(variant.price.amount)
    };

    const existing = malaItems.find(item => item.id === variant.id);
    if (existing) {
      setMalaItems(malaItems.map(item => item.id === variant.id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setMalaItems([...malaItems, newItem]);
    }
  };


  const handleRemove = (id) => setMalaItems(malaItems.filter(item => item.id !== id));
  
  const totalBeads = malaItems.reduce((sum, item) => sum + item.quantity, 0);
  const beadsTotal = malaItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const chainPrice = selectedChain ? parseFloat(selectedChain.variants.edges[0].node.price.amount) : 0;
  const capPrice = selectedCap && selectedCapVariant
  ? parseFloat(selectedCapVariant.price.amount) * totalBeads
  : 0;

  const totalPrice = beadsTotal + chainPrice + capPrice;


  const CUSTOM_PRODUCT_VARIANT_ID = "gid://shopify/ProductVariant/46091600363671"; // your variant ID 

  const DOMAIN = "https://customize-mala.cardiacambulance.com";

  const selectedDesignObj = designs.find(d => d.id === selectedDesign);

const handleAddToCart = async () => {
  const totalBeads = malaItems.reduce((sum, item) => sum + item.quantity, 0);

  let count1Mukhi = 0;
  let countGaurishankar = 0;

  malaItems.forEach(item => {
    // Find the bead by matching variant ID
    const beadNode = beads.find(b =>
      b.node.variants.edges.some(v => v.node.id === item.id)
    )?.node;

    if (!beadNode) return;

    const tags = Array.isArray(beadNode.tags) ? beadNode.tags : [];
    console.log("tags", tags);

    if (tags.includes("1mukhi")) count1Mukhi += item.quantity;
    if (tags.includes("gaurishankar")) countGaurishankar += item.quantity;
  });

  const has1Mukhi = count1Mukhi > 0;
  const hasGaurishankar = countGaurishankar > 0;

  // Minimum beads check
  if (totalBeads < 3) {
    return alert("You need to select at least 3 beads before checkout!");
  }

  // Special bead rules
  if (has1Mukhi && hasGaurishankar) {
    if (totalBeads % 2 !== 0) {
      return alert(
        "Since you selected 1 Mukhi and Gaurishankar beads, total beads must be even! Please add or remove a bead."
      );
    }
  } else {
    if (totalBeads % 2 === 0) {
      return alert(
        "Total beads must be odd! Please add or remove a bead."
      );
    }
  }

  // Proceed to create draft order and redirect
  try {
    const res = await fetch(`${API_BASE_URL}/proxy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quantity: 1,
        totalPrice,
        selections: {
          Design: selectedDesignObj.name,
          DesignImage: selectedDesignObj.img
            ? `${DOMAIN}${selectedDesignObj.img}`
            : "",
          Beads: malaItems
            .map(i => `${i.title} x${i.quantity} = ₹${(i.price * i.quantity).toFixed(2)}`)
            .join(", "),
          Thread: selectedThread || "None",
          Chain: selectedChain
            ? `${selectedChain.title} (+₹${parseFloat(selectedChain.variants.edges[0].node.price.amount).toFixed(2)})`
            : "None",
          Cap: selectedCap
            ? `${selectedCapVariant?.title} (+₹${parseFloat(selectedCapVariant.price.amount).toFixed(2)} × ${totalBeads} = ₹${capPrice.toFixed(2)})`
            : "Without Cap",
        },
      }),
    });

    const data = await res.json();

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl; // redirect to checkout
    } else {
      console.error("Checkout error:", data);
    }
  } catch (err) {
    console.error("Checkout error:", err);
  }
};


  
  return (
    <div>
      
      <div style={{ maxWidth: "1200px", textAlign: "center" }}>
        <img src={logo} alt="Logo" style={{ maxWidth: "25%", paddingTop: "10px" }} />
      </div>
      <h1 style={{ color: "#555", textAlign: "center", margin: "30px" }}>Customize Your Mala - Select your Mala Variant</h1>

      <div style={{ maxWidth: "1200px", margin: "40px auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", fontFamily: "Arial, sans-serif" }}>
    
        {/* Left: Main image */}
        <div>
          <div style={{ border: "1px solid #eee", borderRadius: "12px", padding: "20px", textAlign: "center" }}>
            <img
              src={designs.find(d => d.id === selectedDesign)?.img}
              alt={selectedDesign}
              style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Right: Configurator */}
        <div>
          
          {/* Design selection */}
          <h3 style={{ marginTop: "20px" }}>Select Your Design:</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", margin: "15px 0" }}>
            {designs.map(d => (
              <div
                key={d.id}
                onClick={() => handleDesignChange(d.id)}
                style={{
                  flex: "1",
                  border: selectedDesign === d.id ? "3px solid #212862" : "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "10px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
              >
                <img src={d.img} alt={d.name} style={{ width: "100%", borderRadius: "8px" }} />
                {/* <div style={{ marginTop: "8px", fontWeight: "bold" }}>{d.name}</div> */}
              </div>
            ))}
          </div>

          {/* Dropdowns */}
          <h3>Select Bead:</h3>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>

              <select
                value={selectedBeadId}
                onChange={e => {
                  setSelectedBeadId(e.target.value);
                  setSelectedVariantId(""); // reset variant
                }}
              >
                <option value="">-- Select Bead --</option>
                {beads.map(p => (
                  <option key={p.node.id} value={p.node.id}>
                    {p.node.title}
                  </option>
                ))}
              </select>

              {/* Show variants only if a bead is selected */}
              {selectedBeadId && (
                <select
                  value={selectedVariantId}
                  onChange={e => setSelectedVariantId(e.target.value)}
                  style={{ flex: 1, padding: "8px" }}
                >
                  <option value="">-- Select Bead Type --</option>
                  {beads
                    .find(p => p.node.id === selectedBeadId)
                    .node.variants.edges.map(v => (
                      <option key={v.node.id} value={v.node.id}>
                        {v.node.title} - ₹{v.node.price.amount}
                      </option>
                    ))}
                </select>
              )}

            
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{
                  background: "#eee",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "32px",
                  height: "32px",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                –
              </button>

              <span style={{ minWidth: "30px", textAlign: "center" }}>{quantity}</span>

              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                style={{
                  background: "#eee",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  width: "32px",
                  height: "32px",
                  fontSize: "18px",
                  cursor: "pointer"
                }}
              >
                +
              </button>
            </div>

            <button onClick={handleAdd}
              style={{ background: "#212862", color: "#fff", padding: "8px 15px", border: "none", borderRadius: "6px" }}>
              Add
            </button>
          </div>

          <h3>Choose Thread / Chain</h3>
          <div style={{ display: "flex", flexDirection: "row", gap: "20%" }}>
            
            {options.threads.length > 0 && (
              <select style={{ padding: "5px" }} value={selectedThread} onChange={e => setSelectedThread(e.target.value)}>
                <option value="">-- Choose Thread --</option>
                {options.threads.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}

            {/* Chain */}
            {options.chains.length > 0 && (
              selectedDesign === "design1" ? (
                <select
                  style={{ padding: "5px" }}
                  value={selectedChain?.id || ""}
                  onChange={e => {
                    const chain = options.chains.find(c => c.node.id === e.target.value);
                    setSelectedChain(chain?.node || null);
                  }}
                >
                  <option value="">-- Choose Chain --</option>
                  {options.chains.map(c => (
                    <option key={c.node.id} value={c.node.id}>
                      {c.node.title} (+₹{c.node.variants.edges[0].node.price.amount})
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <strong>Chain: </strong>
                  <span>
                    {selectedChain
                      ? `${selectedChain.title} (+₹${selectedChain.variants.edges[0].node.price.amount})`
                      : "No Chain Selected"}
                  </span>
                </div>
              )
            )}

          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            
            {options.caps.length > 0 && (
              <>
                <h3>Choose Capping material</h3>
                <div>
                  {/* Always render "With Cap" option */}
                  <label>
                    <input
                      type="radio"
                      checked={selectedCap === true}
                      onChange={() => setSelectedCap(true)}
                    />{" "}
                    With Cap
                  </label>

                  {/* Show dropdown only if With Cap */}
                  {selectedCap && options.caps.length > 0 && (
                    <select
                      value={selectedCapVariant?.id || ""}
                      onChange={(e) => {
                        const selected = options.caps
                          .map((cap) => cap.node.variants.edges)
                          .flat()
                          .find((v) => v.node.id === e.target.value)?.node;

                        setSelectedCapVariant(selected || null);
                      }}
                      style={{ margin: "10px", padding: "8px" }}
                    >
                      {/* <option value="">-- Select Cap Type --</option> */}
                      {options.caps.flatMap((cap) =>
                        cap.node.variants.edges.map((v) => (
                          <option key={v.node.id} value={v.node.id}>
                            {v.node.title ||
                              v.node.selectedOptions.map((o) => o.value).join(" / ")}{" "}
                            (+₹{v.node.price.amount})
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>
              </>
            )}

          </div>

          {/* Summary */}
          {malaItems.length > 0 && (
            <div style={{ marginTop: "30px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
              <h3>Selected Beads:</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {malaItems.map((item) => (
                  <li key={item.id} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ flex: 1 }}>
                      {item.title} - Price: ₹{(item.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Quantity controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <button
                        type="button"
                        onClick={() => setMalaItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                              : i
                          )
                        )}
                        style={{
                          background: "#eee",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          width: "28px",
                          height: "28px",
                          fontSize: "16px",
                          cursor: "pointer",
                        }}
                      >
                        –
                      </button>
                      <span style={{ minWidth: "25px", textAlign: "center" }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setMalaItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                          )
                        )}
                        style={{
                          background: "#eee",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          width: "28px",
                          height: "28px",
                          fontSize: "16px",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      style={{
                        background: "#212862",
                        color: "#fff",
                        padding: "6px 12px",
                        border: "none",
                        borderRadius: "6px",
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(selectedThread || selectedChain || selectedCap) && (
            <>
              <h3>Accessories:</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {selectedThread && <li style={{ marginBottom: "10px"}}> <b> Thread: </b> {selectedThread}</li>}

                {selectedChain && (
                  <li style={{ marginBottom: "10px"}}>
                    <b> Chain: </b> {selectedChain.title} (+₹{chainPrice.toFixed(2)})
                    {selectedDesign === "design1" && (
                      <button
                        onClick={() => setSelectedChain(null)}
                        style={{
                          marginLeft: "10px",
                          background: "#212862",
                          color: "#fff",
                          padding: "4px 10px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </li>
                )}

                {selectedCap && selectedCapVariant && (
                  <li style={{ marginBottom: "10px"}}>
                    <b> Cap: </b> {selectedCapVariant.title} (+₹
                    {parseFloat(selectedCapVariant.price.amount).toFixed(2)} × {totalBeads} = ₹
                    {capPrice.toFixed(2)})
                  </li>
                )}
              </ul>
            </>
          )}

          <h2>Total: ₹{totalPrice.toFixed(2)}</h2>
          {/* Add to cart */}
          <button onClick={handleAddToCart} style={{ marginTop: "20px", width: "100%", padding: "15px", background: "#212862", color: "#fff", border: "none", borderRadius: "8px", fontSize: "18px", cursor: "pointer" }}>
            Add to Cart
          </button>
        </div>

      </div>

    </div>
  );
}
