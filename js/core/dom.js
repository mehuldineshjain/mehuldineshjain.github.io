/* ============================================================
   PORTFOLIO — core/dom.js
   Tiny vanilla DOM helper, shared by every card builder.
   Exposed on the PB (Portfolio Builders) namespace so the
   no-build <script> setup can split builders across files.
   (React migration: drop this; use JSX instead.)
   ============================================================ */
(function (g) {
  "use strict";
  const PB = (g.PB = g.PB || {});

  // el("div", { class: "x", text: "hi" }, [childNode, "string"])
  PB.el = function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (attrs[k] == null) continue;
        if (k === "class") node.className = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  };
})(window);
