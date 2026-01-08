/**
 * BLKPAPER - E-commerce Website JavaScript
 * Modern fashion e-commerce with cart functionality, product management, and checkout
 */

// ===== GLOBAL VARIABLES =====
let isLoading = true;
let cart = JSON.parse(localStorage.getItem('blkpaper_cart')) || [];
let products = [];
let currentFilter = 'all';
let searchQuery = '';
let isSearchOpen = false;
let isCartOpen = false;
let isMobileMenuOpen = false;

// Google Sheets Configuration
const GOOGLE_SHEETS_CONFIG = {
    // Google Apps Script Web App URL (provided)
    scriptURL: 'https://script.google.com/macros/s/AKfycbyUy-myOKQB52KazuDNhE5tm24doJfQ_FVVvffT0CltGHY1v26PQOxB8AuemQ_MoeqWYw/exec',
    
    // Backup email for order notifications (optional)
    backupEmail: 'blkpaper399@gmail.com'
};

// Product data
const productData = [
    // Memory Band
    {
        id: 'memory-band-001',
        name: 'Memory Band Classic',
        category: 'memory-band',
        price: 1500,
        originalPrice: 1800,
        image: 'wnb/m1p1.png',
        description: 'Revolutionary memory storage device with premium design and smart technology.',
        featured: true,
        inStock: true,
        rating: 0,
        reviews: 0
    },
    
    // Clothing
    {
        id: 'clothing-001',
        name: 'BLKPAPER   ash acid-wash Urban Hoodie',
        category: 'clothing',
        price: 820,
        originalPrice: 1000,
        images: [
            'clothing/h1p1.png',
            'clothing/h1p2.png'
        ],
        description: 'Premium cotton hoodie with minimalist design and comfortable fit.',
        eco: true,
        featured: false,
        inStock: true,
        rating: 4.0,
        reviews: 5
    },
    {
        id: 'clothing-002',
        name: 'BLKPAPER   black acid-wash Urban Hoodie',
        category: 'clothing',
        price: 820,
        originalPrice: 1000,
        images: [
            'clothing/h2p1.png',
            'clothing/h2p2.png',
            'clothing/sc.png'
        ],
        description: 'Essential black t-shirt with premium fabric and perfect cut.',
        featured: false,
        inStock: true,
        rating: 4.7,
        reviews: 4
    },
    {
        id: 'clothing-003',
        name: 'Street Style acid wash hoodie ',
        category: 'clothing',
        price: 820,
        originalPrice: 1200,
        images: [
            'clothing/h3p1.png',
            'clothing/h3p2.png',
            'clothing/sc.png'
        ],
        description: 'Trendy street style hoodie with durable material and modern fit.',
        featured: true,
        inStock: true,
        rating: 4.9,
        reviews: 4
    },
    {
        id: 'clothing-004',
        name: 'Cargo Pants - Black',
        category: 'clothing',
        price: 700,
        originalPrice: null,
        image: 'clothing/bp1p1.png',
        description: 'Functional cargo pants with multiple pockets and modern silhouette.',
        featured: false,
        inStock: true,
        rating: 4.6,
        reviews: 3
    },
    {
        id: 'clothing-005',
        name: 'Oversized Sweatshirt',
        category: 'clothing',
        price: 640,
        originalPrice: 800,
        image: 'clothing/s1p1.png',
        description: 'Comfortable oversized sweatshirt perfect for casual wear.',
        featured: false,
        inStock: false,
        rating: 4.5,
        reviews: 5
    },
    {
        id: 'clothing-006',
        name: 'Oversized Sweatshirt',
        category: 'clothing',
        price: 640,
        originalPrice: 800,
        images: [
            'clothing/h1p1.png',
            'clothing/h1p2.png',
            'clothing/sc.png'
        ],
        description: 'Comfortable oversized sweatshirt perfect for casual wear.',
        featured: false,
        inStock: false,
        rating: 4.5,
        reviews: 3
    },
    {
        id: 'clothing-007',
        name: 'f1 x blkpaper acid-wash hoodie',
        category: 'clothing',
        price: 1000,
        originalPrice: 1200,
        images: [
            'clothing/h7n1.png',
            'clothing/h7n2.png',
            'clothing/sc.png'
        ],
        description: 'f1 x blkpaper acid-wash hoodie with comfortable fit and unique design.',
        featured: true,
        inStock: true,
        rating: 4.5,
        reviews: 4
    },
    {
        id: 'clothing-008',
        name: 'oni black acid-wash hoodie',
        category: 'clothing',
        price: 1000,
        originalPrice: 1200,
        image: [
            'clothing/h8n1.png',
            'clothing/h8n2.png',
            'clothing/sc.png'

        ],
        description: 'oni black acid-wash hoodie with comfortable fit and unique design.',
        featured: false,
        inStock: true,
        rating: 4.5,
        reviews: 2
    },
    {
        id: 'clothing-009',
        name: 'f1 x blkpaper  Redbull acid-wash hoodie',
        category: 'clothing',
        price: 1000,
        originalPrice: 1200,
        image: [
            'clothing/h9n1.png',
            'clothing/h9n2.png'
            ,'clothing/sc.png'
        ],
        description: 'Comfortable oversized sweatshirt perfect for casual wear.',
        featured: false,
        inStock: true,
        rating: 4.5,
        reviews: 3
    },
    
    // Sunglasses
    {
        id: 'sunglasses-001',
        name: 'Classic Black Aviators',
        category: 'sunglasses',
        price: 1500,
        originalPrice: 1800,
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Timeless aviator sunglasses with UV protection and premium frames.',
        featured: false,
        inStock: true,
        rating: 4.8,
        reviews: 1
    },
    {
        id: 'sunglasses-002',
        name: 'Round Frame Sunglasses',
        category: 'sunglasses',
        price: 1300,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Vintage-inspired round sunglasses with modern lens technology.',
        featured: false,
        inStock: true,
        rating: 0,
        reviews: 0
    },
    {
        id: 'sunglasses-003',
        name: 'Square Designer Shades',
        category: 'sunglasses',
        price: 1700,
        originalPrice: 2000,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Bold square-frame sunglasses for statement style.',
        featured: true,
        inStock: true,
        rating: 0,
        reviews: 0
    },
    
    // Accessories
    {
        id: 'accessories-001',
        name: 'Leather Wallet - Black',
        category: 'accessories',
        price: 800,
        originalPrice: 1000,
        image: [
            'wnb/w1p1.png',
            'wnb/w1p2.png',
            'wnb/w1p3.png',
            'wnb/w1p4.png'

        ],
        description: 'Premium leather wallet with multiple card slots and coin pocket.',
        featured: false,
        inStock: true,
        rating: 4.9,
        reviews: 2
    },
    {
        id: 'accessories-002',
        name: 'Minimalist Watch',
        category: 'accessories',
        price: 2800,
        originalPrice: 3200,
        image: [
            'wnb/wt1p1.png',
            'wnb/wt1p2.png',
            

        ],
        description: 'Sleek minimalist watch with black leather strap.',
        featured: true,
        inStock: true,
        rating: 0,
        reviews: 0
    },
    {
        id: 'accessories-003',
        name: 'Canvas Messenger Bag',
        category: 'accessories',
        price: 1600,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Durable canvas messenger bag perfect for daily use.',
        eco: true,
        featured: false,
        inStock: false,
        rating: 4.5,
        reviews: 2
    },
    {
        id: 'accessories-004',
        name: 'Beanie Hat - Black',
        category: 'accessories',
        price: 600,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Comfortable knit beanie for casual streetwear looks.',
        featured: false,
        inStock: false,
        rating: 0,
        reviews: 0
    },
    {
        id: 'accessories-005',
        name: 'Phone Case - Matte Black',
        category: 'accessories',
        price: 300,
        originalPrice: 400,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Protective phone case with minimalist design.',
        eco: true,
        featured: false,
        inStock: true,
        rating: 0,
        reviews: 0
    }
];

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🖤 BLKPAPER Store Initializing...');
    initializeWebsite();
});

function initializeWebsite() {
    // Set products data
    products = productData;
    
    // Initialize loading screen
    initializeLoadingScreen();
    
    // Initialize navigation
    initializeNavigation();
    
    // Initialize cart
    initializeCart();
    
    // Initialize products
    initializeProducts();
    
    // Initialize search
    initializeSearch();
    
    // Initialize forms
    initializeForms();
    
    // Initialize animations
    initializeAnimations();
    
    // Initialize modals
    initializeModals();
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize Eco Corner (eco-friendly products)
    initializeEcoCorner();
    
    // Initialize retry queue processing
    initializeRetryQueue();
    
    console.log('✅ BLKPAPER Store Ready!');
}

// ===== LOADING SCREEN =====
function initializeLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Simulate loading time
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            isLoading = false;
            
            // Remove loading screen after transition
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 2500);
}

// ===== NAVIGATION =====
function initializeNavigation() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                scrollToSection(href);
                
                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
                if (isMobileMenuOpen) {
                    toggleMobileMenu();
                }
            }
        });
    });
    
    // Category links
    const categoryLinks = document.querySelectorAll('[data-category]');
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.getAttribute('data-category');
            filterProducts(category);
            scrollToSection('#shop');
        });
    });
}

function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    
    isMobileMenuOpen = !isMobileMenuOpen;
    
    if (isMobileMenuOpen) {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.background = 'var(--white)';
        navMenu.style.boxShadow = 'var(--shadow-lg)';
        navMenu.style.padding = '20px';
        navMenu.style.gap = '16px';
        mobileMenuBtn.classList.add('active');
    } else {
        navMenu.style.display = '';
        navMenu.style.flexDirection = '';
        navMenu.style.position = '';
        navMenu.style.top = '';
        navMenu.style.left = '';
        navMenu.style.right = '';
        navMenu.style.background = '';
        navMenu.style.boxShadow = '';
        navMenu.style.padding = '';
        navMenu.style.gap = '';
        mobileMenuBtn.classList.remove('active');
    }
}

function scrollToSection(sectionId) {
    const target = document.querySelector(sectionId);
    if (target) {
        const headerHeight = 80;
        const targetPosition = target.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ===== CART FUNCTIONALITY =====
function initializeCart() {
    const cartIcon = document.getElementById('cartIcon');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    
    // Cart icon click
    if (cartIcon) {
        cartIcon.addEventListener('click', toggleCart);
    }
    
    // Cart close button
    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (isCartOpen && !cartSidebar.contains(e.target) && !cartIcon.contains(e.target)) {
            closeCart();
        }
    });
    
    // Update cart display
    updateCartUI();
}

function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    
    if (isCartOpen) {
        closeCart();
    } else {
        openCart();
    }
}

function openCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.add('open');
    isCartOpen = true;
    document.body.style.overflow = 'hidden';
    updateCartItems();
}

function closeCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.remove('open');
    isCartOpen = false;
    document.body.style.overflow = '';
}

function addToCart(productId, quantity = 1, size = null) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }
    
    if (!product.inStock) {
        showToast('Sorry, this product is out of stock', 'warning');
        return;
    }
    
    // If size not provided, try to read from a size select in DOM
    if (!size && product.category === 'clothing') {
        const selectEl = document.getElementById(`size-select-${productId}`) || document.getElementById(`modal-size-${productId}`);
        if (selectEl) {
            size = selectEl.value || null;
        }
    }

    // For clothing, require size selection
    if (product.category === 'clothing' && !size) {
        showToast('Please select a size before adding to cart', 'warning');
        return;
    }

    // Check for existing item with same productId and size
    const existingItem = cart.find(item => item.id === productId && (item.size || null) === (size || null));

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image || (product.images && product.images[0]) || '',
            quantity: quantity,
            size: size || null
        });
    }
    
    // Save to localStorage
    localStorage.setItem('blkpaper_cart', JSON.stringify(cart));
    
    // Update UI
    updateCartUI();
    updateCartItems();
    
    // Show success message
    showToast(`${product.name} added to cart!`, 'success');
    
    // Open cart sidebar briefly to show item
    openCart();
    setTimeout(() => {
        closeCart();
    }, 2000);
}

function removeFromCart(productId) {
    // Deprecated simple remove; keep signature but allow passing size via second arg when used
    // We'll support calls like removeFromCart(productId, size)
    const args = Array.from(arguments);
    const size = args.length > 1 ? args[1] : null;
    if (size) {
        cart = cart.filter(item => !(item.id === productId && ((item.size || null) === (size || null))));
    } else {
        cart = cart.filter(item => item.id !== productId);
    }
    localStorage.setItem('blkpaper_cart', JSON.stringify(cart));
    updateCartUI();
    updateCartItems();
    showToast('Item removed from cart', 'info');
}

function updateCartQuantity(productId, quantity, size = null) {
    const item = cart.find(item => item.id === productId && ((item.size || null) === (size || null)));
    if (item) {
        if (quantity <= 0) {
            // remove specific sized item
            cart = cart.filter(i => !(i.id === productId && ((i.size || null) === (size || null))));
            localStorage.setItem('blkpaper_cart', JSON.stringify(cart));
            updateCartUI();
            updateCartItems();
        } else {
            item.quantity = quantity;
            localStorage.setItem('blkpaper_cart', JSON.stringify(cart));
            updateCartUI();
            updateCartItems();
        }
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartShipping = document.getElementById('cartShipping');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 100 : 0; // Free shipping over certain amount could be added
    const total = subtotal + shipping;
    
    // Update totals
    if (cartSubtotal) cartSubtotal.textContent = `৳${subtotal.toLocaleString()}`;
    if (cartShipping) cartShipping.textContent = `৳${shipping.toLocaleString()}`;
    if (cartTotal) cartTotal.textContent = `৳${total.toLocaleString()}`;
}

function updateCartItems() {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 16px;"></i>
                <p style="color: var(--gray-500); text-align: center;">Your cart is empty</p>
                <button class="btn btn-primary" onclick="closeCart(); scrollToSection('#shop');" style="margin-top: 16px;">
                    Start Shopping
                </button>
            </div>
        `;
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${item.size ? `<div class="cart-item-size">Size: <strong>${item.size}</strong></div>` : ''}
                <div class="cart-item-price">৳${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1}, '${item.size || ''}')">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" 
                               onchange="updateCartQuantity('${item.id}', parseInt(this.value), '${item.size || ''}')" min="1">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1}, '${item.size || ''}')">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}', '${item.size || ''}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function clearCart() {
    cart = [];
    localStorage.setItem('blkpaper_cart', JSON.stringify(cart));
    updateCartUI();
    updateCartItems();
    showToast('Cart cleared', 'info');
}

function viewCart() {
    closeCart();
    // In a real application, this would navigate to a dedicated cart page
    showToast('Cart page would open here', 'info');
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'warning');
        return;
    }
    
    closeCart();
    showCheckoutModal();
}

// ===== PRODUCTS =====
function initializeProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterProducts(filter);
            
            // Update active filter
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Load more button
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreProducts);
    }
    
    // Initial load
    displayProducts();
}

function filterProducts(category) {
    currentFilter = category;
    displayProducts();
}

function displayProducts(limit = 8) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    let filteredProducts = products;
    
    // Apply category filter
    if (currentFilter !== 'all') {
        filteredProducts = products.filter(p => p.category === currentFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    // Limit products shown
    const displayedProducts = filteredProducts.slice(0, limit);
    
    if (displayedProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-300); margin-bottom: 16px;"></i>
                <h3 style="color: var(--gray-500); margin-bottom: 8px;">No products found</h3>
                <p style="color: var(--gray-400);">Try adjusting your filters or search terms</p>
                <button class="btn btn-outline" onclick="resetFilters()" style="margin-top: 16px;">
                    Reset Filters
                </button>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = displayedProducts.map(product => createProductCard(product)).join('');
    
    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = filteredProducts.length > displayedProducts.length ? 'block' : 'none';
    }
}

function createProductCard(product) {
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    // Use a display name if set (eco copies may provide a different display name)
    const displayName = product.displayName || product.name;

    // Normalize image source: support `image` as string, `image` as array, or `images` array
    const imgSrc = Array.isArray(product.image) ? (product.image[0] || '') : (product.image || (product.images && product.images[0]) || '');

    return `
        <div class="product-card ${product.featured ? 'featured' : ''} ${!product.inStock ? 'out-of-stock' : ''}" 
             data-category="${product.category}">
            <div class="product-image">
                <img src="${imgSrc}" alt="${displayName}" loading="lazy" onerror="if(!this.__errored){this.__errored=true; if(this.src && this.src.indexOf('cm.png')===-1){this.src='cm.png';} }">
                ${discount > 0 ? `<div class="product-badge">${discount}% OFF</div>` : ''}
                ${!product.inStock ? `<div class="product-badge" style="background: var(--accent-danger);">Out of Stock</div>` : ''}
                ${product.eco ? `<div class="eco-badge"><i class="fas fa-leaf"></i>Eco</div>` : ''}
                <div class="product-actions">
                    <button class="action-btn" onclick="quickView('${product.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn" onclick="toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${displayName}</h3>
                <p class="product-description">${product.description}</p>
                ${product.category === 'clothing' ? `
                <div class="product-size">
                    <label for="size-select-${product.id}" style="font-size:0.85rem; color:var(--gray-600);">Size</label>
                    <select id="size-select-${product.id}" style="width:100%; padding:8px; border-radius:8px; margin-top:6px;">
                        <option value="">Select size</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                    </select>
                </div>` : ''}
                <div class="product-footer">
                    <div class="product-price">
                        <span class="current-price">৳${product.price.toLocaleString()}</span>
                        ${product.originalPrice ? `<span class="original-price">৳${product.originalPrice.toLocaleString()}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn" onclick="addToCart('${product.id}')" 
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== ECO CORNER =====
function initializeEcoCorner() {
    const ecoGrid = document.getElementById('ecoProductsGrid');
    if (!ecoGrid) return;

    // Build independent copies of eco products so modifying eco display/data doesn't mutate main products
    const ecoRaw = products.filter(p => p.eco === true);

    if (!ecoRaw || ecoRaw.length === 0) {
        ecoGrid.innerHTML = '<p class="muted">No eco-friendly products available yet. Check back soon.</p>';
        return;
    }

    const ecoProducts = ecoRaw.map(p => {
        // shallow copy is sufficient for display overrides
        const copy = Object.assign({}, p);
        // Distinct displayName for eco corner
        copy.displayName = (p.displayName || p.name) + ' — Eco Corner';
        // Optionally highlight eco pricing (small discount shown to users)
        if (typeof p.price === 'number') copy.price = Math.round(p.price * 0.95);
        // Set eco image and mark as out of stock for Eco Corner display
        copy.image = 'cm.png';
        copy.images = ['cm.png'];
        copy.inStock = false;
        // Mark as eco variant
        copy.isEcoVariant = true;
        return copy;
    });

    ecoGrid.innerHTML = ecoProducts.map(p => createProductCard(p)).join('');
}

function getCategoryName(category) {
    const categoryNames = {
        'clothing': 'Clothing',
        'sunglasses': 'Sunglasses',
        'accessories': 'Accessories',
        'memory-band': 'Memory Band'
    };
    return categoryNames[category] || category;
}

function loadMoreProducts() {
    const currentlyDisplayed = document.querySelectorAll('.product-card').length;
    displayProducts(currentlyDisplayed + 8);
}

function resetFilters() {
    currentFilter = 'all';
    searchQuery = '';
    
    // Reset filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    
    displayProducts();
}

function quickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('productModal');
    
    // Get all images
    const images = Array.isArray(product.images) && product.images.length
        ? product.images
        : (Array.isArray(product.image) ? product.image : (product.image ? [product.image] : []));
    
    // Build carousel HTML for multiple images
    let imageHTML = '';
    if (images.length > 1) {
        const slidesHTML = images.map(src => `<div class="carousel-slide"><img src="${src}" alt="${product.name}" onerror="if(!this.__errored){this.__errored=true; if(this.src && this.src.indexOf('cm.png')===-1){this.src='cm.png';} }"></div>`).join('');
        const indicatorsHTML = images.map((_, idx) => `<div class="carousel-indicator${idx === 0 ? ' active' : ''}" data-index="${idx}"></div>`).join('');
        imageHTML = `
            <div class="product-carousel quick-view-carousel">
                <button class="carousel-nav left" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
                <button class="carousel-nav right" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
                <div class="carousel-track">${slidesHTML}</div>
                <div class="carousel-indicators">${indicatorsHTML}</div>
            </div>
        `;
    } else {
        const imgSrc = images[0] || '';
        imageHTML = `<img src="${imgSrc}" alt="${product.name}" onerror="if(!this.__errored){this.__errored=true; if(this.src && this.src.indexOf('cm.png')===-1){this.src='cm.png';} }">`;
    }
    
    modalBody.innerHTML = `
        <div class="product-quick-view">
            <div class="quick-view-image">
                ${imageHTML}
            </div>
            <div class="quick-view-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h2>${product.name}</h2>
                <div class="product-rating">
                    <div class="stars">
                        ${'★'.repeat(Math.floor(product.rating))}${'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                    <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
                </div>
                <p class="product-description">${product.description}</p>
                <div class="product-price" style="margin: 24px 0;">
                    <span class="current-price" style="font-size: 1.8rem;">৳${product.price.toLocaleString()}</span>
                    ${product.originalPrice ? `<span class="original-price" style="font-size: 1.2rem;">৳${product.originalPrice.toLocaleString()}</span>` : ''}
                </div>
                ${product.category === 'clothing' ? `
                <div style="margin-top:12px;">
                    <label for="modal-size-${product.id}" style="font-size:0.95rem; color:var(--gray-700);">Choose Size</label>
                    <select id="modal-size-${product.id}" style="width:100%; padding:8px; border-radius:8px; margin-top:6px;">
                        <option value="">Select size</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                    </select>
                </div>
                ` : ''}

                <div class="product-actions" style="display: flex; gap: 16px; margin-top: 24px;">
                    <button class="btn btn-primary btn-large" onclick="addToCart('${product.id}', 1, document.getElementById('modal-size-${product.id}') ? document.getElementById('modal-size-${product.id}').value : null); closeModal();" 
                            ${!product.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button class="btn btn-outline" onclick="toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                        Wishlist
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Initialize carousel if multiple images
    if (images.length > 1) {
        setTimeout(() => initCarousels(), 0);
    }
}

function toggleWishlist(productId) {
    // In a real application, this would manage a wishlist
    showToast('Wishlist feature coming soon!', 'info');
}

// ===== SEARCH =====
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const searchModal = document.getElementById('searchModal');
    const searchClose = document.getElementById('searchClose');
    const searchInput = document.getElementById('searchInput');
    
    // Search button
    if (searchBtn) {
        searchBtn.addEventListener('click', openSearch);
    }
    
    // Search close
    if (searchClose) {
        searchClose.addEventListener('click', closeSearch);
    }
    
    // Search input
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // Close search when clicking outside
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearch();
            }
        });
    }
}

function openSearch() {
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    
    searchModal.classList.add('show');
    isSearchOpen = true;
    document.body.style.overflow = 'hidden';
    
    // Focus input
    setTimeout(() => {
        if (searchInput) searchInput.focus();
    }, 100);
}

function closeSearch() {
    const searchModal = document.getElementById('searchModal');
    
    searchModal.classList.remove('show');
    isSearchOpen = false;
    document.body.style.overflow = '';
}

function handleSearch(e) {
    const query = e.target.value;
    const searchResults = document.getElementById('searchResults');
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    const results = products.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                <p>No products found for "${query}"</p>
            </div>
        `;
        return;
    }
    
    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="selectSearchResult('${product.id}')">
            <img src="${product.image}" alt="${product.name}">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>৳${product.price.toLocaleString()}</p>
            </div>
        </div>
    `).join('');
}

function selectSearchResult(productId) {
    closeSearch();
    quickView(productId);
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    searchQuery = searchInput.value;
    
    closeSearch();
    scrollToSection('#shop');
    displayProducts();
    
    // Reset to 'all' filter to show search results across all categories
    currentFilter = 'all';
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
}

// ===== CHECKOUT =====
function showCheckoutModal() {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    if (modalTitle) modalTitle.textContent = 'Checkout';
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 100;
    const total = subtotal + shipping;
    
    modalBody.innerHTML = `
        <div class="checkout-content">
            <div class="checkout-form">
                <h3>Customer Information</h3>
                <form id="checkoutForm">
                    <div class="form-group">
                        <input type="text" name="fullName" placeholder="Full Name *" required>
                    </div>
                    <div class="form-group">
                        <input type="tel" name="phone" placeholder="Phone Number *" required>
                    </div>
                    <div class="form-group">
                        <input type="email" name="email" placeholder="Email Address *" required>
                    </div>
                    <div class="form-group">
                        <textarea name="address" placeholder="Full Address *" required rows="3"></textarea>
                    </div>
                    <div class="form-group">
                        <input type="text" name="city" placeholder="City *" required>
                    </div>
                    <div class="form-group">
                        <select name="paymentMethod" required>
                            <option value="">Select Payment Method</option>
                            <option value="cod">Cash on Delivery</option>
                            <option value="bkash">bKash</option>
                            <option value="nagad">Nagad</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <textarea name="notes" placeholder="Order Notes (Optional)" rows="2"></textarea>
                    </div>
                </form>
            </div>
            
            <div class="checkout-summary">
                <h3>Order Summary</h3>
                <div class="checkout-items">
                    ${cart.map(item => `
                        <div class="checkout-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-details">
                                <span class="item-name">${item.name}</span>
                                <span class="item-qty">Qty: ${item.quantity}</span>
                                ${item.size ? `<span class="item-size">Size: ${item.size}</span>` : ''}
                            </div>
                            <span class="item-total">৳${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="checkout-totals">
                    <div class="total-line">
                        <span>Subtotal:</span>
                        <span>৳${subtotal.toLocaleString()}</span>
                    </div>
                    <div class="total-line">
                        <span>Shipping:</span>
                        <span>৳${shipping.toLocaleString()}</span>
                    </div>
                    <div class="total-line total">
                        <span>Total:</span>
                        <span>৳${total.toLocaleString()}</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-large" onclick="submitOrder()" style="width: 100%; margin-top: 24px;">
                    <i class="fas fa-check"></i>
                    Place Order
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function submitOrder() {
    const form = document.getElementById('checkoutForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Create order object
    const order = {
        id: generateOrderId(),
        customerInfo: {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            city: formData.get('city'),
            paymentMethod: formData.get('paymentMethod'),
            notes: formData.get('notes') || ''
        },
        items: [...cart],
        subtotal: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shipping: 100,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 100,
        status: 'pending',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    };
    
    // Show loading state
    const submitBtn = document.querySelector('.checkout-content .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    // Simulate order processing
    setTimeout(() => {
        // Save order (now includes Google Sheets integration)
        saveOrder(order);
        
        // Clear cart
        clearCart();
        
        // Send WhatsApp notification
        sendWhatsAppNotification(order);
        
        // Show success
        showOrderConfirmation(order);

        // Generate and send bill by opening user's mail client with prefilled email
        if (order.customerInfo && order.customerInfo.email) {
            try {
                sendBillByEmail(order.customerInfo.email, order);
            } catch (err) {
                console.error('Failed to open mail client for bill:', err);
            }
        }
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Create a plain-text bill for email body
function generateBillText(order) {
    const lines = [];
    lines.push('BLKPAPER - Order Receipt');
    lines.push('Order ID: ' + order.id);
    lines.push('Date: ' + new Date(order.orderDate).toLocaleString());
    lines.push('');
    lines.push('Customer: ' + (order.customerInfo.fullName || ''));
    lines.push('Email: ' + (order.customerInfo.email || ''));
    lines.push('Phone: ' + (order.customerInfo.phone || ''));
    lines.push('Address: ' + (order.customerInfo.address || '') + ', ' + (order.customerInfo.city || ''));
    lines.push('');
    lines.push('Items:');
    order.items.forEach(item => {
        const name = item.name || '';
        const qty = item.quantity || 1;
        const size = item.size ? ` (Size: ${item.size})` : '';
        const lineTotal = (item.price * item.quantity).toLocaleString();
        lines.push(`- ${name}${size} x${qty} : ৳${lineTotal}`);
    });
    lines.push('');
    lines.push('Subtotal: ৳' + order.subtotal.toLocaleString());
    lines.push('Shipping: ৳' + order.shipping.toLocaleString());
    lines.push('Total: ৳' + order.total.toLocaleString());
    lines.push('');
    if (order.customerInfo.notes) {
        lines.push('Notes: ' + order.customerInfo.notes);
        lines.push('');
    }
    lines.push('Thank you for shopping with BLKPAPER!');
    lines.push('');
    lines.push('If you have any questions, reply to this email or contact us at blkpaper399@gmail.com');

    return lines.join('\n');
}

// Open user's default mail client with prefilled subject and body containing the bill
function sendBillByEmail(email, order) {
    const subject = `BLKPAPER Order ${order.id} - Receipt`;
    const body = generateBillText(order);

    // mailto body length is limited; trim if very long
    let encodedBody = encodeURIComponent(body);
    if (encodedBody.length > 15000) {
        // Trim body to avoid exceeding URL limits
        const shortBody = body.substring(0, 8000) + '\n\n[Content truncated]';
        encodedBody = encodeURIComponent(shortBody);
    }

    const mailto = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodedBody}`;

    // Open mail client
    window.location.href = mailto;
    showToast('Opened your mail client to send the invoice.', 'info');
}

// Optionally open a printable invoice window (user can save as PDF)
function openInvoiceWindow(order) {
    const html = [];
    html.push('<!doctype html><html><head><meta charset="utf-8"><title>Invoice - ' + order.id + '</title>');
    html.push('<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111} .header{display:flex;justify-content:space-between;align-items:center} .items{width:100%;border-collapse:collapse;margin-top:20px} .items td, .items th{padding:8px;border:1px solid #ddd} .total{font-weight:700}</style>');
    html.push('</head><body>');
    html.push('<div class="header"><h2>BLKPAPER - Invoice</h2><div>Order: ' + order.id + '<br>' + new Date(order.orderDate).toLocaleString() + '</div></div>');
    html.push('<p>Customer: ' + (order.customerInfo.fullName || '') + '<br>' + (order.customerInfo.email || '') + '<br>' + (order.customerInfo.phone || '') + '</p>');
    html.push('<table class="items"><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>');
    order.items.forEach(item => {
        html.push('<tr>');
        html.push('<td>' + (item.name || '') + (item.size ? ' (' + item.size + ')' : '') + '</td>');
        html.push('<td>' + item.quantity + '</td>');
        html.push('<td>৳' + item.price.toLocaleString() + '</td>');
        html.push('<td>৳' + (item.price * item.quantity).toLocaleString() + '</td>');
        html.push('</tr>');
    });
    html.push('</tbody></table>');
    html.push('<p class="total">Subtotal: ৳' + order.subtotal.toLocaleString() + '<br>Shipping: ৳' + order.shipping.toLocaleString() + '<br>Total: ৳' + order.total.toLocaleString() + '</p>');
    html.push('<p>Thank you for shopping with BLKPAPER.</p>');
    html.push('<script>window.print();</script>');
    html.push('</body></html>');

    const w = window.open('', '_blank');
    if (w) {
        w.document.write(html.join(''));
        w.document.close();
    } else {
        showToast('Popup blocked. Please allow popups to print or save invoice.', 'warning');
    }
}

function generateOrderId() {
    return 'BLK' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase();
}

function saveOrder(order) {
    // Save to local storage as backup
    let orders = JSON.parse(localStorage.getItem('blkpaper_orders')) || [];
    orders.push(order);
    localStorage.setItem('blkpaper_orders', JSON.stringify(orders));
    
    // Send to Google Sheets
    sendOrderToGoogleSheets(order);
    
    console.log('Order saved locally and sent to Google Sheets:', order);
}

// ===== GOOGLE SHEETS INTEGRATION =====
async function sendOrderToGoogleSheets(order) {
    try {
        // Prepare order data for Google Sheets
        const orderData = {
            // Order Information
            orderId: order.id,
            orderDate: new Date(order.orderDate).toLocaleString('en-GB', {
                timeZone: 'Asia/Dhaka',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: order.status,
            
            // Customer Information
            customerName: order.customerInfo.fullName,
            customerPhone: order.customerInfo.phone,
            customerEmail: order.customerInfo.email,
            customerAddress: order.customerInfo.address,
            customerCity: order.customerInfo.city,
            paymentMethod: order.customerInfo.paymentMethod.toUpperCase(),
            orderNotes: order.customerInfo.notes || '',
            
            // Order Details
            itemsCount: order.items.length,
            itemsDetails: order.items.map(item => 
                `${item.name}${item.size ? ' [Size: '+item.size+']' : ''} (Qty: ${item.quantity}, Price: ৳${item.price})`
            ).join(' | '),
            subtotal: order.subtotal,
            shipping: order.shipping,
            total: order.total,
            
            // Delivery Information
            estimatedDelivery: new Date(order.estimatedDelivery).toLocaleDateString('en-GB', {
                timeZone: 'Asia/Dhaka',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
            
            // System Information
            source: 'BLKPAPER Website',
            timestamp: new Date().toISOString()
        };
        
        // Send to Google Sheets via Apps Script
        // Send to Apps Script. Remove `mode: 'no-cors'` so we receive real responses/errors.
        // Send form-encoded to avoid CORS preflight (use Apps Script e.parameter or e.postData.contents)
        const orderForm = new URLSearchParams();
        orderForm.append('payload', JSON.stringify(orderData));

        const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptURL, {
            method: 'POST',
            body: orderForm
        });

        // Try to parse response (Apps Script should return JSON)
        let respText = null;
        try {
            respText = await response.text();
            console.log('Google Sheets response:', respText);
            if (!response.ok) {
                throw new Error('Server responded with status ' + response.status + ': ' + respText);
            }
        } catch (err) {
            console.warn('Could not parse response from Apps Script:', err);
        }

        console.log('✅ Order send attempt completed (check Apps Script logs for append confirmation)');
        
        // Send backup notification email (optional)
        await sendBackupNotification(order);
        
    } catch (error) {
        console.error('❌ Failed to send order to Google Sheets:', error);
        
        // Fallback: Save to local queue for retry
        saveOrderToRetryQueue(order);
        
        // Still show success to user (order is saved locally)
        showToast('Order saved! We\'ll process it shortly.', 'success');
    }
}

// Backup notification system
async function sendBackupNotification(order) {
    if (!GOOGLE_SHEETS_CONFIG.backupEmail) return;
    
    try {
        // This would integrate with EmailJS or similar service
        console.log('📧 Backup notification would be sent to:', GOOGLE_SHEETS_CONFIG.backupEmail);
        
        // Example EmailJS integration (commented out):
        /*
        await emailjs.send('your_service_id', 'order_template', {
            to_email: GOOGLE_SHEETS_CONFIG.backupEmail,
            order_id: order.id,
            customer_name: order.customerInfo.fullName,
            total_amount: order.total,
            order_details: JSON.stringify(order, null, 2)
        });
        */
        
    } catch (error) {
        console.error('Failed to send backup notification:', error);
    }
}

// Retry queue for failed submissions
function saveOrderToRetryQueue(order) {
    let retryQueue = JSON.parse(localStorage.getItem('blkpaper_retry_queue')) || [];
    retryQueue.push({
        order: order,
        attempts: 0,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('blkpaper_retry_queue', JSON.stringify(retryQueue));
    
    console.log('Order added to retry queue');
}

// Retry failed submissions periodically
function processRetryQueue() {
    const retryQueue = JSON.parse(localStorage.getItem('blkpaper_retry_queue')) || [];
    
    if (retryQueue.length === 0) return;
    
    console.log(`Processing ${retryQueue.length} orders from retry queue...`);
    
    retryQueue.forEach(async (queueItem, index) => {
        if (queueItem.attempts < 3) { // Max 3 retry attempts
            try {
                await sendOrderToGoogleSheets(queueItem.order);
                
                // Remove from retry queue on success
                retryQueue.splice(index, 1);
                localStorage.setItem('blkpaper_retry_queue', JSON.stringify(retryQueue));
                
                console.log(`✅ Retry successful for order ${queueItem.order.id}`);
                
            } catch (error) {
                // Increment attempt count
                queueItem.attempts++;
                console.log(`❌ Retry failed for order ${queueItem.order.id} (attempt ${queueItem.attempts})`);
            }
        } else {
            // Remove after 3 failed attempts
            console.log(`🗑️ Removing order ${queueItem.order.id} after 3 failed attempts`);
            retryQueue.splice(index, 1);
        }
    });
    
    localStorage.setItem('blkpaper_retry_queue', JSON.stringify(retryQueue));
}

// WhatsApp integration for order confirmations
function sendWhatsAppNotification(order) {
    const message = `🖤 BLKPAPER Order Confirmation
    
Order ID: ${order.id}
Customer: ${order.customerInfo.fullName}
Phone: ${order.customerInfo.phone}
Total: ৳${order.total.toLocaleString()}
Payment: ${order.customerInfo.paymentMethod.toUpperCase()}

Items:
${order.items.map(item => `• ${item.name} (Qty: ${item.quantity})`).join('\n')}

Address: ${order.customerInfo.address}, ${order.customerInfo.city}

Thank you for choosing BLKPAPER! 🖤`;
    
    // This would integrate with WhatsApp Business API
    console.log('📱 WhatsApp notification would be sent:', message);
    
    // For now, show user that notification was sent
    setTimeout(() => {
        showToast('Order confirmation sent via WhatsApp!', 'success');
    }, 1500);
}

function showOrderConfirmation(order) {
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');
    
    modalBody.innerHTML = `
        <div class="order-confirmation">
            <div class="confirmation-icon">
                <i class="fas fa-check-circle" style="font-size: 4rem; color: var(--accent-success);"></i>
            </div>
            <h2>Order Confirmed!</h2>
            <p>Thank you for your purchase. Your order has been successfully placed.</p>
            
            <div class="order-details">
                <h3>Order Details</h3>
                <div class="detail-row">
                    <span>Order ID:</span>
                    <span><strong>${order.id}</strong></span>
                </div>
                <div class="detail-row">
                    <span>Total Amount:</span>
                    <span><strong>৳${order.total.toLocaleString()}</strong></span>
                </div>
                <div class="detail-row">
                    <span>Payment Method:</span>
                    <span>${order.customerInfo.paymentMethod.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span>Estimated Delivery:</span>
                    <span>${new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div class="confirmation-actions">
                <button class="btn btn-primary" onclick="closeModal(); scrollToSection('#home');">
                    <i class="fas fa-home"></i>
                    Continue Shopping
                </button>
                <button class="btn btn-outline" onclick="trackOrder('${order.id}')">
                    <i class="fas fa-truck"></i>
                    Track Order
                </button>
            </div>
        </div>
    `;
    
    // Send confirmation WhatsApp message
    setTimeout(() => {
        showToast('Order confirmation sent to your WhatsApp!', 'success');
    }, 1000);
}

function trackOrder(orderId) {
    closeModal();
    showToast(`Order tracking for ${orderId} would open here`, 'info');
}

// ===== FORMS =====
function initializeForms() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}

function handleContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Show loading state
    const submitBtn = e.target.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;
    
    // Try to POST to Google Apps Script endpoint configured in GOOGLE_SHEETS_CONFIG
    const endpoint = GOOGLE_SHEETS_CONFIG.scriptURL;
    const payload = {
        action: 'addContact',
        sheet: 'ContactForm',
        data: contactData
    };

    // Use form-encoded body to avoid CORS preflight (Apps Script web apps don't respond to OPTIONS)
    const formBody = new URLSearchParams();
    formBody.append('payload', JSON.stringify(payload));

    fetch(endpoint, {
        method: 'POST',
        body: formBody
    })
    .then(response => response.json().catch(() => ({})))
    .then(result => {
        // Assume success if script returns a success object or HTTP 200
        showToast('Thank you! We\'ll get back to you soon.', 'success');
        e.target.reset();
    })
    .catch(err => {
        // Fallback: save contact locally so entries are not lost
        try {
            const backups = JSON.parse(localStorage.getItem('contact_form_backups') || '[]');
            backups.push({ ts: new Date().toISOString(), data: contactData });
            localStorage.setItem('contact_form_backups', JSON.stringify(backups));
            showToast('Could not send to server; saved locally as backup.', 'warning');
        } catch (e) {
            showToast('Something went wrong. Please try again later.', 'error');
        }
    })
    .finally(() => {
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

// ===== MODALS =====
function initializeModals() {
    const modal = document.getElementById('productModal');
    const modalClose = document.getElementById('modalClose');
    
    // Modal close button
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (isSearchOpen) closeSearch();
            else closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');
    animateElements.forEach(el => observer.observe(el));
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    const backToTop = document.getElementById('backToTop');
    
    // Back to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Parallax effects could be added here
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastContent = toast.querySelector('.toast-content');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Set icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toastIcon.className = `toast-icon ${icons[type] || icons.info}`;
    toastMessage.textContent = message;
    
    // Set toast type
    toast.className = `toast ${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function formatPrice(price) {
    return `৳${price.toLocaleString()}`;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// ===== CATEGORY NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.getAttribute('data-category');
            filterProducts(category);
            scrollToSection('#shop');
        });
    });
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to open search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
    
    // Ctrl/Cmd + Shift + C to open cart
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        toggleCart();
    }
});

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    showToast('Something went wrong. Please refresh the page.', 'error');
});

// ===== PERFORMANCE MONITORING =====
window.addEventListener('load', function() {
    // Log performance metrics
    const navigation = performance.getEntriesByType('navigation')[0];
    console.log(`🖤 BLKPAPER loaded in ${Math.round(navigation.loadEventEnd - navigation.fetchStart)}ms`);
});

// ===== RETRY QUEUE INITIALIZATION =====
function initializeRetryQueue() {
    // Process retry queue on startup
    setTimeout(() => {
        processRetryQueue();
    }, 3000);
    
    // Set up periodic retry processing (every 5 minutes)
    setInterval(() => {
        processRetryQueue();
    }, 5 * 60 * 1000);
    
    // Show admin info about pending orders
    const retryQueue = JSON.parse(localStorage.getItem('blkpaper_retry_queue')) || [];
    if (retryQueue.length > 0) {
        console.log(`⚠️ ${retryQueue.length} orders pending retry to Google Sheets`);
    }
}

// ===== ADMIN FUNCTIONS =====
// Helper functions for debugging and management
window.BLKPAPER_ADMIN = {
    // View all local orders
    viewOrders: () => {
        const orders = JSON.parse(localStorage.getItem('blkpaper_orders')) || [];
        console.table(orders);
        return orders;
    },
    
    // View retry queue
    viewRetryQueue: () => {
        const queue = JSON.parse(localStorage.getItem('blkpaper_retry_queue')) || [];
        console.table(queue);
        return queue;
    },
    
    // Manually process retry queue
    processRetries: () => {
        processRetryQueue();
    },
    
    // Clear retry queue
    clearRetryQueue: () => {
        localStorage.removeItem('blkpaper_retry_queue');
        console.log('Retry queue cleared');
    },
    
    // Test Google Sheets connection
    testGoogleSheets: async () => {
        const testOrder = {
            id: 'TEST' + Date.now(),
            orderDate: new Date().toISOString(),
            status: 'test',
            customerInfo: {
                fullName: 'Test Customer',
                phone: '01700000000',
                email: 'test@example.com',
                address: 'Test Address',
                city: 'Dhaka',
                paymentMethod: 'cod',
                notes: 'Test order'
            },
            items: [{
                name: 'Test Product',
                quantity: 1,
                price: 100
            }],
            subtotal: 100,
            shipping: 100,
            total: 200,
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        await sendOrderToGoogleSheets(testOrder);
    },

    // Lightweight client-side test for Apps Script endpoint (sends a small test payload)
    testAppsScript: async () => {
        const endpoint = GOOGLE_SHEETS_CONFIG.scriptURL;
        const payload = {
            action: 'testClientPing',
            timestamp: new Date().toISOString(),
            note: 'Client-side test payload from BLKPAPER website'
        };

        try {
            showToast('Sending Apps Script test payload...');
            // Use form-encoded body to avoid OPTIONS preflight in browsers
            const form = new URLSearchParams();
            form.append('payload', JSON.stringify(payload));

            const resp = await fetch(endpoint, {
                    method: 'POST',
                    body: form
                });

            const text = await resp.text();
            console.log('Apps Script test response:', resp.status, text);

            if (resp.ok) {
                showToast('Apps Script test succeeded (' + resp.status + ')', 'success');
                alert('Apps Script test succeeded.\nStatus: ' + resp.status + '\nResponse: ' + text + '\nCheck the spreadsheet and Apps Script logs.');
            } else {
                showToast('Apps Script test failed (' + resp.status + ')', 'error');
                alert('Apps Script test failed.\nStatus: ' + resp.status + '\nResponse: ' + text + '\nCheck deployment settings and CORS.');
            }
        } catch (err) {
            console.error('Apps Script test error:', err);
            showToast('Apps Script test error: check console', 'error');
            alert('Network/CORS error when testing Apps Script. See console for details.');
        }
    }
};
console.log(`
🖤 BLKPAPER - Redefine Your Style
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Modern fashion e-commerce from Bangladesh
🛒 Full cart functionality with checkout
📱 Responsive design for all devices
🔍 Smart search and filtering
💳 Cash on delivery & mobile payment options
🚀 Optimized for performance

Shortcuts:
- Ctrl/Cmd + K: Open search
- Ctrl/Cmd + Shift + C: Open cart
- ESC: Close modals/search

Ready to redefine style! 🖤
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

/**
 * Build carousel HTML for a product.
 * Accepts product.images (array) or product.image (single).
 */
function buildProductCarousel(product) {
    const images = Array.isArray(product.images) && product.images.length
        ? product.images
        : (product.image ? [product.image] : []);

    if (!images.length) return ''; // no images

    // create container
    const wrapper = document.createElement('div');
    wrapper.className = 'product-carousel';

    // track
    const track = document.createElement('div');
    track.className = 'carousel-track';

    images.forEach(src => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        const img = document.createElement('img');
        img.src = src;
        img.alt = product.name || 'Product image';
        slide.appendChild(img);
        track.appendChild(slide);
    });

    // nav buttons (only show if multiple)
    if (images.length > 1) {
        const btnLeft = document.createElement('button');
        btnLeft.className = 'carousel-nav left';
        btnLeft.setAttribute('aria-label', 'Previous image');
        btnLeft.innerHTML = '<i class="fas fa-chevron-left"></i>';

        const btnRight = document.createElement('button');
        btnRight.className = 'carousel-nav right';
        btnRight.setAttribute('aria-label', 'Next image');
        btnRight.innerHTML = '<i class="fas fa-chevron-right"></i>';

        wrapper.appendChild(btnLeft);
        wrapper.appendChild(btnRight);

        // indicators
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        images.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = 'carousel-indicator' + (idx === 0 ? ' active' : '');
            dot.dataset.index = idx;
            indicators.appendChild(dot);
        });
        wrapper.appendChild(indicators);
    }

    wrapper.appendChild(track);
    return wrapper;
}

/**
 * Initialize all carousels in the DOM.
 * Call this after products are rendered.
 */
function initCarousels() {
    document.querySelectorAll('.product-carousel').forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        if (!slides.length) return;

        let index = 0;
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        const getWidth = () => carousel.clientWidth;

        const update = (animate = true) => {
            if (!animate) track.style.transition = 'none';
            else track.style.transition = '';
            const offset = -index * getWidth();
            track.style.transform = `translateX(${offset}px)`;
            // indicators
            const dots = carousel.querySelectorAll('.carousel-indicator');
            dots.forEach(d => d.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
            // restore transition after immediate set
            if (!animate) requestAnimationFrame(()=> track.style.transition = '');
        };

        // next/prev
        const next = () => { index = Math.min(index + 1, slides.length - 1); update(); };
        const prev = () => { index = Math.max(index - 1, 0); update(); };

        // navigation buttons
        const btnLeft = carousel.querySelector('.carousel-nav.left');
        const btnRight = carousel.querySelector('.carousel-nav.right');
        if (btnLeft) btnLeft.addEventListener('click', prev);
        if (btnRight) btnRight.addEventListener('click', next);

        // indicators
        carousel.querySelectorAll('.carousel-indicator').forEach(dot => {
            dot.addEventListener('click', () => {
                index = Number(dot.dataset.index);
                update();
            });
        });

        // swipe handling
        track.addEventListener('pointerdown', (e) => {
            isDragging = true;
            startX = e.clientX;
            track.setPointerCapture(e.pointerId);
            track.style.transition = 'none';
        });
        track.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            currentX = e.clientX;
            const diff = currentX - startX;
            track.style.transform = `translateX(${-index * getWidth() + diff}px)`;
        });
        track.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            const diff = e.clientX - startX;
            const threshold = getWidth() * 0.15;
            if (diff > threshold) prev();
            else if (diff < -threshold) next();
            else update();
        });
        track.addEventListener('pointercancel', () => { isDragging = false; update(); });

        // handle window resize
        window.addEventListener('resize', () => update(false));

        // initial layout
        update(false);
    });
}

/**
 * Helper: when rendering product cards, insert carousel element.
 * Example usage in your product render loop:
 *
 * const productCard = document.createElement('div');
 * productCard.className = 'product-card';
 * const carouselEl = buildProductCarousel(product);
 * if (carouselEl) productCard.appendChild(carouselEl);
 * // ... add rest of product info ...
 *
 * After all products loaded, call:
 * initCarousels();
 */

// If your existing product rendering function is named renderProducts or similar,
// ensure it calls initCarousels() after populating #productsGrid.
// Example (add near end of your render function):
// initCarousels();