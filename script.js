// Navigation and Page Management
let currentPage = 'landing';
let currentView = 'browse'; // For farmer/operator dashboards

// Machine data for search functionality
const machines = [
    { name: "Rajesh's Cool Tractor 🚜", operator: "Rajesh Kumar", type: "Tractor", price: "₹1200/hour", crop: "Wheat", rating: 4.8, available: true },
    { name: "The Harvest Beast 🌾", operator: "Suresh Singh", type: "Harvester", price: "₹2500/hour", crop: "Rice", rating: 4.9, available: true },
    { name: "Thresher Thunder ⚡", operator: "Amit Sharma", type: "Thresher", price: "₹800/hour", crop: "Barley", rating: 4.7, available: false },
    { name: "Seed Rocket 🚀", operator: "Vikram Yadav", type: "Seeder", price: "₹600/hour", crop: "Wheat", rating: 4.6, available: true },
    { name: "Heavy Duty Hero 💪", operator: "Mohan Lal", type: "Tractor", price: "₹1500/hour", crop: "Rice", rating: 4.5, available: true },
    { name: "Mini Marvel ✨", operator: "Ramesh Kumar", type: "Tractor", price: "₹1800/hour", crop: "Wheat", rating: 4.4, available: true }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen, then hide after 2 seconds
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }, 2000);

    initializeNavigation();
    initializeSidebar();
    initializeButtons();
    initializeSearch();
});

// Navigation between main pages (Landing, Farmer, Operator)
function initializeNavigation() {
    const navChips = document.querySelectorAll('.chip[data-page]');
    navChips.forEach(chip => {
        chip.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            switchToPage(page);
        });
    });
}

function switchToPage(page) {
    // Hide all pages
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('farmer-page').style.display = 'none';
    document.getElementById('operator-page').style.display = 'none';
    
    // Update navigation chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.remove('chip--active');
    });
    
    // Show selected page and update navigation
    switch(page) {
        case 'landing':
            document.getElementById('landing-page').style.display = 'block';
            document.querySelector('.chip[data-page="landing"]').classList.add('chip--active');
            document.getElementById('current-page').textContent = 'Current: Landing';
            currentPage = 'landing';
            break;
        case 'farmer':
            document.getElementById('farmer-page').style.display = 'block';
            document.querySelector('.chip[data-page="farmer"]').classList.add('chip--active');
            document.getElementById('current-page').textContent = 'Current: Farmer Dashboard';
            currentPage = 'farmer';
            currentView = 'browse';
            showFarmerView('browse');
            break;
        case 'operator':
            document.getElementById('operator-page').style.display = 'block';
            document.querySelector('.chip[data-page="operator"]').classList.add('chip--active');
            document.getElementById('current-page').textContent = 'Current: Operator Dashboard';
            currentPage = 'operator';
            currentView = 'requests';
            showOperatorView('requests');
            break;
    }
}

// Sidebar navigation for farmer dashboard
function initializeSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar__link[data-view]');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
            
            // Update active sidebar link
            document.querySelectorAll('.sidebar__link').forEach(l => l.classList.remove('sidebar__link--active'));
            this.classList.add('sidebar__link--active');
            
            if (currentPage === 'farmer') {
                showFarmerView(view);
            } else if (currentPage === 'operator') {
                showOperatorView(view);
            }
        });
    });
}

// Show farmer dashboard views
function showFarmerView(view) {
    // Hide all farmer views
    document.getElementById('browse-machines').style.display = 'none';
    document.getElementById('my-bookings').style.display = 'none';
    document.getElementById('farmer-profile').style.display = 'none';
    
    // Show selected view
    switch(view) {
        case 'browse':
            document.getElementById('browse-machines').style.display = 'block';
            break;
        case 'bookings':
            document.getElementById('my-bookings').style.display = 'block';
            break;
        case 'profile':
            document.getElementById('farmer-profile').style.display = 'block';
            break;
    }
    currentView = view;
}

// Show operator dashboard views
function showOperatorView(view) {
    // Hide all operator views
    document.getElementById('booking-requests').style.display = 'none';
    document.getElementById('operator-earnings').style.display = 'none';
    document.getElementById('operator-profile').style.display = 'none';
    
    // Show selected view
    switch(view) {
        case 'requests':
            document.getElementById('booking-requests').style.display = 'block';
            break;
        case 'earnings':
            document.getElementById('operator-earnings').style.display = 'block';
            break;
        case 'profile':
            document.getElementById('operator-profile').style.display = 'block';
            break;
    }
    currentView = view;
}

// Initialize button handlers
function initializeButtons() {
    // Landing page buttons
    const farmerBtn = document.querySelector('.btn--green');
    const operatorBtn = document.querySelector('.btn--orange');
    
    if (farmerBtn && farmerBtn.textContent.includes("I'm a Farmer")) {
        farmerBtn.addEventListener('click', function() {
            switchToPage('farmer');
        });
    }
    
    if (operatorBtn && operatorBtn.textContent.includes("I'm an Operator")) {
        operatorBtn.addEventListener('click', function() {
            switchToPage('operator');
        });
    }
    
    // Machine booking buttons
    const bookButtons = document.querySelectorAll('.machine__book');
    bookButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.disabled) {
                const machineName = this.closest('.machine__card').querySelector('.machine__name').textContent;
                bookMachine(machineName);
            }
        });
    });
    
    // Request action buttons
    const acceptButtons = document.querySelectorAll('.btn--green');
    const rejectButtons = document.querySelectorAll('.btn--red');
    
    acceptButtons.forEach(btn => {
        if (btn.textContent.includes('Yes, Let')) {
            btn.addEventListener('click', function() {
                const farmerName = this.closest('.request__card').querySelector('.request__farmer').textContent;
                showNotification('Request Accepted! ✅', `You accepted the booking from ${farmerName}`, 'success');
                this.parentElement.innerHTML = '<div class="request__success">✨ Awesome! Booking confirmed! The farmer is super happy! 😄</div>';
            });
        }
    });
    
    rejectButtons.forEach(btn => {
        if (btn.textContent.includes('Nope, Sorry')) {
            btn.addEventListener('click', function() {
                const farmerName = this.closest('.request__card').querySelector('.request__farmer').textContent;
                showNotification('Request Declined', `You declined the booking from ${farmerName}`, 'info');
                this.parentElement.innerHTML = '<div class="request__success">Request declined. The farmer has been notified.</div>';
            });
        }
    });
    
    // Save profile buttons
    const saveButtons = document.querySelectorAll('.btn--large');
    saveButtons.forEach(btn => {
        if (btn.textContent.includes('Save Profile')) {
            btn.addEventListener('click', function() {
                showNotification('Profile Saved! 💾', 'Your profile has been updated successfully!', 'success');
            });
        }
    });
    
    // Feedback buttons
    const feedbackButtons = document.querySelectorAll('.btn--small');
    feedbackButtons.forEach(btn => {
        if (btn.textContent.includes('Give Feedback')) {
            btn.addEventListener('click', function() {
                showNotification('Feedback Form', 'Opening feedback form...', 'info');
            });
        }
    });
    
    // Tracking buttons
    const callButtons = document.querySelectorAll('.btn--blue');
    callButtons.forEach(btn => {
        if (btn.textContent.includes('Call Operator')) {
            btn.addEventListener('click', function() {
                alert('Calling operator...');
            });
        }
        if (btn.textContent.includes('View on Map')) {
            btn.addEventListener('click', function() {
                alert('Opening map view...');
            });
        }
    });
}

// Quick navigation functions for landing page buttons
function switchToFarmer() {
    switchToPage('farmer');
}

function switchToOperator() {
    switchToPage('operator');
}

function switchToLanding() {
    switchToPage('landing');
}

// Initialize search functionality
function initializeSearch() {
    const openSearchBtn = document.getElementById('open-search');
    const closeSearchBtn = document.getElementById('close-search');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // Open search modal
    if (openSearchBtn) {
        openSearchBtn.addEventListener('click', () => {
            searchModal.classList.add('active');
            searchInput.focus();
        });
    }

    // Close search modal
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchModal.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        });
    }

    // Close modal when clicking outside
    searchModal?.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('active');
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    });

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length === 0) {
                searchResults.innerHTML = '';
                return;
            }

            const results = machines.filter(machine => 
                machine.name.toLowerCase().includes(query) ||
                machine.operator.toLowerCase().includes(query) ||
                machine.type.toLowerCase().includes(query) ||
                machine.crop.toLowerCase().includes(query)
            );

            if (results.length === 0) {
                searchResults.innerHTML = '<p style="text-align: center; color: hsl(var(--text-med));">No machines found 😢</p>';
            } else {
                searchResults.innerHTML = results.map(machine => `
                    <div class="search-result-item">
                        <h4>${machine.name}</h4>
                        <p><strong>Operator:</strong> ${machine.operator} | <strong>Type:</strong> ${machine.type}</p>
                        <p><strong>Price:</strong> ${machine.price} | <strong>Rating:</strong> ⭐ ${machine.rating}</p>
                        <p><strong>Status:</strong> ${machine.available ? '✅ Available' : '🔴 Busy'}</p>
                    </div>
                `).join('');
            }
        });
    }
}

// Add some interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.machine__card, .booking__card, .request__card, .earnings__card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add click effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});

// Filter functionality for machine browsing
function initializeFilters() {
    const filterSelects = document.querySelectorAll('.filter__select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            // Filter logic would be implemented here
            console.log('Filter changed:', this.value);
        });
    });
}

// Initialize filters when farmer page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize filters after a short delay to ensure DOM is ready
    setTimeout(initializeFilters, 100);
});

// Add smooth scrolling for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Add loading states for better UX
function showLoading(element) {
    const originalText = element.textContent;
    element.textContent = 'Loading...';
    element.disabled = true;
    
    setTimeout(() => {
        element.textContent = originalText;
        element.disabled = false;
    }, 1000);
}

// Form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#d1d5db';
        }
    });
    
    return isValid;
}

// Add form validation to profile forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('.profile__form');
    forms.forEach(form => {
        const saveBtn = form.querySelector('.btn--large');
        if (saveBtn) {
            saveBtn.addEventListener('click', function(e) {
                if (!validateForm(form)) {
                    e.preventDefault();
                    alert('Please fill in all required fields.');
                }
            });
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Escape key to go back to landing
    if (e.key === 'Escape' && currentPage !== 'landing') {
        switchToLanding();
    }
    
    // Number keys for quick navigation
    if (currentPage === 'farmer') {
        switch(e.key) {
            case '1':
                showFarmerView('browse');
                break;
            case '2':
                showFarmerView('bookings');
                break;
            case '3':
                showFarmerView('profile');
                break;
        }
    }
    
    if (currentPage === 'operator') {
        switch(e.key) {
            case '1':
                showOperatorView('requests');
                break;
            case '2':
                showOperatorView('earnings');
                break;
            case '3':
                showOperatorView('profile');
                break;
        }
    }
});

// Add touch support for mobile
document.addEventListener('touchstart', function(e) {
    // Add touch feedback
    if (e.target.classList.contains('btn') || e.target.classList.contains('chip')) {
        e.target.style.transform = 'scale(0.95)';
    }
});

document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('btn') || e.target.classList.contains('chip')) {
        setTimeout(() => {
            e.target.style.transform = '';
        }, 150);
    }
});

// Notification System
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <h4 class="notification__title">${title}</h4>
        <p class="notification__message">${message}</p>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Enhanced booking functionality with notifications
function bookMachine(machineName) {
    showNotification('Booking Confirmed! 🎉', `${machineName} has been booked successfully!`, 'success');
}

// Add floating animation to hero emoji
document.addEventListener('DOMContentLoaded', function() {
    const heroEmoji = document.querySelector('.hero__emoji');
    if (heroEmoji) {
        heroEmoji.classList.add('float');
    }
});

