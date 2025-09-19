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
  const [yantras, setYantras] = useState([]);


  const designs = [
    // { id: "design1", name: "Type 1-Silver Capping Kawach", img: design1 },
    // { id: "design2a", name: "Type 2A- Kawach in Rudraksh Mala", img: design2a },
    // { id: "design2b", name: "Type 2B- Kawach in Rudraksh Mala with Silver", img: design2b },
    // { id: "design3", name: "Type 3- Kawach in Thread", img: design3 },
    // { id: "design4a", name: "Type 4A- Kawach In Rudraksh Sphatic Mala", img: design4a },
    // { id: "design4b", name: "Type 4B- Kawach In Rudraksh Sphatic Mala with silver", img: design4b },

    { id: "design1", name: "Type 1", img: design1 },
    { id: "design2a", name: "Type 2A", img: design2a },
    { id: "design2b", name: "Type 2B", img: design2b },
    { id: "design3", name: "Type 3", img: design3 },
    { id: "design4a", name: "Type 4A", img: design4a },
    { id: "design4b", name: "Type 4B", img: design4b },
  ];


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/mala-products`)
      .then(res => res.json())
      .then(data => {
        setBeads(data.data.beads.edges);
        setAccessories(data.data.accessories.edges);
        setYantras(
          data.data.yantras.products.edges.filter(
            ({ node }) => node.tags.includes("silveryantra")
          )
        );     
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
      chains: accessories.filter(a => a.node.tags.includes("rudrakshmalawithcapping")),
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
  const [selectedBeadVariantId, setSelectedBeadVariantId] = useState(""); 
  const [selectedMalaVariantId, setSelectedMalaVariantId] = useState("");
  const [userIp, setUserIp] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedYantra, setSelectedYantra] = useState(null);

  const options = designOptions[selectedDesign];

  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (node) => {
    setSelectedYantra(node);
    setIsOpen(false); // close dropdown after selection
  };

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
        setSelectedMalaVariantId(data.selectedMalaVariant || null);
        setSelectedCap(data.selectedCap || null);
        setSelectedCapVariant(data.selectedCapVariant || null);

        setSelectedBeadId(data.selectedBeadId || null);
        setSelectedBeadVariantId(data.selectedBeadVariantId || null);

        setSelectedYantra(data.selectedYantra || null);
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
      selectedBeadVariantId,
      quantity,
      selectedThread,
      selectedChain,
      selectedMalaVariant,
      selectedCap,
      selectedCapVariant,
      selectedYantra,
    };

    localStorage.setItem(`mala-builder-${userIp}`, JSON.stringify(dataToSave));
  }, [
    userIp,
    malaItems,
    selectedDesign,
    selectedBeadId,
    selectedBeadVariantId,
    setSelectedMalaVariantId,
    quantity,
    selectedThread,
    selectedChain,
    selectedCap,
    selectedCapVariant,
    selectedYantra
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

    
  useEffect(() => {
    if (!selectedDesign) return;

    const options = designOptions[selectedDesign];

    if (selectedDesign === "design1") {
      // If neither chain nor thread is selected, auto-select first chain
      if (!selectedChain && !selectedThread && options.chains.length > 0) {
        setSelectedChain(options.chains[0].node);
      }
    } else {
      // For other designs, auto-select first thread if not selected
      if (options.threads.length > 0 && !selectedThread) {
        setSelectedThread(options.threads[0]);
      }
    }
  }, [selectedDesign, options.threads, options.chains, selectedThread, selectedChain]);


  const handleDesignChange = (designId) => {
    setSelectedDesign(designId);

    const newOptions = designOptions[designId];

    setMalaItems([]);
    setSelectedBeadId("");
    setSelectedBeadVariantId("");

    setSelectedChain(null);
    setSelectedMalaVariantId(null);

    setSelectedThread("");

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
    if (!selectedBeadId || !selectedBeadVariantId) {
      setBeadError(true);
       return toast.error("Please select bead and bead type!");
    }

    setBeadError(false);
    
    const bead = beads.find(p => p.node.id === selectedBeadId).node;
    const variant = bead.variants.edges.find(v => v.node.id === selectedBeadVariantId).node;
    
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
  
  const handleRemoveYantra = () => {
    setSelectedYantra(null);
  };

  
  const totalBeads = malaItems.reduce((sum, item) => sum + item.quantity, 0);
  const beadsTotal = malaItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedMalaVariant = selectedMalaVariantId
    ? options.chains
        .flatMap((chain) => chain.node.variants.edges.map((v) => v.node))
        .find((v) => v.id === selectedMalaVariantId)
    : null;

  const chainPrice = selectedMalaVariant
    ? parseFloat(selectedMalaVariant.price.amount)
    : selectedChain
    ? parseFloat(selectedChain.variants.edges[0].node.price.amount)
    : 0;

  // const chainPrice = selectedChain ? parseFloat(selectedChain.variants.edges[0].node.price.amount) : 0;
  const capPrice = selectedCap && selectedCapVariant
  ? parseFloat(selectedCapVariant.price.amount) * totalBeads
  : 0;
  const yantraPrice = selectedYantra ? parseFloat(selectedYantra.variants.edges[0].node.price.amount) : 0;

  const totalPrice = beadsTotal + chainPrice + capPrice + yantraPrice;


  const CUSTOM_PRODUCT_VARIANT_ID = "gid://shopify/ProductVariant/51308905136450"; // your variant ID 

  const selectedDesignObj = designs.find(d => d.id === selectedDesign);

  const handleAddToCart = async () => {
    console.log("Add to cart clicked!", { selectedBeadId, selectedBeadVariantId, malaItems });
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

    if (totalBeads > 53) {
      return toast.error("The maximum beads allowed are 53. You need to remove a bead for proceed.");
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
              ? `${selectedDesignObj.img}`
              : "",
            Beads: malaItems
              .map(i => `${i.title} x${i.quantity} = ₹${(i.price * i.quantity).toFixed(2)}`)
              .join(", "),
            Thread: selectedThread || "None",
            Mala: selectedChain
              ? `${selectedChain.title} (+₹${parseFloat(selectedChain.variants.edges[0].node.price.amount).toFixed(2)})`
              : "None",
            Cap: selectedCap
              ? `${selectedCapVariant?.title} (+₹${parseFloat(selectedCapVariant.price.amount).toFixed(2)} × ${totalBeads} = ₹${capPrice.toFixed(2)})`
              : "Without Cap",
            Yantra: selectedYantra
              ? `${selectedYantra.title} (+₹${parseFloat(selectedYantra.variants.edges[0].node.price.amount).toFixed(2)})`
              : "None",

          },
        }),
      });

      const data = await res.json();

      if (data.checkoutUrl) {
        setLoading(false);
        window.top.location.href = data.checkoutUrl; // redirect to checkout
      } else {
        setLoading(false);
        toast.error("Checkout error: " + (data?.message || JSON.stringify(data)));
      }
    } catch (err) {
      toast.error("Checkout error: " + err.message);
      setLoading(false);
    }
  };


  // Utility to match cap ↔ mala dynamically
  const findMatchingVariant = (variants, keyword) => {
    return variants
      .flatMap((p) => p.node.variants.edges.map((v) => v.node))
      .find((v) => v.title.toLowerCase().includes(keyword.toLowerCase()));
  };

  
  return (
    <div className="container">
      
      
      <div className="main-section">

        {loading && (
          <div className="loader-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {/*<div className="logo-section">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>*/}
        <h1 className="main-heading">Customize Your Mala - Select your Mala Variant</h1>

        <div className="main-container">
          {/* Left: Main image */}
          <div className="left-section">
            <img
              src={designs.find(d => d.id === selectedDesign)?.img}
              alt={selectedDesign}
              className="selected-image"
            />
          </div>

          {/* Right: Configurator */}
          <div className="right-section">
            
            {/* Design selection */}
            <h3 className="section-heading">Select Your Design:</h3>
            <div className="design-section">
              {designs.map(d => (
                <div
                  key={d.id}
                  className="design-div"
                  onClick={() => {
                    console.log("Design clicked:", d.id);
                    handleDesignChange(d.id)}}
                  // style={{
                  //   border: selectedDesign === d.id ? "3px solid #212862" : "1px solid #ddd", 
                  // }}
                >
                  <div key={d.id} style={{ marginBottom: "8px", fontWeight: "bold" }} >{d.name}</div>
                  <div style={{
                      border: selectedDesign === d.id ? "3px solid #212862" : "1px solid #ddd",
                      borderRadius: "10px" 
                  }}>
                    <img src={d.img} alt={d.name} className="design-image-div" />
                  </div>
                </div>
              ))}
            </div>



            <div className="thread-section">

              {options.threads.length > 0 && (
                <>

                <h3>Choose Thread / Mala</h3>
                  {selectedDesign === "design1" ? (
                    // 🔹 Single merged dropdown (Threads + Chains)
                    <select
                      className="dropdown"
                      style={{ padding: "8px", marginRight: "10px", borderRadius: "4px",border: "1px solid rgb(221, 221, 221)" }}
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
                      <option value=""> Choose Thread / Mala </option>

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
                        className="dropdown"
                        style={{ padding: "8px", marginRight: "10px", borderRadius: "4px",border: "1px solid rgb(221, 221, 221)" }}
                        value={selectedThread || ""}
                        onChange={(e) => setSelectedThread(e.target.value)}
                      >
                        <option value=""> Choose Thread </option>
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

              {options.chains.length > 0 && (
                <>

                  {selectedDesign === "design2b" && (
                    <>
                    <h3>Choose Mala</h3>
                    {/* <select
                      className="dropdown"
                      style={{ padding: "8px", marginRight: "10px", borderRadius: "4px",border: "1px solid rgb(221, 221, 221)" }}
                      value={selectedChain?.id}
                      onChange={(e) => {
                        const value = e.target.value;
                        const chain = options.chains.find((c) => c.node.id === value);
                        setSelectedChain(chain?.node || null);
                        
                      }}
                    >

                      {options.chains.map((c) => (
                        <option key={`chain-${c.node.id}`} value={c.node.id}>
                          {c.node.title} (+₹{c.node.variants.edges[0].node.price.amount})
                        </option>
                      ))}
                    </select> */}

                    <select
                        style={{
                          border: "1px solid rgb(221, 221, 221)",
                          padding: "8px",
                          borderRadius: "4px",
                          whiteSpace: "normal",
                          wordBreak: "break-all"
                        }}
                        value={selectedMalaVariantId || ""}
                        onChange={(e) => {
                          setSelectedMalaVariantId(e.target.value);

                          // Auto-sync Cap if Design2B
                          if (selectedDesign === "design2b") {
                            const selected = options.chains
                              .flatMap((chain) => chain.node.variants.edges.map((v) => v.node))
                              .find((v) => v.id === e.target.value);

                            if (selected) {
                              const keyword = selected.title.split(" ").slice(-1)[0]; // last word e.g. "Silver"
                              const targetCapVariant = findMatchingVariant(options.caps, keyword);

                              if (targetCapVariant) {
                                setSelectedCapVariant(targetCapVariant);
                              }
                            }
                          }
                        }}
                      >
                        {options.chains.flatMap((chain) =>
                          chain.node.variants.edges.map((v) => (
                            <option key={v.node.id} value={v.node.id}>
                              {v.node.title} (+₹{v.node.price.amount})
                            </option>
                          ))
                        )}
                      </select>

                    </>
                    )}
                </>
              )}

            </div>


            <div className="cap-section">
              
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
                      <>
                      {selectedDesign !== "design2b" ? (

                        <select
                        value={selectedCapVariant?.id || ""}
                        onChange={(e) => {
                          const selected = options.caps
                            .map((cap) => cap.node.variants.edges)
                            .flat()
                            .find((v) => v.node.id === e.target.value)?.node;

                          setSelectedCapVariant(selected || null);
                        }}
                        style={{ margin: "0px 10px 10px 10px", padding: "8px", borderRadius: "4px", border: "1px solid rgb(221, 221, 221)"  }}
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

                        ): (

                        <select
                          style={{
                            border: "1px solid rgb(221, 221, 221)",
                            padding: "8px",
                            marginLeft: "10px",
                            borderRadius: "4px",
                            whiteSpace: "normal",
                            wordBreak: "break-all"
                          }}
                          value={selectedCapVariant?.id || ""}
                          onChange={(e) => {
                            const selected = options.caps
                              .flatMap((cap) => cap.node.variants.edges.map((v) => v.node))
                              .find((v) => v.id === e.target.value);

                            setSelectedCapVariant(selected || null);

                            // Auto-sync Mala if Design2B
                            if (selectedDesign === "design2b" && selected) {
                              const keyword = selected.title.split(" ")[0]; // e.g. "Silver", "Copper"
                              const targetMalaVariant = findMatchingVariant(options.chains, keyword);

                              if (targetMalaVariant) {
                                setSelectedChain(options.chains[0].node);
                                setSelectedMalaVariantId(targetMalaVariant.id);
                              }
                            }
                          }}
                        >
                          {options.caps.flatMap((cap) =>
                            cap.node.variants.edges.map((v) => (
                              <option key={v.node.id} value={v.node.id}>
                                {v.node.title} (+₹{v.node.price.amount})
                              </option>
                            ))
                          )}
                        </select>


                        )}
                      </>
                    )}
                  </div>
                </>
              )}

            </div>


            {/* Summary */}
            {malaItems.length > 0 && (
              <div className="beads-summary">
                <h3>Selected Beads:</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {malaItems.map((item) => (
                    <li key={item.id} className="beads-list">
                      <span>
                        {item.title} - Price: ₹{(item.price * item.quantity).toFixed(2)}
                      </span>

                      <div className="action">
                      {/* Quantity controls */}
                      <div className="quantity-section">
                        <button
                          type="button"
                          onClick={() => setMalaItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                : i
                            )
                          )}
                          className="quantity-button"
                        >
                          –
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setMalaItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                            )
                          )}
                          className="quantity-button"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dropdowns */}
            <div className="bead-headings">
              <h3 style={{ margin: "5px" }}>Select Bead:</h3>
              <span style={{ color: "grey", fontSize: "13px",fontWeight: "600", margin: "8px" }}>(min. 3 beads)</span>
              {malaItems.length > 0 && (
                <span className="sub-heading">(Select more beads here...)</span>
              )}
            </div>
            <div className="bead-section">
              <select
                  value={selectedBeadId}
                  onChange={e => {
                    setSelectedBeadId(e.target.value);
                    setSelectedBeadVariantId(""); // reset variant
                    setBeadError(false);
                  }}
                  style={{
                    border: beadError && !selectedBeadId ? "2px solid red" : "1px solid #ddd",
                    padding: "8px",
                    marginRight: "10px",
                    borderRadius: "4px",
                    whiteSpace: "normal",
                    wordBreak: "break-all"
                  }}
                >
                  <option value=""> Select Bead </option>
                  {beads.map(p => (
                    <option key={p.node.id} value={p.node.id}>
                      {p.node.title}
                    </option>
                  ))}
                </select>

                {/* Show variants only if a bead is selected */}
                {selectedBeadId && (
                  <select
                    value={selectedBeadVariantId}
                    onChange={e => {
                      setSelectedBeadVariantId(e.target.value);
                      setBeadError(false);
                    }}
                    style={{
                      border: beadError && !selectedBeadVariantId ? "2px solid red" : "1px solid #ddd",
                      padding: "8px",
                      flex: 1,
                      borderRadius: "4px" ,
                      width: "100%",
                      whiteSpace: "normal",
                      wordBreak: "break-all"
                    }}
                  >
                    <option value=""> Select Bead Type </option>
                    {selectedBeadId &&
                      beads.find(p => p.node.id === selectedBeadId)?.node?.variants?.edges
                      .filter(v => v.node.title.toLowerCase().includes("without silver capping"))
                      .map(v => (
                        <option key={v.node.id} value={v.node.id}>
                          {v.node.title} - ₹{v.node.price.amount}
                        </option>
                    ))}
                  </select>
                )}

              <div className="action-row">
                <div className="quantity-section">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="quantity-button"
                  >
                    –
                  </button>

                  <span className="qty-value">{quantity}</span>

                  <button
                    type="button"
                    onClick={() => setQuantity(q => q + 1)}
                    className="quantity-button"
                  >
                    +
                  </button>
                </div>

                <button onClick={handleAdd}
                  className="add-button">
                  Add
                </button>
                </div>
            </div>

           {/* <div className="yantra-container">
              <div className="yantra-heading">
                  <h3 style={{ margin: "5px" }}>Choose Yantra:</h3>
                  <span className="yantra-sub-heading">(Optional)</span>
                </div>
              <div className="yantra-section">
                {yantras.map(({ node }) => (
                  <div
                    key={node.id}
                    className="yantra-div"
                    onClick={() => setSelectedYantra(node)}
                  >
                    
                    <div
                      style={{
                        border:
                          selectedYantra?.id === node.id
                            ? "3px solid #212862"
                            : "1px solid #ddd",
                        borderRadius: "10px"
                      }}
                    >
                      <img
                        src={node.images.edges[0]?.node.url || "/placeholder.jpg"}
                        alt={node.title}
                        className="yantra-image"
                      />
                    </div>

                    <div class="yantra-details">
                      <p>{node.title}</p>
                      <p>Rs. {node.variants.edges[0].node.price.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>*/}

          <div className="yantra-container" style={{ position: "relative", width: "300px" }}>
            <div className="yantra-heading">
              <h3 style={{ margin: "5px" }}>Choose Yantra:</h3>
              <span className="yantra-sub-heading">(Optional)</span>
            </div>

            <div className="custom-dropdown">
              {/* Dropdown button */}
              <button
                className="dropdown-button"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  textAlign: "left",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {selectedYantra ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                      src={selectedYantra.images.edges[0]?.node.url || "/placeholder.jpg"}
                      alt={selectedYantra.title}
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <span>
                      {selectedYantra.title} - Rs. {selectedYantra.variants.edges[0].node.price.amount}
                    </span>
                  </div>
                ) : (
                  "Select Yantra "
                )}
              </button>

              {/* Dropdown options */}
              {isOpen && (
                <div
                  className="dropdown-options"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    background: "#fff",
                    zIndex: 1000,
                  }}
                >
                  {/* Default "Select Yantra" option */}
                  <div
                    key="default"
                    className="dropdown-option"
                    onClick={() => handleSelect(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "5px 10px",
                      cursor: "pointer",
                      borderBottom: "1px solid #eee",
                      fontStyle: "italic",
                      color: "#777",
                    }}
                  >
                    Select Yantra
                  </div>

                  {/* Actual Yantra options */}
                  {yantras.map(({ node }) => (
                    <div
                      key={node.id}
                      className="dropdown-option"
                      onClick={() => handleSelect(node)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "5px 10px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                        background: selectedYantra?.id === node.id ? "#f0f0f0" : "#fff",
                      }}
                    >
                      <img
                        src={node.images.edges[0]?.node.url || "/placeholder.jpg"}
                        alt={node.title}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>{node.title}</span>
                        <span style={{ fontSize: "12px", color: "#555" }}>Rs. {parseFloat(node.variants.edges[0].node.price.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

            {(selectedThread || selectedChain || selectedCap || selectedYantra) && (
              <>
                <h3>Accessories:</h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {selectedThread && <li style={{ marginBottom: "10px"}}> <b> Thread: </b> {selectedThread}</li>}

                  {(selectedMalaVariantId || selectedChain) && (
                    <li style={{ marginBottom: "10px" }}>
                      <b>Mala Type:</b>{" "}
                      {selectedMalaVariantId
                        ? // Case 1: design2b → use Mala variant
                          (() => {
                            const malaVariant = options.chains
                              .flatMap((chain) => chain.node.variants.edges.map((v) => v.node))
                              .find((v) => v.id === selectedMalaVariantId);
                            return `${malaVariant?.title || ""} (+₹${parseFloat(
                              malaVariant?.price.amount || 0
                            ).toFixed(2)})`;
                          })()
                        : // Case 2: other designs → just show Mala product title (not variant)
                          `${selectedChain.title} (+₹${parseFloat(
                            selectedChain.variants.edges[0].node.price.amount || 0
                          ).toFixed(2)})`}
                    </li>
                  )}

                  {selectedCap && selectedCapVariant && (
                    <li style={{ marginBottom: "10px"}}>
                      <b> Cap: </b> {selectedCapVariant.title} (+₹
                      {parseFloat(selectedCapVariant.price.amount).toFixed(2)} × {totalBeads} = ₹
                      {capPrice.toFixed(2)})
                    </li>
                  )}

                  {selectedYantra && (
                    <li style={{ marginBottom: "10px" }}>
                      <b> Yantra: </b> {selectedYantra.title} (+₹
                      {parseFloat(selectedYantra.variants.edges[0].node.price.amount).toFixed(2)})

                      <button
                        onClick={handleRemoveYantra}
                        className="remove-button"
                      >
                        Remove
                      </button>
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
