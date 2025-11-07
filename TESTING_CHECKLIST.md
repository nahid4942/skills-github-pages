# 🖤 BLKPAPER Manual Testing Checklist

## 🧪 Manual Testing Guide

This checklist covers all the manual tests you should perform to ensure the BLKPAPER e-commerce website is working perfectly.

---

## 📋 **Basic Functionality Tests**

### ✅ Page Loading
- [ ] Website loads completely within 3 seconds
- [ ] All images load properly
- [ ] Loading screen appears and disappears
- [ ] No JavaScript errors in console (F12 → Console)
- [ ] Fonts load correctly (Inter/Space Grotesk)

### ✅ Navigation
- [ ] All navigation links work
- [ ] Smooth scrolling to sections
- [ ] Active link highlighting
- [ ] Logo links to home
- [ ] Mobile menu works on small screens

### ✅ Responsive Design
- [ ] Desktop view (1920px+) looks good
- [ ] Tablet view (768px-1024px) looks good
- [ ] Mobile view (320px-768px) looks good
- [ ] Text is readable on all screen sizes
- [ ] Buttons are easily clickable on mobile

---

## 🛒 **Shopping Cart Tests**

### ✅ Add to Cart
- [ ] Click "Add to Cart" on any product
- [ ] Cart count increases
- [ ] Toast notification appears
- [ ] Cart sidebar opens automatically
- [ ] Product appears in cart with correct details

### ✅ Cart Management
- [ ] Open cart sidebar by clicking cart icon
- [ ] Increase/decrease quantity using +/- buttons
- [ ] Update quantity by typing in input field
- [ ] Remove items using trash icon
- [ ] Cart totals update correctly (subtotal, shipping, total)
- [ ] Cart persists after page refresh (localStorage)

### ✅ Empty Cart
- [ ] Empty cart shows "Your cart is empty" message
- [ ] "Start Shopping" button works
- [ ] Cart count shows 0 or is hidden

---

## 🔍 **Product & Search Tests**

### ✅ Product Display
- [ ] All 15+ products display correctly
- [ ] Product images load properly
- [ ] Prices show in Bangladeshi Taka (৳)
- [ ] "Out of Stock" products are marked correctly
- [ ] Discount badges show on sale items

### ✅ Product Filtering
- [ ] "All" filter shows all products
- [ ] "Clothing" filter shows only clothing items
- [ ] "Sunglasses" filter shows only sunglasses
- [ ] "Accessories" filter shows only accessories
- [ ] "Memory Band" filter shows only Memory Band
- [ ] Active filter button is highlighted

### ✅ Product Quick View
- [ ] Click eye icon on any product
- [ ] Modal opens with product details
- [ ] Product rating and reviews display
- [ ] "Add to Cart" works from modal
- [ ] "Wishlist" button works (shows "coming soon")
- [ ] Modal closes properly

### ✅ Search Functionality
- [ ] Click search icon (magnifying glass)
- [ ] Search modal opens
- [ ] Type "memory" - results appear
- [ ] Type "black" - multiple results appear
- [ ] Click on search result - product modal opens
- [ ] Search modal closes properly
- [ ] Keyboard shortcut Ctrl+K opens search

---

## 📝 **Form & Checkout Tests**

### ✅ Contact Form
- [ ] Scroll to contact section
- [ ] Fill out all fields
- [ ] Submit form
- [ ] Success message appears
- [ ] Form resets after submission

### ✅ Checkout Process
- [ ] Add items to cart
- [ ] Click "Checkout" in cart sidebar
- [ ] Checkout modal opens
- [ ] All order items display correctly
- [ ] Order totals are accurate
- [ ] Fill out customer information form:
  - [ ] Full Name (required)
  - [ ] Phone Number (required)
  - [ ] Email Address (required)
  - [ ] Full Address (required)
  - [ ] City (required)
  - [ ] Payment Method (COD/bKash/Nagad)
  - [ ] Order Notes (optional)

### ✅ Order Submission
- [ ] Click "Place Order"
- [ ] Button shows loading state
- [ ] Order confirmation appears
- [ ] Order ID is generated (BLK format)
- [ ] Cart clears after successful order
- [ ] Success toast notifications appear

---

## 📊 **Google Sheets Integration Tests**

### ✅ Setup (Admin Only)
- [ ] Google Apps Script deployed
- [ ] Script URL updated in website code
- [ ] Spreadsheet created with proper headers
- [ ] Email notifications configured (optional)

### ✅ Order Tracking
- [ ] Place a test order on website
- [ ] Check Google Sheets - order appears
- [ ] Order details are complete and accurate
- [ ] Timestamp is correct (Bangladesh time)
- [ ] Status is set to "pending"

### ✅ Admin Functions (Browser Console)
```javascript
// Test these commands in browser console (F12):
BLKPAPER_ADMIN.viewOrders()          // Shows local orders
BLKPAPER_ADMIN.viewRetryQueue()      // Shows failed orders
BLKPAPER_ADMIN.testGoogleSheets()    // Tests connection
BLKPAPER_ADMIN.processRetries()      // Retry failed orders
```

---

## 📱 **Mobile-Specific Tests**

### ✅ Mobile Navigation
- [ ] Hamburger menu works
- [ ] Mobile menu closes when link clicked
- [ ] Touch scrolling is smooth
- [ ] All buttons are finger-friendly (44px+)

### ✅ Mobile Shopping
- [ ] Product cards are properly sized
- [ ] Cart sidebar works on mobile
- [ ] Checkout form is mobile-friendly
- [ ] Modal dialogs work on touch devices
- [ ] Keyboard appears for form inputs

---

## ⚡ **Performance Tests**

### ✅ Loading Speed
- [ ] Initial page load under 3 seconds
- [ ] Images load progressively
- [ ] No layout shifts during loading
- [ ] Smooth animations (60fps)

### ✅ Interactions
- [ ] Button clicks respond immediately
- [ ] Cart updates are instant
- [ ] Modal transitions are smooth
- [ ] No freezing during heavy operations

---

## 🔐 **Security & Data Tests**

### ✅ Data Persistence
- [ ] Cart persists after page refresh
- [ ] Orders save to localStorage
- [ ] No sensitive data stored in browser
- [ ] HTTPS works (if deployed)

### ✅ Error Handling
- [ ] Graceful handling of network errors
- [ ] Fallback when Google Sheets fails
- [ ] User-friendly error messages
- [ ] No crashes or blank screens

---

## 🎨 **Design & UX Tests**

### ✅ Visual Design
- [ ] Black/white/gray color scheme consistent
- [ ] Typography is readable and consistent
- [ ] Proper contrast ratios
- [ ] Icons and images are crisp
- [ ] Loading states provide feedback

### ✅ User Experience
- [ ] Intuitive navigation flow
- [ ] Clear call-to-action buttons
- [ ] Helpful hover effects
- [ ] Logical information hierarchy
- [ ] Consistent interaction patterns

---

## 🚨 **Error Scenarios**

### ✅ Edge Cases
- [ ] Add 0 quantity to cart (should default to 1)
- [ ] Try to buy out-of-stock items
- [ ] Submit empty checkout form
- [ ] Very long product names display well
- [ ] Special characters in search work

### ✅ Network Issues
- [ ] Slow internet connection
- [ ] Offline behavior
- [ ] Google Sheets connection failure
- [ ] Large cart with many items

---

## 📊 **Browser Compatibility**

### ✅ Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### ✅ Mobile Browsers
- [ ] Chrome Mobile
- [ ] Safari Mobile
- [ ] Samsung Internet
- [ ] Opera Mobile

---

## 🎯 **Business Logic Tests**

### ✅ Pricing
- [ ] All prices show in Bangladeshi Taka (৳)
- [ ] Discounts calculate correctly
- [ ] Shipping costs are accurate (৳100)
- [ ] Tax calculations (if applicable)
- [ ] Total amounts are correct

### ✅ Inventory
- [ ] In-stock items can be purchased
- [ ] Out-of-stock items show proper messaging
- [ ] Stock status is clear on product cards
- [ ] Featured products are highlighted

---

## 📋 **Final Checklist**

Before going live:
- [ ] All manual tests pass
- [ ] Automated test suite passes (check console)
- [ ] Google Sheets integration working
- [ ] Contact information is correct
- [ ] Payment methods are accurate
- [ ] Shipping information is updated
- [ ] Terms and conditions added (if needed)
- [ ] Privacy policy added (if needed)

---

## 🎉 **Success Criteria**

Your BLKPAPER website is ready for production when:
- ✅ All core functionality works flawlessly
- ✅ Mobile experience is excellent
- ✅ Orders automatically save to Google Sheets
- ✅ Performance is fast and smooth
- ✅ Design is professional and brand-appropriate
- ✅ User experience is intuitive and enjoyable

---

## 🆘 **If Issues Found**

1. **Document the issue**: What happened, when, and how to reproduce
2. **Check browser console**: Look for JavaScript errors
3. **Test in different browsers**: Confirm if it's browser-specific
4. **Check admin tools**: Use BLKPAPER_ADMIN functions to debug
5. **Verify Google Sheets**: Ensure integration is properly configured

---

**Happy Testing! 🖤**

Remember: A thoroughly tested e-commerce site builds customer trust and ensures smooth business operations.