// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Navigation and Page Management
let currentPage = 'landing';
let currentView = 'browse'; // For farmer/operator dashboards

// Machine data cache (will be fetched from API)
let machines = [];
let bookings = [];

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

    // Fetch initial data from API
    fetchMachines();
    fetchBookings();

    initializeNavigation();
    initializeSidebar();
    initializeButtons();
    initializeSearch();
});

// API Functions
async function fetchMachines() {
    try {
        const response = await fetch(`${API_BASE_URL}/machines`);
        if (!response.ok) throw new Error('Failed to fetch machines');
        machines = await response.json();
        console.log('✅ Machines loaded from API:', machines.length);
        updateMachineDisplays();
    } catch (error) {
        console.error('❌ Error fetching machines:', error);
        // Fallback to local data if API is not available
        loadLocalMachines();
    }
}

async function fetchBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        if (!response.ok) throw new Error('Failed to fetch bookings');
        bookings = await response.json();
        console.log('✅ Bookings loaded from API:', bookings.length);
        updateBookingDisplays();
    } catch (error) {
        console.error('❌ Error fetching bookings:', error);
        // Fallback to local data if API is not available
        loadLocalBookings();
    }
}

async function createBooking(bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });
        if (!response.ok) throw new Error('Failed to create booking');
        const newBooking = await response.json();
        bookings.unshift(newBooking);
        updateBookingDisplays();
        return newBooking;
    } catch (error) {
        console.error('❌ Error creating booking:', error);
        throw error;
    }
}

async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update booking status');
        const updatedBooking = await response.json();
        
        // Update local bookings array
        const index = bookings.findIndex(b => b._id === bookingId);
        if (index !== -1) {
            bookings[index] = updatedBooking;
        }
        updateBookingDisplays();
        return updatedBooking;
    } catch (error) {
        console.error('❌ Error updating booking:', error);
        throw error;
    }
}

async function fetchEarnings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/stats/earnings`);
        if (!response.ok) throw new Error('Failed to fetch earnings');
        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching earnings:', error);
        return { today: 0, thisMonth: 0, total: 0 };
    }
}

// Fallback functions for local data
function loadLocalMachines() {
    machines = [
        { id: 1, name: "Rajesh's Cool Tractor 🚜", operator: "Rajesh Kumar", type: "Tractor", price: "₹1200/hour", pricePerHour: 1200, crop: "Wheat", rating: 4.8, available: true },
        { id: 2, name: "The Harvest Beast 🌾", operator: "Suresh Singh", type: "Harvester", price: "₹2500/hour", pricePerHour: 2500, crop: "Rice", rating: 4.9, available: true },
        { id: 3, name: "Thresher Thunder ⚡", operator: "Amit Sharma", type: "Thresher", price: "₹800/hour", pricePerHour: 800, crop: "Barley", rating: 4.7, available: false },
        { id: 4, name: "Seed Rocket 🚀", operator: "Vikram Yadav", type: "Seeder", price: "₹600/hour", pricePerHour: 600, crop: "Wheat", rating: 4.6, available: true },
        { id: 5, name: "Heavy Duty Hero 💪", operator: "Mohan Lal", type: "Tractor", price: "₹1500/hour", pricePerHour: 1500, crop: "Rice", rating: 4.5, available: true },
        { id: 6, name: "Mini Marvel ✨", operator: "Ramesh Kumar", type: "Tractor", price: "₹1800/hour", pricePerHour: 1800, crop: "Wheat", rating: 4.4, available: true }
    ];
    updateMachineDisplays();
}

function loadLocalBookings() {
    bookings = [];
    updateBookingDisplays();
}

// Update displays when data changes
function updateMachineDisplays() {
    if (currentPage === 'farmer' && currentView === 'browse') {
        showFarmerView('browse');
    }
}

function updateBookingDisplays() {
    if (currentPage === 'farmer' && currentView === 'bookings') {
        showFarmerView('bookings');
    } else if (currentPage === 'operator' && currentView === 'requests') {
        showOperatorView('requests');
    } else if (currentPage === 'operator' && currentView === 'earnings') {
        showOperatorView('earnings');
    }
}

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

// Rest of the original script.js functions remain the same...
// (I'll include key booking-related functions that need API integration)

function initializeButtons() {
    // Landing page buttons
    const farmerBtn = document.getElementById('farmer-btn');
    const operatorBtn = document.getElementById('operator-btn');
    
    if (farmerBtn) {
        farmerBtn.addEventListener('click', () => switchToPage('farmer'));
    }
    
    if (operatorBtn) {
        operatorBtn.addEventListener('click', () => switchToPage('operator'));
    }
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
    
    // Close modal on outside click
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
                                <span class="machine-card__status ${machine.available ? 'available' : 'unavailable'}">
                                    ${machine.available ? '✅ Available' : '❌ Unavailable'}
                                </span>
                            </div>
                            <h3 class="machine-card__title">${machine.name}</h3>
                            <div class="machine-card__info">
                                <p>👨‍🌾 <strong>Operator:</strong> ${machine.operator}</p>
                                <p>🔧 <strong>Type:</strong> ${machine.type}</p>
                                <p>🌾 <strong>Best for:</strong> ${machine.crop}</p>
                                <p>⭐ <strong>Rating:</strong> ${machine.rating}/5</p>
                            </div>
                            <div class="machine-card__footer">
                                <div class="machine-card__price">${machine.price}</div>
                                <button class="btn-primary" onclick="bookMachine(${machine.id})" ${!machine.available ? 'disabled' : ''}>
                                    📅 Book Now
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
        case 'bookings':
            const farmerBookings = bookings.filter(b => true); // In real app, filter by farmer
            content.innerHTML = `
                <div class="dashboard__header">
                    <h2>📋 My Bookings</h2>
                    <p>Track your machine bookings</p>
                </div>
                <div class="bookings-list">
                    ${farmerBookings.length === 0 ? 
                        '<p class="empty-state">No bookings yet. Start by browsing machines! 🚜</p>' :
                        farmerBookings.map(booking => `
                            <div class="booking-card">
                                <div class="booking-card__header">
                                    <h3>${booking.machineName}</h3>
                                    <span class="status-badge status-badge--${booking.status}">${booking.status}</span>
                                </div>
                                <div class="booking-card__body">
                                    <p>📅 <strong>Date:</strong> ${booking.date}</p>
                                    <p>⏰ <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
                                    <p>⏱️ <strong>Duration:</strong> ${booking.duration}</p>
                                    <p>🌾 <strong>Crop:</strong> ${booking.crop}</p>
                                    <p>📍 <strong>Location:</strong> ${booking.location}</p>
                                    <p>💰 <strong>Amount:</strong> ₹${booking.amount}</p>
                                </div>
                            </div>
                        `).join('')
                    }
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
                            <div class="booking-card">
                                <div class="booking-card__header">
                                    <h3>${booking.farmerName}</h3>
                                    <span class="status-badge status-badge--${booking.status}">${booking.status}</span>
                                </div>
                                <div class="booking-card__body">
                                    <p>🚜 <strong>Machine:</strong> ${booking.machineName}</p>
                                    <p>📞 <strong>Phone:</strong> ${booking.phone}</p>
                                    <p>📍 <strong>Location:</strong> ${booking.location}</p>
                                    <p>📅 <strong>Date:</strong> ${booking.date}</p>
                                    <p>⏰ <strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
                                    <p>⏱️ <strong>Duration:</strong> ${booking.duration}</p>
                                    <p>🌾 <strong>Crop:</strong> ${booking.crop}</p>
                                    <p>💰 <strong>Amount:</strong> ₹${booking.amount}</p>
                                </div>
                                <div class="booking-card__actions">
                                    <button class="btn-success" onclick="handleBookingAction('${booking._id}', 'accepted')">
                                        ✅ Accept
                                    </button>
                                    <button class="btn-danger" onclick="handleBookingAction('${booking._id}', 'rejected')">
                                        ❌ Reject
                                    </button>
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
                    <p>Track your income</p>
                </div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card__icon">📅</div>
                        <div class="stat-card__info">
                            <h3>₹${earnings.today}</h3>
                            <p>Today's Earnings</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__icon">📊</div>
                        <div class="stat-card__info">
                            <h3>₹${earnings.thisMonth}</h3>
                            <p>This Month</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__icon">💎</div>
                        <div class="stat-card__info">
                            <h3>₹${earnings.total}</h3>
                            <p>Total Earnings</p>
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
                            </div>
                        `).join('')
                    }
                </div>
            `;
            break;
    }
}

// Booking machine modal
function bookMachine(machineId) {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="booking-modal">
            <div class="modal">
                <div class="modal__header">
                    <h2>📅 Book ${machine.name}</h2>
                    <button class="modal__close" onclick="closeBookingModal()">&times;</button>
                </div>
                <div class="modal__body">
                    <form id="booking-form">
                        <div class="form-group">
                            <label>👨‍🌾 Your Name</label>
                            <input type="text" id="farmer-name" required placeholder="Enter your name">
                        </div>
                        <div class="form-group">
                            <label>📞 Phone Number</label>
                            <input type="tel" id="farmer-phone" required placeholder="+91 XXXXX XXXXX">
                        </div>
                        <div class="form-group">
                            <label>📍 Location</label>
                            <input type="text" id="farmer-location" required placeholder="Village/City, State">
                        </div>
                        <div class="form-group">
                            <label>📅 Date</label>
                            <input type="date" id="booking-date" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>⏰ Start Time</label>
                                <input type="time" id="start-time" required>
                            </div>
                            <div class="form-group">
                                <label>⏰ End Time</label>
                                <input type="time" id="end-time" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>🌾 Crop Type</label>
                            <input type="text" id="crop-type" required placeholder="e.g., Wheat, Rice">
                        </div>
                        <div class="price-estimate">
                            <strong>💰 Price:</strong> ${machine.price}
                            <div id="total-estimate"></div>
                        </div>
                        <button type="submit" class="btn-primary btn-block">
                            ✅ Confirm Booking
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add form submit handler
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitBooking(machine);
    });
    
    // Add time change handlers for price calculation
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
            document.getElementById('total-estimate').innerHTML = `
                <strong>Duration:</strong> ${hours} hours<br>
                <strong>Total:</strong> ₹${total}
            `;
        }
    }
}

async function submitBooking(machine) {
    const bookingData = {
        farmerName: document.getElementById('farmer-name').value,
        phone: document.getElementById('farmer-phone').value,
        location: document.getElementById('farmer-location').value,
        date: document.getElementById('booking-date').value,
        startTime: document.getElementById('start-time').value,
        endTime: document.getElementById('end-time').value,
        machineId: machine.id,
        machineName: machine.name,
        crop: document.getElementById('crop-type').value,
        status: 'pending'
    };
    
    // Calculate duration and amount
    const start = new Date(`2000-01-01T${bookingData.startTime}`);
    const end = new Date(`2000-01-01T${bookingData.endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);
    
    bookingData.duration = `${hours} hours`;
    bookingData.amount = hours * machine.pricePerHour;
    
    try {
        await createBooking(bookingData);
        closeBookingModal();
        alert('🎉 Booking request submitted successfully! The operator will review it soon.');
        switchToPage('farmer');
        showFarmerView('bookings');
    } catch (error) {
        alert('❌ Failed to submit booking. Please try again.');
    }
}

function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) modal.remove();
}

async function handleBookingAction(bookingId, action) {
    try {
        await updateBookingStatus(bookingId, action);
        alert(`✅ Booking ${action === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
        showOperatorView('requests');
    } catch (error) {
        alert('❌ Failed to update booking. Please try again.');
    }
}
