// Configuration
const API_BASE_URL = 'https://fleet-monitor-169.emergent.host';
const API_KEY = 'sk-emergent-94eA9127216D46b8d4';

// DOM Elements
const containerInput = document.getElementById('containerInput');
const trackBtn = document.getElementById('trackBtn');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const errorMessage = document.getElementById('errorMessage');
const resultsDiv = document.getElementById('results');
const newSearchBtn = document.getElementById('newSearchBtn');

// Event Listeners
trackBtn.addEventListener('click', searchContainer);
containerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchContainer();
});
newSearchBtn.addEventListener('click', resetSearch);

// Search Container Function
async function searchContainer() {
    const containerNumber = containerInput.value.trim();

    if (!containerNumber) {
        showError('Please enter a container number');
        return;
    }

    showLoading(true);
    hideError();
    resultsDiv.style.display = 'none';

    try {
        // Make API call to fleet monitor
        const response = await fetch(`${API_BASE_URL}/api/containers/${containerNumber}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Container not found. Please check the container number.');
            } else if (response.status === 401) {
                throw new Error('Authentication failed. Please contact support.');
            } else if (response.status === 0) {
                throw new Error('Unable to connect to tracking server. Please check your internet connection.');
            } else {
                throw new Error(`Failed to fetch container data (Error ${response.status}). Please try again.`);
            }
        }

        const data = await response.json();
        displayResults(data);

    } catch (error) {
        console.error('Error:', error);
        
        // Handle network/CORS errors
        if (error.message.includes('Failed to fetch')) {
            showError('Unable to connect to tracking server. This might be a network issue or server unavailability. Please try again later.');
        } else {
            showError(error.message || 'An error occurred while fetching data. Please try again.');
        }
    } finally {
        showLoading(false);
    }
}

// Display Results
function displayResults(data) {
    // Populate container details
    document.getElementById('containerId').textContent = data.containerId || data.id || '-';
    document.getElementById('vehicleNumber').textContent = data.vehicleNumber || '-';
    document.getElementById('driverName').textContent = data.driverName || '-';
    document.getElementById('vehicleType').textContent = data.vehicleType || '-';

    // Display status with appropriate styling
    const statusElement = document.getElementById('status');
    const status = data.status || '-';
    statusElement.textContent = status;
    
    // Add status-specific styling
    statusElement.classList.remove('delivered', 'in-transit', 'pending');
    if (status.toLowerCase().includes('delivered')) {
        statusElement.classList.add('delivered');
    } else if (status.toLowerCase().includes('transit')) {
        statusElement.classList.add('in-transit');
    } else if (status.toLowerCase().includes('pending')) {
        statusElement.classList.add('pending');
    }

    // Show results
    resultsDiv.style.display = 'block';
    window.scrollTo({ top: resultsDiv.offsetTop - 100, behavior: 'smooth' });
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorDiv.style.display = 'block';
}

// Hide Error
function hideError() {
    errorDiv.style.display = 'none';
}

// Show/Hide Loading
function showLoading(show) {
    loadingDiv.style.display = show ? 'block' : 'none';
    trackBtn.disabled = show;
    trackBtn.style.opacity = show ? '0.6' : '1';
}

// Reset Search
function resetSearch() {
    containerInput.value = '';
    resultsDiv.style.display = 'none';
    hideError();
    containerInput.focus();
}
