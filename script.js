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
        // API endpoint: search at root with container number as query parameter
        const searchUrl = `${API_BASE_URL}/?search=${encodeURIComponent(containerNumber)}`;
        
        console.log('Fetching from:', searchUrl);

        const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            mode: 'cors',
            credentials: 'omit'
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Container not found. Please check the container number.');
            } else if (response.status === 401 || response.status === 403) {
                throw new Error('Authentication failed. Please contact support.');
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        }

        const data = await response.json();
        
        if (!data || Object.keys(data).length === 0) {
            throw new Error('Container not found. Please check the container number.');
        }

        displayResults(data);

    } catch (error) {
        console.error('Error details:', error);
        
        // Provide more helpful error messages
        if (error.message.includes('Failed to fetch')) {
            showError('Unable to connect to tracking server. This may be a network issue. Please check your internet connection and try again.');
        } else if (error.message.includes('CORS')) {
            showError('Connection error. Please try again in a moment.');
        } else {
            showError(error.message || 'An error occurred while fetching data. Please try again.');
        }
    } finally {
        showLoading(false);
    }
}

// Display Results
function displayResults(data) {
    // Handle different possible field names from the API
    const fieldMap = {
        'containerId': ['containerId', 'container_id', 'id', 'containerNumber', 'container_number'],
        'vehicleNumber': ['vehicleNumber', 'vehicle_number', 'vehicle', 'truck_number'],
        'driverName': ['driverName', 'driver_name', 'driver'],
        'vehicleType': ['vehicleType', 'vehicle_type', 'type'],
        'status': ['status', 'state', 'current_status']
    };

    // Function to find field value with flexible naming
    const findField = (obj, fieldNames) => {
        for (let name of fieldNames) {
            if (obj[name] !== undefined && obj[name] !== null) {
                return obj[name];
            }
        }
        return '-';
    };

    // Populate container details
    document.getElementById('containerId').textContent = findField(data, fieldMap.containerId);
    document.getElementById('vehicleNumber').textContent = findField(data, fieldMap.vehicleNumber);
    document.getElementById('driverName').textContent = findField(data, fieldMap.driverName);
    document.getElementById('vehicleType').textContent = findField(data, fieldMap.vehicleType);

    // Display status with appropriate styling
    const statusElement = document.getElementById('status');
    const status = String(findField(data, fieldMap.status)).toLowerCase();
    statusElement.textContent = status;
    
    // Add status-specific styling
    statusElement.classList.remove('delivered', 'in-transit', 'pending');
    if (status.includes('delivered') || status.includes('completed')) {
        statusElement.classList.add('delivered');
    } else if (status.includes('transit') || status.includes('in-transit') || status.includes('moving')) {
        statusElement.classList.add('in-transit');
    } else if (status.includes('pending') || status.includes('waiting')) {
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
