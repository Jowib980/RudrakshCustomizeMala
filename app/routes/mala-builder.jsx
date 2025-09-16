import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { appSettings } from "../data/settings";
import design1 from "../assets/images/design1.jpg";
import design2a from "../assets/images/design2a.jpg";
import design2b from "../assets/images/design2b.jpg";
import design3 from "../assets/images/design3.jpg";
import design4a from "../assets/images/design4a.jpg";
import design4b from "../assets/images/design4b.jpg";
import logo from "../assets/images/logo.png";
import { useEffect } from "react";
import "../assets/css/style.css";
import toast from "react-hot-toast";

const API_BASE_URL = "https://customize-mala.cardiacambulance.com";

export function links() {
  return [{ rel: "stylesheet", href: "../assets/css/style.css" }];
}


export default function MalaBuilder() {
  const [beads, setBeads] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [beadError, setBeadError] = useState(false);


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
  const [userIp, setUserIp] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const options = designOptions[selectedDesign];

  // ✅ Get IP and cache it
  const getUserIp = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/get-ip`);
      const data = await res.json();
      localStorage.setItem("IP", data.ip);
      setUserIp(data.ip);
      return data.ip;
    } catch (err) {
      console.log("Error getting IP:", err);
      localStorage.setItem("IP", "guest");
      setUserIp("guest");
      return "guest";
    }
  };

  // ✅ Step 1: Initialize userIp
  useEffect(() => {
    const init = async () => {
      const storedIp = localStorage.getItem("IP");
      if (storedIp) {
        setUserIp(storedIp);
      } else {
        await getUserIp();
      }
    };
    init();
  }, []);

  // ✅ Step 2: Load saved data (runs only once when IP is ready)
  useEffect(() => {
    if (!userIp) return;

    const saved = localStorage.getItem(`mala-builder-${userIp}`);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setMalaItems(data.malaItems || []);
        setSelectedDesign(data.selectedDesign || null);
        setQuantity(data.quantity || 1);
        setSelectedThread(data.selectedThread || null);
        setSelectedChain(data.selectedChain || null);
        setSelectedCap(data.selectedCap || null);
        setSelectedCapVariant(data.selectedCapVariant || null);

        setSelectedBeadId(data.selectedBeadId || null);
        setSelectedVariantId(data.selectedVariantId || null);
      } catch (e) {
        console.log("Error parsing saved data:", e);
      }
    }
  }, [userIp]);

  // ✅ Step 3: Save on state changes (after IP is ready)
  useEffect(() => {
    if (!userIp) return;

    const dataToSave = {
      malaItems,
      selectedDesign,
      selectedBeadId,
      selectedVariantId,
      quantity,
      selectedThread,
      selectedChain,
      selectedCap,
      selectedCapVariant,
    };

    localStorage.setItem(`mala-builder-${userIp}`, JSON.stringify(dataToSave));
  }, [
    userIp,
    malaItems,
    selectedDesign,
    selectedBeadId,
    selectedVariantId,
    quantity,
    selectedThread,
    selectedChain,
    selectedCap,
    selectedCapVariant,
  ]);


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

      const firstCapVariant = newOptions.caps[0]?.node.variants.edges[0]?.node || null;
      setSelectedCapVariant(firstCapVariant);
    } else {
      setSelectedCap(false);
      setSelectedCapVariant(null);
    }

  };

  const handleAdd = () => {
    if (!selectedBeadId || !selectedVariantId) {
      setBeadError(true);
       return toast.error("Please select bead and bead type!");
    }

    setBeadError(false);
    
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

    if (tags.includes("1mukhi")) count1Mukhi += item.quantity;
    if (tags.includes("gaurishankar")) countGaurishankar += item.quantity;
  });

  const has1Mukhi = count1Mukhi > 0;
  const hasGaurishankar = countGaurishankar > 0;

  // Minimum beads check
  if (totalBeads < 3) {
    return toast.error("You need to select at least 3 beads before checkout!");
  }

  // Special bead rules
  if (has1Mukhi && hasGaurishankar) {
    if (totalBeads % 2 !== 0) {
      return toast.error(
        "Since you selected 1 Mukhi and Gaurishankar beads, total beads must be even! Please add or remove a bead."
      );
    }
  } else {
    if (totalBeads % 2 === 0) {
      return toast.error(
        "Total beads must be odd! Please add or remove a bead."
      );
    }
  }

  // Proceed to create draft order and redirect
  try {
    setLoading(true);
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
      setLoading(false);
      window.location.href = data.checkoutUrl; // redirect to checkout
    } else {
      setLoading(false);
      toast.error("Checkout error: " + (data?.message || JSON.stringify(data)));
    }
  } catch (err) {
    toast.error("Checkout error: " + err.message);
    setLoading(false);
  }
};


  
  return (
    <div class="container">
      
      
      <div class="main-section">

        {loading && (
          <div className="loader-overlay">
            <div className="spinner"></div>
          </div>
        )}

        <div class="logo-section">
          <img src={logo} alt="Logo" class="logo-image" />
        </div>
        <h1 class="main-heading">Customize Your Mala - Select your Mala Variant</h1>

        <div class="main-container">
          {/* Left: Main image */}
          <div class="left-section">
            <img
              src={designs.find(d => d.id === selectedDesign)?.img}
              alt={selectedDesign}
              class="selected-image"
            />
          </div>

          {/* Right: Configurator */}
          <div class="right-section">
            
            {/* Design selection */}
            <h3 class="section-heading">Select Your Design:</h3>
            <div class="design-section">
              {designs.map(d => (
                <div
                  key={d.id}
                  class="design-div"
                  onClick={() => handleDesignChange(d.id)}
                  style={{
                    border: selectedDesign === d.id ? "3px solid #212862" : "1px solid #ddd", 
                  }}
                >
                  <img src={d.img} alt={d.name} class="design-image-div" />
                  {/* <div style={{ marginTop: "8px", fontWeight: "bold" }}>{d.name}</div> */}
                </div>
              ))}
            </div>



            <div className="thread-section">

              {options.threads.length > 0 && (
                <>

                <h3>Choose Thread / Chain</h3>
                  {selectedDesign === "design1" ? (
                    // 🔹 Single merged dropdown (Threads + Chains)
                    <select
                      style={{ padding: "5px", marginRight: "10px", borderRadius: "4px" }}
                      value={selectedThread || selectedChain?.id || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Check if selected value matches a thread
                        if (options.threads.includes(value)) {
                          setSelectedThread(value);
                          setSelectedChain(null); // reset chain
                        } else {
                          // Otherwise it's a chain
                          const chain = options.chains.find((c) => c.node.id === value);
                          setSelectedChain(chain?.node || null);
                          setSelectedThread(""); // reset thread
                        }
                      }}
                    >
                      <option value="">-- Choose Thread / Chain --</option>

                      {/* Threads */}
                      {options.threads.map((t) => (
                        <option key={`thread-${t}`} value={t}>
                          {t}
                        </option>
                      ))}

                      {/* Chains */}
                      {options.chains.map((c) => (
                        <option key={`chain-${c.node.id}`} value={c.node.id}>
                          {c.node.title} (+₹{c.node.variants.edges[0].node.price.amount})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      {/* 🔹 Normal Thread dropdown */}
                      <select
                        style={{ padding: "5px", borderRadius: "4px"  }}
                        value={selectedThread}
                        onChange={(e) => setSelectedThread(e.target.value)}
                      >
                        <option value="">-- Choose Thread --</option>
                        {options.threads.map((t) => (
                          <option key={`thread-${t}`} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>

                    </>
                  )}
                </>
              )}
            </div>


            <div class="cap-section">
              
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
                        style={{ margin: "0px 10px 10px 10px", padding: "8px", borderRadius: "4px"  }}
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


            {/* Dropdowns */}
            <div class="bead-headings">
              <h3 style={{ margin: "5px" }}>Select Bead:</h3>
              {malaItems.length > 0 && (
                <span class="sub-heading">Select more beads here...</span>
              )}
            </div>
            <div class="bead-section">

                <select
                  value={selectedBeadId}
                  onChange={e => {
                    setSelectedBeadId(e.target.value);
                    setSelectedVariantId(""); // reset variant
                    setBeadError(false);
                  }}
                  style={{
                    border: beadError && !selectedBeadId ? "2px solid red" : "1px solid #ddd",
                    padding: "8px",
                    marginRight: "10px",
                    borderRadius: "4px" 
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
                    onChange={e => {
                      setSelectedVariantId(e.target.value);
                      setBeadError(false);
                    }}
                    style={{
                      border: beadError && !selectedVariantId ? "2px solid red" : "1px solid #ddd",
                      padding: "8px",
                      flex: 1,
                      borderRadius: "4px" 
                    }}
                  >
                    <option value="">-- Select Bead Type --</option>
                    {selectedBeadId &&
                      beads.find(p => p.node.id === selectedBeadId)?.node?.variants?.edges.map(v => (
                        <option key={v.node.id} value={v.node.id}>
                          {v.node.title} - ₹{v.node.price.amount}
                        </option>
                    ))}
                  </select>
                )}

              
              <div class="quantity-section">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  class="quantity-button"
                >
                  –
                </button>

                <span class="qty-value">{quantity}</span>

                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  class="quantity-button"
                >
                  +
                </button>
              </div>

              <button onClick={handleAdd}
                class="add-button">
                Add
              </button>
            </div>


            {/* Summary */}
            {malaItems.length > 0 && (
              <div class="beads-summary">
                <h3>Selected Beads:</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {malaItems.map((item) => (
                    <li key={item.id} class="beads-list">
                      <span style={{ flex: 1 }}>
                        {item.title} - Price: ₹{(item.price * item.quantity).toFixed(2)}
                      </span>

                      {/* Quantity controls */}
                      <div class="quantity-section">
                        <button
                          type="button"
                          onClick={() => setMalaItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                : i
                            )
                          )}
                          class="quantity-button"
                        >
                          –
                        </button>
                        <span class="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setMalaItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            )
                          )}
                          class="quantity-button"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        class="remove-button"
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
                          class="remove-button"
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
            <button
              onClick={handleAddToCart}
              className="add-cart-btn"
            >
              {/* Cart icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-4a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>

              ADD TO CART
            </button>

          </div>

        </div>
      </div>

    </div>
  );
}
