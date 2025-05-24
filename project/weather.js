// Weather API Configuration
const WEATHER_API_KEY = '9d70fa2da101de5ec64d30e266fdde1c'; // You'll need to replace this with your actual API key
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const NOTIFICATION_DURATION = 5000; // 5 seconds

// DOM Elements
const locationInput = document.querySelector('#location-input');
const locationButton = document.querySelector('.location-btn');
const refreshButton = document.querySelector('.refresh-btn');
const currentWeather = document.querySelector('.current-weather');
const weatherDetails = document.querySelector('.weather-details');
const forecastSection = document.querySelector('.forecast-slider');
const agriMetrics = document.querySelector('.metrics-grid');
const alertsContainer = document.querySelector('.alerts-container');
const lastUpdated = document.querySelector('#update-time');

// Weather Data State
let currentLocation = {
    lat: null,
    lon: null,
    name: ''
};

// Weather Map Configuration
let map;
let currentLayer;
const weatherLayers = {
    temperature: 'temp_new',
    precipitation: 'precipitation_new',
    clouds: 'clouds_new',
    wind: 'wind_new'
};

// Initialize Weather App
document.addEventListener('DOMContentLoaded', () => {
    initializeWeatherApp();
    initializeWeatherMap();
    setupEventListeners();
});

// Initialize the Weather Application
async function initializeWeatherApp() {
    showLoadingState();
    
    try {
        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    currentLocation.lat = position.coords.latitude;
                    currentLocation.lon = position.coords.longitude;
                    fetchWeatherData();
                },
                error => {
                    console.error('Geolocation error:', error);
                    setDefaultLocation();
                }
            );
        } else {
            setDefaultLocation();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Unable to initialize weather app');
    }

    const notificationContainer = createNotificationSystem();
}

// Setup Event Listeners
function setupEventListeners() {
    // Location search with Enter key
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchQuery = locationInput.value.trim();
            if (searchQuery) {
                searchLocation(searchQuery);
            }
        }
    });

    // GPS button click
    locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
            locationButton.disabled = true;
            locationButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    currentLocation.lat = position.coords.latitude;
                    currentLocation.lon = position.coords.longitude;
                    fetchWeatherData();
                    locationButton.disabled = false;
                    locationButton.innerHTML = '<i class="fas fa-crosshairs"></i>';
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    showError('Unable to get your location');
                    locationButton.disabled = false;
                    locationButton.innerHTML = '<i class="fas fa-crosshairs"></i>';
                }
            );
        }
    });

    // Refresh button click
    refreshButton.addEventListener('click', () => {
        if (currentLocation.lat && currentLocation.lon) {
            fetchWeatherData();
        } else if (locationInput.value.trim()) {
            searchLocation(locationInput.value.trim());
        }
    });
}

// Fetch Weather Data
async function fetchWeatherData() {
    showLoadingState();

    try {
        // Fetch current weather
        const currentWeatherData = await fetch(
            `${WEATHER_API_BASE}/weather?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${WEATHER_API_KEY}&units=metric`
        ).then(res => res.json());

        // Fetch forecast
        const forecastData = await fetch(
            `${WEATHER_API_BASE}/forecast?lat=${currentLocation.lat}&lon=${currentLocation.lon}&appid=${WEATHER_API_KEY}&units=metric`
        ).then(res => res.json());

        // Update UI with weather data
        updateWeatherUI(currentWeatherData, forecastData);
        updateLastUpdated();
        hideLoadingState();
    } catch (error) {
        console.error('Weather data fetch error:', error);
        showError('Unable to fetch weather data');
    }
}

// Update Weather UI
function updateWeatherUI(current, forecast) {
    const currentTemp = Math.round(current.main.temp);
    const weatherIcon = getWeatherIcon(current.weather[0].icon);
    const feelsLike = Math.round(current.main.feels_like);
    const isDay = current.weather[0].icon.includes('d');
    
    // Add time-based classes for different styling
    const timeClass = isDay ? 'day' : 'night';
    
    currentWeather.innerHTML = `
        <div class="weather-header">
            <div class="location-info">
                <h2>${current.name}, ${current.sys.country}</h2>
                <span class="last-updated">Last updated: ${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="temperature-display ${timeClass}">
                ${currentTemp}°C
                <i class="weather-icon ${weatherIcon} ${timeClass}"></i>
            </div>
            <div class="weather-description">
                <p>${current.weather[0].description}</p>
                <span>Feels like ${feelsLike}°C</span>
            </div>
            <div class="sun-times">
                <div class="sunrise">
                    <i class="fas fa-sunrise"></i>
                    ${formatTime(current.sys.sunrise)}
                </div>
                <div class="sunset">
                    <i class="fas fa-sunset"></i>
                    ${formatTime(current.sys.sunset)}
                </div>
            </div>
        </div>
    `;

    // Enhanced weather details with animations
    updateWeatherDetails(current);
    
    // Update forecast with enhanced animations
    updateForecast(forecast);
    
    // Update agricultural metrics with new styling
    updateAgriMetrics(current, forecast);

    // Update new features
    if (current.sys.sunrise && current.sys.sunset) {
        updateSunPosition(current.sys.sunrise, current.sys.sunset);
    }
    
    if (current.wind.deg !== undefined) {
        updateWindDirection(current.wind.deg);
    }
    
    // Note: UV Index and Air Quality would require additional API calls
    // For demonstration, using mock data
    updateUVIndex(5.2); // Mock UV Index
    updateAirQuality(75); // Mock AQI
}

// Update Forecast Section
function updateForecast(forecast) {
    const dailyForecasts = forecast.list.filter(item => 
        new Date(item.dt * 1000).getHours() === 12
    ).slice(0, 7);

    const forecastSlider = document.querySelector('.forecast-slider');
    forecastSlider.innerHTML = dailyForecasts.map((day, index) => {
        const date = new Date(day.dt * 1000);
        const dayName = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const weatherIcon = getWeatherIcon(day.weather[0].icon);
        const animationClass = day.weather[0].main.includes('Rain') ? 'fa-shake' : 'fa-beat-fade';
        
        return `
            <div class="forecast-card">
                <div class="day">${dayName}</div>
                <i class="weather-icon ${weatherIcon} ${animationClass}"></i>
                <div class="temp-range">
                    <span class="high">${Math.round(day.main.temp_max)}°</span>
                    <span class="separator">/</span>
                    <span class="low">${Math.round(day.main.temp_min)}°</span>
                </div>
                <div class="forecast-details">
                    <span class="humidity"><i class="fas fa-tint"></i> ${day.main.humidity}%</span>
                    <span class="precipitation"><i class="fas fa-cloud-rain"></i> ${Math.round(day.pop * 100)}%</span>
                </div>
            </div>
        `;
    }).join('');

    // Remove loading states after data is loaded
    removeLoadingStates();
}

// Update Agricultural Metrics
function updateAgriMetrics(current, forecast) {
    const soilTemp = calculateSoilTemperature(current.main.temp);
    const evaporation = calculateEvaporation(current.main.temp, current.main.humidity, current.wind.speed);
    
    agriMetrics.innerHTML = `
        <div class="metric-card">
            <i class="fas fa-thermometer-half"></i>
            <h3>Soil Temperature</h3>
            <p>${soilTemp.toFixed(1)}°C</p>
        </div>
        <div class="metric-card">
            <i class="fas fa-tint"></i>
            <h3>Evaporation Rate</h3>
            <p>${evaporation.toFixed(2)} mm/day</p>
        </div>
        <div class="metric-card">
            <i class="fas fa-cloud-rain"></i>
            <h3>Precipitation Chance</h3>
            <p>${(forecast.list[0].pop * 100).toFixed(0)}%</p>
        </div>
    `;
}

// Update Weather Alerts
function updateWeatherAlerts(forecast) {
    const alerts = forecast.alerts || [];
    
    alertsContainer.innerHTML = alerts.map(alert => `
        <div class="alert-item">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="alert-content">
                <h4>${alert.event}</h4>
                <p>${alert.description}</p>
            </div>
        </div>
    `).join('') || '';
}

// Helper Functions
function getWeatherIcon(code) {
    const iconMap = {
        '01d': 'fas fa-sun fa-beat-fade',
        '01n': 'fas fa-moon fa-beat-fade',
        '02d': 'fas fa-cloud-sun fa-beat-fade',
        '02n': 'fas fa-cloud-moon fa-beat-fade',
        '03d': 'fas fa-cloud fa-pulse',
        '03n': 'fas fa-cloud fa-pulse',
        '04d': 'fas fa-clouds fa-pulse',
        '04n': 'fas fa-clouds fa-pulse',
        '09d': 'fas fa-cloud-showers-heavy fa-shake',
        '09n': 'fas fa-cloud-showers-heavy fa-shake',
        '10d': 'fas fa-cloud-sun-rain fa-shake',
        '10n': 'fas fa-cloud-moon-rain fa-shake',
        '11d': 'fas fa-bolt fa-shake',
        '11n': 'fas fa-bolt fa-shake',
        '13d': 'fas fa-snowflake fa-spin',
        '13n': 'fas fa-snowflake fa-spin',
        '50d': 'fas fa-smog fa-pulse',
        '50n': 'fas fa-smog fa-pulse'
    };
    
    return iconMap[code] || 'fas fa-question';
}

function calculateSoilTemperature(airTemp) {
    // Simple soil temperature estimation
    return airTemp * 0.8 + 2;
}

function calculateEvaporation(temp, humidity, windSpeed) {
    // Simple evaporation rate calculation
    return (temp * 0.2 + windSpeed * 0.3) * (1 - humidity / 100);
}

// UI State Management
function showLoadingState() {
    document.querySelectorAll('.loading-skeleton').forEach(skeleton => {
        skeleton.style.display = 'block';
    });
}

function hideLoadingState() {
    document.querySelectorAll('.loading-skeleton').forEach(skeleton => {
        skeleton.style.display = 'none';
    });
}

function updateLastUpdated() {
    const now = new Date();
    lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
}

function showError(message) {
    hideLoadingState();
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, NOTIFICATION_DURATION);
}

function setDefaultLocation() {
    // Set default location (e.g., London)
    currentLocation.lat = 51.5074;
    currentLocation.lon = -0.1278;
    fetchWeatherData();
}

// Search Location
async function searchLocation(query) {
    try {
        // Add loading state
        locationInput.classList.add('loading');
        const locationSelector = document.querySelector('.location-selector');
        locationSelector.classList.add('loading');

        // Geocoding API call
        const response = await fetch(
            `${WEATHER_API_BASE}/weather?q=${encodeURIComponent(query)}&appid=${WEATHER_API_KEY}`
        );
        const data = await response.json();

        if (data.cod === 200) {
            currentLocation.lat = data.coord.lat;
            currentLocation.lon = data.coord.lon;
            currentLocation.name = data.name;
            fetchWeatherData();
        } else {
            showError('Location not found. Please try again.');
        }
    } catch (error) {
        console.error('Location search error:', error);
        showError('Unable to search location. Please try again.');
    } finally {
        // Remove loading state
        locationInput.classList.remove('loading');
        document.querySelector('.location-selector').classList.remove('loading');
    }
}

// Add helper functions for enhanced weather details
function getHumidityDescription(humidity) {
    if (humidity < 30) return 'Very Dry';
    if (humidity < 50) return 'Comfortable';
    if (humidity < 70) return 'Moderate';
    return 'Humid';
}

function getUVIndex(uvi) {
    if (uvi <= 2) return 'Low';
    if (uvi <= 5) return 'Moderate';
    if (uvi <= 7) return 'High';
    if (uvi <= 10) return 'Very High';
    return 'Extreme';
}

// Add notification container to handle errors and success messages
function createNotificationSystem() {
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    document.body.appendChild(notificationContainer);
    return notificationContainer;
}

// Add success notification
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, NOTIFICATION_DURATION);
}

// Add new helper function for time formatting
function formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Add smooth transitions for temperature changes
function updateTemperature(element, newTemp, oldTemp) {
    const duration = 1000;
    const frames = 60;
    const step = (newTemp - oldTemp) / frames;
    let currentFrame = 0;

    const animate = () => {
        currentFrame++;
        const currentTemp = Math.round(oldTemp + (step * currentFrame));
        element.textContent = `${currentTemp}°C`;

        if (currentFrame < frames) {
            requestAnimationFrame(animate);
        }
    };

    animate();
}

// Add interactive hover effects for forecast items
function addForecastInteractivity() {
    const forecastItems = document.querySelectorAll('.forecast-item');
    
    forecastItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'scale(1.05)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

// Update the weather icon system with more detailed icons
function getWeatherIcon(code) {
    const iconMap = {
        '01d': 'fas fa-sun fa-beat-fade',
        '01n': 'fas fa-moon fa-beat-fade',
        '02d': 'fas fa-cloud-sun fa-beat-fade',
        '02n': 'fas fa-cloud-moon fa-beat-fade',
        '03d': 'fas fa-cloud fa-pulse',
        '03n': 'fas fa-cloud fa-pulse',
        '04d': 'fas fa-clouds fa-pulse',
        '04n': 'fas fa-clouds fa-pulse',
        '09d': 'fas fa-cloud-showers-heavy fa-shake',
        '09n': 'fas fa-cloud-showers-heavy fa-shake',
        '10d': 'fas fa-cloud-sun-rain fa-shake',
        '10n': 'fas fa-cloud-moon-rain fa-shake',
        '11d': 'fas fa-bolt fa-shake',
        '11n': 'fas fa-bolt fa-shake',
        '13d': 'fas fa-snowflake fa-spin',
        '13n': 'fas fa-snowflake fa-spin',
        '50d': 'fas fa-smog fa-pulse',
        '50n': 'fas fa-smog fa-pulse'
    };
    
    return iconMap[code] || 'fas fa-question';
}

// Add mouse tracking for enhanced hover effects
document.addEventListener('mousemove', (e) => {
    document.querySelectorAll('.section-container, .weather-detail-item, .forecast-card, .metric-card').forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / card.offsetWidth) * 100;
        const y = ((e.clientY - rect.top) / card.offsetHeight) * 100;
        
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// Add loading class to elements initially
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.weather-detail-item, .forecast-card, .metric-card').forEach(element => {
        element.classList.add('loading');
    });
});

// Remove loading class when data is loaded
function removeLoadingStates() {
    document.querySelectorAll('.loading').forEach(element => {
        element.classList.remove('loading');
    });
}

// Add error message styling
const style = document.createElement('style');
style.textContent = `
    .error-message {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4757;
        color: white;
        padding: 0.8rem 1.5rem;
        border-radius: 8px;
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideIn 0.3s ease;
        z-index: 100;
    }

    .error-message.fade-out {
        opacity: 0;
        transform: translateX(-50%) translateY(-10px);
        transition: all 0.3s ease;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize Weather Map
function initializeWeatherMap() {
    map = new ol.Map({
        target: 'weather-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([84.124, 28.3949]), // Nepal center coordinates
            zoom: 7
        })
    });

    // Add weather layer
    updateWeatherLayer('temperature');

    // Setup map controls
    setupMapControls();
}

// Update Weather Layer
function updateWeatherLayer(type) {
    const mapContainer = document.querySelector('.map-container');
    mapContainer.classList.add('loading');

    // Remove current weather layer if exists
    if (currentLayer) {
        map.removeLayer(currentLayer);
    }

    // Create new weather layer
    currentLayer = new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: `https://tile.openweathermap.org/map/${weatherLayers[type]}/{z}/{x}/{y}.png?appid=${WEATHER_API_KEY}`,
            attributions: '© OpenWeatherMap'
        })
    });

    // Add new layer to map
    map.addLayer(currentLayer);

    // Update legend
    updateMapLegend(type);

    // Update timestamp
    document.querySelector('.map-overlay .timestamp').textContent = 
        new Date().toLocaleTimeString();

    mapContainer.classList.remove('loading');
}

// Setup Map Controls
function setupMapControls() {
    const buttons = document.querySelectorAll('.map-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update weather layer
            updateWeatherLayer(button.dataset.map);
        });
    });
}

// Update Map Legend
function updateMapLegend(type) {
    const legendContent = document.querySelector('.legend-content');
    const legends = {
        temperature: [
            { color: '#91003f', label: '> 30°C' },
            { color: '#ff3800', label: '20-30°C' },
            { color: '#fcd37f', label: '10-20°C' },
            { color: '#ffff00', label: '0-10°C' },
            { color: '#ffffff', label: '< 0°C' }
        ],
        precipitation: [
            { color: '#001ff9', label: 'Heavy' },
            { color: '#0096f9', label: 'Moderate' },
            { color: '#9696ff', label: 'Light' },
            { color: '#e6e6ff', label: 'Very Light' }
        ],
        clouds: [
            { color: '#464646', label: 'Overcast' },
            { color: '#787878', label: 'Mostly Cloudy' },
            { color: '#a0a0a0', label: 'Partly Cloudy' },
            { color: '#c8c8c8', label: 'Slightly Cloudy' }
        ],
        wind: [
            { color: '#ff2800', label: '> 20 m/s' },
            { color: '#ff6400', label: '10-20 m/s' },
            { color: '#ffa000', label: '5-10 m/s' },
            { color: '#ffd200', label: '< 5 m/s' }
        ]
    };

    legendContent.innerHTML = legends[type]
        .map(item => `
            <div class="legend-item">
                <div class="legend-color" style="background-color: ${item.color}"></div>
                <span>${item.label}</span>
            </div>
        `).join('');
}

// Update Sun Position
function updateSunPosition(sunrise, sunset) {
    const now = new Date().getTime() / 1000; // Current time in seconds
    const dayDuration = sunset - sunrise;
    const progress = Math.min(Math.max((now - sunrise) / dayDuration, 0), 1);
    
    const sunIndicator = document.querySelector('.sun-indicator');
    if (sunIndicator) {
        // Calculate position along the arc
        const x = 50 + Math.sin(progress * Math.PI) * 50;
        const y = 100 - Math.sin(progress * Math.PI / 2) * 100;
        
        sunIndicator.style.left = `${x}%`;
        sunIndicator.style.top = `${y}%`;
        
        // Update sunrise/sunset times
        document.querySelector('.sunrise span').textContent = formatTime(sunrise);
        document.querySelector('.sunset span').textContent = formatTime(sunset);
    }
}

// Update Wind Direction
function updateWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    const direction = directions[index];
    
    const indicator = document.querySelector('.direction-indicator i');
    const text = document.querySelector('.direction-text');
    
    if (indicator && text) {
        indicator.style.transform = `rotate(${degrees}deg)`;
        text.textContent = direction;
    }
}

// Update UV Index
function updateUVIndex(uvi) {
    const uvValue = document.querySelector('.uv-value');
    const uvFill = document.querySelector('.uv-fill');
    
    if (uvValue && uvFill) {
        uvValue.textContent = Math.round(uvi);
        
        // Calculate fill percentage (assuming max UV index of 11)
        const fillPercentage = (uvi / 11) * 100;
        uvFill.style.width = `${Math.min(fillPercentage, 100)}%`;
        
        // Update color based on UV level
        let color;
        if (uvi <= 2) color = '#2ecc71';
        else if (uvi <= 5) color = '#f1c40f';
        else if (uvi <= 7) color = '#e67e22';
        else color = '#e74c3c';
        
        uvFill.style.background = color;
    }
}

// Update Air Quality
function updateAirQuality(aqi) {
    const aqiValue = document.querySelector('.aqi-value .value');
    const aqiFill = document.querySelector('.scale-fill');
    
    if (aqiValue && aqiFill) {
        aqiValue.textContent = aqi;
        
        // Calculate fill percentage (assuming max AQI of 500)
        const fillPercentage = (aqi / 500) * 100;
        aqiFill.style.width = `${Math.min(fillPercentage, 100)}%`;
        
        // Update color based on AQI level
        let color;
        if (aqi <= 50) color = '#2ecc71';
        else if (aqi <= 100) color = '#f1c40f';
        else if (aqi <= 150) color = '#e67e22';
        else color = '#e74c3c';
        
        aqiValue.style.color = color;
        aqiFill.style.background = color;
    }
} 