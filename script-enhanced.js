// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Global state
let currentPage = 'landing';
let currentView = 'browse';
let machines = [];
let bookings = [];
let favorites = [];
let currentFarmer = { name: '', phone: '' }; // Store current farmer info
let notifications = [];

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => loadingScreen.style.display = 'none', 500);
        }
    }, 2000);

    loadFarmerInfo();
    fetchMachines();
    fetchBookings();
    initializeNavigation();
    initializeSidebar();
    initializeButtons();
    initializeSearch();
});

// LocalStorage for farmer info
function loadFarmerInfo() {
    const saved = localStorage.getItem('farmerInfo');
    if (saved) {
        currentFarmer = JSON.parse(saved);
        loadFavorites();
    }
}

function saveFarmerInfo(name, phone) {
    currentFarmer = { name, phone };
    localStorage.setItem('farmerInfo', JSON.stringify(currentFarmer));
    loadFavorites();
}

// API Functions
async function fetchMachines() {
    try {
        const response = await fetch(`${API_BASE_URL}/machines`);
        if (!response.ok) throw new Error('Failed to fetch');
        machines = await response.json();
        console.log('✅ Loaded machines:', machines.length);
        updateMachineDisplays();
    } catch (error) {
        console.error('❌ Error:', error);
        loadLocalMachines();
    }
}

async function fetchBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        if (!response.ok) throw new Error('Failed to fetch');
        bookings = await response.json();
        updateBookingDisplays();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function loadFavorites() {
    if (!currentFarmer.phone) return;
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/farmer/${currentFarmer.phone}`);
        if (response.ok) {
            favorites = await response.json();
        }
    } catch (error) {
        console.error('❌ Error loading favorites:', error);
    }
}

async function toggleFavorite(machineId, machineName) {
    if (!currentFarmer.phone) {
        alert('⚠️ Please complete a booking first to save favorites!');
        return;
    }

    const isFavorite = favorites.some(f => f.machineId === machineId);
    
    try {
        if (isFavorite) {
            await fetch(`${API_BASE_URL}/favorites`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ farmerPhone: currentFarmer.phone, machineId })
            });
            favorites = favorites.filter(f => f.machineId !== machineId);
            showNotification('💔 Removed from favorites');
        } else {
            const response = await fetch(`${API_BASE_URL}/favorites`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    farmerName: currentFarmer.name,
                    farmerPhone: currentFarmer.phone,
                    machineId,
                    machineName
                })
            });
            const newFav = await response.json();
            favorites.push(newFav);
            showNotification('❤️ Added to favorites!');
        }
        updateMachineDisplays();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

async function submitReview(machineId, rating, comment) {
    if (!currentFarmer.name || !currentFarmer.phone) {
        alert('⚠️ Please enter your name and phone number in a booking first!');
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/machines/${machineId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                farmerName: currentFarmer.name,
                rating: parseInt(rating),
                comment
            })
        });
        if (response.ok) {
            showNotification('⭐ Review submitted successfully! Thank you for your feedback.');
            await fetchMachines();
            await fetchBookings(); // Refresh bookings to update hasReview flag
            return true;
        } else {
            showNotification('❌ Failed to submit review. Please try again.');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('❌ Error submitting review. Please check your connection.');
    }
    return false;
}

async function deleteReview(machineId, reviewId) {
    if (!confirm('⚠️ Are you sure you want to delete this review?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/machines/${machineId}/reviews/${reviewId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showNotification('🗑️ Review deleted successfully!');
            await fetchMachines();
            // Refresh the current view
            if (currentPage === 'farmer') {
                showFarmerView(currentView || 'bookings');
            }
            closeModal('machine-modal');
            return true;
        } else {
            showNotification('❌ Failed to delete review. Please try again.');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('❌ Error deleting review. Please check your connection.');
    }
    return false;
}

async function createBooking(bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        if (!response.ok) throw new Error('Failed');
        const newBooking = await response.json();
        bookings.unshift(newBooking);
        updateBookingDisplays();
        return newBooking;
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed');
        const updated = await response.json();
        const index = bookings.findIndex(b => b._id === bookingId);
        if (index !== -1) bookings[index] = updated;
        updateBookingDisplays();
        showNotification(`✅ Booking ${status}!`);
        return updated;
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

// Fallback data
function loadLocalMachines() {
    machines = [
        { id: 1, name: "Rajesh's Cool Tractor 🚜", operator: "Rajesh Kumar", type: "Tractor", price: "₹1200/hour", pricePerHour: 1200, crop: "Wheat", rating: 4.8, available: true, reviews: [] },
        { id: 2, name: "The Harvest Beast 🌾", operator: "Suresh Singh", type: "Harvester", price: "₹2500/hour", pricePerHour: 2500, crop: "Rice", rating: 4.9, available: true, reviews: [] },
        { id: 3, name: "Thresher Thunder ⚡", operator: "Amit Sharma", type: "Thresher", price: "₹800/hour", pricePerHour: 800, crop: "Barley", rating: 4.7, available: false, reviews: [] },
        { id: 4, name: "Seed Rocket 🚀", operator: "Vikram Yadav", type: "Seeder", price: "₹600/hour", pricePerHour: 600, crop: "Wheat", rating: 4.6, available: true, reviews: [] },
        { id: 5, name: "Heavy Duty Hero 💪", operator: "Mohan Lal", type: "Tractor", price: "₹1500/hour", pricePerHour: 1500, crop: "Rice", rating: 4.5, available: true, reviews: [] },
        { id: 6, name: "Mini Marvel ✨", operator: "Ramesh Kumar", type: "Tractor", price: "₹1800/hour", pricePerHour: 1800, crop: "Wheat", rating: 4.4, available: true, reviews: [] }
    ];
    updateMachineDisplays();
}

// Notification system
function showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Update displays
function updateMachineDisplays() {
    if (currentPage === 'farmer' && currentView === 'browse') {
        showFarmerView('browse');
    } else if (currentPage === 'farmer' && currentView === 'favorites') {
        showFarmerView('favorites');
    }
}

function updateBookingDisplays() {
    if (currentPage === 'farmer' && currentView === 'bookings') {
        showFarmerView('bookings');
    } else if (currentPage === 'operator') {
        showOperatorView(currentView);
    }
}

// Navigation
function initializeNavigation() {
    document.querySelectorAll('.chip[data-page]').forEach(chip => {
        chip.addEventListener('click', function() {
            switchToPage(this.getAttribute('data-page'));
        });
    });
}

function switchToPage(page) {
    document.getElementById('landing-page').style.display = 'none';
    document.getElementById('farmer-page').style.display = 'none';
    document.getElementById('operator-page').style.display = 'none';
    
    document.querySelectorAll('.chip').forEach(chip => {
        chip.classList.remove('chip--active');
    });
    
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

function initializeSidebar() {
    document.querySelectorAll('.sidebar__link[data-view]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const view = this.getAttribute('data-view');
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

function initializeButtons() {
    const farmerBtn = document.getElementById('farmer-btn');
    const operatorBtn = document.getElementById('operator-btn');
    
    if (farmerBtn) farmerBtn.addEventListener('click', () => switchToPage('farmer'));
    if (operatorBtn) operatorBtn.addEventListener('click', () => switchToPage('operator'));
}

function initializeSearch() {
    const openSearchBtn = document.getElementById('open-search');
    const closeSearchBtn = document.getElementById('close-search');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-input');
    
    if (openSearchBtn) {
        openSearchBtn.addEventListener('click', () => {
            searchModal.style.display = 'flex';
            searchInput.focus();
        });
    }
    
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', () => {
            searchModal.style.display = 'none';
            searchInput.value = '';
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    
    searchModal?.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.style.display = 'none';
            searchInput.value = '';
        }
    });
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        searchResults.innerHTML = '<p class="search-results__empty">Start typing to search...</p>';
        return;
    }
    
    const results = machines.filter(machine => 
        machine.name.toLowerCase().includes(query) ||
        machine.operator.toLowerCase().includes(query) ||
        machine.type.toLowerCase().includes(query) ||
        machine.crop.toLowerCase().includes(query)
    );
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="search-results__empty">No machines found 😢</p>';
        return;
    }
    
    searchResults.innerHTML = results.map(machine => `
        <div class="search-result-item">
            <div class="search-result-item__icon">${machine.image || '🚜'}</div>
            <div class="search-result-item__info">
                <h4>${machine.name}</h4>
                <p>👨‍🌾 ${machine.operator} | ${machine.type} | ${machine.crop}</p>
                <p class="search-result-item__price">${machine.price}</p>
            </div>
            <span class="search-result-item__status ${machine.available ? 'available' : 'unavailable'}">
                ${machine.available ? '✅ Available' : '❌ Unavailable'}
            </span>
        </div>
    `).join('');
}

function isFavorite(machineId) {
    return favorites.some(f => f.machineId === machineId);
}

// Make functions globally accessible for onclick attributes
window.toggleFavorite = toggleFavorite;
window.bookMachine = bookMachine;
window.viewMachineDetails = viewMachineDetails;
window.closeModal = closeModal;
window.closeBookingModal = closeBookingModal;
window.handleBookingAction = handleBookingAction;
window.openReviewModal = openReviewModal;
window.switchToFarmer = function() { switchToPage('farmer'); };
window.switchToOperator = function() { switchToPage('operator'); };
window.switchToLanding = function() { switchToPage('landing'); };
window.saveProfile = saveProfile;
window.showSupportModal = showSupportModal;
window.deleteReview = deleteReview;

function showSupportModal() {
    const modal = document.getElementById('review-modal');
    const modalContent = document.getElementById('review-modal-content');
    
    modalContent.innerHTML = `
        <div class="modal__header">
            <h2>🆘 Need Support?</h2>
            <button class="modal__close" onclick="closeModal('review-modal')">&times;</button>
        </div>
        <div class="modal__body">
            <div class="support-container">
                <div class="support-card">
                    <div class="support-icon">📞</div>
                    <h3>Call Us</h3>
                    <p>Speak with our support team</p>
                    <a href="tel:+911234567890" class="btn-primary">📞 Call Now</a>
                </div>
                <div class="support-card">
                    <div class="support-icon">📧</div>
                    <h3>Email Support</h3>
                    <p>Send us your questions</p>
                    <a href="mailto:support@harvestharmony.com" class="btn-primary">📧 Email Us</a>
                </div>
                <div class="support-card">
                    <div class="support-icon">💬</div>
                    <h3>WhatsApp</h3>
                    <p>Chat with us instantly</p>
                    <a href="https://wa.me/911234567890" target="_blank" class="btn-primary">💬 WhatsApp</a>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
                <p style="margin: 0; text-align: center;">🕒 <strong>Available:</strong> Mon-Sat, 9 AM - 6 PM</p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function saveProfile(type) {
    if (type === 'farmer') {
        const name = document.getElementById('profile-name').value;
        const phone = document.getElementById('profile-phone').value;
        saveFarmerInfo(name, phone);
        showNotification('Profile saved successfully! ✅', 'success');
    } else {
        showNotification('Operator profile saved! ✅', 'success');
    }
}

function showFarmerView(view) {
    currentView = view;
    const content = document.getElementById('farmer-content');
    
    switch(view) {
        case 'browse':
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>🚜 Browse Machines</h2>
                    <p>Find the perfect machine for your farming needs!</p>
                </div>
                <div class="machines-grid">
                    ${machines.map(machine => `
                        <div class="machine-card ${!machine.available ? 'machine-card--unavailable' : ''}">
                            <div class="machine-card__header">
                                <div class="machine-card__icon">${machine.image || '🚜'}</div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="favorite-btn ${isFavorite(machine.id) ? 'active' : ''}" 
                                            onclick="toggleFavorite(${machine.id}, '${machine.name}')"
                                            title="${isFavorite(machine.id) ? 'Remove from favorites' : 'Add to favorites'}">
                                        ${isFavorite(machine.id) ? '❤️' : '🤍'}
                                    </button>
                                    <span class="machine-card__status ${machine.available ? 'available' : 'unavailable'}">
                                        ${machine.available ? '✅ Available' : '❌ Unavailable'}
                                    </span>
                                </div>
                            </div>
                            <h3 class="machine-card__title">${machine.name}</h3>
                            <div class="machine-card__info">
                                <p>👨‍🌾 <strong>Operator:</strong> ${machine.operator}</p>
                                <p>🔧 <strong>Type:</strong> ${machine.type}</p>
                                <p>🌾 <strong>Best for:</strong> ${machine.crop}</p>
                                <p>⭐ <strong>Rating:</strong> ${machine.rating}/5 (${machine.reviews?.length || 0} reviews)</p>
                                <p>📍 <strong>Location:</strong> ${machine.location}</p>
                            </div>
                            <div class="machine-card__footer">
                                <div class="machine-card__price">${machine.price}</div>
                                <div style="display: flex; gap: 8px;">
                                    <button class="btn-secondary" onclick="viewMachineDetails(${machine.id})" style="flex: 1;">
                                        👁️ Details
                                    </button>
                                    <button class="btn-primary" onclick="bookMachine(${machine.id})" ${!machine.available ? 'disabled' : ''} style="flex: 1;">
                                        📅 Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
            
        case 'favorites':
            const favMachines = machines.filter(m => isFavorite(m.id));
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>❤️ My Favorites</h2>
                    <p>Your saved machines</p>
                </div>
                ${favMachines.length === 0 ? 
                    '<p class="empty-state">No favorites yet. Start by adding machines! 🤍</p>' :
                    `<div class="machines-grid">${machines.filter(m => isFavorite(m.id)).map(machine => `
                        <div class="machine-card">
                            <div class="machine-card__header">
                                <div class="machine-card__icon">${machine.image || '🚜'}</div>
                                <button class="favorite-btn active" onclick="toggleFavorite(${machine.id}, '${machine.name}')">❤️</button>
                            </div>
                            <h3 class="machine-card__title">${machine.name}</h3>
                            <div class="machine-card__info">
                                <p>👨‍🌾 ${machine.operator}</p>
                                <p>⭐ ${machine.rating}/5</p>
                            </div>
                            <div class="machine-card__footer">
                                <div class="machine-card__price">${machine.price}</div>
                                <button class="btn-primary" onclick="bookMachine(${machine.id})">📅 Book</button>
                            </div>
                        </div>
                    `).join('')}</div>`
                }
            `;
            break;
            
        case 'bookings':
            const farmerBookings = bookings.filter(b => true);
            
            // Separate bookings with and without reviews
            const bookingsWithReviews = [];
            const bookingsWithoutReviews = [];
            
            farmerBookings.forEach(booking => {
                const machine = machines.find(m => m.id === booking.machineId);
                
                // Only show the review for the first booking of this machine that has a review
                // This prevents duplicating the same review across multiple bookings of the same machine
                const hasReviewForThisMachine = bookingsWithReviews.some(
                    item => item.booking.machineId === booking.machineId
                );
                
                const userReview = machine?.reviews?.find(r => r.farmerName === currentFarmer.name);
                
                if (userReview && !hasReviewForThisMachine) {
                    // First booking for this machine with a review
                    bookingsWithReviews.push({ booking, machine, userReview });
                } else if (!userReview) {
                    // No review exists for this machine yet
                    bookingsWithoutReviews.push({ booking, machine });
                } else {
                    // Additional booking for same machine that already has review shown
                    // Add to pending without review button since review already exists
                    bookingsWithoutReviews.push({ booking, machine, hideReviewButton: true });
                }
            });
            
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>📋 My Bookings</h2>
                    <p>Track all your machine bookings and reviews</p>
                </div>
                
                <!-- Bookings without reviews -->
                ${bookingsWithoutReviews.length > 0 ? `
                    <div class="bookings-section">
                        <h3 style="margin: 20px 0 15px 0; color: #333;">📝 Pending Reviews</h3>
                        <div class="bookings-list">
                            ${bookingsWithoutReviews.map(({ booking, machine, hideReviewButton }) => `
                                <div class="booking-card">
                                    <div class="booking-card__header">
                                        <div>
                                            <h3>${booking.machineName}</h3>
                                            ${booking.bookingId ? `<p style="font-size: 12px; color: #666;">ID: ${booking.bookingId}</p>` : ''}
                                        </div>
                                        <span class="status-badge status-badge--${booking.status}">${booking.status}</span>
                                    </div>
                                    <div class="booking-card__body">
                                        <p>👨‍🌾 <strong>Name:</strong> ${booking.farmerName}</p>
                                        <p>📅 <strong>Date:</strong> ${booking.date}</p>
                                        <p>⏰ <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
                                        <p>⏱️ <strong>Duration:</strong> ${booking.duration}</p>
                                        <p>🌾 <strong>Crop:</strong> ${booking.crop}</p>
                                        ${booking.fieldSize ? `<p>📏 <strong>Field Size:</strong> ${booking.fieldSize} ${booking.fieldSizeUnit}</p>` : ''}
                                        <p>📍 <strong>Location:</strong> ${booking.location}</p>
                                        <p>💰 <strong>Amount:</strong> ₹${booking.amount}</p>
                                        ${hideReviewButton ? '<p style="color: #4caf50; margin-top: 10px;">✅ <strong>You already reviewed this machine</strong></p>' : ''}
                                    </div>
                                    ${booking.status === 'completed' && !hideReviewButton ? `
                                        <div class="booking-card__actions">
                                            <button class="btn-primary" onclick="window.openReviewModal('${booking._id}', ${booking.machineId}, \`${booking.machineName}\`)">
                                                ⭐ Write Review
                                            </button>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Bookings with reviews -->
                ${bookingsWithReviews.length > 0 ? `
                    <div class="bookings-section">
                        <h3 style="margin: 30px 0 15px 0; color: #333;">⭐ My Reviews</h3>
                        <div class="bookings-list">
                            ${bookingsWithReviews.map(({ booking, machine, userReview }) => `
                                <div class="booking-card reviewed-booking">
                                    <div class="booking-card__header">
                                        <div>
                                            <h3>${booking.machineName}</h3>
                                            ${booking.bookingId ? `<p style="font-size: 12px; color: #666;">ID: ${booking.bookingId}</p>` : ''}
                                        </div>
                                        <span class="status-badge status-badge--${booking.status}">${booking.status}</span>
                                    </div>
                                    <div class="booking-card__body">
                                        <p>📅 <strong>Booking Date:</strong> ${booking.date}</p>
                                        <p>💰 <strong>Amount:</strong> ₹${booking.amount}</p>
                                        
                                        <div class="user-review-display">
                                            <strong>⭐ Your Review (${userReview.rating}/5)</strong>
                                            <div class="review-content">
                                                <p>${userReview.comment}</p>
                                                <small>📅 Reviewed on ${new Date(userReview.date).toLocaleDateString()}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="booking-card__actions">
                                        <button class="btn-secondary" onclick="viewMachineDetails(${booking.machineId})">
                                            👁️ View All Reviews
                                        </button>
                                        <button class="btn-danger" onclick="window.deleteReview(${booking.machineId}, '${userReview._id}')">
                                            🗑️ Delete My Review
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${farmerBookings.length === 0 ? 
                    '<p class="empty-state">No bookings yet. Start by browsing machines! 🚜</p>' : 
                    ''
                }
            `;
            break;
            
        case 'profile':
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>👤 My Profile</h2>
                    <p>Manage your farmer account</p>
                </div>
                <div class="profile-container">
                    <div class="profile-card">
                        <div class="profile-avatar">
                            <div class="avatar-circle">🧑‍🌾</div>
                        </div>
                        <form class="profile-form" onsubmit="event.preventDefault(); saveProfile('farmer')">
                            <h3>📝 Personal Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" id="profile-name" required value="${currentFarmer.name || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" id="profile-phone" required value="${currentFarmer.phone || ''}">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" id="profile-email" placeholder="your.email@example.com">
                            </div>
                            
                            <h3>🏠 Farm Details</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Farm Location</label>
                                    <input type="text" id="profile-location" placeholder="Village, District, State">
                                </div>
                                <div class="form-group">
                                    <label>Farm Size</label>
                                    <input type="text" id="profile-farmsize" placeholder="e.g., 10 acres">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Crops You Grow</label>
                                <input type="text" id="profile-crops" placeholder="e.g., Wheat, Rice, Cotton">
                            </div>
                            <div class="form-group">
                                <label>About Your Farm</label>
                                <textarea id="profile-about" rows="3" placeholder="Tell us about your farming experience..."></textarea>
                            </div>
                            
                            <div class="profile-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${bookings.filter(b => b.phone === currentFarmer.phone).length}</div>
                                    <div class="stat-label">Total Bookings</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${favorites.length}</div>
                                    <div class="stat-label">Favorites</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${bookings.filter(b => b.phone === currentFarmer.phone && b.status === 'completed').length}</div>
                                    <div class="stat-label">Completed</div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn-primary btn-block">💾 Save Profile</button>
                        </form>
                    </div>
                </div>
            `;
            break;
            
        case 'support':
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>🆘 Need Support?</h2>
                    <p>We're here to help you!</p>
                </div>
                <div class="support-container">
                    <div class="support-card">
                        <div class="support-icon">📞</div>
                        <h3>Call Us</h3>
                        <p>Speak directly with our support team</p>
                        <a href="tel:+911234567890" class="btn-primary">📞 Call +91 123-456-7890</a>
                    </div>
                    <div class="support-card">
                        <div class="support-icon">📧</div>
                        <h3>Email Support</h3>
                        <p>Send us your questions or concerns</p>
                        <a href="mailto:support@harvestharmony.com" class="btn-primary">📧 Email Us</a>
                    </div>
                    <div class="support-card">
                        <div class="support-icon">💬</div>
                        <h3>WhatsApp</h3>
                        <p>Chat with us on WhatsApp</p>
                        <a href="https://wa.me/911234567890" target="_blank" class="btn-primary">💬 WhatsApp Chat</a>
                    </div>
                </div>
                <div class="faq-section">
                    <h3>💡 Frequently Asked Questions</h3>
                    <div class="faq-list">
                        <details class="faq-item">
                            <summary>How do I book a machine?</summary>
                            <p>Browse available machines, click on the one you need, then click "Book Now" and fill in the booking details.</p>
                        </details>
                        <details class="faq-item">
                            <summary>How do I cancel a booking?</summary>
                            <p>Go to "My Bookings" and contact the operator directly for cancellation requests.</p>
                        </details>
                        <details class="faq-item">
                            <summary>What payment methods are accepted?</summary>
                            <p>Payment details are discussed directly with the machine operator when confirming the booking.</p>
                        </details>
                        <details class="faq-item">
                            <summary>How do I add machines to favorites?</summary>
                            <p>Click the heart icon (♥️) on any machine card to add it to your favorites for quick access later.</p>
                        </details>
                        <details class="faq-item">
                            <summary>Can I review a machine after use?</summary>
                            <p>Yes! After your booking is completed, you'll see a "Write Review" button in My Bookings section.</p>
                        </details>
                    </div>
                </div>
            `;
            break;
    }
}

async function showOperatorView(view) {
    currentView = view;
    const content = document.getElementById('operator-content');
    
    switch(view) {
        case 'requests':
            const pendingBookings = bookings.filter(b => b.status === 'pending');
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>📬 Booking Requests</h2>
                    <p>Manage incoming booking requests</p>
                </div>
                <div class="bookings-list">
                    ${pendingBookings.length === 0 ?
                        '<p class="empty-state">No pending requests 👍</p>' :
                        pendingBookings.map(booking => `
                            <div class="booking-card booking-request-card">
                                <div class="booking-card__header">
                                    <div>
                                        <h3>👨‍🌾 ${booking.farmerName}</h3>
                                        ${booking.bookingId ? `<p style="font-size: 12px; color: #666; margin: 4px 0 0 0;">Booking ID: ${booking.bookingId}</p>` : ''}
                                    </div>
                                    <span class="status-badge status-badge--${booking.status}">⏳ ${booking.status}</span>
                                </div>
                                <div class="booking-card__body">
                                    <div class="booking-info-grid">
                                        <div class="info-item">
                                            <span class="info-icon">🚜</span>
                                            <div>
                                                <strong>Machine</strong>
                                                <p>${booking.machineName}</p>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-icon">📞</span>
                                            <div>
                                                <strong>Contact</strong>
                                                <p><a href="tel:${booking.phone}">${booking.phone}</a></p>
                                                ${booking.email ? `<p><a href="mailto:${booking.email}">${booking.email}</a></p>` : ''}
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-icon">📅</span>
                                            <div>
                                                <strong>Schedule</strong>
                                                <p>${booking.date}</p>
                                                <p>${booking.startTime} - ${booking.endTime} (${booking.duration})</p>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-icon">📍</span>
                                            <div>
                                                <strong>Location</strong>
                                                <p>${booking.location}</p>
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-icon">🌾</span>
                                            <div>
                                                <strong>Crop & Field</strong>
                                                <p>${booking.crop}</p>
                                                ${booking.fieldSize ? `<p>${booking.fieldSize} ${booking.fieldSizeUnit}</p>` : ''}
                                            </div>
                                        </div>
                                        <div class="info-item">
                                            <span class="info-icon">💰</span>
                                            <div>
                                                <strong>Amount</strong>
                                                <p class="amount-highlight">₹${booking.amount}</p>
                                            </div>
                                        </div>
                                    </div>
                                    ${booking.notes ? `
                                        <div class="booking-notes">
                                            <strong>📝 Special Instructions:</strong>
                                            <p>${booking.notes}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="booking-card__actions">
                                    <button class="btn-success" onclick="handleBookingAction('${booking._id}', 'accepted')">
                                        ✅ Accept Booking
                                    </button>
                                    <button class="btn-danger" onclick="handleBookingAction('${booking._id}', 'rejected')">
                                        ❌ Decline
                                    </button>
                                    <a href="tel:${booking.phone}" class="btn-secondary">
                                        📞 Call Farmer
                                    </a>
                                </div>
                            </div>
                        `).join('')
                    }
                </div>
            `;
            break;
            
        case 'earnings':
            const earnings = await fetchEarnings();
            const acceptedBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'completed');
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>💰 Earnings Dashboard</h2>
                    <p>Track your income from all bookings</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card" style="background: linear-gradient(135deg, #66BB6A 0%, #43A047 100%);">
                        <div class="stat-card__icon">📅</div>
                        <div class="stat-card__info">
                            <h3>₹${earnings?.today || 0}</h3>
                            <p>Today's Earnings</p>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #42A5F5 0%, #1E88E5 100%);">
                        <div class="stat-card__icon">📊</div>
                        <div class="stat-card__info">
                            <h3>₹${earnings?.thisMonth || 0}</h3>
                            <p>This Month</p>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #FFA726 0%, #FB8C00 100%);">
                        <div class="stat-card__icon">💎</div>
                        <div class="stat-card__info">
                            <h3>₹${earnings?.total || 0}</h3>
                            <p>Total Earnings</p>
                        </div>
                    </div>
                    <div class="stat-card" style="background: linear-gradient(135deg, #AB47BC 0%, #8E24AA 100%);">
                        <div class="stat-card__icon">📋</div>
                        <div class="stat-card__info">
                            <h3>${acceptedBookings.length}</h3>
                            <p>Total Bookings</p>
                        </div>
                    </div>
                </div>
                <div class="dashboard__header" style="margin-top: 2rem;">
                    <h2>📋 Accepted Bookings</h2>
                </div>
                <div class="bookings-list">
                    ${acceptedBookings.length === 0 ?
                        '<p class="empty-state">No accepted bookings yet</p>' :
                        acceptedBookings.map(booking => `
                            <div class="booking-card">
                                <div class="booking-card__header">
                                    <h3>${booking.farmerName}</h3>
                                    <span class="status-badge status-badge--${booking.status}">${booking.status}</span>
                                </div>
                                <div class="booking-card__body">
                                    <p>🚜 <strong>Machine:</strong> ${booking.machineName}</p>
                                    <p>📅 <strong>Date:</strong> ${booking.date}</p>
                                    <p>⏰ <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
                                    <p>💰 <strong>Amount:</strong> ₹${booking.amount}</p>
                                </div>
                                ${booking.status === 'accepted' ? `
                                    <div class="booking-card__actions">
                                        <button class="btn-success" onclick="handleBookingAction('${booking._id}', 'completed')">
                                            ✅ Mark Completed
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')
                    }
                </div>
            `;
            break;
            
        case 'profile':
            const operatorBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'completed');
            const totalEarnings = operatorBookings.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>👤 Operator Profile</h2>
                    <p>Manage your operator account</p>
                </div>
                <div class="profile-container">
                    <div class="profile-card">
                        <div class="profile-avatar">
                            <div class="avatar-circle">🔧</div>
                        </div>
                        <form class="profile-form" onsubmit="event.preventDefault(); saveProfile('operator')">
                            <h3>📝 Operator Information</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Full Name *</label>
                                    <input type="text" id="operator-name" required placeholder="Enter your name">
                                </div>
                                <div class="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" id="operator-phone" required placeholder="+91 XXXXX XXXXX">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Email Address</label>
                                <input type="email" id="operator-email" placeholder="your.email@example.com">
                            </div>
                            
                            <h3>🚜 Equipment Details</h3>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" id="operator-location" placeholder="City, State">
                                </div>
                                <div class="form-group">
                                    <label>Experience</label>
                                    <input type="text" id="operator-experience" placeholder="e.g., 5+ years">
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Equipment Types</label>
                                <input type="text" id="operator-equipment" placeholder="e.g., Tractor, Harvester, Seeder">
                            </div>
                            <div class="form-group">
                                <label>About You</label>
                                <textarea id="operator-about" rows="3" placeholder="Tell farmers about your service..."></textarea>
                            </div>
                            
                            <div class="profile-stats">
                                <div class="stat-item">
                                    <div class="stat-value">${operatorBookings.length}</div>
                                    <div class="stat-label">Total Jobs</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">₹${totalEarnings}</div>
                                    <div class="stat-label">Total Earned</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${bookings.filter(b => b.status === 'pending').length}</div>
                                    <div class="stat-label">Pending</div>
                                </div>
                            </div>
                            
                            <button type="submit" class="btn-primary btn-block">💾 Save Profile</button>
                        </form>
                    </div>
                </div>
            `;
            break;
            
        case 'support':
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>🆘 Need Support?</h2>
                    <p>We're here to help operators succeed</p>
                </div>
                <div class="support-container">
                    <div class="support-card">
                        <div class="support-icon">📞</div>
                        <h3>Operator Helpline</h3>
                        <p>Get immediate assistance</p>
                        <a href="tel:+911234567891" class="btn-primary">📞 Call +91 123-456-7891</a>
                    </div>
                    <div class="support-card">
                        <div class="support-icon">📧</div>
                        <h3>Business Support</h3>
                        <p>Questions about earnings or bookings</p>
                        <a href="mailto:operators@harvestharmony.com" class="btn-primary">📧 Email Us</a>
                    </div>
                    <div class="support-card">
                        <div class="support-icon">🔧</div>
                        <h3>Technical Support</h3>
                        <p>Equipment or platform issues</p>
                        <a href="https://wa.me/911234567891" target="_blank" class="btn-primary">💬 WhatsApp Support</a>
                    </div>
                </div>
                <div class="faq-section">
                    <h3>💡 Operator FAQs</h3>
                    <div class="faq-list">
                        <details class="faq-item">
                            <summary>How do I accept booking requests?</summary>
                            <p>Go to "Booking Requests" and click the ✅ Accept button on pending requests. You can also reject requests if unavailable.</p>
                        </details>
                        <details class="faq-item">
                            <summary>How do I track my earnings?</summary>
                            <p>Visit the "My Earnings" section to see your daily, monthly, and total earnings from all completed bookings.</p>
                        </details>
                        <details class="faq-item">
                            <summary>What if a farmer cancels?</summary>
                            <p>Contact our support team immediately. We'll help resolve the situation and update the booking status.</p>
                        </details>
                        <details class="faq-item">
                            <summary>How do I update machine availability?</summary>
                            <p>Contact support to update your machine's availability status when you're busy or unavailable.</p>
                        </details>
                        <details class="faq-item">
                            <summary>When do I get paid?</summary>
                            <p>Payment arrangements are made directly with farmers. Mark bookings as "Completed" once the job is done.</p>
                        </details>
                    </div>
                </div>
            `;
            break;
    }
}

async function fetchEarnings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/stats/earnings`);
        if (response.ok) return await response.json();
    } catch (error) {
        console.error('❌ Error:', error);
    }
    return { today: 0, thisMonth: 0, total: 0 };
}

function viewMachineDetails(machineId) {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;
    
    const reviews = machine.reviews || [];
    const modal = document.getElementById('machine-modal');
    const modalContent = document.getElementById('machine-modal-content');
    
    modalContent.innerHTML = `
                <div class="modal__header">
                    <h2>${machine.image} ${machine.name}</h2>
                    <button class="modal__close" onclick="closeModal('machine-modal')">&times;</button>
                </div>
                <div class="modal__body">
                    <div class="machine-details">
                        <h3>📋 Machine Information</h3>
                        <p><strong>Operator:</strong> ${machine.operator}</p>
                        <p><strong>Type:</strong> ${machine.type}</p>
                        <p><strong>Best for:</strong> ${machine.crop}</p>
                        <p><strong>Location:</strong> ${machine.location}</p>
                        <p><strong>Experience:</strong> ${machine.experience}</p>
                        <p><strong>Price:</strong> ${machine.price}</p>
                        <p><strong>Rating:</strong> ⭐ ${machine.rating}/5</p>
                        <p><strong>Total Bookings:</strong> ${machine.totalBookings || 0}</p>
                        <p><strong>Status:</strong> ${machine.available ? '✅ Available' : '❌ Unavailable'}</p>
                        
                        <h3 style="margin-top: 20px;">💬 Reviews (${reviews.length})</h3>
                        ${reviews.length === 0 ? '<p>No reviews yet.</p>' : 
                            reviews.map(r => `
                                <div class="review-item">
                                    <div class="review-header">
                                        <div>
                                            <strong>${r.farmerName}</strong>
                                            <span style="margin-left: 15px;">⭐ ${r.rating}/5</span>
                                        </div>
                                        ${r.farmerName === currentFarmer.name ? `
                                            <button class="btn-delete-review" onclick="deleteReview(${machine.id}, '${r._id}')" title="Delete your review">
                                                🗑️ Delete
                                            </button>
                                        ` : ''}
                                    </div>
                                    <p>${r.comment}</p>
                                    <small>${new Date(r.date).toLocaleDateString()}</small>
                                </div>
                            `).join('')
                        }
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button class="btn-primary" style="flex: 1;" onclick="closeModal('machine-modal');">
                            ✅ Close
                        </button>
                    </div>
                </div>
    `;
    
    modal.classList.add('active');
}

function bookMachine(machineId) {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;
    
    const modal = document.getElementById('booking-modal');
    const modalContent = document.getElementById('booking-modal-content');
    
    modalContent.innerHTML = `
                <div class="modal__header">
                    <h2>📅 Book ${machine.name}</h2>
                    <button class="modal__close" onclick="closeBookingModal()">&times;</button>
                </div>
                <div class="modal__body">
                    <form id="booking-form" class="booking-form">
                        <h3>👨‍🌾 Farmer Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Your Name *</label>
                                <input type="text" id="farmer-name" required placeholder="Enter your name" value="${currentFarmer.name}">
                            </div>
                            <div class="form-group">
                                <label>Phone Number *</label>
                                <input type="tel" id="farmer-phone" required placeholder="+91 XXXXX XXXXX" value="${currentFarmer.phone}">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="farmer-email" placeholder="your.email@example.com">
                        </div>
                        
                        <h3>📍 Location Details</h3>
                        <div class="form-group">
                            <label>Village/City *</label>
                            <input type="text" id="farmer-village" required placeholder="Your village or city">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>District *</label>
                                <input type="text" id="farmer-district" required placeholder="District">
                            </div>
                            <div class="form-group">
                                <label>State *</label>
                                <input type="text" id="farmer-state" required placeholder="State">
                            </div>
                            <div class="form-group">
                                <label>Pincode</label>
                                <input type="text" id="farmer-pincode" placeholder="000000">
                            </div>
                        </div>
                        
                        <h3>📅 Booking Details</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" id="booking-date" required min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="form-group">
                                <label>Start Time *</label>
                                <input type="time" id="start-time" required>
                            </div>
                            <div class="form-group">
                                <label>End Time *</label>
                                <input type="time" id="end-time" required>
                            </div>
                        </div>
                        
                        <h3>🌾 Crop & Field Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Crop Type *</label>
                                <input type="text" id="crop-type" required placeholder="e.g., Wheat, Rice">
                            </div>
                            <div class="form-group">
                                <label>Field Size *</label>
                                <input type="number" id="field-size" required placeholder="Enter size" min="0.1" step="0.1">
                            </div>
                            <div class="form-group">
                                <label>Unit *</label>
                                <select id="field-unit" required>
                                    <option value="acres">Acres</option>
                                    <option value="hectares">Hectares</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>Additional Notes</label>
                            <textarea id="booking-notes" rows="3" placeholder="Any special requirements or instructions..."></textarea>
                        </div>
                        
                        <div class="price-estimate">
                            <div>
                                <strong>💰 Price Rate:</strong> ${machine.price}
                            </div>
                            <div id="total-estimate" style="font-size: 18px; margin-top: 10px;"></div>
                        </div>
                        
                        <button type="submit" class="btn-primary btn-block">
                            ✅ Confirm Booking
                        </button>
                    </form>
                </div>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitBooking(machine);
    });
    
    document.getElementById('start-time').addEventListener('change', () => calculatePrice(machine));
    document.getElementById('end-time').addEventListener('change', () => calculatePrice(machine));
}

function calculatePrice(machine) {
    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    
    if (startTime && endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        const hours = (end - start) / (1000 * 60 * 60);
        
        if (hours > 0) {
            const total = hours * machine.pricePerHour;
            const advance = (total * 0.2).toFixed(0); // 20% advance
            document.getElementById('total-estimate').innerHTML = `
                <strong>Duration:</strong> ${hours} hours<br>
                <strong>Total Amount:</strong> ₹${total}<br>
                <strong>Advance (20%):</strong> ₹${advance}
            `;
        } else {
            document.getElementById('total-estimate').innerHTML = '<span style="color: red;">Invalid time range</span>';
        }
    }
}

async function submitBooking(machine) {
    const name = document.getElementById('farmer-name').value;
    const phone = document.getElementById('farmer-phone').value;
    
    saveFarmerInfo(name, phone);
    
    const start = new Date(`2000-01-01T${document.getElementById('start-time').value}`);
    const end = new Date(`2000-01-01T${document.getElementById('end-time').value}`);
    const hours = (end - start) / (1000 * 60 * 60);
    
    const bookingData = {
        farmerName: name,
        phone: phone,
        email: document.getElementById('farmer-email').value,
        location: `${document.getElementById('farmer-village').value}, ${document.getElementById('farmer-district').value}, ${document.getElementById('farmer-state').value}`,
        address: {
            village: document.getElementById('farmer-village').value,
            district: document.getElementById('farmer-district').value,
            state: document.getElementById('farmer-state').value,
            pincode: document.getElementById('farmer-pincode').value
        },
        date: document.getElementById('booking-date').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        duration: `${hours} hours`,
        machineId: machine.id,
        machineName: machine.name,
        crop: document.getElementById('crop-type').value,
        fieldSize: parseFloat(document.getElementById('field-size').value),
        fieldSizeUnit: document.getElementById('field-unit').value,
        amount: hours * machine.pricePerHour,
        advancePayment: (hours * machine.pricePerHour * 0.2).toFixed(0),
        notes: document.getElementById('booking-notes').value,
        status: 'pending'
    };
    
    try {
        await createBooking(bookingData);
        closeBookingModal();
        showNotification('🎉 Booking request submitted successfully!');
        setTimeout(() => {
            switchToPage('farmer');
            showFarmerView('bookings');
        }, 1000);
    } catch (error) {
        alert('❌ Failed to submit booking. Please try again.');
    }
}

function openReviewModal(bookingId, machineId, machineName) {
    const modal = document.getElementById('review-modal');
    const modalContent = document.getElementById('review-modal-content');
    
    modalContent.innerHTML = `
                <div class="modal__header">
                    <h2>⭐ Review ${machineName}</h2>
                    <button class="modal__close" onclick="closeModal('review-modal')">&times;</button>
                </div>
                <div class="modal__body">
                    <form id="review-form">
                        <div class="form-group">
                            <label>Rating *</label>
                            <div class="rating-stars">
                                <input type="radio" name="rating" value="5" id="star5" required>
                                <label for="star5">⭐⭐⭐⭐⭐</label>
                                <input type="radio" name="rating" value="4" id="star4">
                                <label for="star4">⭐⭐⭐⭐</label>
                                <input type="radio" name="rating" value="3" id="star3">
                                <label for="star3">⭐⭐⭐</label>
                                <input type="radio" name="rating" value="2" id="star2">
                                <label for="star2">⭐⭐</label>
                                <input type="radio" name="rating" value="1" id="star1">
                                <label for="star1">⭐</label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Your Review *</label>
                            <textarea id="review-comment" required rows="4" placeholder="Share your experience with this machine..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary btn-block">Submit Review</button>
                    </form>
                </div>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('review-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        if (!ratingInput) {
            alert('⭐ Please select a rating!');
            return;
        }
        
        const rating = ratingInput.value;
        const comment = document.getElementById('review-comment').value.trim();
        
        if (!comment) {
            alert('📝 Please write your review!');
            return;
        }
        
        const success = await submitReview(machineId, rating, comment);
        if (success) {
            closeModal('review-modal');
            // Refresh bookings view to show the review
            showFarmerView('bookings');
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.classList.remove('active');
}

async function handleBookingAction(bookingId, action) {
    try {
        await updateBookingStatus(bookingId, action);
        showOperatorView(currentView);
    } catch (error) {
        alert('❌ Failed to update booking. Please try again.');
    }
}

// Add CSS for new components
const style = document.createElement('style');
style.textContent = `
    .favorite-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 4px;
        transition: transform 0.2s;
    }
    .favorite-btn:hover {
        transform: scale(1.2);
    }
    .favorite-btn.active {
        animation: heartbeat 0.5s;
    }
    @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    .modal-large {
        max-width: 700px;
        max-height: 90vh;
        overflow-y: auto;
    }
    .booking-form h3 {
        margin-top: 20px;
        margin-bottom: 15px;
        color: #2d5016;
        border-bottom: 2px solid #4CAF50;
        padding-bottom: 8px;
    }
    .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
    }
    .review-item {
        background: #f5f5f5;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 10px;
    }
    .review-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    .rating-stars {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .rating-stars label {
        cursor: pointer;
        padding: 8px;
        border: 2px solid #ddd;
        border-radius: 8px;
        transition: all 0.3s;
    }
    .rating-stars input {
        display: none;
    }
    .rating-stars input:checked + label {
        background: #4CAF50;
        color: white;
        border-color: #4CAF50;
    }
    .rating-stars label:hover {
        background: #e8f5e9;
    }
    .machine-details p {
        margin: 8px 0;
    }
`;
document.head.appendChild(style);
