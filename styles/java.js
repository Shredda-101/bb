
(function () {
  const items = [
    {
      name: "Apples",
      image: "../images/apples.jpg",
      prices: {
        Shoprite: "R20",
        "Pick n Pay": "R22",
        Woolworths: "R25",
        Checkers: "R21",
      },
    },
    {
      name: "Bananas",
      image: "../images/bananas.jpg",
      prices: {
        Shoprite: "R15",
        "Pick n Pay": "R14",
        Woolworths: "R18",
        Checkers: "R16",
      },
    },
    {
      name: "Bread",
      image: "../images/bread.jpg",
      prices: {
        Shoprite: "R12",
        "Pick n Pay": "R13",
        Woolworths: "R16",
        Checkers: "R12",
      },
    },
    {
      name: "Milk",
      image: "../images/milk.jpg",
      prices: {
        Shoprite: "R18",
        "Pick n Pay": "R20",
        Woolworths: "R22",
        Checkers: "R19",
      },
    },
    {
      name: "Eggs",
      image: "../images/eggs.jpg",
      prices: {
        Shoprite: "R30",
        "Pick n Pay": "R28",
        Woolworths: "R35",
        Checkers: "R32",
      },
    },
    {
      name: "Rice",
      image: "../images/rice.jpg",
      prices: {
        Shoprite: "R50",
        "Pick n Pay": "R52",
        Woolworths: "R55",
        Checkers: "R51",
      },
    },
    {
      name: "Wors",
      image: "../images/wors.jpg",
      prices: {
        Shoprite: "R80",
        "Pick n Pay": "R85",
        Woolworths: "R95",
        Checkers: "R82",
      },
    },
    {
      name: "Tomatoes",
      image: "../images/tomatoes.jpg",
      prices: {
        Shoprite: "R25",
        "Pick n Pay": "R24",
        Woolworths: "R28",
        Checkers: "R26",
      },
    },
    {
      name: "Potatoes",
      image: "../images/potatoes.jpg",
      prices: {
        Shoprite: "R40",
        "Pick n Pay": "R42",
        Woolworths: "R48",
        Checkers: "R41",
      },
    },
    {
      name: "Cheese",
      image: "../images/cheese.jpg",
      prices: {
        Shoprite: "R60",
        "Pick n Pay": "R62",
        Woolworths: "R70",
        Checkers: "R65",
      },
    },
  ];

  function lowestPriceNum(prices) {
    const vals = Object.values(prices).map(
      (p) => parseFloat(p.replace(/[^0-9.]/g, "")) || Infinity
    );
    const min = Math.min.apply(null, vals);
    return isFinite(min) ? min : 0;
  }
  function formatR(val) {
    return val === "N/A"
      ? "N/A"
      : "R" + Number(val).toFixed(2).replace(".00", "");
  }

  /* product modal helpers */
  const modal = document.getElementById
    ? document.getElementById("productModal")
    : null;
  function openModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    const pmBody = document.getElementById("pmBody");
    if (pmBody) pmBody.innerHTML = "";
  }
  document.addEventListener("click", (e) => {
    if (e.target && e.target.matches("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  function showProductDetail(item) {
    const pmBody = document.getElementById("pmBody");
    if (!pmBody) return;
    const priceEntries = Object.entries(item.prices).map(
      ([store, priceStr]) => {
        const num = parseFloat(priceStr.replace(/[^0-9.]/g, "")) || 0;
        return { store, priceStr, num };
      }
    );
    const minVal = Math.min(...priceEntries.map((p) => p.num));
    let rows =
      '<table class="pm-prices"><thead><tr><th>Retailer</th><th>Price</th></tr></thead><tbody>';
    priceEntries.forEach((p) => {
      rows += `<tr class="${p.num === minVal ? "lowest" : ""}"><td>${
        p.store
      }</td><td>${formatR(p.num)}</td></tr>`;
    });
    rows += "</tbody></table>";

    pmBody.innerHTML = `
      <div class="pm-left">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="pm-right">
        <div class="pm-title">${item.name}</div>
        <div class="pm-prices">${rows}</div>
        <div class="pm-actions">
          <button class="btn-add">Add lowest to cart</button>
          <button class="btn-close" data-close>Close</button>
        </div>
      </div>
    `;

    const addBtn = pmBody.querySelector(".btn-add");
    addBtn.addEventListener("click", () => {
      const lowestEntry = priceEntries.reduce((a, b) =>
        a.num <= b.num ? a : b
      );
      const cart = JSON.parse(localStorage.getItem("bb_cart") || "[]");
      cart.push({
        name: item.name,
        image: item.image,
        price: formatR(lowestEntry.num),
        store: lowestEntry.store,
      });
      localStorage.setItem("bb_cart", JSON.stringify(cart));
      addBtn.textContent = "Added";
      setTimeout(() => (addBtn.textContent = "Add lowest to cart"), 900);
    });

    openModal();
  }

  // render grid with optional selectedShop parameter
  function renderExploreGrid(filter = "", selectedShop = "All") {
    const grid = document.getElementById("exploreGrid");
    const resultsCount = document.getElementById("resultsCount");
    if (!grid) return;
    grid.innerHTML = "";
    const query = (filter || "").toLowerCase().trim();
    const filtered = items.filter((it) =>
      it.name.toLowerCase().includes(query)
    );
    if (resultsCount) resultsCount.textContent = `${filtered.length} item(s)`;
    if (filtered.length === 0) {
      grid.innerHTML = "<p>No items match your search.</p>";
      return;
    }

    const favs = JSON.parse(localStorage.getItem("bb_favs") || "[]");

    filtered.forEach((it) => {
      // decide displayed price based on selectedShop
      let displayNum = 0,
        displayStr = "N/A",
        shopLabel = "";
      if (selectedShop && selectedShop !== "All") {
        shopLabel = selectedShop;
        const p = it.prices[selectedShop];
        if (p) {
          displayNum = parseFloat(p.replace(/[^0-9.]/g, "")) || 0;
          displayStr = formatR(displayNum);
        } else {
          displayNum = 0;
          displayStr = "N/A";
        }
      } else {
        // show lowest price and shop label
        const entries = Object.entries(it.prices).map(([s, p]) => ({
          s,
          num: parseFloat(p.replace(/[^0-9.]/g, "")) || Infinity,
        }));
        const min = Math.min(...entries.map((e) => e.num));
        const lowest = entries.find((e) => e.num === min);
        displayNum = isFinite(min) ? min : 0;
        displayStr = formatR(displayNum);
        shopLabel = lowest ? lowest.s : Object.keys(it.prices)[0];
        shopLabel = `Lowest: ${shopLabel}`;
      }

      // compute orig/save if we have a numeric price
      const orig =
        displayNum > 0 ? Math.round(displayNum * 1.15 * 100) / 100 : null;
      const save = orig ? Math.round((orig - displayNum) * 100) / 100 : null;

      const card = document.createElement("div");
      card.className = "item-card";
      card.innerHTML = `
        <div class="fav-toggle" title="Toggle favorite" role="button" aria-label="Favorite">${
          favs.includes(it.name) ? "❤" : "♡"
        }</div>
        <div class="shop-label">${shopLabel}</div>
        <img src="${it.image}" alt="${it.name}" loading="lazy">
        <h3>${it.name}</h3>
        <div class="price-row" style="margin-top:auto;">
          <div>
            <span class="current-price">${displayStr}</span>
            ${orig ? `<span class="orig-price">${formatR(orig)}</span>` : ""}
          </div>
          <div>
            ${
              save
                ? `<span class="save-badge">Save ${formatR(save)}</span>`
                : ""
            }
          </div>
        </div>
        <button class="add-to-cart">Add to cart</button>
      `;

      const favBtn = card.querySelector(".fav-toggle");
      favBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const currentFavs = JSON.parse(localStorage.getItem("bb_favs") || "[]");
        const i = currentFavs.indexOf(it.name);
        if (i === -1) {
          currentFavs.push(it.name);
          favBtn.textContent = "❤";
        } else {
          currentFavs.splice(i, 1);
          favBtn.textContent = "♡";
        }
        localStorage.setItem("bb_favs", JSON.stringify(currentFavs));
      });

      const btn = card.querySelector(".add-to-cart");
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const priceToAdd =
          displayNum > 0 ? displayNum : lowestPriceNum(it.prices);
        const cart = JSON.parse(localStorage.getItem("bb_cart") || "[]");
        cart.push({
          name: it.name,
          image: it.image,
          price: formatR(priceToAdd),
        });
        localStorage.setItem("bb_cart", JSON.stringify(cart));
        btn.textContent = "Added";
        setTimeout(() => (btn.textContent = "Add to cart"), 900);
      });

      card.addEventListener("click", () => showProductDetail(it));

      grid.appendChild(card);
    });
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function onSearchTrigger(q, shop) {
    const isExplore =
      window.location.pathname.toLowerCase().endsWith("/pages/explore.html") ||
      window.location.pathname.toLowerCase().endsWith("explore.html");
    if (isExplore) {
      renderExploreGrid(q, shop);
    } else {
      let url = "/pages/explore.html";
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (shop && shop !== "All") params.set("shop", shop);
      const qs = params.toString();
      if (qs) url += "?" + qs;
      window.location.href = url;
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector(".search-bar input");
    const searchBtn = document.querySelector(".search-bar button");
    const shopSelect = document.getElementById("shopSelect");

    const initialQ = getQueryParam("q");
    const initialShop = getQueryParam("shop") || "All";
    if (searchInput && initialQ) searchInput.value = initialQ;
    if (shopSelect) shopSelect.value = initialShop;

    renderExploreGrid(initialQ, initialShop);

    if (searchBtn && searchInput) {
      searchBtn.addEventListener("click", function () {
        onSearchTrigger(
          searchInput.value || "",
          shopSelect ? shopSelect.value : "All"
        );
      });
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          onSearchTrigger(
            searchInput.value || "",
            shopSelect ? shopSelect.value : "All"
          );
        }
      });
    }

    if (shopSelect) {
      shopSelect.addEventListener("change", function () {
        renderExploreGrid(
          searchInput ? searchInput.value : "",
          shopSelect.value
        );
        // update URL without reloading
        const params = new URLSearchParams(window.location.search);
        if (searchInput && searchInput.value)
          params.set("q", searchInput.value);
        else params.delete("q");
        if (shopSelect.value && shopSelect.value !== "All")
          params.set("shop", shopSelect.value);
        else params.delete("shop");
        const newUrl =
          window.location.pathname +
          (params.toString() ? "?" + params.toString() : "");
        history.replaceState(null, "", newUrl);
      });
    }

    // render cart items on cart page (unchanged)
    const cartItemsEl = document.getElementById("cartItems");
    if (cartItemsEl) {
      const cart = JSON.parse(localStorage.getItem("bb_cart") || "[]");
      if (cart.length === 0) {
        cartItemsEl.innerHTML = "<p>Your cart is empty.</p>";
      } else {
        cartItemsEl.innerHTML = "";
        cart.forEach((c, idx) => {
          const div = document.createElement("div");
          div.className = "cart-item";
          div.innerHTML = `
            <img src="${c.image}" alt="${c.name}">
            <span>${c.name} — ${c.price} ${
            c.store ? " (" + c.store + ")" : ""
          }</span>
            <button data-idx="${idx}">Remove</button>
          `;
          div.querySelector("button").addEventListener("click", function () {
            const i = Number(this.getAttribute("data-idx"));
            const current = JSON.parse(localStorage.getItem("bb_cart") || "[]");
            current.splice(i, 1);
            localStorage.setItem("bb_cart", JSON.stringify(current));
            if (cartItemsEl) location.reload();
          });
          cartItemsEl.appendChild(div);
        });
      }
    }
  });
})();
