# Headless components

```js
// Header link
theme.watch(
  {
    selector: `.wk-wishlist-link`,
  },
  (target) => {
    theme.createHeadlessComponent("wishlist-link", {
      host: target,
    });
  }
);

// Product page
theme.watch(
  {
    selector: `.wk-wishlist-button`,
    pageType: ["product"],
  },
  (target) => {
    theme.createHeadlessComponent("wishlist-button", {
      host: target,
      dataset: {
        productHandle: theme.getProductHandle(document.location.href),
        variantId: theme.getVariantId(document.location.href),
      },
    });
  }
);

export class WishlistLinkHeadless extends WishlistElementHeadless {
  getStateConfig() {
    return {
      wishlist: true,
    };
  }

  getWishlistUrl() {
    if (this.app.settings.loginRequired) {
      return this.app.routes.accountLoginUrl;
    }
    return this.app.routes.wishlistUrl;
  }

  updated() {
    const numItems = this.wishlist ? this.wishlist.numItems : 0;

    this.host.href = this.getWishlistUrl();
    this.host.classList.toggle("wk-selected", numItems > 0);
  }
}

headlessElements.define("wishlist-link", WishlistLinkHeadless);

export class WishlistButtonHeadless extends WishlistElementHeadless {
  getStateConfig() {
    return {
      productInfo: true,
    };
  }

  getEventConfig() {
    return {
      click: this.handleClick,
    };
  }

  handleClick() {
    if (this.productInfo.inWishlist) {
      return this.app.removeWishlistItem(this.productInfo);
    } else {
      return this.app.addWishlistItem(this.productInfo);
    }
  }

  updated() {
    const inWishlist = this.productInfo.inWishlist;
    const text = inWishlist ? "Remove from Wishlist" : "Add to Wishlist";

    this.host.querySelector(".wk-text").innerHTML = text;
    this.host.classList.toggle("wk-selected", inWishlist);
  }
}

headlessElements.define("wishlist-button", WishlistButtonHeadless);
```
