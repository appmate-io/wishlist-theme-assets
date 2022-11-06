import { html } from "https://cdn.jsdelivr.net/npm/lit@2.3.0/+esm";
import { WishlistElement } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.14.7";
import { LiquidElement } from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.14.7/liquid.js";
import {
  ProductFormController,
  Icon,
} from "https://cdn.jsdelivr.net/npm/@appmate/wishlist@4.14.7/components/all.js";

export class WishlistPage extends LiquidElement {
  getStateConfig() {
    return {
      wishlist: "all",
    };
  }

  updateState(state) {
    const wishlistId = state.wishlist && state.wishlist.id;

    if (wishlistId === "mine" && this.dataset.wishlistId !== "mine") {
      this.dataset.wishlistId = "mine";
    } else {
      super.updateState(state);
    }
  }

  getLiquidTemplate() {
    return `
      <section class="wk-page">
        <div class="wk-header">
          <h1 class="wk-title">{{ 'wishlist_page.title' | t }}</h1>
          {%- if wishlist.id -%}
            {%- unless wishlist.num_items == 0 -%}
              <div class="wk-controls">
                <wishlist-share 
                  data-wishlist-id="{{ wishlist.id }}"
                  layout="icon-and-text"
                ></wishlist-share>
                {% comment %}
                <wishlist-buy-all 
                  data-wishlist-id="{{ wishlist.id }}"
                  layout="icon-and-text"
                ></wishlist-buy-all>
                {% endcomment %}
              </div>
            {%- endunless -%}
          {%- endif -%}
        </div>
        <div class="wk-body">
          {%- if wishlist.num_items == 0 -%}
            <div class="wk-wishlist-empty-note">
              <p>{{ 'wishlist_page.wishlist_empty_callout_html' | t }}</p>
            </div>
          {%- else -%}
            {%- unless customer or wishlist.is_mine == false or shop.customer_accounts_enabled == false -%}
              <div class="wk-login-note">
                <p>{{ 'wishlist_page.login_callout_html' | t: login_url: routes.account_login_url, register_url: routes.account_register_url }}</p>
              </div>
            {%- endunless -%}
            <wk-grid>
              {%- assign wishlist_items = wishlist.items | reverse -%}
              {%- for wishlist_item in wishlist_items -%}
                <wishlist-product-card 
                  part="product"
                  data-wishlist-id="{{ wishlist.id }}"
                  data-wishlist-item-id="{{ wishlist_item.id }}"
                ></wishlist-product-card>
              {%- endfor -%}
            </wk-grid>
          </div>
        {% endif %}
      </section>
    `;
  }
}

customElements.define("wishlist-page", WishlistPage);

export class WishlistProductCard extends LiquidElement {
  constructor() {
    super();
    this.form = new ProductFormController(this, {
      app: this.app,
    });
  }

  updateState(state) {
    if (state.wishlistItem) {
      this.form.setProduct({
        product: state.wishlistItem.product,
        selectedVariantId: state.wishlistItem.selectedVariantId,
        autoSelect: this.app.settings.autoSelectVariantOnInit,
      });
    }

    super.updateState(state);
  }

  getStateConfig() {
    return {
      loading: "lazy",
      wishlist: "minimal",
      wishlistItem: true,
    };
  }

  getLiquidData() {
    return {
      form: this.form.state,
    };
  }

  getEventConfig() {
    return {
      "change .wk-form": async (event) => {
        this.form.changeOption({
          input: event.target,
          autoSelect: this.app.settings.autoSelectVariantOnChange,
        });

        if (this.form.state.selectedVariant && this.state.wishlist.isMine) {
          await this.app.updateWishlistItem({
            wishlistItemId: this.state.wishlistItem.id,
            changes: {
              variantId: this.form.state.selectedVariant.id,
            },
          });
        }
      },
      "submit .wk-form": async (event) => {
        event.preventDefault();

        await this.form.addToCart({
          wishlistId: this.state.wishlist.id,
          wishlistItemId: this.state.wishlistItem.id,
        });
      },
    };
  }

  getLiquidTemplate() {
    return `
      {%- assign container_id = "product-card-" | append: wishlist_item.id -%}
      {%- if wishlist_item.loading -%}
        <div id="{{ container_id }}" class="wk-product-card">
          <div class="wk-image">
            <wk-icon icon="spinner" class="wk-loading-spinner"></wk-icon>
          </div>  
        </div>
      {%- elsif wishlist_item.hidden -%}
        <div id="{{ container_id }}" class="wk-product-card">
          <div class="wk-image-link">
            <img class="wk-image" src="{{ product | image_url: width: 1000, height: 1000 }}">
          </div>
          <div class="wk-meta">
            <span class="wk-vendor">&nbsp;</span>
            <span class="wk-product-title">{{ 'wishlist_page.product_removed_html' | t }}</span>
          </div>
          {%- if wishlist.is_mine -%}
            <remove-button
              data-wishlist-item-id="{{ wishlist_item.id }}"
              layout="icon-only"
              floating='{"reference": "#{{ container_id }} .wk-image", "position": {"placement": "top-end", "inset": true}}'
            ></remove-button>
          {%- endif -%}
        </div>
      {%- else -%}
        {%- assign product = wishlist_item.product -%}
        {%- assign variant = form.selected_variant -%}
        {%- if product.has_only_default_variant -%}
          {%- assign variant = product.variants | first -%}
        {%- endif -%}

        {%- if variant.price < variant.compare_at_price -%}
          {%- assign container_class = "wk-product-card wk-sale" -%}
        {%- else %}
          {%- assign container_class = "wk-product-card" -%}
        {%- endif -%}

        <div id="{{ container_id }}" class="{{ container_class }}">
          <a href="{{ product | variant_url }}" class="wk-image-link">
            <img class="wk-image" src="{{ product | image_url: width: 1000, height: 1000 }}">
          </a>
          <div class="wk-meta">
            <span class="wk-vendor">{{ product.vendor }}</span>
            <a class="wk-product-title" href="{{ product | variant_url }}">{{ product.title }}</a>
            <div class="wk-price">
              {%- if variant -%}
                <span class="wk-current-price">{{ variant.price | money }}</span>
                <span class="wk-compare-price">{{ variant.compare_at_price | money }}</span>
              {%- else -%}
                {%- assign from_price = product.price_min | money -%}
                <span class="wk-current-price">{{ 'wishlist_product.from_price_html' | t: price: from_price }}</span>
              {%- endif -%}
            </div>
          </div>
          <form 
            class="wk-form"
            method="post" 
            action="{{ routes.cart_add_url }}" 
            data-wishlist-id="{{ wishlist.id }}"
            data-wishlist-item-id="{{ wishlist_item.id }}"
          >
            <input name="id" value="{{ variant.id }}" type="hidden">
            {%- unless product.has_only_default_variant -%}
              <div class="wk-variants">
                {%- for option in form.options_with_values -%}
                  <wk-swatches
                    name="options[{{ option.name | escape }}]"
                    label="{{ option.name }}"
                  >
                    {%- for value in option.values -%}
                      {%- assign soldout = option.soldout_values contains value -%}
                      {%- assign unavailable = option.unavailable_values contains value -%}
                      {%- assign selected = option.selected_value == value -%}
              
                      {%- liquid
                        assign color_name = null
                        assign color_file_name = null
                        assign color_image = null
                        if option.name == "Colour"
                          assign color_name = value | handle
                          assign color_image = product.id | append: '_' | append: color_name | append: '.png' | file_img_url: "50x50"
                        endif
                      -%}
              
                      {%- unless unavailable -%}
                        <wk-swatch 
                          label="{{ value }}"
                          value="{{ value | escape }}"
                          {%- if selected %} selected{%- endif -%}
                          {%- if unavailable %} disabled{%- endif -%}
                          {%- if soldout %} unavailable{%- endif -%}
                          {%- if color_name %} color="{{ color_name }}"{%- endif -%}
                          {%- if color_image %} image="{{ color_image }}"{%- endif -%}
                        ></wk-swatch>
                      {%- endunless -%}
                    {%- endfor -%}
                  </wk-swatches>
                {%- endfor -%}
              </div>
            {%- endunless -%}
            <div class="wk-quantity">
              <label class="wk-quantity-label">{{ 'wishlist_product.quantity' | t }}</label>
              <input class="wk-quantity-input" type="number" name="quantity" value="1" min="1">
            </div>
            <button 
              type="submit" 
              class="wk-submit-button"
              data-wishlist-item-id="{{ product.wishlist_item_id }}"
              {%- unless variant.available -%}disabled{%- endunless -%}
            >
              <span class="wk-submit-label">
                {%- if variant.available -%}
                  {{ 'wishlist_product.add_to_cart' | t }}
                {%- elsif variant == null and form.has_selection -%}
                  {{ 'wishlist_product.unavailable' | t }}
                {%- elsif variant == null -%}
                  {{ 'wishlist_product.select_variant' | t }}
                {%- else -%}
                  {{ 'wishlist_product.sold_out' | t }}
                {%- endif -%}
              </span>
              <wk-icon icon="spinner" class="wk-submit-spinner"></wk-icon>
            </button>
          </form>
          {%- if wishlist.is_mine -%}
            <remove-button
              data-wishlist-item-id="{{ wishlist_item.id }}"
              layout="icon-only"
              floating='{"reference": "#{{ container_id }} .wk-image", "position": {"placement": "top-end", "inset": true}}'
            ></remove-button>
          {%- else -%}
            <wishlist-button 
              data-product-id="{{ product.id }}"
              data-variant-id="{{ variant.id }}"
              layout="icon-only"
              floating='{"reference": "#{{ container_id }} .wk-image", "position": {"placement": "top-end", "inset": true}}'
            ></wishlist-button>
          {%- endif -%}

        </div>
      {%- endif -%}
    `;
  }
}

customElements.define("wishlist-product-card", WishlistProductCard);

export class WishlistButton extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      productInfo: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  appReadyCallback() {
    this.app.events.subscribe("wk:product:change-variant:success", (event) => {
      if (this.dataset.productHandle === event.data.productHandle) {
        const wishlistItemId = this.state.productInfo
          ? this.state.productInfo.wishlistItemId
          : undefined;

        const currentVariantId = this.state.productInfo
          ? this.state.productInfo.variantId
          : undefined;

        if (wishlistItemId && !currentVariantId) {
          this.app.updateWishlistItem({
            wishlistItemId,
            changes: {
              variantId: event.data.variantId,
            },
          });
        }

        this.dataset.variantId = event.data.variantId;
      }
    });
  }

  handleClick() {
    if (this.state.productInfo.inWishlist) {
      return this.app.removeWishlistItem(this.state.productInfo);
    } else {
      return this.app.addWishlistItem(this.state.productInfo);
    }
  }

  render() {
    const inWishlist =
      this.state.productInfo && this.state.productInfo.inWishlist;

    const text = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.product_in_wishlist"
        : "wishlist_buttons.add_product"
    );

    const hint = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.remove_product"
        : "wishlist_buttons.add_product"
    );

    return html`
      <wk-button
        .text=${text}
        .hint=${hint}
        .selected=${inWishlist}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"wishlist"}
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-button", WishlistButton);

export class RemoveButton extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
    };
  }

  getEventConfig() {
    return {
      "click .wk-button": this.handleClick,
    };
  }

  handleClick() {
    return this.app.removeWishlistItem({
      wishlistItemId: this.dataset.wishlistItemId,
    });
  }

  render() {
    const text = this.getTranslation("wishlist_buttons.remove_product");
    const hint = this.getTranslation("wishlist_buttons.remove_product");

    return html`
      <wk-button
        .text=${text}
        .hint=${hint}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"remove"}
      ></wk-button>
    `;
  }
}

customElements.define("remove-button", RemoveButton);

export class WishlistLink extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
      badgeLayout: { type: String },
      badgeParentheses: { type: Boolean },
      badgeHiddenIfEmpty: { type: Boolean },
      badgeFloating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      wishlist: "minimal",
    };
  }

  getWishlistUrl() {
    if (this.app.settings.loginRequired) {
      return this.app.routes.accountLoginUrl;
    }
    return this.app.routes.wishlistUrl;
  }

  render() {
    const wishlistUrl = this.getWishlistUrl();
    const text = this.getTranslation("wishlist_buttons.wishlist");
    const hint = this.getTranslation("wishlist_buttons.view_wishlist");

    return html`
      <wk-button
        .href=${wishlistUrl}
        .text=${text}
        .hint=${hint}
        .selected=${this.state.wishlist.numItems > 0}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"wishlist"}
        .badgeText=${this.state.wishlist.numItems}
        .badgeLayout=${this.badgeLayout}
        .badgeParentheses=${this.badgeParentheses}
        .badgeHiddenIfEmpty=${this.badgeHiddenIfEmpty}
        .badgeFloating=${this.badgeFloating}
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-link", WishlistLink);

export class WishlistShare extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      floating: { type: Object },
      linkCopied: { type: Boolean, state: true },
    };
  }

  getStateConfig() {
    return {
      wishlist: "minimal",
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    const { clipboard } = await this.app.shareWishlist({
      wishlistId: this.state.wishlist.publicId,
      title: this.getTranslation("wishlist_share.share_title"),
      text: this.getTranslation("wishlist_share.share_message"),
    });

    if (clipboard) {
      this.linkCopied = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      this.linkCopied = false;
    }
  }

  render() {
    const text = this.getTranslation(
      this.linkCopied
        ? "wishlist_share.link_copied"
        : "wishlist_share.button_label"
    );

    return html`
      <wk-button
        .text=${text}
        .hint=${text}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .floating=${this.floating}
        .icon="${"share"}"
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-share", WishlistShare);

export class WishlistBuyAll extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      floating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      wishlist: "minimal",
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    await this.app.addAllToCart({
      wishlistId: this.state.wishlist.id,
    });
  }

  render() {
    const text = this.getTranslation("wishlist_page.add_all_to_cart");

    return html`
      <wk-button
        .text=${text}
        .hint=${text}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .floating=${this.floating}
        .icon="${"buy"}"
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-buy-all", WishlistBuyAll);

export class WishlistSaveForLater extends WishlistElement {
  static get properties() {
    return {
      layout: { type: String },
      alignment: { type: String },
      outline: { type: Boolean },
      fullWidth: { type: Boolean },
      floating: { type: Object },
    };
  }

  getStateConfig() {
    return {
      productInfo: true,
    };
  }

  getEventConfig() {
    return {
      "click wk-button": this.handleClick,
    };
  }

  async handleClick() {
    if (!this.state.productInfo.inWishlist) {
      await this.app.addWishlistItem(this.state.productInfo);
      this.closest(".cart-item").querySelector("cart-remove-button a").click();
    }
  }

  render() {
    const inWishlist =
      this.state.productInfo && this.state.productInfo.inWishlist;

    const text = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.product_in_wishlist"
        : "wishlist_buttons.save_for_later"
    );

    const hint = this.getTranslation(
      inWishlist
        ? "wishlist_buttons.product_in_wishlist"
        : "wishlist_buttons.save_for_later"
    );

    return html`
      <wk-button
        .text=${text}
        .hint=${hint}
        .selected=${inWishlist}
        .disabled=${inWishlist}
        .layout=${this.layout}
        .alignment=${this.alignment}
        .outline=${this.outline}
        .fullWidth=${this.fullWidth}
        .floating=${this.floating}
        .icon=${"wishlist"}
      ></wk-button>
    `;
  }
}

customElements.define("wishlist-save-for-later", WishlistSaveForLater);

Icon.setIcons({
  wishlist: `
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 64 64">
      <path d="M32.012,59.616c-1.119-.521-2.365-1.141-3.707-1.859a79.264,79.264,0,0,1-11.694-7.614C6.316,42,.266,32.6.254,22.076,0.244,12.358,7.871,4.506,17.232,4.5a16.661,16.661,0,0,1,11.891,4.99l2.837,2.889,2.827-2.9a16.639,16.639,0,0,1,11.874-5.02h0c9.368-.01,17.008,7.815,17.021,17.539,0.015,10.533-6.022,19.96-16.312,28.128a79.314,79.314,0,0,1-11.661,7.63C34.369,58.472,33.127,59.094,32.012,59.616Z"/>
    </svg>
  `,
  remove: `
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 64 64">
      <path d="M0.309,0.309a0.9,0.9,0,0,1,1.268,0L63.691,62.423a0.9,0.9,0,0,1-1.268,1.268L0.309,1.577A0.9,0.9,0,0,1,.309.309Z"/>
      <path d="M63.691,0.309a0.9,0.9,0,0,1,0,1.268L1.577,63.691A0.9,0.9,0,0,1,.309,62.423L62.423,0.309A0.9,0.9,0,0,1,63.691.309Z"/>
    </svg>
  `,
  share: `
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 122.88 122.88">
      <path d="M60.54,34.07A7.65,7.65,0,0,1,49.72,23.25l13-12.95a35.38,35.38,0,0,1,49.91,0l.07.08a35.37,35.37,0,0,1-.07,49.83l-13,12.95A7.65,7.65,0,0,1,88.81,62.34l13-13a20.08,20.08,0,0,0,0-28.23l-.11-.11a20.08,20.08,0,0,0-28.2.07l-12.95,13Zm14,3.16A7.65,7.65,0,0,1,85.31,48.05L48.05,85.31A7.65,7.65,0,0,1,37.23,74.5L74.5,37.23ZM62.1,89.05A7.65,7.65,0,0,1,72.91,99.87l-12.7,12.71a35.37,35.37,0,0,1-49.76.14l-.28-.27a35.38,35.38,0,0,1,.13-49.78L23,50A7.65,7.65,0,1,1,33.83,60.78L21.12,73.49a20.09,20.09,0,0,0,0,28.25l0,0a20.07,20.07,0,0,0,28.27,0L62.1,89.05Z"/>
    </svg>
  `,
  buy: `
    <svg viewBox="0 0 490.399 490.399">
      <path d="M490.086,464.75l-28.1-294.4c-1-10.4-10.4-18.7-20.8-18.7h-63.5v-17.7c0-72.8-59.3-133.2-133.2-133.2
        c-72.8,0-133.2,59.3-133.2,133.2v17.7h-61.3c-11.4,0-19.8,8.3-20.8,18.7l-29.1,297.5c-1.4,17.7,14.6,21.8,20.8,21.8h449.4
        C494.486,488.25,490.086,465.85,490.086,464.75z M152.986,133.95c0-51,41.6-92.6,92.6-92.6s92.6,41.6,92.6,92.6v17.7h-185.2
        L152.986,133.95L152.986,133.95z M43.786,449.15l25-257h42.7v33.3c0,11.4,9.4,20.8,20.8,20.8c11.4,0,20.8-9.4,20.8-20.8v-33.3
        h185.2v33.3c0,11.4,9.4,20.8,20.8,20.8c10.4,0,19.8-9.4,18.7-20.8v-33.3h44.7l25,257H43.786z" />
      <path d="M306.986,314.95h-32.3c-8.3,0-14.6-6.2-14.6-14.6v-31.2c0-8.3-6.2-14.6-14.6-14.6s-14.6,6.2-14.6,14.6v31.2
        c0,8.3-6.2,14.6-14.6,14.6h-32.3c-8.3,0-14.6,6.2-14.6,14.6c0,0-0.7,15.1,14.6,15.6h32.5c8.3,0,14.6,6.2,14.6,14.6v31.2
        c0,8.3,6.2,14.6,14.6,14.6c8.4,0,14.6-6.2,14.6-14.6v-31.2c0-8.3,6.2-14.6,14.6-14.6h32.3c15.7-1.3,14.6-15.6,14.6-15.6
        C321.586,321.15,315.286,314.95,306.986,314.95z" />
    </svg>
  `,
  caret: `
    <svg aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 24 24">
      <path d="M6 9l6 6 6-6" />
    </svg>
  `,
  spinner: `
    <svg class="wk-spinner-svg" aria-hidden="true" focusable="false" role="presentation" viewBox="0 0 66 66">
      <circle class="wk-spinner-circle" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
    </svg>
  `,
});
