// Updated menu prices with cigarette brands in Taka
const menuPrices = {
    // Cigarette Brands
    goldleaf: 15,  // Updated to match HTML
    benson: 20,
    advance: 20,
    lucky: 12,     // Updated to match HTML
    
    // Beverages & Snacks
    tea: 12,
    coffee: 20,
    snacks: 10,    // Updated to match HTML (chips)
    others: 0      // Custom amount
};

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    setupEventListeners();
    console.log('🚬☕ Tong er Bill Calculator initialized!');
});

function initializeCalculator() {
    // Set initial values
    updateCalculation();
    
    // Add real-time calculation on input change
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', updateCalculation);
        input.addEventListener('change', updateCalculation);
    });
}

function setupEventListeners() {
    // Quantity control buttons
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(button => {
        button.addEventListener('click', handleQuantityChange);
    });
    
    // Calculate button
    const calculateBtn = document.getElementById('calculate');
    calculateBtn.addEventListener('click', showDetailedResult);
    
    // Reset button
    const resetBtn = document.getElementById('reset');
    resetBtn.addEventListener('click', resetAllInputs);
    
    // Clear all button
    const clearBtn = document.getElementById('clear-all');
    clearBtn.addEventListener('click', clearAllInputs);
    
    // Enter key support
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            showDetailedResult();
        }
    });
}

function handleQuantityChange(e) {
    const button = e.target;
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    const isPlus = button.classList.contains('plus');
    const isMinus = button.classList.contains('minus');
    
    let currentValue = parseInt(input.value) || 0;
    const min = parseInt(input.min) || 0;
    const max = parseInt(input.max) || 999;
    
    if (isPlus && currentValue < max) {
        input.value = currentValue + 1;
    } else if (isMinus && currentValue > min) {
        input.value = currentValue - 1;
    }
    
    // Add visual feedback
    button.style.transform = 'scale(0.9)';
    setTimeout(() => {
        button.style.transform = '';
    }, 150);
    
    updateCalculation();
}

function updateCalculation() {
    const quantities = getQuantities();
    const totals = calculateTotals(quantities);
    
    // Update display without showing detailed breakdown
    document.getElementById('total-bill').textContent = `৳${totals.total.toFixed(2)}`;
    document.getElementById('split-bill').textContent = `৳${totals.perPerson.toFixed(2)}`;
}

function getQuantities() {
    return {
        // Cigarette brands
        goldleaf: parseInt(document.getElementById('goldleaf').value) || 0,
        benson: parseInt(document.getElementById('benson').value) || 0,
        advance: parseInt(document.getElementById('advance').value) || 0,
        lucky: parseInt(document.getElementById('lucky').value) || 0,
        
        // Beverages & snacks
        tea: parseInt(document.getElementById('tea').value) || 0,
        coffee: parseInt(document.getElementById('coffee').value) || 0,
        snacks: parseInt(document.getElementById('snacks').value) || 0,
        others: parseFloat(document.getElementById('others').value) || 0,
        people: parseInt(document.getElementById('people').value) || 1
    };
}

function calculateTotals(quantities) {
    let subtotals = {};
    let total = 0;
    
    // Calculate subtotals for each item
    Object.keys(menuPrices).forEach(item => {
        if (item === 'others') {
            subtotals[item] = quantities[item];
        } else {
            subtotals[item] = quantities[item] * menuPrices[item];
        }
        total += subtotals[item];
    });
    
    const perPerson = total / Math.max(quantities.people, 1);
    
    return {
        subtotals,
        total,
        perPerson,
        quantities
    };
}

function getSpecialMessage(totalAmount) {
    if (totalAmount < 100) {
        return {
            message: "এটা কোন বিল হইল 😂",
            type: "low-bill",
            emoji: "🤣"
        };
    } else if (totalAmount >= 300) {
        return {
            message: "টাকা এর গুষ্টি চুদি 😡",
            type: "very-high-bill",
            emoji: "💸"
        };
    } else if (totalAmount >= 200) {
        return {
            message: "বিড়ি কম খা বাইনচোদ 😤",
            type: "high-bill",
            emoji: "🚬"
        };
    }
    return null;
}

function showDetailedResult() {
    const quantities = getQuantities();
    const totals = calculateTotals(quantities);
    
    // Validate inputs
    if (totals.total === 0) {
        showNotification('Please add some items to calculate the bill! ☕', 'warning');
        return;
    }
    
    if (quantities.people < 1) {
        showNotification('Number of people must be at least 1! 👤', 'error');
        return;
    }
    
    // Generate breakdown
    generateBreakdown(totals);
    
    // Show special message based on bill amount
    showSpecialMessage(totals.total);
    
    // Show result section with animation
    const resultSection = document.getElementById('result');
    resultSection.classList.add('show');
    
    // Scroll to result
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Show success notification
    showNotification('Bill calculated successfully! 💰', 'success');
    
    // Add some celebration effect
    addCelebrationEffect();
}

function showSpecialMessage(totalAmount) {
    const specialMsg = getSpecialMessage(totalAmount);
    const messageContainer = document.getElementById('special-message');
    
    if (specialMsg) {
        messageContainer.innerHTML = `
            <div class="message-content ${specialMsg.type}">
                <div class="message-emoji">${specialMsg.emoji}</div>
                <div class="message-text">${specialMsg.message}</div>
            </div>
        `;
        messageContainer.style.display = 'block';
        messageContainer.classList.add('bounce-in');
        
        // Add some fun animation
        setTimeout(() => {
            messageContainer.classList.remove('bounce-in');
        }, 600);
    } else {
        messageContainer.style.display = 'none';
    }
}

function generateBreakdown(totals) {
    const breakdownContainer = document.getElementById('breakdown-details');
    const { subtotals, quantities, total, perPerson } = totals;
    
    let breakdownHTML = '';
    let cigaretteTotal = 0;
    let beverageTotal = 0;
    
    // Group cigarettes
    const cigaretteBrands = ['goldleaf', 'benson', 'advance', 'lucky'];
    const beverageItems = ['tea', 'coffee', 'snacks'];
    
    // Add cigarette brands
    cigaretteBrands.forEach(item => {
        if (quantities[item] > 0) {
            const itemName = getItemDisplayName(item);
            const quantity = quantities[item];
            const subtotal = subtotals[item];
            const unitPrice = menuPrices[item];
            cigaretteTotal += subtotal;
            
            breakdownHTML += `
                <div class="breakdown-item">
                    <span>🚬 ${itemName} (${quantity} × ৳${unitPrice})</span>
                    <span>৳${subtotal.toFixed(2)}</span>
                </div>
            `;
        }
    });
    
    // Add cigarette subtotal if any
    if (cigaretteTotal > 0) {
        breakdownHTML += `
            <div class="breakdown-item category-total">
                <span><strong>🚬 Cigarettes Subtotal</strong></span>
                <span><strong>৳${cigaretteTotal.toFixed(2)}</strong></span>
            </div>
        `;
    }
    
    // Add beverages and snacks
    beverageItems.forEach(item => {
        if (quantities[item] > 0) {
            const itemName = getItemDisplayName(item);
            const quantity = quantities[item];
            const subtotal = subtotals[item];
            const unitPrice = menuPrices[item];
            beverageTotal += subtotal;
            
            breakdownHTML += `
                <div class="breakdown-item">
                    <span>${getItemIcon(item)} ${itemName} (${quantity} × ৳${unitPrice})</span>
                    <span>৳${subtotal.toFixed(2)}</span>
                </div>
            `;
        }
    });
    
    // Add beverages subtotal if any
    if (beverageTotal > 0) {
        breakdownHTML += `
            <div class="breakdown-item category-total">
                <span><strong>☕ Beverages & Snacks Subtotal</strong></span>
                <span><strong>৳${beverageTotal.toFixed(2)}</strong></span>
            </div>
        `;
    }
    
    // Add others if any
    if (quantities.others > 0) {
        breakdownHTML += `
            <div class="breakdown-item">
                <span>🍽️ Other Items</span>
                <span>৳${subtotals.others.toFixed(2)}</span>
            </div>
        `;
    }
    
    // Add total and per person
    breakdownHTML += `
        <div class="breakdown-item total-row">
            <span><strong>📊 Total Amount</strong></span>
            <span><strong>৳${total.toFixed(2)}</strong></span>
        </div>
    `;
    
    if (quantities.people > 1) {
        breakdownHTML += `
            <div class="breakdown-item split-row">
                <span><strong>👥 Split among ${quantities.people} people</strong></span>
                <span><strong>৳${perPerson.toFixed(2)} each</strong></span>
            </div>
        `;
    }
    
    breakdownContainer.innerHTML = breakdownHTML;
    
    // Update main totals
    document.getElementById('total-bill').textContent = `৳${total.toFixed(2)}`;
    document.getElementById('split-bill').textContent = `৳${perPerson.toFixed(2)}`;
}

function getItemDisplayName(item) {
    const names = {
        // Cigarette brands
        goldleaf: 'Gold Leaf',
        benson: 'Benson & Hedges',
        advance: 'Advance',
        lucky: 'Lucky Strike',
        
        // Beverages & snacks
        tea: 'Tea',
        coffee: 'Coffee',
        snacks: 'Chips',
        others: 'Other Items'
    };
    return names[item] || item;
}

function getItemIcon(item) {
    const icons = {
        // Cigarette brands
        goldleaf: '🚬',
        benson: '🚬',
        advance: '🚬',
        lucky: '🚬',
        
        // Beverages & snacks
        tea: '🍵',
        coffee: '☕',
        snacks: '🍪',
        others: '🍽️'
    };
    return icons[item] || '📄';
}

function resetAllInputs() {
    // Reset all inputs without confirmation
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        if (input.id === 'people') {
            input.value = 1; // Keep people count as 1
        } else {
            input.value = 0;
        }
    });
    
    // Hide result section
    const resultSection = document.getElementById('result');
    resultSection.classList.remove('show');
    
    // Hide special message
    const messageContainer = document.getElementById('special-message');
    messageContainer.style.display = 'none';
    
    // Update calculation
    updateCalculation();
    
    // Show notification
    showNotification('All inputs reset! 🔄', 'info');
    
    // Add reset animation
    const resetBtn = document.getElementById('reset');
    resetBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        resetBtn.style.transform = '';
    }, 600);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearAllInputs() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to clear all inputs? 🗑️')) {
        resetAllInputs();
        showNotification('All inputs cleared! 🧹', 'info');
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
        ${getNotificationStyle(type)}
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

function getNotificationStyle(type) {
    const styles = {
        success: 'background: linear-gradient(135deg, #10b981, #059669);',
        error: 'background: linear-gradient(135deg, #ef4444, #dc2626);',
        warning: 'background: linear-gradient(135deg, #f59e0b, #d97706);',
        info: 'background: linear-gradient(135deg, #3b82f6, #2563eb);'
    };
    return styles[type] || styles.info;
}

function addCelebrationEffect() {
    // Add a subtle celebration effect
    const calculateBtn = document.getElementById('calculate');
    calculateBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    calculateBtn.innerHTML = '<span>✅ Bill Calculated!</span>';
    
    setTimeout(() => {
        calculateBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        calculateBtn.innerHTML = '<span>💰 Calculate Bill</span>';
    }, 2000);
}

// Add CSS animations and additional styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes bounce-in {
        0% {
            transform: scale(0.3);
            opacity: 0;
        }
        50% {
            transform: scale(1.05);
        }
        70% {
            transform: scale(0.9);
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    /* Pulse effect for inputs when changed */
    input:focus {
        animation: pulse 0.3s ease;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    /* Button group styling */
    .button-group {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .reset-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    }
    
    .reset-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    }
    
    /* Special message styling */
    .special-message {
        display: none;
        margin-bottom: 1.5rem;
    }
    
    .message-content {
        text-align: center;
        padding: 1.5rem;
        border-radius: 15px;
        margin-bottom: 1rem;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .message-emoji {
        font-size: 2.5rem;
        margin-bottom: 0.5rem;
    }
    
    .message-text {
        font-size: 1.3rem;
        font-weight: 700;
        color: white;
    }
    
    .low-bill {
        background: linear-gradient(135deg, #10b981, #059669);
    }
    
    .high-bill {
        background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    
    .very-high-bill {
        background: linear-gradient(135deg, #ef4444, #dc2626);
    }
    
    /* Category subtotals styling */
    .category-total {
        background: #f0f2f5 !important;
        border-radius: 6px !important;
        margin: 0.5rem 0 !important;
        padding: 0.5rem !important;
        border: 2px solid #e5e7eb !important;
    }
    
    .category-total span {
        color: #667eea !important;
    }
    
    /* Total row styling */
    .total-row {
        background: linear-gradient(135deg, #667eea, #764ba2) !important;
        color: white !important;
        border-radius: 8px !important;
        margin-top: 1rem !important;
        padding: 0.8rem !important;
        border: none !important;
    }
    
    .total-row span {
        color: white !important;
        font-size: 1.1rem !important;
    }
    
    .split-row {
        background: #10b981 !important;
        color: white !important;
        border-radius: 8px !important;
        margin-top: 0.5rem !important;
        padding: 0.8rem !important;
        border: none !important;
    }
    
    .split-row span {
        color: white !important;
    }
    
    /* Mobile responsive */
    @media (max-width: 768px) {
        .button-group {
            grid-template-columns: 1fr;
        }
        
        .message-emoji {
            font-size: 2rem;
        }
        
        .message-text {
            font-size: 1.1rem;
        }
    }
`;
document.head.appendChild(style);

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + R or Cmd + R to reset all
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetAllInputs();
    }
    
    // Escape to hide result
    if (e.key === 'Escape') {
        const resultSection = document.getElementById('result');
        resultSection.classList.remove('show');
    }
});

// Add some fun console messages
console.log(`
🚬☕ Welcome to Tong er Bill Calculator! ☕🚬
🎯 Features:
- Cigarette Brands: Gold Leaf (৳15), Benson (৳20), Advance (৳20), Lucky Strike (৳12)
- Beverages: Tea (৳12), Coffee (৳20), Chips (৳10)
- Special Messages based on bill amount
- Reset button for quick clearing
- Real-time calculation
- Bill splitting
- Quantity controls
- Keyboard shortcuts (Enter to calculate, Ctrl+R to reset)
- Mobile responsive

Made with ❤️ for tong lovers!
`);

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateTotals,
        getQuantities,
        menuPrices,
        getSpecialMessage
    };
}