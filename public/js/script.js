const socket = io();

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Log the exact location
        socket.emit('send-location', {
            latitude,
            longitude,
            device: navigator.userAgent
        });
    },
        (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                console.log("User denied the request for Geolocation.");
            } else {
                console.log(error);
            }
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000
        }
    );
} else {
    console.log("Geolocation is not supported by this browser.");
}

const map = L.map('map').setView([0, 0], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Tracking'
}).addTo(map);

const markers = {};

socket.on('receive-location', (data) => {
    const { id, latitude, longitude, device } = data; // Added 'device' field to show device info
    map.setView([latitude, longitude], 16);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map)
            .bindPopup(`Device: ${device}`).openPopup(); // Show device info in popup
    }
    map.setView([latitude, longitude], 16);
});

socket.on('user-disconneted', (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
})