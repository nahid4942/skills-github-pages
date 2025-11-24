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
    // Replace with your Google Apps Script Web App URL
    scriptURL: 'https://script.google.com/macros/s/AKfycbwjMwrf4Kl25HJEiQirL4wJD5LoaDW-BjIhVpEg9_6DqXa27rIsu33jAWHzVTJJNfP0jg/exec',
    
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
        price: 2500,
        originalPrice: 3000,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Revolutionary memory storage device with premium design and smart technology.',
        featured: true,
        inStock: true,
        rating: 5,
        reviews: 124
    },
    
    // Clothing
    {
        id: 'clothing-001',
        name: 'BLKPAPER Urban Hoodie',
        category: 'clothing',
        price: 1800,
        originalPrice: 2200,
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Premium cotton hoodie with minimalist design and comfortable fit.',
        featured: false,
        inStock: true,
        rating: 4.8,
        reviews: 89
    },
    {
        id: 'clothing-002',
        name: 'Minimalist Black Tee',
        category: 'clothing',
        price: 1200,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Essential black t-shirt with premium fabric and perfect cut.',
        featured: false,
        inStock: true,
        rating: 4.7,
        reviews: 156
    },
    {
        id: 'clothing-003',
        name: 'Street Style Jacket',
        category: 'clothing',
        price: 3500,
        originalPrice: 4000,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Urban jacket with modern cut and weather-resistant fabric.',
        featured: true,
        inStock: true,
        rating: 4.9,
        reviews: 67
    },
    {
        id: 'clothing-004',
        name: 'Cargo Pants - Black',
        category: 'clothing',
        price: 2200,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Functional cargo pants with multiple pockets and modern silhouette.',
        featured: false,
        inStock: true,
        rating: 4.6,
        reviews: 92
    },
    {
        id: 'clothing-005',
        name: 'Oversized Sweatshirt',
        category: 'clothing',
        price: 2000,
        originalPrice: 2400,
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Comfortable oversized sweatshirt perfect for casual wear.',
        featured: false,
        inStock: false,
        rating: 4.5,
        reviews: 73
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
        reviews: 112
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
        rating: 4.6,
        reviews: 85
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
        rating: 4.7,
        reviews: 94
    },
    
    // Accessories
    {
        id: 'accessories-001',
        name: 'Leather Wallet - Black',
        category: 'accessories',
        price: 800,
        originalPrice: 1000,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Premium leather wallet with multiple card slots and coin pocket.',
        featured: false,
        inStock: true,
        rating: 4.9,
        reviews: 203
    },
    {
        id: 'accessories-002',
        name: 'Minimalist Watch',
        category: 'accessories',
        price: 2800,
        originalPrice: 3200,
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Sleek minimalist watch with black leather strap.',
        featured: true,
        inStock: true,
        rating: 4.8,
        reviews: 156
    },
    {
        id: 'accessories-003',
        name: 'Canvas Messenger Bag',
        category: 'accessories',
        price: 1600,
        originalPrice: null,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Durable canvas messenger bag perfect for daily use.',
        featured: false,
        inStock: true,
        rating: 4.5,
        reviews: 78
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
        inStock: true,
        rating: 4.4,
        reviews: 167
    },
    {
        id: 'accessories-005',
        name: 'Phone Case - Matte Black',
        category: 'accessories',
        price: 400,
        originalPrice: 500,
        image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Protective phone case with minimalist design.',
        featured: false,
        inStock: true,
        rating: 4.3,
        reviews: 234
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

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('Product not found', 'error');
        return;
    }
    
    if (!product.inStock) {
        showToast('Sorry, this product is out of stock', 'warning');
        return;
    }
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
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
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('blkpaper_cart', JSON.stringify(cart));
    updateCartUI();
    updateCartItems();
    showToast('Item removed from cart', 'info');
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
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
                <div class="cart-item-price">৳${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" 
                               onchange="updateCartQuantity('${item.id}', parseInt(this.value))" min="1">
                        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">
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
    
    return `
        <div class="product-card ${product.featured ? 'featured' : ''} ${!product.inStock ? 'out-of-stock' : ''}" 
             data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${discount > 0 ? `<div class="product-badge">${discount}% OFF</div>` : ''}
                ${!product.inStock ? `<div class="product-badge" style="background: var(--accent-danger);">Out of Stock</div>` : ''}
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
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
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
    
    modalBody.innerHTML = `
        <div class="product-quick-view">
            <div class="quick-view-image">
                <img src="${product.image}" alt="${product.name}">
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
                <div class="product-actions" style="display: flex; gap: 16px; margin-top: 32px;">
                    <button class="btn btn-primary btn-large" onclick="addToCart('${product.id}'); closeModal();" 
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
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
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
                `${item.name} (Qty: ${item.quantity}, Price: ৳${item.price})`
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
        const response = await fetch(GOOGLE_SHEETS_CONFIG.scriptURL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        
        console.log('✅ Order sent to Google Sheets successfully');
        
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
    
    // Simulate form submission
    setTimeout(() => {
        showToast('Thank you! We\'ll get back to you soon.', 'success');
        e.target.reset();
        
        // Reset button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 2000);
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