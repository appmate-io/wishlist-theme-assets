const templates = [
  {
    id: "wishlist-link",
    data: "wishlist",
    template: `
      <a href="{{ wishlist.url }}" class="wk-link wk-{{ wishlist.state }}" title="{{ locale.view_wishlist }}">
        <div class="wk-icon">{% include 'wishlist-icon' %}</div>
        <span class="wk-label">{{ locale.wishlist }}</span>
        <span class="wk-count">{{ wishlist.item_count }}</span>
      </a>
    `,
  },
  {
    id: "wishlist-link-li",
    data: "wishlist",
    template: `
      <li class="wishlist-link-li">
        <a href="{{ wishlist.url }}" class="wk-link wk-{{ wishlist.state }}" title="{{ locale.view_wishlist }}">
          <div class="wk-icon">{% include 'wishlist-icon' %}</div>
          <span class="wk-label">{{ locale.wishlist }}</span>
          <span class="wk-count">{{ wishlist.item_count }}</span>
        </a>
      </li>
    `,
  },
  {
    id: "wishlist-button-product",
    data: "product",
    events: {
      "click button[data-wk-add-product]": (event) => {
        const select = document.querySelector("form select[name='id']");
        WishlistKingSDK.toolkit.wk.addProduct(
          event.currentTarget.getAttribute("data-wk-add-product"),
          select ? select.value : undefined
        );
      },
      "click button[data-wk-remove-product]": (event) => {
        WishlistKingSDK.toolkit.wk.removeProduct(
          event.currentTarget.getAttribute("data-wk-remove-product")
        );
      },
    },
    template: `
      {% if product.in_wishlist %}
        {% assign btn_text = locale.in_wishlist %}
        {% assign btn_title = locale.remove_from_wishlist %}
        {% assign btn_action = 'wk-remove-product' %}
      {% else %}
        {% assign btn_text = locale.add_to_wishlist %}
        {% assign btn_title = locale.add_to_wishlist %}
        {% assign btn_action = 'wk-add-product' %}
      {% endif %}

      <button type="button" class="wk-button-product {{ btn_action }}" title="{{ btn_title }}" data-{{ btn_action }}="{{ product.id }}">
        <div class="wk-icon">{% include 'wishlist-icon' %}</div>
        <span class="wk-label">{{ btn_text }}</span>
      </button>
    `,
  },
  {
    id: "wishlist-button-collection",
    data: "product",
    template: `
      {% if product.in_wishlist %}
        {% assign btn_text = locale.in_wishlist %}
        {% assign btn_title = locale.remove_from_wishlist %}
        {% assign btn_action = 'wk-remove-product' %}
      {% else %}
        {% assign btn_text = locale.add_to_wishlist %}
        {% assign btn_title = locale.add_to_wishlist %}
        {% assign btn_action = 'wk-add-product' %}
      {% endif %}

      <button type="button" class="wk-button-collection {{ btn_action }}" title="{{ btn_title }}" data-{{ btn_action }}="{{ product.id }}">
        <div class="wk-icon">{% include 'wishlist-icon' %}</div>
        <span class="wk-label">{{ btn_text }}</span>
      </button>
    `,
  },
  {
    id: "wishlist-button-wishlist-page",
    data: "product button[data-wk-remove-item]",
    events: {
      "click button[data-wk-remove-item]": (event) => {
        WishlistKingSDK.toolkit.wk.removeItem(
          event.currentTarget.getAttribute("data-wk-remove-item")
        );
      },
    },
    template: `
      {% assign btn_text = locale.in_wishlist %}
      {% assign btn_title = locale.remove_from_wishlist %}

      <button type="button" class="wk-button-wishlist-page {{ btn_action }}" title="{{ btn_title }}" data-wk-remove-item="{{ product.wishlist_item_id }}">
        <div class="wk-icon">
          {% include 'wishlist-icon-remove' %}
        </div>
        <span class="wk-label">{{ btn_text }}</span>
      </button>
    `,
  },
  {
    id: "wishlist-collection",
    data: "wishlist",
    events: {
      "click a[data-wk-share]": (event) => {
        event.preventDefault();
        event.stopPropagation();

        WishlistKingSDK.toolkit.wk.requestWishlistSharing({
          wkShareService: event.currentTarget.getAttribute(
            "data-wk-share-service"
          ),
          wkShare: event.currentTarget.getAttribute("data-wk-share"),
          wkShareImage: event.currentTarget.getAttribute("data-wk-share-image"),
        });
      },
    },
    template: `
      <div class='wishlist-collection'>
      {% if wishlist.item_count == 0 %}
        <div class="wk-row">
          <div class="wk-span12">
            <h3 class="wk-wishlist-empty-note">{{ locale.wishlist_empty_note }}</h3>
          </div>
        </div>
      {% else %}
        {% if customer_accounts_enabled and customer == false and wishlist.read_only == false %}
          <div class="wk-row">
            <p class="wk-span12 wk-login-note">
              {{ locale.login_or_signup_note }}
            </p>
          </div>
        {% endif %}

        {% unless wishlist.read_only %}
          <h3 id="wk-share-head">{{ locale.share_wishlist }}</h3>
          <ul id="wk-share-list">
            <li>{% include 'wishlist-share-button-fb' %}</li>
            <li>{% include 'wishlist-share-button-twitter' %}</li>
            <li>{% include 'wishlist-share-button-email' %}</li>
            <li>{% include 'wishlist-share-button-link' %}</li>
            {% comment %}
            <li>{% include 'wishlist-share-button-contact' %}</li>
            {% endcomment %}
            <li id="wk-share-whatsapp">{% include 'wishlist-share-button-whatsapp' %}</li>
          </ul>
          <div id="wk-share-link-text"><span class="wk-text"></span><button class="wk-clipboard" data-clipboard-target="#wk-share-link-text .wk-text">{{ locale.copy_share_link }}</button></div>
        {% endunless %}

        <div class="wk-row">
          {% assign item_count = 0 %}
          {% assign products = wishlist.products | reverse %}
          {% for product in products %}
            {% assign item_count = item_count | plus: 1 %}
            {% unless limit and item_count > limit %}
              {% assign hide_default_title = false %}
              {% if product.variants.length == 1 and product.variants[0].title contains 'Default' %}
                {% assign hide_default_title = true %}
              {% endif %}

              {% assign variant = product.selected_or_first_available_variant %}
              {% assign items_per_row = settings.app_wk_products_per_row %}
              {% assign wk_item_width = 100 | divided_by: items_per_row %}

              <div class="wk-item-column" style="width: {{ wk_item_width }}%">
                <div class="wk-item" data-wk-item="{{ product.wishlist_item_id }}">
                  {% unless wishlist.read_only %}
                    {% include 'wishlist-button-wishlist-page' with product %}
                  {% else %}
                    {% include 'wishlist-button-collection' with product %}
                  {% endunless %}
                  <div class="wk-image">
                    <a href="{{ product | variant_url }}" class="wk-variant-link wk-content" title="{{ locale.view_product }}">
                      <img class="wk-variant-image" src="{{ product | variant_img_url: '1000x' }}" alt="{{ product.title }}" />
                    </a>
                  </div>
                  <div class="wk-product-title">
                    <a href="{{ product | variant_url }}" class="wk-variant-link" {% if settings.root_url %}style="opacity: 0;"{% endif %}>{{ product.title }}</a>
                  </div>

                  <div class="wk-purchase">
                    <span class="wk-price wk-price-preview">
                      {% if variant.price >= variant.compare_at_price %}
                      {{ variant.price | money }}
                      {% else %}
                      <span class="saleprice">{{ variant.price | money }}</span> <del>{{ variant.compare_at_price | money }}</del>
                      {% endif %}
                    </span>
                  </div>
                  {% include 'wishlist-product-form' %}
                </div>
              </div>
            {% endunless %}
          {% endfor %}
        </div>
		{% comment %}
        {% unless wishlist.read_only %}
          {% include 'wishlist-button-clear' %}
        {% endunless %}
		{% endcomment %}
      {% endif %}
      </div>
    `,
  },
  {
    id: "wishlist-product-form",
    events: {
      "render .wk-add-item-form": (form) => {
        const container = form.closest("[data-wk-item]");
        const itemId = container.getAttribute("data-wk-item");
        WishlistKingSDK.toolkit.wk.getItem(itemId).then((product) => {
          WishlistKingSDK.toolkit.wk.initProductForm(form, product, {
            // Uncomment to override default option change
            // onOptionChange: (event) => {
            //   console.log(event.dataset);
            // },
            // Uncomment to override default form submit
            // onFormSubmit: (event) => {
            //   event.preventDefault();
            //   event.stopPropagation();
            // },
          });
        });
      },
    },
    template: `
      <form
        id="wk-add-item-form-{{ product.wishlist_item_id }}"
        class="wk-add-item-form"
        action="/cart/add"
        method="post"
      >
        {% assign current_variant = product.selected_or_first_available_variant %}
        <div class="wk-product-options">
          {% unless product.has_only_default_variant %}
            {% for option in product.options_with_values %}
              <div class="js-enabled">
                <label for="Option{{ option.position }}">
                  {{ option.name }}
                </label>
                <select name="options[{{ option.name | escape }}]">
                  {% for value in option.values %}
                    <option
                      value="{{ value | escape }}"
                      {% if option.selected_value == value %}selected="selected"{% endif %}
                    >
                      {{ value }}
                    </option>
                  {% endfor %}
                </select>
              </div>
            {% endfor %}
          {% endunless %}
          <noscript>
            <select name="id">
              {% for variant in product.variants %}
                <option
                  {% if variant == current_variant %}selected="selected"{% endif %}
                  {% unless variant.available %}disabled="disabled"{% endunless %}
                  value="{{ variant.id }}"
                >
                  {{ variant.title }}
                </option>
              {% endfor %}
            </select>
          </noscript>
          {% comment %}
          <label for="Quantity">{{ locale.quantity }}</label>
          <input type="number" name="quantity" value="1" min="1">
          {% endcomment %}
        </div>
        <div class="wk-purchase-section">
          <button
            type="submit"
            class="wk-add-to-cart"
            data-move-to-cart="{{ product.wishlist_item_id }}"
            {% unless current_variant.available %}disabled="disabled"{% endunless %}
          >
            {% if current_variant.available %}{{ locale.add_to_cart }}{% else %}{{ locale.sold_out }}{% endif %}
          </button>
        </div>
      </form>
    `,
  },
  {
    id: "wishlist-collection-shared",
    data: "shared_wishlist",
    template: `
      {% assign wishlist = shared_wishlist %}
      {% include 'wishlist-collection' with wishlist %}
    `,
  },
  {
    id: "wishlist-button-clear",
    data: "wishlist",
    events: {
      "click button[data-wk-clear-wishlist]": (event) => {
        WishlistKingSDK.toolkit.wk.clear(
          event.currentTarget.getAttribute("data-wk-clear-wishlist")
        );
      },
    },
    template: `
      {% assign btn_text = locale.clear_wishlist %}
      {% assign btn_title = locale.clear_wishlist %}

      <button type="button" class="wk-button-wishlist-clear" title="{{ btn_title }}" data-wk-clear-wishlist="{{ wishlist.permaId }}">
        <span class="wk-label">{{ btn_text }}</span>
      </button>
    `,
  },
  {
    id: "wishlist-icon",
    template: `
      <svg role="presentation" viewBox="0 0 18 16" preserveAspectRatio="xMidYMid meet">
        <path d="M9.01163699,14.9053769 C8.72930024,14.7740736 8.41492611,14.6176996 8.07646224,14.4366167 C7.06926649,13.897753 6.06198912,13.2561336 5.12636931,12.5170512 C2.52930452,10.4655288 1.00308384,8.09476443 1.00000218,5.44184117 C0.997549066,2.99198843 2.92175104,1.01242822 5.28303025,1.01000225 C6.41066623,1.00972036 7.49184369,1.4629765 8.28270844,2.2678673 L8.99827421,2.9961237 L9.71152148,2.26559643 C10.4995294,1.45849728 11.5791258,1.0023831 12.7071151,1.00000055 L12.7060299,1.00000225 C15.0693815,0.997574983 16.9967334,2.97018759 17.0000037,5.421337 C17.0038592,8.07662382 15.4809572,10.4530151 12.8850542,12.5121483 C11.9520963,13.2521931 10.9477036,13.8951276 9.94340074,14.4354976 C9.60619585,14.6169323 9.29297309,14.7736855 9.01163699,14.9053769 Z"></path>
      </svg>
    `,
  },
  {
    id: "wishlist-icon-remove",
    template: `
      <svg role="presentation" viewBox="0 0 16 14">
        <path d="M15 0L1 14m14 0L1 0" stroke="currentColor" fill="none" fill-rule="evenodd"></path>
      </svg>
    `,
  },
  {
    id: "wishlist-share-button-fb",
    data: "wishlist",
    template: `
      <a href="#" class="wk-button-share resp-sharing-button__link" title="{{ locale.share_on_facebook }}" data-wk-share-service="facebook" data-wk-share="{{ wishlist.permaId }}" data-wk-share-image="{{ wishlist.products[0] | variant_img_url: '1200x630' }}">
        <div class="resp-sharing-button resp-sharing-button--facebook">
          <div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
            <svg version="1.1" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
              <g>
                <path d="M18.768,7.465H14.5V5.56c0-0.896,0.594-1.105,1.012-1.105s2.988,0,2.988,0V0.513L14.171,0.5C10.244,0.5,9.5,3.438,9.5,5.32 v2.145h-3v4h3c0,5.212,0,12,0,12h5c0,0,0-6.85,0-12h3.851L18.768,7.465z"/>
              </g>
            </svg>
          </div>
        </div>
      </a>
    `,
  },
  {
    id: "wishlist-share-button-twitter",
    data: "wishlist",
    template: `
      <a href="#" class="wk-button-share resp-sharing-button__link" title="{{ locale.share_on_twitter }}" data-wk-share-service="twitter" data-wk-share="{{ wishlist.permaId }}">
        <div class="resp-sharing-button resp-sharing-button--twitter">
          <div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
            <svg version="1.1" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
              <g>
                <path d="M23.444,4.834c-0.814,0.363-1.5,0.375-2.228,0.016c0.938-0.562,0.981-0.957,1.32-2.019c-0.878,0.521-1.851,0.9-2.886,1.104 C18.823,3.053,17.642,2.5,16.335,2.5c-2.51,0-4.544,2.036-4.544,4.544c0,0.356,0.04,0.703,0.117,1.036 C8.132,7.891,4.783,6.082,2.542,3.332C2.151,4.003,1.927,4.784,1.927,5.617c0,1.577,0.803,2.967,2.021,3.782 C3.203,9.375,2.503,9.171,1.891,8.831C1.89,8.85,1.89,8.868,1.89,8.888c0,2.202,1.566,4.038,3.646,4.456 c-0.666,0.181-1.368,0.209-2.053,0.079c0.579,1.804,2.257,3.118,4.245,3.155C5.783,18.102,3.372,18.737,1,18.459 C3.012,19.748,5.399,20.5,7.966,20.5c8.358,0,12.928-6.924,12.928-12.929c0-0.198-0.003-0.393-0.012-0.588 C21.769,6.343,22.835,5.746,23.444,4.834z"/>
              </g>
            </svg>
          </div>
        </div>
      </a>
    `,
  },
  {
    id: "wishlist-share-button-whatsapp",
    data: "wishlist",
    template: `
      <a href="#" class="wk-button-share resp-sharing-button__link" title="{{ locale.share_with_whatsapp }}" data-wk-share-service="whatsapp" data-wk-share="{{ wishlist.permaId }}">
        <div class="resp-sharing-button resp-sharing-button--whatsapp">
          <div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
            <svg xmlns="https://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path stroke="none" d="M20.1,3.9C17.9,1.7,15,0.5,12,0.5C5.8,0.5,0.7,5.6,0.7,11.9c0,2,0.5,3.9,1.5,5.6l-1.6,5.9l6-1.6c1.6,0.9,3.5,1.3,5.4,1.3l0,0l0,0c6.3,0,11.4-5.1,11.4-11.4C23.3,8.9,22.2,6,20.1,3.9z M12,21.4L12,21.4c-1.7,0-3.3-0.5-4.8-1.3l-0.4-0.2l-3.5,1l1-3.4L4,17c-1-1.5-1.4-3.2-1.4-5.1c0-5.2,4.2-9.4,9.4-9.4c2.5,0,4.9,1,6.7,2.8c1.8,1.8,2.8,4.2,2.8,6.7C21.4,17.2,17.2,21.4,12,21.4z M17.1,14.3c-0.3-0.1-1.7-0.9-1.9-1c-0.3-0.1-0.5-0.1-0.7,0.1c-0.2,0.3-0.8,1-0.9,1.1c-0.2,0.2-0.3,0.2-0.6,0.1c-0.3-0.1-1.2-0.5-2.3-1.4c-0.9-0.8-1.4-1.7-1.6-2c-0.2-0.3,0-0.5,0.1-0.6s0.3-0.3,0.4-0.5c0.2-0.1,0.3-0.3,0.4-0.5c0.1-0.2,0-0.4,0-0.5c0-0.1-0.7-1.5-1-2.1C8.9,6.6,8.6,6.7,8.5,6.7c-0.2,0-0.4,0-0.6,0S7.5,6.8,7.2,7c-0.3,0.3-1,1-1,2.4s1,2.8,1.1,3c0.1,0.2,2,3.1,4.9,4.3c0.7,0.3,1.2,0.5,1.6,0.6c0.7,0.2,1.3,0.2,1.8,0.1c0.6-0.1,1.7-0.7,1.9-1.3c0.2-0.7,0.2-1.2,0.2-1.3C17.6,14.5,17.4,14.4,17.1,14.3z"/>
            </svg>
          </div>
        </div>
      </a>
    `,
  },
  {
    id: "wishlist-share-button-email",
    data: "wishlist",
    template: `
      <a href="#" class="wk-button-share resp-sharing-button__link" title="{{ locale.share_by_email }}" data-wk-share-service="email" data-wk-share="{{ wishlist.permaId }}">
        <div class="resp-sharing-button resp-sharing-button--email">
          <div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
            <svg version="1.1" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve">
              <path d="M22,4H2C0.897,4,0,4.897,0,6v12c0,1.103,0.897,2,2,2h20c1.103,0,2-0.897,2-2V6C24,4.897,23.103,4,22,4z M7.248,14.434 l-3.5,2C3.67,16.479,3.584,16.5,3.5,16.5c-0.174,0-0.342-0.09-0.435-0.252c-0.137-0.239-0.054-0.545,0.186-0.682l3.5-2 c0.24-0.137,0.545-0.054,0.682,0.186C7.571,13.992,7.488,14.297,7.248,14.434z M12,14.5c-0.094,0-0.189-0.026-0.271-0.08l-8.5-5.5 C2.997,8.77,2.93,8.46,3.081,8.229c0.15-0.23,0.459-0.298,0.691-0.147L12,13.405l8.229-5.324c0.232-0.15,0.542-0.084,0.691,0.147 c0.15,0.232,0.083,0.542-0.148,0.691l-8.5,5.5C12.189,14.474,12.095,14.5,12,14.5z M20.934,16.248 C20.842,16.41,20.673,16.5,20.5,16.5c-0.084,0-0.169-0.021-0.248-0.065l-3.5-2c-0.24-0.137-0.323-0.442-0.186-0.682 s0.443-0.322,0.682-0.186l3.5,2C20.988,15.703,21.071,16.009,20.934,16.248z"/>
            </svg>
          </div>
        </div>
      </a>
    `,
  },
  {
    id: "wishlist-share-button-link",
    data: "wishlist",
    template: `
      <a href="#" class="wk-button-share resp-sharing-button__link" title="{{ locale.get_link }}" data-wk-share-service="link" data-wk-share="{{ wishlist.permaId }}">
        <div class="resp-sharing-button resp-sharing-button--link">
          <div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
            <svg version='1.1' xmlns='https://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
              <path d='M459.654,233.373l-90.531,90.5c-49.969,50-131.031,50-181,0c-7.875-7.844-14.031-16.688-19.438-25.813
              l42.063-42.063c2-2.016,4.469-3.172,6.828-4.531c2.906,9.938,7.984,19.344,15.797,27.156c24.953,24.969,65.563,24.938,90.5,0
              l90.5-90.5c24.969-24.969,24.969-65.563,0-90.516c-24.938-24.953-65.531-24.953-90.5,0l-32.188,32.219
              c-26.109-10.172-54.25-12.906-81.641-8.891l68.578-68.578c50-49.984,131.031-49.984,181.031,0
              C509.623,102.342,509.623,183.389,459.654,233.373z M220.326,382.186l-32.203,32.219c-24.953,24.938-65.563,24.938-90.516,0
              c-24.953-24.969-24.953-65.563,0-90.531l90.516-90.5c24.969-24.969,65.547-24.969,90.5,0c7.797,7.797,12.875,17.203,15.813,27.125
              c2.375-1.375,4.813-2.5,6.813-4.5l42.063-42.047c-5.375-9.156-11.563-17.969-19.438-25.828c-49.969-49.984-131.031-49.984-181.016,0
              l-90.5,90.5c-49.984,50-49.984,131.031,0,181.031c49.984,49.969,131.031,49.969,181.016,0l68.594-68.594
              C274.561,395.092,246.42,392.342,220.326,382.186z'/>
            </svg>
          </div>
        </div>
      </a>
    `,
  },
  {
    id: "wishlist-share-button-contact",
    data: "wishlist",
    template: `
      <a href="#" class="wk-button-share resp-sharing-button__link" title="{{ locale.send_to_customer_service }}" data-wk-share-service="contact" data-wk-share="{{ wishlist.permaId }}">
        <div class="resp-sharing-button resp-sharing-button--link">
          <div aria-hidden="true" class="resp-sharing-button__icon resp-sharing-button__icon--solid">
            <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
          </div>
        </div>
      </a>
    `,
  },
];

export default templates;
