// ============================================
// AUTHENTICATION MANAGEMENT
// ============================================

let currentUser = null;

// Check authentication status on page load
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            updateUIForAuthState(true);
            return true;
        } else {
            currentUser = null;
            updateUIForAuthState(false);
            return false;
        }
    } catch (error) {
        console.error('Auth check error:', error);
        currentUser = null;
        updateUIForAuthState(false);
        return false;
    }
}

// Update UI based on authentication state
function updateUIForAuthState(isAuthenticated) {
    const navbar = document.querySelector('.navbar__right');
    
    if (!navbar) return;
    
    // Remove existing auth elements
    const existingAuthElements = navbar.querySelectorAll('.auth-element');
    existingAuthElements.forEach(el => el.remove());
    
    if (isAuthenticated && currentUser) {
        // Create user menu
        const userMenu = document.createElement('div');
        userMenu.className = 'auth-element user-menu';
        userMenu.innerHTML = `
            <div class="user-info">
                <span class="user-greeting">👋 Hi, ${currentUser.username}</span>
                <span class="user-role">${currentUser.role === 'farmer' ? '🌾' : '🔧'} ${currentUser.role}</span>
            </div>
            <button class="btn-logout" onclick="handleLogout()">Logout</button>
        `;
        
        // Insert before the chips
        const chips = navbar.querySelector('.chips');
        if (chips) {
            navbar.insertBefore(userMenu, chips);
        }
    } else {
        // Create login/register buttons
        const authButtons = document.createElement('div');
        authButtons.className = 'auth-element auth-buttons';
        authButtons.innerHTML = `
            <a href="/login" class="btn-login">Login</a>
            <a href="/register" class="btn-register">Register</a>
        `;
        
        // Insert before the chips
        const chips = navbar.querySelector('.chips');
        if (chips) {
            navbar.insertBefore(authButtons, chips);
        }
    }
}

// Handle logout
async function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = null;
            showNotification('👋 Logged out successfully!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showNotification('❌ Logout failed. Please try again.');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('❌ An error occurred during logout.');
    }
}

// Get current user
function getCurrentUser() {
    return currentUser;
}

// Check if user is authenticated
function isAuthenticated() {
    return currentUser !== null;
}

// Initialize auth on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthStatus();
    });
}
