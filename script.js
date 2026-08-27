// List of all available time zones
const allTimeZones = Intl.supportedValuesOf('timeZone').sort();

// Store selected time zones in localStorage
let selectedTimeZones = JSON.parse(localStorage.getItem('selectedTimeZones')) || ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderTimeZones();
    updateClocks();
    setInterval(updateClocks, 1000);
    setupSearchFilter();
    setupTimeZoneInputListener();
});

// Render all selected time zones
function renderTimeZones() {
    const listContainer = document.getElementById('timeZonesList');
    listContainer.innerHTML = '';

    if (selectedTimeZones.length === 0) {
        listContainer.innerHTML = '<div class="empty-state"><p>No time zones selected</p><p>Click "+ Add Time Zone" to get started!</p></div>';
        return;
    }

    selectedTimeZones.forEach((tz, index) => {
        const clockCard = createClockCard(tz, index);
        listContainer.appendChild(clockCard);
    });
}

// Create a clock card element
function createClockCard(timeZone, index) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.id = `clock-${index}`;

    card.innerHTML = `
        <div class="timezone-name">${timeZone}</div>
        <div class="time-display" id="time-${index}">--:--:--</div>
        <div class="date-display" id="date-${index}">--/--/----</div>
        <div class="timezone-info">
            <span class="offset" id="offset-${index}">UTC+00:00</span>
            <button class="remove-btn" onclick="removeTimeZone('${timeZone}')">Remove</button>
        </div>
    `;

    return card;
}

// Update all clocks
function updateClocks() {
    selectedTimeZones.forEach((tz, index) => {
        updateClock(tz, index);
    });
}

// Update individual clock
function updateClock(timeZone, index) {
    try {
        const now = new Date();
        const timeString = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(now);

        const dateString = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(now);

        // Get timezone offset
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timeZone,
            timeZoneName: 'shortOffset'
        });
        const parts = formatter.formatToParts(now);
        const offset = parts.find(p => p.type === 'timeZoneName')?.value || 'UTC';

        document.getElementById(`time-${index}`).textContent = timeString;
        document.getElementById(`date-${index}`).textContent = dateString;
        document.getElementById(`offset-${index}`).textContent = offset;
    } catch (error) {
        console.error(`Error updating clock for ${timeZone}:`, error);
    }
}

// Remove a time zone
function removeTimeZone(timeZone) {
    selectedTimeZones = selectedTimeZones.filter(tz => tz !== timeZone);
    localStorage.setItem('selectedTimeZones', JSON.stringify(selectedTimeZones));
    renderTimeZones();
}

// Add time zone button
function addTimeZone() {
    document.getElementById('timeZoneModal').classList.add('show');
    document.getElementById('timeZoneInput').focus();
}

// Close modal
function closeModal() {
    document.getElementById('timeZoneModal').classList.remove('show');
    document.getElementById('timeZoneInput').value = '';
    document.getElementById('suggestions').classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('timeZoneModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Setup time zone input listener for suggestions
function setupTimeZoneInputListener() {
    const input = document.getElementById('timeZoneInput');
    input.addEventListener('input', (e) => {
        const value = e.target.value.toLowerCase();
        const suggestionsContainer = document.getElementById('suggestions');

        if (value.length === 0) {
            suggestionsContainer.classList.remove('show');
            return;
        }

        const filtered = allTimeZones.filter(tz => 
            tz.toLowerCase().includes(value) && !selectedTimeZones.includes(tz)
        ).slice(0, 10);

        if (filtered.length === 0) {
            suggestionsContainer.classList.remove('show');
            return;
        }

        suggestionsContainer.innerHTML = filtered.map(tz => 
            `<div class="suggestion-item" onclick="selectTimeZone('${tz}')">${tz}</div>`
        ).join('');
        suggestionsContainer.classList.add('show');
    });
}

// Select time zone from suggestions
function selectTimeZone(timeZone) {
    document.getElementById('timeZoneInput').value = timeZone;
    document.getElementById('suggestions').classList.remove('show');
}

// Confirm adding time zone
function confirmAddTimeZone() {
    const input = document.getElementById('timeZoneInput').value.trim();

    if (!input) {
        alert('Please enter a time zone');
        return;
    }

    // Check if it's a valid time zone
    if (!allTimeZones.includes(input)) {
        alert(`"${input}" is not a valid time zone. Please select from the suggestions.`);
        return;
    }

    // Check if already added
    if (selectedTimeZones.includes(input)) {
        alert(`"${input}" is already added`);
        return;
    }

    selectedTimeZones.push(input);
    localStorage.setItem('selectedTimeZones', JSON.stringify(selectedTimeZones));
    renderTimeZones();
    updateClocks();
    closeModal();
}

// Allow Enter key to confirm
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('timeZoneModal').classList.contains('show')) {
        confirmAddTimeZone();
    }
});

// Setup search filter
function setupSearchFilter() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.clock-card');

        cards.forEach(card => {
            const tzName = card.querySelector('.timezone-name').textContent.toLowerCase();
            if (tzName.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}
