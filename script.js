const API_KEY = "1338c8b4a3f9639bbde0c8a733f73c43";

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    generateStars();
    generateRain();
    generateSnowflakes();
    startShootingStars();
    // initial sun/moon placement based on local time
    positionSun();
    updateMoonPhase();
});

// Compute an approximate moon phase (0..1)
function getMoonPhaseFraction(date = new Date()) {
    const lp = 2551443; // lunar period in seconds (29.5305882 days)
    const newMoon = new Date(Date.UTC(1970, 0, 7, 20, 35, 0));
    const diff = (date.getTime() - newMoon.getTime()) / 1000;
    const phase = (diff % lp) / lp;
    return (phase + 1) % 1; // normalize 0..1
}

function updateMoonPhase() {
    const phase = getMoonPhaseFraction(new Date());
    // map phase to -50%..+50% mask offset: 0.5 => 0% (full), 0 or 1 => +/-50% (new)
    const mask = ((phase - 0.5) * 100).toFixed(2) + '%';
    document.querySelectorAll('.moon').forEach(m => {
        m.style.setProperty('--moon-mask', mask);
        m.style.opacity = 1;
    });
}

// Position the sun according to sunrise/sunset in `data` (if provided)
function positionSun(data) {
    const nowSec = Date.now() / 1000;
    const today = new Date();
    let sunriseSec, sunsetSec;

    if (data && data.sys && data.sys.sunrise && data.sys.sunset) {
        sunriseSec = data.sys.sunrise;
        sunsetSec = data.sys.sunset;
    } else {
        // fallback: use local 6:00 and 18:00
        const s = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0, 0);
        const t = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0);
        sunriseSec = s.getTime() / 1000;
        sunsetSec = t.getTime() / 1000;
    }

    const sunEls = document.querySelectorAll('.sun, .sun-small');
    sunEls.forEach(el => {
        if (nowSec < sunriseSec || nowSec > sunsetSec) {
            el.style.opacity = 0;
            return;
        }

        const frac = (nowSec - sunriseSec) / (sunsetSec - sunriseSec); // 0..1
        // vertical position: low at sunrise (65%), highest near midday (~10%), low at sunset (65%)
        const top = 65 - Math.sin(frac * Math.PI) * 55; // produces 65 -> 10 -> 65
        const left = 15 + frac * 70; // left 15% -> right 85%

        el.style.right = 'auto';
        el.style.left = left + '%';
        el.style.top = top + '%';
        // intensity based on elevation
        const intensity = 0.25 + Math.sin(frac * Math.PI) * 0.7;
        el.style.boxShadow = `0 0 ${60 * intensity}px ${18 * intensity}px rgba(255,215,0,${0.28 * intensity}), 0 0 ${90 * intensity}px ${28 * intensity}px rgba(255,165,0,${0.12 * intensity}), inset -8px -8px 20px rgba(0,0,0,0.08)`;
        el.style.opacity = 1;

        if (frac < 0.22 || frac > 0.78) {
            el.classList.add('sun-low');
        } else {
            el.classList.remove('sun-low');
        }
    });
}

// Generate random stars
function generateStars() {
    const starsContainer = document.getElementById('starsContainer');
    if (!starsContainer) return;
    starsContainer.innerHTML = '';
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        starsContainer.appendChild(star);
    }
}

// Generate shooting stars
function generateShootingStar() {
    const container = document.getElementById('shootingStarsContainer');
    if (!container) return;
    
    const star = document.createElement('div');
    star.className = 'shooting-star';
    
    // Random starting position along the top and left edges
    const startX = Math.random() * 100;
    const startY = Math.random() * 50;
    const duration = 1.5 + Math.random() * 1;
    
    star.style.left = startX + '%';
    star.style.top = startY + '%';
    star.style.animationDuration = duration + 's';
    
    container.appendChild(star);
    
    // Remove star after animation completes
    setTimeout(() => {
        star.remove();
    }, duration * 1000);
}

// Start continuous shooting stars
function startShootingStars() {
    // Generate shooting stars at random intervals
    setInterval(() => {
        if (document.getElementById('nightBg').style.display !== 'none') {
            generateShootingStar();
        }
    }, 2000 + Math.random() * 2000);
}

// Generate rain drops
function generateRain() {
    const rainContainer = document.getElementById('rainContainer');
    if (!rainContainer) return;
    rainContainer.innerHTML = '';
    const rainCount = 100;
    
    for (let i = 0; i < rainCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.top = Math.random() * -50 + '%';
        drop.style.animationDuration = (0.5 + Math.random() * 0.5) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        rainContainer.appendChild(drop);
    }
}

// Generate snowflakes
function generateSnowflakes() {
    const snowContainer = document.getElementById('snowContainer');
    if (!snowContainer) return;
    snowContainer.innerHTML = '';
    const snowCount = 50;
    const snowSymbols = ['❄', '❅', '❆'];
    
    for (let i = 0; i < snowCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowSymbols[Math.floor(Math.random() * snowSymbols.length)];
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.top = Math.random() * -100 + '%';
        snowflake.style.animationDuration = (5 + Math.random() * 5) + 's';
        snowflake.style.animationDelay = Math.random() * 3 + 's';
        snowContainer.appendChild(snowflake);
    }
}

// Get weather icon based on conditions
function getWeatherIcon(weatherMain) {
    const iconMap = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Drizzle': 'fas fa-cloud-rain',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Mist': 'fas fa-smog',
        'Smoke': 'fas fa-smog',
        'Haze': 'fas fa-smog',
        'Dust': 'fas fa-wind',
        'Fog': 'fas fa-smog',
        'Sand': 'fas fa-wind',
        'Ash': 'fas fa-wind',
        'Squall': 'fas fa-wind',
        'Tornado': 'fas fa-tornado'
    };
    return iconMap[weatherMain] || 'fas fa-cloud';
}

// Get gradient color based on temperature
function getTempColor(temp) {
    if (temp < 0) {
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    } else if (temp < 10) {
        return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    } else if (temp < 20) {
        return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
    } else if (temp < 30) {
        return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    } else {
        return 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)';
    }
}

// Check if it's night time
function isNightTime(data) {
    const currentTime = new Date().getTime() / 1000;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;
    
    return currentTime < sunrise || currentTime > sunset;
}

// Show appropriate background
function showWeatherBackground(data) {
    document.getElementById('sunnyBg').style.display = 'none';
    document.getElementById('nightBg').style.display = 'none';
    document.getElementById('rainyBg').style.display = 'none';
    document.getElementById('cloudyBg').style.display = 'none';
    document.getElementById('snowyBg').style.display = 'none';

    const weatherMain = data.weather[0].main.toLowerCase();
    const isNight = isNightTime(data);

    if (weatherMain.includes('thunderstorm')) {
        document.getElementById('rainyBg').style.display = 'block';
        generateLightning();
    } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
        document.getElementById('rainyBg').style.display = 'block';
    } else if (weatherMain.includes('snow')) {
        document.getElementById('snowyBg').style.display = 'block';
    } else if (weatherMain.includes('cloud')) {
        if (isNight) {
            document.getElementById('nightBg').style.display = 'block';
        } else {
            document.getElementById('cloudyBg').style.display = 'block';
        }
    } else if (weatherMain.includes('clear') || weatherMain.includes('sunny')) {
        if (isNight) {
            document.getElementById('nightBg').style.display = 'block';
        } else {
            document.getElementById('sunnyBg').style.display = 'block';
        }
    } else if (weatherMain.includes('mist') || weatherMain.includes('fog') || weatherMain.includes('haze')) {
        if (isNight) {
            document.getElementById('nightBg').style.display = 'block';
        } else {
            document.getElementById('cloudyBg').style.display = 'block';
        }
    } else {
        if (isNight) {
            document.getElementById('nightBg').style.display = 'block';
        } else {
            document.getElementById('cloudyBg').style.display = 'block';
        }
    }
    // update sun and moon placement based on actual times
    try {
        positionSun(data);
        updateMoonPhase();
    } catch (e) {
        console.warn('Sun/Moon update error', e);
    }
}

// Generate lightning
function generateLightning() {
    const lightningContainer = document.getElementById('lightning');
    if (!lightningContainer) return;
    
    if (Math.random() > 0.7) {
        const bolt = document.createElement('div');
        bolt.className = 'lightning-bolt';
        bolt.style.left = Math.random() * 100 + '%';
        bolt.style.top = 0;
        lightningContainer.appendChild(bolt);
        
        setTimeout(() => {
            bolt.remove();
        }, 300);
    }
}

// Continuous lightning
function startLightningLoop() {
    setInterval(() => {
        if (document.getElementById('rainyBg').style.display !== 'none') {
            generateLightning();
        }
    }, 3000);
}

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();

    if (city === "") {
        showError("Please enter a city name");
        return;
    }

    try {
        // Fetch weather data
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please try another search.");
            } else {
                throw new Error("Unable to fetch weather data. Please try again.");
            }
        }

        const data = await response.json();
        showWeatherBackground(data);
        displayWeather(data);
        document.getElementById("cityInput").value = "";
        
        if (data.weather[0].main.toLowerCase().includes('thunderstorm')) {
            startLightningLoop();
        }

    } catch (error) {
        showError(error.message);
        console.error(error);
    }
}

function displayWeather(data) {
    const weatherIcon = getWeatherIcon(data.weather[0].main);
    const tempColor = getTempColor(data.main.temp);

    const weatherHTML = `
        <div class="weather-card" style="background: ${tempColor}">
            <div class="city-name">${data.name}, ${data.sys.country}</div>
            <div class="weather-main">${data.weather[0].main}</div>
            <div class="weather-icon">
                <i class="${weatherIcon}"></i>
            </div>
            <div class="temp-display">${Math.round(data.main.temp)}°C</div>
        </div>
    `;

    document.getElementById("weatherResult").innerHTML = weatherHTML;

    // Update additional info section with all details
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("windSpeed").textContent = `${Math.round(data.wind.speed)} m/s`;
    document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
    document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById("feelsLike").textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById("uvIndex").textContent = "N/A";
}

function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    document.getElementById("weatherResult").innerHTML = errorHTML;
    document.getElementById("infoSection").style.display = "none";
}

// Handle Enter key press
function handleKeyPress(event) {
    if (event.key === "Enter") {
        getWeather();
    }
}
