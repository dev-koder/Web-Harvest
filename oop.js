// ============================================
// OBJECT-ORIENTED PROGRAMMING IMPLEMENTATION
// ============================================

// Base class for all machines
class Machine {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.operator = data.operator;
        this.type = data.type;
        this.price = data.price;
        this.pricePerHour = data.pricePerHour;
        this.crop = data.crop;
        this.rating = data.rating;
        this.available = data.available;
        this.description = data.description;
        this.image = data.image;
        this.location = data.location;
        this.experience = data.experience;
    }

    // Method to get machine status
    getStatus() {
        return this.available ? 'Available' : 'Busy';
    }

    // Method to calculate booking cost
    calculateCost(hours) {
        return this.pricePerHour * hours;
    }

    // Method to toggle availability
    toggleAvailability() {
        this.available = !this.available;
    }

    // Method to render machine card HTML
    renderCard() {
        const statusClass = this.available ? 'machine__status--available' : 'machine__status--busy';
        const statusText = this.available ? '✔ Available' : '• Busy';
        const buttonHTML = this.available 
            ? `<button class="btn btn--green machine__book" data-machine-id="${this.id}">Book Now!</button>`
            : `<button class="btn btn--disabled" disabled>Not Available</button>`;

        return `
            <div class="machine__card" data-machine-id="${this.id}">
                <div class="machine__image">
                    <button class="machine__specs" onclick="machineManager.showSpecs(${this.id})">Specs</button>
                    <span class="machine__status ${statusClass}">${statusText}</span>
                </div>
                <div class="machine__content">
                    <h3 class="machine__name">${this.name}</h3>
                    <p class="machine__description">${this.description}</p>
                    <div class="machine__details">
                        <span class="machine__operator">👤 ${this.operator}</span>
                        <span class="machine__price">${this.price}</span>
                        <span class="machine__rating">★ ${this.rating}</span>
                    </div>
                    ${buttonHTML}
                </div>
            </div>
        `;
    }
}

// BookingRequest class for managing booking requests
class BookingRequest {
    constructor(data) {
        this.id = data.id;
        this.farmerName = data.farmerName;
        this.phone = data.phone;
        this.location = data.location;
        this.date = data.date;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        this.duration = data.duration;
        this.machineId = data.machineId;
        this.machineName = data.machineName;
        this.crop = data.crop;
        this.amount = data.amount;
        this.status = data.status;
    }

    // Method to get status badge HTML
    getStatusBadge() {
        const statusClass = this.status === 'pending' ? 'request__status--pending' : 'request__status--accepted';
        const statusText = this.status === 'pending' ? 'Pending' : 'Accepted';
        return `<div class="request__status ${statusClass}">${statusText}</div>`;
    }

    // Method to accept request
    accept() {
        this.status = 'accepted';
    }

    // Method to reject request
    reject() {
        this.status = 'rejected';
    }

    // Method to render request card HTML
    renderCard() {
        const actionsHTML = this.status === 'pending' 
            ? `
                <div class="request__actions">
                    <button class="btn btn--green" onclick="bookingManager.acceptRequest(${this.id})">✔ Yes, Let's Do It!</button>
                    <button class="btn btn--red" onclick="bookingManager.rejectRequest(${this.id})">❌ Nope, Sorry!</button>
                </div>
            `
            : `<div class="request__success">✨ Awesome! Booking confirmed! The farmer is super happy! 😄</div>`;

        return `
            <div class="request__card" data-request-id="${this.id}">
                <div class="request__header">
                    ${this.getStatusBadge()}
                </div>
                <div class="request__content">
                    <h3 class="request__farmer">${this.farmerName}</h3>
                    <div class="request__contact">
                        <span class="request__phone">📞 ${this.phone}</span>
                        <span class="request__location">📍 ${this.location}</span>
                    </div>
                    <div class="request__details">
                        <div class="request__detail">
                            <span class="request__icon">📅</span>
                            <span>${this.date}</span>
                            <span>${this.startTime} - ${this.endTime}</span>
                        </div>
                        <div class="request__detail">
                            <span class="request__icon">⏱️</span>
                            <span>${this.duration}</span>
                        </div>
                        <div class="request__detail">
                            <span class="request__icon">🚜</span>
                            <span>${this.machineName}</span>
                        </div>
                        <div class="request__detail">
                            <span class="request__icon">🌾</span>
                            <span>${this.crop}</span>
                        </div>
                        <div class="request__detail">
                            <span class="request__icon">💰</span>
                            <span>₹${this.amount}</span>
                        </div>
                    </div>
                    ${actionsHTML}
                </div>
            </div>
        `;
    }
}

// MachineManager class - Singleton pattern for managing all machines
class MachineManager {
    constructor() {
        if (MachineManager.instance) {
            return MachineManager.instance;
        }
        this.machines = [];
        this.filteredMachines = [];
        MachineManager.instance = this;
    }

    // Load machines from JSON file
    async loadMachines() {
        try {
            const response = await fetch('machines.json');
            const data = await response.json();
            this.machines = data.machines.map(machineData => new Machine(machineData));
            this.filteredMachines = [...this.machines];
            this.renderMachines();
        } catch (error) {
            console.error('Error loading machines:', error);
            // Fallback to hardcoded data if JSON fails
            this.loadFallbackData();
        }
    }

    // Fallback data in case JSON loading fails
    loadFallbackData() {
        const fallbackData = [
            { id: 1, name: "Rajesh's Cool Tractor 🚜", operator: "Rajesh Kumar", type: "Tractor", price: "₹1200/hour", pricePerHour: 1200, crop: "Wheat", rating: 4.8, available: true, description: "Super fast and reliable! GPS included 📍", image: "🚜", location: "Punjab, India", experience: "5+ years" },
            { id: 2, name: "The Harvest Beast 🌾", operator: "Suresh Singh", type: "Harvester", price: "₹2500/hour", pricePerHour: 2500, crop: "Rice", rating: 4.9, available: true, description: "This baby can harvest anything! 💪", image: "🌾", location: "Haryana, India", experience: "8+ years" },
            { id: 3, name: "Thresher Thunder ⚡", operator: "Amit Sharma", type: "Thresher", price: "₹800/hour", pricePerHour: 800, crop: "Barley", rating: 4.7, available: false, description: "Lightning fast grain separation! ⚡", image: "⚡", location: "Rajasthan, India", experience: "4+ years" },
            { id: 4, name: "Seed Rocket 🚀", operator: "Vikram Yadav", type: "Seeder", price: "₹600/hour", pricePerHour: 600, crop: "Wheat", rating: 4.6, available: true, description: "Plants seeds with pinpoint accuracy! 🎯", image: "🚀", location: "UP, India", experience: "3+ years" },
            { id: 5, name: "Heavy Duty Hero 💪", operator: "Mohan Lal", type: "Tractor", price: "₹1500/hour", pricePerHour: 1500, crop: "Rice", rating: 4.5, available: true, description: "For when you need serious power! 🔥", image: "💪", location: "Bihar, India", experience: "6+ years" },
            { id: 6, name: "Mini Marvel ✨", operator: "Ramesh Kumar", type: "Tractor", price: "₹1800/hour", pricePerHour: 1800, crop: "Wheat", rating: 4.4, available: true, description: "Small but mighty! Perfect for cozy fields 🏡", image: "✨", location: "MP, India", experience: "7+ years" }
        ];
        this.machines = fallbackData.map(data => new Machine(data));
        this.filteredMachines = [...this.machines];
        this.renderMachines();
    }

    // Render machines to the grid
    renderMachines() {
        const grid = document.querySelector('.machines__grid');
        if (!grid) return;

        grid.innerHTML = this.filteredMachines.map(machine => machine.renderCard()).join('');
        
        // Re-attach event listeners for book buttons
        this.attachBookingListeners();
    }

    // Attach event listeners to booking buttons
    attachBookingListeners() {
        const bookButtons = document.querySelectorAll('.machine__book');
        bookButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const machineId = parseInt(e.target.dataset.machineId);
                this.bookMachine(machineId);
            });
        });
    }

    // Book a machine
    bookMachine(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (machine && machine.available) {
            showNotification('Booking Confirmed! 🎉', `${machine.name} has been booked successfully!`, 'success');
            // Could add more booking logic here
        }
    }

    // Show machine specifications
    showSpecs(machineId) {
        const machine = this.machines.find(m => m.id === machineId);
        if (machine) {
            const specs = `
                <strong>Machine:</strong> ${machine.name}<br>
                <strong>Type:</strong> ${machine.type}<br>
                <strong>Operator:</strong> ${machine.operator}<br>
                <strong>Experience:</strong> ${machine.experience}<br>
                <strong>Location:</strong> ${machine.location}<br>
                <strong>Suitable for:</strong> ${machine.crop}<br>
                <strong>Price:</strong> ${machine.price}<br>
                <strong>Rating:</strong> ⭐ ${machine.rating}<br>
                <strong>Status:</strong> ${machine.getStatus()}
            `;
            showNotification('Machine Specifications', specs, 'info');
        }
    }

    // Filter machines by criteria
    filterMachines(filterType, value) {
        if (value === 'All' || value.includes('All')) {
            this.filteredMachines = [...this.machines];
        } else {
            switch(filterType) {
                case 'crop':
                    this.filteredMachines = this.machines.filter(m => m.crop === value);
                    break;
                case 'type':
                    this.filteredMachines = this.machines.filter(m => m.type === value);
                    break;
                case 'price':
                    this.filterByPrice(value);
                    break;
            }
        }
        this.renderMachines();
    }

    // Filter by price range
    filterByPrice(range) {
        if (range.includes('Under')) {
            const max = parseInt(range.match(/\d+/)[0]);
            this.filteredMachines = this.machines.filter(m => m.pricePerHour < max);
        } else if (range.includes('Above')) {
            const min = parseInt(range.match(/\d+/)[0]);
            this.filteredMachines = this.machines.filter(m => m.pricePerHour > min);
        } else if (range.includes('-')) {
            const [min, max] = range.match(/\d+/g).map(Number);
            this.filteredMachines = this.machines.filter(m => 
                m.pricePerHour >= min && m.pricePerHour <= max
            );
        }
    }

    // Search machines
    searchMachines(query) {
        const lowerQuery = query.toLowerCase();
        return this.machines.filter(machine => 
            machine.name.toLowerCase().includes(lowerQuery) ||
            machine.operator.toLowerCase().includes(lowerQuery) ||
            machine.type.toLowerCase().includes(lowerQuery) ||
            machine.crop.toLowerCase().includes(lowerQuery)
        );
    }
}

// BookingManager class - Singleton pattern for managing bookings
class BookingManager {
    constructor() {
        if (BookingManager.instance) {
            return BookingManager.instance;
        }
        this.requests = [];
        this.earnings = {};
        BookingManager.instance = this;
    }

    // Load bookings from JSON file
    async loadBookings() {
        try {
            const response = await fetch('bookings.json');
            const data = await response.json();
            this.requests = data.bookingRequests.map(reqData => new BookingRequest(reqData));
            this.earnings = data.earnings;
            this.renderRequests();
            this.renderEarnings();
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.loadFallbackBookings();
        }
    }

    // Fallback booking data
    loadFallbackBookings() {
        const fallbackRequests = [
            { id: 1, farmerName: "Naman Sir 🧑‍🌾", phone: "+91 98765 43210", location: "Happy Farm Village, Gujarat 🌻", date: "2024-09-16", startTime: "08:00 AM", endTime: "10:00 AM", duration: "2 hours", machineId: 1, machineName: "Rajesh's Cool Tractor 🚜", crop: "Wheat 🌾", amount: 2400, status: "pending" },
            { id: 2, farmerName: "Saurabh Sir 🧑‍🌾", phone: "+91 87654 32109", location: "Green Fields Paradise, Punjab 🌱", date: "2024-09-17", startTime: "06:00 AM", endTime: "12:00 PM", duration: "6 hours", machineId: 2, machineName: "The Harvest Beast 🌾", crop: "Rice 🍚", amount: 15000, status: "pending" },
            { id: 3, farmerName: "Sachin Sir 🧑‍🌾", phone: "+91 76543 21098", location: "Harvest Valley, Haryana 🌾", date: "2024-09-18", startTime: "02:00 PM", endTime: "06:00 PM", duration: "4 hours", machineId: 3, machineName: "Thresher Thunder ⚡", crop: "Barley 🌾", amount: 3200, status: "accepted" }
        ];
        this.requests = fallbackRequests.map(data => new BookingRequest(data));
        this.earnings = { today: 5600, weekly: 28400, monthly: 89200, totalBookings: 47, completedBookings: 44, pendingBookings: 3, successRate: 94 };
        this.renderRequests();
        this.renderEarnings();
    }

    // Render booking requests
    renderRequests() {
        const container = document.querySelector('.requests__list');
        if (!container) return;

        container.innerHTML = this.requests.map(request => request.renderCard()).join('');
    }

    // Render earnings data
    renderEarnings() {
        // Update earnings cards
        const earningsCards = document.querySelectorAll('.earnings__card');
        if (earningsCards.length >= 3) {
            earningsCards[0].querySelector('.earnings__amount').textContent = `₹${this.earnings.today}`;
            earningsCards[1].querySelector('.earnings__amount').textContent = `₹${this.earnings.weekly}`;
            earningsCards[2].querySelector('.earnings__amount').textContent = `₹${this.earnings.monthly}`;
        }

        // Update stats
        const statRows = document.querySelectorAll('.stat__row');
        if (statRows.length >= 4) {
            statRows[0].querySelector('span:last-child').textContent = this.earnings.totalBookings;
            statRows[1].querySelector('span:last-child').textContent = this.earnings.completedBookings;
            statRows[2].querySelector('span:last-child').textContent = this.earnings.pendingBookings;
            statRows[3].querySelector('span:last-child').textContent = `${this.earnings.successRate}%`;
        }
    }

    // Accept a booking request
    acceptRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (request) {
            request.accept();
            showNotification('Request Accepted! ✅', `You accepted the booking from ${request.farmerName}`, 'success');
            this.renderRequests();
        }
    }

    // Reject a booking request
    rejectRequest(requestId) {
        const request = this.requests.find(r => r.id === requestId);
        if (request) {
            request.reject();
            showNotification('Request Declined', `You declined the booking from ${request.farmerName}`, 'info');
            this.renderRequests();
        }
    }

    // Get pending requests count
    getPendingCount() {
        return this.requests.filter(r => r.status === 'pending').length;
    }

    // Get accepted requests count
    getAcceptedCount() {
        return this.requests.filter(r => r.status === 'accepted').length;
    }
}

// Create singleton instances
const machineManager = new MachineManager();
const bookingManager = new BookingManager();

// Initialize OOP-based functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Load data from JSON files
    machineManager.loadMachines();
    bookingManager.loadBookings();

    // Setup filter listeners using OOP approach
    const filterSelects = document.querySelectorAll('.filter__select');
    filterSelects.forEach((select, index) => {
        select.addEventListener('change', function() {
            const filterTypes = ['crop', 'type', 'price'];
            machineManager.filterMachines(filterTypes[index], this.value);
        });
    });

    // Update search to use OOP
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const searchResults = document.getElementById('search-results');
            
            if (query.length === 0) {
                searchResults.innerHTML = '';
                return;
            }

            const results = machineManager.searchMachines(query);

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
});

// Export for use in other files (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Machine, BookingRequest, MachineManager, BookingManager };
}
