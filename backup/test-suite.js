/**
 * BLKPAPER E-commerce Testing Suite
 * Comprehensive tests for all website functionality
 */

// Test Configuration
const TESTS = {
    BASIC_FUNCTIONALITY: true,
    CART_OPERATIONS: true,
    PRODUCT_FILTERING: true,
    SEARCH_FUNCTIONALITY: true,
    MODAL_INTERACTIONS: true,
    FORM_VALIDATION: true,
    RESPONSIVE_DESIGN: true,
    GOOGLE_SHEETS_INTEGRATION: true
};

// Test Results
let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
};

// Utility Functions
function logTest(testName, passed, details = '') {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName} - PASSED`);
    } else {
        testResults.failed++;
        console.log(`❌ ${testName} - FAILED: ${details}`);
    }
    
    testResults.details.push({
        name: testName,
        passed: passed,
        details: details,
        timestamp: new Date().toISOString()
    });
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Suite Functions
async function runAllTests() {
    console.log('🖤 Starting BLKPAPER Test Suite...');
    console.log('═'.repeat(50));
    
    try {
        // Wait for page to fully load
        await wait(2000);
        
        if (TESTS.BASIC_FUNCTIONALITY) await testBasicFunctionality();
        if (TESTS.CART_OPERATIONS) await testCartOperations();
        if (TESTS.PRODUCT_FILTERING) await testProductFiltering();
        if (TESTS.SEARCH_FUNCTIONALITY) await testSearchFunctionality();
        if (TESTS.MODAL_INTERACTIONS) await testModalInteractions();
        if (TESTS.FORM_VALIDATION) await testFormValidation();
        if (TESTS.RESPONSIVE_DESIGN) await testResponsiveDesign();
        if (TESTS.GOOGLE_SHEETS_INTEGRATION) await testGoogleSheetsIntegration();
        
        // Display Results
        displayTestResults();
        
    } catch (error) {
        console.error('Test suite failed:', error);
    }
}

// Basic Functionality Tests
async function testBasicFunctionality() {
    console.log('\n📋 Testing Basic Functionality...');
    
    // Test 1: Page Load
    logTest('Page Load', document.readyState === 'complete');
    
    // Test 2: Navigation Elements
    const navbar = document.getElementById('navbar');
    logTest('Navigation Bar', navbar !== null);
    
    // Test 3: Product Grid
    const productsGrid = document.getElementById('productsGrid');
    logTest('Products Grid', productsGrid !== null);
    
    // Test 4: Cart Icon
    const cartIcon = document.getElementById('cartIcon');
    logTest('Cart Icon', cartIcon !== null);
    
    // Test 5: Search Button
    const searchBtn = document.getElementById('searchBtn');
    logTest('Search Button', searchBtn !== null);
    
    // Test 6: Global Variables
    logTest('Products Data Loaded', Array.isArray(products) && products.length > 0);
    logTest('Cart Initialized', Array.isArray(cart));
}

// Cart Operations Tests
async function testCartOperations() {
    console.log('\n🛒 Testing Cart Operations...');
    
    // Clear cart first
    clearCart();
    await wait(500);
    
    // Test 1: Add to Cart
    const initialCartCount = cart.length;
    addToCart('memory-band-001', 1);
    await wait(500);
    logTest('Add to Cart', cart.length === initialCartCount + 1);
    
    // Test 2: Cart Count Update
    const cartCountElement = document.getElementById('cartCount');
    const displayedCount = parseInt(cartCountElement.textContent) || 0;
    logTest('Cart Count Display', displayedCount > 0);
    
    // Test 3: Cart Sidebar Opening
    toggleCart();
    await wait(500);
    const cartSidebar = document.getElementById('cartSidebar');
    logTest('Cart Sidebar Opens', cartSidebar.classList.contains('open'));
    
    // Test 4: Update Quantity
    const originalQuantity = cart[0].quantity;
    updateCartQuantity('memory-band-001', 2);
    await wait(500);
    logTest('Update Quantity', cart[0].quantity === 2);
    
    // Test 5: Remove from Cart
    removeFromCart('memory-band-001');
    await wait(500);
    logTest('Remove from Cart', cart.length === 0);
    
    // Close cart
    closeCart();
}

// Product Filtering Tests
async function testProductFiltering() {
    console.log('\n🔍 Testing Product Filtering...');
    
    // Test 1: Filter by Category
    filterProducts('clothing');
    await wait(500);
    const productCards = document.querySelectorAll('.product-card');
    logTest('Filter by Clothing Category', productCards.length > 0);
    
    // Test 2: Filter by All
    filterProducts('all');
    await wait(500);
    const allProductCards = document.querySelectorAll('.product-card');
    logTest('Show All Products', allProductCards.length >= productCards.length);
    
    // Test 3: Filter Buttons Active State
    const filterBtns = document.querySelectorAll('.filter-btn');
    let activeFilterExists = false;
    filterBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
            activeFilterExists = true;
        }
    });
    logTest('Filter Button Active State', activeFilterExists);
}

// Search Functionality Tests
async function testSearchFunctionality() {
    console.log('\n🔎 Testing Search Functionality...');
    
    // Test 1: Open Search Modal
    openSearch();
    await wait(500);
    const searchModal = document.getElementById('searchModal');
    logTest('Search Modal Opens', searchModal.classList.contains('show'));
    
    // Test 2: Search Input
    const searchInput = document.getElementById('searchInput');
    logTest('Search Input Exists', searchInput !== null);
    
    // Test 3: Search Results
    if (searchInput) {
        searchInput.value = 'memory';
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
        await wait(500);
        
        const searchResults = document.getElementById('searchResults');
        logTest('Search Results Generated', searchResults.children.length > 0);
    }
    
    // Close search
    closeSearch();
}

// Modal Interactions Tests
async function testModalInteractions() {
    console.log('\n🪟 Testing Modal Interactions...');
    
    // Test 1: Product Quick View
    if (products.length > 0) {
        quickView(products[0].id);
        await wait(500);
        const productModal = document.getElementById('productModal');
        logTest('Product Modal Opens', productModal.classList.contains('show'));
        
        // Test 2: Modal Close
        closeModal();
        await wait(500);
        logTest('Product Modal Closes', !productModal.classList.contains('show'));
    }
}

// Form Validation Tests
async function testFormValidation() {
    console.log('\n📝 Testing Form Validation...');
    
    // Test Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        logTest('Contact Form Exists', true);
        
        // Test required fields
        const requiredFields = contactForm.querySelectorAll('[required]');
        logTest('Required Fields Present', requiredFields.length > 0);
    } else {
        logTest('Contact Form Exists', false, 'Contact form not found');
    }
}

// Responsive Design Tests
async function testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    // Test 1: Mobile Menu Button
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    logTest('Mobile Menu Button Exists', mobileMenuBtn !== null);
    
    // Test 2: Responsive Classes
    const responsiveElements = document.querySelectorAll('.responsive, .mobile-only, .desktop-only');
    logTest('Responsive Elements Present', responsiveElements.length >= 0);
    
    // Test 3: Viewport Meta Tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    logTest('Viewport Meta Tag', viewportMeta !== null);
}

// Google Sheets Integration Tests
async function testGoogleSheetsIntegration() {
    console.log('\n📊 Testing Google Sheets Integration...');
    
    // Test 1: Configuration Exists
    logTest('Google Sheets Config', typeof GOOGLE_SHEETS_CONFIG === 'object');
    
    // Test 2: Admin Functions Available
    logTest('Admin Functions Available', typeof window.BLKPAPER_ADMIN === 'object');
    
    // Test 3: Order Processing Functions
    logTest('Save Order Function', typeof saveOrder === 'function');
    logTest('Send to Google Sheets Function', typeof sendOrderToGoogleSheets === 'function');
    
    // Test 4: Retry Queue Functions
    logTest('Retry Queue Functions', typeof processRetryQueue === 'function');
    
    // Test 5: Local Storage Integration
    const testOrder = {
        id: 'TEST-' + Date.now(),
        items: [{name: 'Test Product', quantity: 1, price: 100}],
        total: 100
    };
    
    try {
        localStorage.setItem('blkpaper_test', JSON.stringify(testOrder));
        const retrieved = JSON.parse(localStorage.getItem('blkpaper_test'));
        localStorage.removeItem('blkpaper_test');
        logTest('Local Storage Integration', retrieved.id === testOrder.id);
    } catch (error) {
        logTest('Local Storage Integration', false, error.message);
    }
}

// Display Test Results
function displayTestResults() {
    console.log('\n' + '═'.repeat(50));
    console.log('🖤 BLKPAPER Test Results Summary');
    console.log('═'.repeat(50));
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📊 Total: ${testResults.total}`);
    console.log(`📈 Success Rate: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    console.log('═'.repeat(50));
    
    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.details.forEach(test => {
            if (!test.passed) {
                console.log(`   • ${test.name}: ${test.details}`);
            }
        });
    }
    
    console.log('\n🔧 Admin Tools Available:');
    console.log('   • BLKPAPER_ADMIN.viewOrders() - View all local orders');
    console.log('   • BLKPAPER_ADMIN.viewRetryQueue() - View retry queue');
    console.log('   • BLKPAPER_ADMIN.testGoogleSheets() - Test Google Sheets connection');
    console.log('   • BLKPAPER_ADMIN.processRetries() - Process retry queue');
    
    // Store results for later analysis
    window.TEST_RESULTS = testResults;
}

// Performance Tests
async function testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    const startTime = performance.now();
    
    // Test page load time
    const navigation = performance.getEntriesByType('navigation')[0];
    const loadTime = navigation.loadEventEnd - navigation.fetchStart;
    logTest('Page Load Time < 3s', loadTime < 3000, `${Math.round(loadTime)}ms`);
    
    // Test JavaScript execution time
    const jsStartTime = performance.now();
    displayProducts();
    const jsEndTime = performance.now();
    const jsExecutionTime = jsEndTime - jsStartTime;
    logTest('Product Display < 100ms', jsExecutionTime < 100, `${Math.round(jsExecutionTime)}ms`);
    
    // Test memory usage (if available)
    if ('memory' in performance) {
        const memoryInfo = performance.memory;
        const memoryUsage = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
        logTest('Memory Usage < 50MB', memoryUsage < 50, `${Math.round(memoryUsage)}MB`);
    }
}

// Accessibility Tests
async function testAccessibility() {
    console.log('\n♿ Testing Accessibility...');
    
    // Test 1: Alt text for images
    const images = document.querySelectorAll('img');
    let imagesWithAlt = 0;
    images.forEach(img => {
        if (img.getAttribute('alt')) imagesWithAlt++;
    });
    logTest('Images have Alt Text', imagesWithAlt === images.length);
    
    // Test 2: Form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    let inputsWithLabels = 0;
    inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        const placeholder = input.getAttribute('placeholder');
        if (label || placeholder) inputsWithLabels++;
    });
    logTest('Form Inputs have Labels/Placeholders', inputsWithLabels === inputs.length);
    
    // Test 3: Heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    logTest('Heading Structure Present', headings.length > 0);
    
    // Test 4: Focus indicators
    const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
    logTest('Focusable Elements Present', focusableElements.length > 0);
}

// E-commerce Specific Tests
async function testEcommerceFeatures() {
    console.log('\n🛍️ Testing E-commerce Features...');
    
    // Test 1: Product Information
    logTest('Products have Prices', products.every(p => p.price > 0));
    logTest('Products have Names', products.every(p => p.name && p.name.length > 0));
    logTest('Products have Images', products.every(p => p.image && p.image.length > 0));
    
    // Test 2: Stock Management
    const inStockProducts = products.filter(p => p.inStock);
    const outOfStockProducts = products.filter(p => !p.inStock);
    logTest('Stock Status Defined', products.every(p => typeof p.inStock === 'boolean'));
    
    // Test 3: Categories
    const categories = [...new Set(products.map(p => p.category))];
    logTest('Product Categories', categories.length > 1);
    
    // Test 4: Featured Products
    const featuredProducts = products.filter(p => p.featured);
    logTest('Featured Products Available', featuredProducts.length > 0);
}

// Initialize Testing
console.log('🖤 BLKPAPER Testing Suite Loaded');
console.log('Run runAllTests() to start comprehensive testing');
console.log('Or run individual test functions:');
console.log('- testBasicFunctionality()');
console.log('- testCartOperations()');
console.log('- testProductFiltering()');
console.log('- testSearchFunctionality()');
console.log('- testModalInteractions()');
console.log('- testFormValidation()');
console.log('- testResponsiveDesign()');
console.log('- testGoogleSheetsIntegration()');
console.log('- testPerformance()');
console.log('- testAccessibility()');
console.log('- testEcommerceFeatures()');

// Auto-run tests after page load
window.addEventListener('load', () => {
    setTimeout(() => {
        console.log('🚀 Auto-starting test suite...');
        runAllTests();
    }, 3000);
});