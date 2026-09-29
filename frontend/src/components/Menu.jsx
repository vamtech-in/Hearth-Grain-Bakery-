import React, { useEffect, useMemo, useState } from 'react';
import { bakeryApi } from '../services/api';
import { useCart } from '../context/CartContext';

/* =========================================================
   FALLBACK MENU
========================================================= */

const FALLBACK_MENU = [
  {
    id: 'fb-br-1',
    name: 'Country Sourdough',
    category: 'bread',
    price: 220,
    description:
      '24-hour wild-yeast fermented, crackling crust.',
    tags: ['Bestseller'],
    inStock: true,
    image: '/images/wheatleaf.jpg'
  },
  {
    id: 'fb-br-2',
    name: 'Seeded Rye',
    category: 'bread',
    price: 200,
    description:
      'Flax, sunflower and caraway seed crust.',
    tags: [],
    inStock: true,
    image: '/images/seeded.jpg'
  },
  {
    id: 'fb-br-3',
    name: 'Baguette Tradition',
    category: 'bread',
    price: 140,
    description:
      'Crisp Parisian-style baguette, baked twice daily.',
    tags: [],
    inStock: true,
    image: '/images/baguette.jpg'
  },
  {
    id: 'fb-br-4',
    name: 'Whole Wheat Loaf',
    category: 'bread',
    price: 190,
    description:
      'Stoneground whole wheat, tender crumb.',
    tags: [],
    inStock: true,
    image: '/images/wheat.jpg'
  },
  {
    id: 'fb-br-5',
    name: 'Olive & Rosemary Focaccia',
    category: 'bread',
    price: 210,
    description:
      'Kalamata olives, virgin olive oil, sea salt.',
    tags: [],
    inStock: true,
    image: '/images/olive.jpg'
  },

  {
    id: 'fb-pa-1',
    name: 'Butter Croissant',
    category: 'pastry',
    price: 110,
    description:
      '72-hour laminated, all butter.',
    tags: ['Bestseller'],
    inStock: true,
    image: '/images/butter.jpg'
  },
  {
    id: 'fb-pa-2',
    name: 'Almond Croissant',
    category: 'pastry',
    price: 150,
    description:
      'Frangipane-filled, toasted almond flakes.',
    tags: [],
    inStock: true,
    image: '/images/almonds.jpg'
  },
  {
    id: 'fb-pa-3',
    name: 'Cinnamon Babka',
    category: 'pastry',
    price: 180,
    description:
      'Swirled with cinnamon sugar, brushed with syrup.',
    tags: [],
    inStock: true,
    image: '/images/babka.jpg'
  },
  {
    id: 'fb-pa-4',
    name: 'Pain au Chocolat',
    category: 'pastry',
    price: 130,
    description:
      'Dark chocolate batons, flaky layers.',
    tags: [],
    inStock: true,
    image: '/images/pain.jpg'
  },

  {
    id: 'fb-co-1',
    name: 'Espresso',
    category: 'coffee',
    price: 100,
    description:
      'Double shot of single-origin beans roasted with care.',
    tags: ['Bold', 'Single Origin'],
    inStock: true,
    image: '/images/espresso.jpg'
  },
  {
    id: 'fb-co-2',
    name: 'Americano',
    category: 'coffee',
    price: 120,
    description:
      'Rich espresso poured over hot filtered spring water.',
    tags: ['Smooth', 'Aromatic'],
    inStock: true,
    image: '/images/americano.jpg'
  },
  {
    id: 'fb-co-3',
    name: 'Cappuccino',
    category: 'coffee',
    price: 160,
    description:
      'Equal parts espresso, steamed milk, and velvety foam.',
    tags: ['Micro-foam', 'Velvet'],
    inStock: true,
    image: '/images/cappuccino.jpg'
  },
  {
    id: 'fb-co-4',
    name: 'Cold Brew',
    category: 'coffee',
    price: 180,
    description:
      'Steeped cold for 18 hours for an ultra-smooth, low-acid finish.',
    tags: ['18h Steep', 'Refreshing'],
    inStock: true,
    image: '/images/cold.jpg'
  },
  {
    id: 'fb-co-5',
    name: 'Oat Milk Flat White',
    category: 'coffee',
    price: 130,
    description:
      'Silky micro-foam with house-made oat milk.',
    tags: ['Popular'],
    inStock: true,
    image: '/images/oat.jpg'
  }
];

/* =========================================================
   IMAGE CONFIG
========================================================= */

const CATEGORY_FALLBACK_IMAGE = {
  bread: '/images/wheatleaf.jpg',
  pastry: '/images/butter.jpg',
  coffee: '/images/espresso.jpg'
};

const GLOBAL_FALLBACK_IMAGE = '/images/wheatleaf.jpg';

/*
  Product-name → exact image mapping.

  IMPORTANT:
  This mapping has priority over the API image.
  So if database accidentally says:

      Americano -> espresso.jpg

  frontend will still display:

      Americano -> americano.jpg
*/
const PRODUCT_IMAGE_MAP = {
  // Coffee
  espresso: '/images/espresso.jpg',
  'single-origin espresso': '/images/espresso.jpg',

  americano: '/images/americano.jpg',

  cappuccino: '/images/cappuccino.jpg',

  'cold brew': '/images/cold.jpg',

  'oat milk flat white': '/images/oat.jpg',
  'flat white': '/images/oat.jpg',

  // Pastry
  'butter croissant': '/images/butter.jpg',
  'almond croissant': '/images/almonds.jpg',

  'cinnamon babka': '/images/babka.jpg',
  babka: '/images/babka.jpg',

  'pain au chocolat': '/images/pain.jpg',

  danish: '/images/danish.jpg',

  // Bread
  'country sourdough': '/images/wheatleaf.jpg',
  sourdough: '/images/wheatleaf.jpg',

  'seeded rye': '/images/seeded.jpg',

  'baguette tradition': '/images/baguette.jpg',
  baguette: '/images/baguette.jpg',

  'whole wheat loaf': '/images/wheat.jpg',
  'whole wheat': '/images/wheat.jpg',

  'olive & rosemary focaccia': '/images/olive.jpg',
  focaccia: '/images/olive.jpg'
};

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value) {
  return String(value ?? '').trim();
}

function normalizeCategory(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags
      .map(tag => normalizeText(tag))
      .filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeImagePath(image) {
  if (!image) {
    return '';
  }

  const value = String(image).trim();

  if (!value) {
    return '';
  }

  // External image
  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  // Already absolute public path
  if (value.startsWith('/')) {
    return value;
  }

  // Remove "./"
  const cleanValue = value.replace(/^\.\/+/, '');

  // images/file.jpg
  if (cleanValue.startsWith('images/')) {
    return `/${cleanValue}`;
  }

  // file.jpg
  return `/images/${cleanValue}`;
}

function getCategoryFallback(category) {
  return (
    CATEGORY_FALLBACK_IMAGE[
      normalizeCategory(category)
    ] || GLOBAL_FALLBACK_IMAGE
  );
}

/* =========================================================
   KNOWN FILENAME CORRECTIONS
========================================================= */

function resolveKnownImageName(path) {
  if (!path) {
    return '';
  }

  const replacements = {
    '/images/Bagutee.jpg': '/images/baguette.jpg',
    '/images/Bagutte.jpg': '/images/baguette.jpg',
    '/images/Baguette.jpg': '/images/baguette.jpg',

    '/images/americano.JPG': '/images/americano.jpg',
    '/images/espresso.JPG': '/images/espresso.jpg',
    '/images/cappuccino.JPG': '/images/cappuccino.jpg',
    '/images/cold.JPG': '/images/cold.jpg',
    '/images/oat.JPG': '/images/oat.jpg',

    '/images/Butter.jpg': '/images/butter.jpg',
    '/images/Almonds.jpg': '/images/almonds.jpg'
  };

  return replacements[path] || path;
}

/* =========================================================
   GET EXACT PRODUCT IMAGE
========================================================= */

function getProductImageByName(item) {
  const name = normalizeText(item?.name)
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (!name) {
    return null;
  }

  // Exact match
  if (PRODUCT_IMAGE_MAP[name]) {
    return PRODUCT_IMAGE_MAP[name];
  }

  /*
    Partial matching for slightly different database names.
  */

  // Coffee
  if (name.includes('americano')) {
    return '/images/americano.jpg';
  }

  if (
    name.includes('cappuccino') ||
    name.includes('cappucino')
  ) {
    return '/images/cappuccino.jpg';
  }

  if (
    name.includes('cold brew') ||
    name.includes('coldbrew')
  ) {
    return '/images/cold.jpg';
  }

  if (
    name.includes('flat white') ||
    name.includes('oat milk')
  ) {
    return '/images/oat.jpg';
  }

  if (name.includes('espresso')) {
    return '/images/espresso.jpg';
  }

  // Pastry
  if (
    name.includes('almond') &&
    name.includes('croissant')
  ) {
    return '/images/almonds.jpg';
  }

  if (name.includes('croissant')) {
    return '/images/butter.jpg';
  }

  if (name.includes('babka')) {
    return '/images/babka.jpg';
  }

  if (
    name.includes('pain au chocolat') ||
    name.includes('pain chocolat')
  ) {
    return '/images/pain.jpg';
  }

  if (name.includes('danish')) {
    return '/images/danish.jpg';
  }

  // Bread
  if (name.includes('sourdough')) {
    return '/images/wheatleaf.jpg';
  }

  if (name.includes('seeded rye')) {
    return '/images/seeded.jpg';
  }

  if (name.includes('baguette')) {
    return '/images/baguette.jpg';
  }

  if (
    name.includes('whole wheat') ||
    name.includes('wheat loaf')
  ) {
    return '/images/wheat.jpg';
  }

  if (
    name.includes('focaccia') ||
    name.includes('olive') ||
    name.includes('rosemary')
  ) {
    return '/images/olive.jpg';
  }

  return null;
}

/* =========================================================
   FINAL IMAGE RESOLVER
========================================================= */

function getSafeImage(item) {
  const category = normalizeCategory(item?.category);

  /*
    PRIORITY 1
    Exact product-name mapping.
  */
  const productImage = getProductImageByName(item);

  if (productImage) {
    return productImage;
  }

  /*
    PRIORITY 2
    API/database image.
  */
  const apiImage = normalizeImagePath(item?.image);

  if (apiImage) {
    return resolveKnownImageName(apiImage);
  }

  /*
    PRIORITY 3
    Category fallback.
  */
  return getCategoryFallback(category);
}

/* =========================================================
   IMAGE COMPONENT
========================================================= */

function MenuItemImage({ item }) {
  const fallback =
    getCategoryFallback(item?.category);

  const resolvedImage = getSafeImage(item);

  const [src, setSrc] = useState(
    resolvedImage || GLOBAL_FALLBACK_IMAGE
  );

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setSrc(
      getSafeImage(item) ||
        GLOBAL_FALLBACK_IMAGE
    );

    setHasError(false);
  }, [
    item?.id,
    item?.name,
    item?.image,
    item?.category
  ]);

  const handleImageError = () => {
    /*
      If selected image failed,
      try category fallback.
    */
    if (!hasError) {
      setHasError(true);

      if (src !== fallback) {
        setSrc(fallback);
        return;
      }
    }

    /*
      Last-resort global fallback.
    */
    if (src !== GLOBAL_FALLBACK_IMAGE) {
      setSrc(GLOBAL_FALLBACK_IMAGE);
    }
  };

  return (
    <img
      src={
        src ||
        GLOBAL_FALLBACK_IMAGE
      }
      alt={
        item?.name ||
        'Bakery item'
      }
      className="menu-item-image"
      loading="lazy"
      decoding="async"
      onError={handleImageError}
    />
  );
}

/* =========================================================
   MAIN MENU
========================================================= */

export default function Menu() {
  const [items, setItems] =
    useState(FALLBACK_MENU);

  const [activeCategory, setActiveCategory] =
    useState('all');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const {
    addToCart,
    setIsCartOpen,
    setIsReservationOpen,
    openItemDetail
  } = useCart();

  /* =======================================================
     FETCH MENU
  ======================================================= */

  const fetchMenuItems = async () => {
    try {
      setLoading(true);

      const res =
        await bakeryApi.getMenu();

      if (
        res?.success &&
        Array.isArray(res.data) &&
        res.data.length > 0
      ) {
        const normalizedItems =
          res.data.map(item => ({
            ...item,

            id:
              item.id ??
              `menu-${Math.random()
                .toString(36)
                .slice(2)}`,

            name:
              normalizeText(item.name) ||
              'Bakery Item',

            category:
              normalizeCategory(
                item.category
              ),

            description:
              normalizeText(
                item.description
              ),

            tags:
              normalizeTags(
                item.tags
              ),

            price:
              Number(item.price) || 0,

            inStock:
              item.inStock !== false,

            /*
              IMPORTANT:
              This now stores the corrected
              product image.
            */
            image:
              getSafeImage(item)
          }));

        setItems(normalizedItems);
      } else {
        setItems(FALLBACK_MENU);
      }
    } catch (error) {
      console.error(
        'Failed to load menu:',
        error
      );

      setItems(FALLBACK_MENU);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = [
    {
      id: 'all',
      label: 'All Offerings'
    },
    {
      id: 'bread',
      label: 'Artisan Bread 🥖'
    },
    {
      id: 'pastry',
      label: 'Morning Pastry 🥐'
    },
    {
      id: 'coffee',
      label: 'Specialty Coffee ☕'
    }
  ];

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredItems =
    useMemo(() => {
      const query =
        searchQuery
          .toLowerCase()
          .trim();

      return items.filter(item => {
        const category =
          normalizeCategory(
            item.category
          );

        const matchesCategory =
          activeCategory === 'all' ||
          category ===
            activeCategory;

        const name =
          normalizeText(
            item.name
          ).toLowerCase();

        const description =
          normalizeText(
            item.description
          ).toLowerCase();

        const tags =
          normalizeTags(
            item.tags
          );

        const matchesSearch =
          !query ||
          name.includes(query) ||
          description.includes(
            query
          ) ||
          tags.some(tag =>
            tag
              .toLowerCase()
              .includes(query)
          );

        return (
          matchesCategory &&
          matchesSearch
        );
      });
    }, [
      items,
      activeCategory,
      searchQuery
    ]);

  /* =======================================================
     CATEGORY HEADERS
  ======================================================= */

  const groupedCategories = [
    'bread',
    'pastry',
    'coffee'
  ];

  const categoryHeaders = {
    bread: {
      num: '01',
      title: 'Artisan Bread',
      desc:
        'Slow-fermented with wild yeast and naturally leavened'
    },

    pastry: {
      num: '02',
      title: 'French Pastry',
      desc:
        'Buttery, 84-layered lamination baked fresh every sunrise'
    },

    coffee: {
      num: '03',
      title: 'Specialty Coffee',
      desc:
        'Single-origin beans thoughtfully brewed and balanced'
    }
  };

  const categoriesToRender =
    activeCategory === 'all'
      ? groupedCategories
      : [activeCategory];

  /* =======================================================
     ITEM CARD
  ======================================================= */

  const renderItemCard = item => {
    const safeItem = {
      ...item,

      name:
        normalizeText(
          item.name
        ) || 'Bakery Item',

      category:
        normalizeCategory(
          item.category
        ),

      description:
        normalizeText(
          item.description
        ),

      tags:
        normalizeTags(
          item.tags
        ),

      price:
        Number(item.price) || 0,

      inStock:
        item.inStock !== false,

      image:
        getSafeImage(item)
    };

    return (
      <article
        key={safeItem.id}
        className={`menu-item-card ${
          !safeItem.inStock
            ? 'sold-out'
            : ''
        }`}
      >
        {/* IMAGE */}

        <div
          className="menu-item-image-wrap"
          onClick={() =>
            openItemDetail(
              safeItem
            )
          }
          title="Click to view bake details, ingredients & pairings"
          style={{
            cursor: 'pointer'
          }}
        >
          <MenuItemImage
            item={safeItem}
          />

          {!safeItem.inStock && (
            <span className="sold-out-flag">
              Sold Out
            </span>
          )}

          <span className="item-quick-peek-badge">
            🔍 Quick View
          </span>
        </div>

        {/* BODY */}

        <div className="menu-item-body">

          <div
            className="menu-item-top"
            onClick={() =>
              openItemDetail(
                safeItem
              )
            }
            style={{
              cursor: 'pointer'
            }}
          >
            <h4>
              {safeItem.name}
            </h4>

            <span className="item-price">
              ₹
              {safeItem.price}
            </span>
          </div>

          {safeItem.description && (
            <p
              className="menu-item-desc"
              onClick={() =>
                openItemDetail(
                  safeItem
                )
              }
              style={{
                cursor: 'pointer'
              }}
            >
              {
                safeItem.description
              }
            </p>
          )}

          <div className="menu-item-footer">

            {/* TAGS */}

            <div className="menu-item-tags">
              {safeItem.tags
                .slice(0, 2)
                .map(
                  (
                    tag,
                    index
                  ) => (
                    <span
                      key={`${safeItem.id}-tag-${index}`}
                      className="item-tag-pill"
                    >
                      {tag}
                    </span>
                  )
                )}
            </div>

            {/* BUTTONS */}

            <div
              className="menu-item-btn-group"
              style={{
                display:
                  'flex',
                gap: '6px'
              }}
            >
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={() =>
                  openItemDetail(
                    safeItem
                  )
                }
                title="View Specs & Ingredients"
                style={{
                  padding:
                    '6px 10px',
                  fontSize:
                    '0.75rem'
                }}
              >
                Specs
              </button>

              {safeItem.inStock ? (
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() => {
                    addToCart(
                      safeItem
                    );

                    if (
                      typeof setIsCartOpen ===
                      'function'
                    ) {
                      setIsCartOpen(
                        true
                      );
                    }
                  }}
                >
                  + Add
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-secondary button-small"
                  disabled
                >
                  Unavailable
                </button>
              )}
            </div>

          </div>
        </div>
      </article>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      id="menu"
      className="menu-section"
    >
      <div className="container">

        {/* =================================================
            HEADING
        ================================================= */}

        <div className="section-heading menu-heading">

          <div>
            <span className="eyebrow">
              <span className="eyebrow-line"></span>
              OUR ARTISAN MENU
            </span>

            <h2>
              Simple ingredients.{' '}
              <span>
                Beautiful results.
              </span>
            </h2>
          </div>

          <p>
            Everything is made in
            small batches every single
            morning using heirloom
            grains, cultured butter,
            and wild leaven.
          </p>

        </div>

        {/* =================================================
            CONTROLS
        ================================================= */}

        <div className="menu-controls-bar">

          {/* CATEGORY */}

          <div
            className="category-tabs"
            role="tablist"
            aria-label="Menu categories"
          >
            {categories.map(
              category => (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={
                    activeCategory ===
                    category.id
                  }
                  className={`category-tab-btn ${
                    activeCategory ===
                    category.id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setActiveCategory(
                      category.id
                    )
                  }
                >
                  {
                    category.label
                  }
                </button>
              )
            )}
          </div>

          {/* SEARCH */}

          <div className="menu-search-wrapper">

            <span
              className="search-icon"
              aria-hidden="true"
            >
              🔍
            </span>

            <input
              type="text"
              className="menu-search-input"
              placeholder="Search sourdough, croissant, cold brew..."
              value={
                searchQuery
              }
              onChange={event =>
                setSearchQuery(
                  event.target
                    .value
                )
              }
              aria-label="Search menu items"
            />

            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() =>
                  setSearchQuery(
                    ''
                  )
                }
                aria-label="Clear search"
              >
                ✕
              </button>
            )}

          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================= */}

        {loading ? (
          <div
            className="menu-loading-state"
            aria-live="polite"
          >
            <div className="baking-spinner">
              🥖
            </div>

            <p>
              Loading morning bakes
              from our oven...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="menu-empty-state">

            <p>
              No items found matching "
              {searchQuery}".
              Try another search term
              or select all categories.
            </p>

            <button
              type="button"
              className="button button-secondary button-small"
              onClick={() => {
                setSearchQuery(
                  ''
                );

                setActiveCategory(
                  'all'
                );
              }}
            >
              Reset Filters
            </button>

          </div>
        ) : (
          <div className="menu-sections">

            {categoriesToRender.map(
              categoryKey => {
                const categoryInfo =
                  categoryHeaders[
                    categoryKey
                  ];

                const categoryItems =
                  filteredItems.filter(
                    item =>
                      normalizeCategory(
                        item.category
                      ) ===
                      categoryKey
                  );

                if (
                  categoryItems.length ===
                  0
                ) {
                  return null;
                }

                return (
                  <div
                    key={
                      categoryKey
                    }
                    className="menu-category-block"
                  >

                    {/* CATEGORY HEADER */}

                    <div className="menu-category-heading">

                      <span className="menu-number">
                        {
                          categoryInfo.num
                        }
                      </span>

                      <div>
                        <h3>
                          {
                            categoryInfo.title
                          }
                        </h3>

                        <p>
                          {
                            categoryInfo.desc
                          }
                        </p>
                      </div>

                    </div>

                    {/* ITEMS */}

                    <div className="menu-items-grid">
                      {categoryItems.map(
                        renderItemCard
                      )}
                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="menu-footer">

          <p>
            Planning a morning event
            or have specific dietary
            inquiries?
          </p>

          <button
            type="button"
            className="text-link"
            onClick={() =>
              setIsReservationOpen(
                true
              )
            }
          >
            Speak with our team &amp;
            Reserve{' '}
            <span
              aria-hidden="true"
            >
              →
            </span>
          </button>

        </div>

      </div>
    </section>
  );
}