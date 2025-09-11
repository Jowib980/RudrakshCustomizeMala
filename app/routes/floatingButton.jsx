export const loader = async () => {
  return new Response(
    `
    (function() {
      // Only show on product pages
      if (!window.location.pathname.startsWith("/products")) return;

      // Create the floating button
      var btn = document.createElement("div");
      btn.innerText = "Customize Your Mala";
      btn.style.position = "fixed";
      btn.style.bottom = "30px";
      btn.style.right = "30px";
      btn.style.backgroundColor = "#ff7f50";
      btn.style.color = "#fff";
      btn.style.padding = "12px 20px";
      btn.style.borderRadius = "10px";
      btn.style.cursor = "pointer";
      btn.style.fontWeight = "bold";
      btn.style.boxShadow = "0px 4px 12px rgba(0,0,0,0.2)";
      btn.style.zIndex = 9999;
      btn.style.transition = "all 0.3s";
      btn.onmouseenter = function() { btn.style.transform = "scale(1.05)"; };
      btn.onmouseleave = function() { btn.style.transform = "scale(1)"; };

      btn.onclick = function() {
        window.open("https://customize-mala.myshopify.com/apps/customize-mala", "_blank");
      };

      document.body.appendChild(btn);
    })();
    `,
    {
      headers: { "Content-Type": "application/javascript" },
    }
  );
};
