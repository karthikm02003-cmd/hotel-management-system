// --- Data Storage (using localStorage for simplicity) ---
let rooms = JSON.parse(localStorage.getItem('rooms')) || [];
let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
let guests = JSON.parse(localStorage.getItem('guests')) || [];

function saveData() {
    localStorage.setItem('rooms', JSON.stringify(rooms));
    localStorage.setItem('bookings', JSON.stringify(bookings));
    localStorage.setItem('guests', JSON.stringify(guests));
}

// --- Utility Functions ---
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function calculateNights(checkIn, checkOut) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) ? 0 : diffDays;
}

// --- Navigation & UI ---
document.addEventListener('DOMContentLoaded', init);

function init() {
    // Set up navigation
    const navItems = document.querySelectorAll('.sidebar nav ul li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Initialize content
    showSection('dashboard');
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    document.getElementById('current-section-title').textContent = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

    // Render content for the active section
    switch (sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'rooms':
            renderRooms();
            break;
        case 'bookings':
            renderBookings();
            break;
        case 'guests':
            renderGuests();
            break;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    // Clear forms when closing modal
    const form = document.getElementById(modalId).querySelector('form');
    if (form) {
        form.reset();
        form.querySelector('input[type="hidden"]').value = ''; // Clear ID
    }
}

// --- Dashboard ---
function updateDashboard() {
    document.getElementById('total-rooms').textContent = rooms.length;
    document.getElementById('available-rooms').textContent = rooms.filter(r => r.status === 'Available').length;
    document.getElementById('booked-rooms').textContent = rooms.filter(r => r.status === 'Booked').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingCheckins = bookings.filter(b => {
        const checkInDate = new Date(b.checkInDate);
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate >= today && b.status !== 'Cancelled' && b.status !== 'Checked-out';
    }).length;
    document.getElementById('upcoming-checkins').textContent = upcomingCheckins;

    renderRecentBookings();
}

function renderRecentBookings() {
    const tableBody = document.getElementById('recent-bookings-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear previous entries

    const recent = bookings
        .sort((a, b) => new Date(b.bookedDate) - new Date(a.bookedDate))
        .slice(0, 5); // Show latest 5 bookings

    if (recent.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No recent bookings.</td></tr>';
        return;
    }

    recent.forEach(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        const guest = guests.find(g => g.id === booking.guestId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${booking.id.substring(0, 6)}...</td>
            <td>${guest ? guest.name : 'N/A'}</td>
            <td>${room ? room.roomNumber : 'N/A'}</td>
            <td>${formatDate(booking.checkInDate)}</td>
            <td>${formatDate(booking.checkOutDate)}</td>
            <td><span class="status-${booking.status.toLowerCase()}">${booking.status}</span></td>
        `;
    });
}

// --- Room Management ---
function renderRooms() {
    const tableBody = document.getElementById('rooms-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Clear previous entries

    if (rooms.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No rooms added yet.</td></tr>';
        return;
    }

    rooms.forEach(room => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${room.roomNumber}</td>
            <td>${room.type}</td>
            <td>${room.capacity}</td>
            <td>$${room.price.toFixed(2)}</td>
            <td><span class="status-${room.status.toLowerCase()}">${room.status}</span></td>
            <td class="actions">
                <button onclick="editRoom('${room.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete" onclick="deleteRoom('${room.id}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
}

function openRoomModal(roomId = '') {
    const modal = document.getElementById('room-modal');
    const title = document.getElementById('room-modal-title');
    const form = document.getElementById('room-form');

    form.reset();
    document.getElementById('room-id').value = roomId;

    if (roomId) {
        title.textContent = 'Edit Room';
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            document.getElementById('room-number').value = room.roomNumber;
            document.getElementById('room-type').value = room.type;
            document.getElementById('room-capacity').value = room.capacity;
            document.getElementById('room-price').value = room.price;
            document.getElementById('room-status').value = room.status;
        }
    } else {
        title.textContent = 'Add New Room';
    }
    modal.style.display = 'flex';
}

document.getElementById('room-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const roomId = document.getElementById('room-id').value;
    const roomNumber = document.getElementById('room-number').value;
    const type = document.getElementById('room-type').value;
    const capacity = parseInt(document.getElementById('room-capacity').value);
    const price = parseFloat(document.getElementById('room-price').value);
    const status = document.getElementById('room-status').value;

    if (roomId) {
        // Edit room
        const roomIndex = rooms.findIndex(r => r.id === roomId);
        if (roomIndex > -1) {
            rooms[roomIndex] = { ...rooms[roomIndex], roomNumber, type, capacity, price, status };
        }
    } else {
        // Add new room
        if (rooms.some(r => r.roomNumber === roomNumber)) {
            alert('Room number already exists!');
            return;
        }
        const newRoom = { id: generateId(), roomNumber, type, capacity, price, status };
        rooms.push(newRoom);
    }
    saveData();
    renderRooms();
    updateDashboard();
    closeModal('room-modal');
});

function editRoom(id) {
    openRoomModal(id);
}

function deleteRoom(id) {
    if (confirm('Are you sure you want to delete this room? This will also remove associated bookings.')) {
        rooms = rooms.filter(r => r.id !== id);
        bookings = bookings.filter(b => b.roomId !== id); // Also delete bookings for this room
        saveData();
        renderRooms();
        renderBookings(); // Re-render bookings as some might have been deleted
        updateDashboard();
    }
}

// --- Guest Management ---
function renderGuests() {
    const tableBody = document.getElementById('guests-table').querySelector('tbody');
    tableBody.innerHTML = '';

    if (guests.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No guests added yet.</td></tr>';
        return;
    }

    guests.forEach(guest => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${guest.id.substring(0, 6)}...</td>
            <td>${guest.name}</td>
            <td>${guest.email}</td>
            <td>${guest.phone}</td>
            <td class="actions">
                <button onclick="editGuest('${guest.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete" onclick="deleteGuest('${guest.id}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
}

function openGuestModal(guestId = '') {
    const modal = document.getElementById('guest-modal');
    const title = document.getElementById('guest-modal-title');
    const form = document.getElementById('guest-form');

    form.reset();
    document.getElementById('guest-id').value = guestId;

    if (guestId) {
        title.textContent = 'Edit Guest';
        const guest = guests.find(g => g.id === guestId);
        if (guest) {
            document.getElementById('guest-name').value = guest.name;
            document.getElementById('guest-email').value = guest.email;
            document.getElementById('guest-phone').value = guest.phone;
        }
    } else {
        title.textContent = 'Add New Guest';
    }
    modal.style.display = 'flex';
}

document.getElementById('guest-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const guestId = document.getElementById('guest-id').value;
    const name = document.getElementById('guest-name').value;
    const email = document.getElementById('guest-email').value;
    const phone = document.getElementById('guest-phone').value;

    if (guestId) {
        // Edit guest
        const guestIndex = guests.findIndex(g => g.id === guestId);
        if (guestIndex > -1) {
            guests[guestIndex] = { ...guests[guestIndex], name, email, phone };
        }
    } else {
        // Add new guest
        const newGuest = { id: generateId(), name, email, phone };
        guests.push(newGuest);
    }
    saveData();
    renderGuests();
    closeModal('guest-modal');
});

function editGuest(id) {
    openGuestModal(id);
}

function deleteGuest(id) {
    if (confirm('Are you sure you want to delete this guest? This will also remove their bookings.')) {
        guests = guests.filter(g => g.id !== id);
        bookings = bookings.filter(b => b.guestId !== id); // Also delete bookings for this guest
        saveData();
        renderGuests();
        renderBookings(); // Re-render bookings as some might have been deleted
        updateDashboard();
    }
}

// --- Booking Management ---
function renderBookings() {
    const tableBody = document.getElementById('bookings-table').querySelector('tbody');
    tableBody.innerHTML = '';

    if (bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">No bookings added yet.</td></tr>';
        return;
    }

    bookings.forEach(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        const guest = guests.find(g => g.id === booking.guestId);
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${booking.id.substring(0, 6)}...</td>
            <td>${guest ? guest.name : 'N/A'}</td>
            <td>${room ? room.roomNumber : 'N/A'}</td>
            <td>${formatDate(booking.checkInDate)}</td>
            <td>${formatDate(booking.checkOutDate)}</td>
            <td>$${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}</td>
            <td><span class="status-${booking.status.toLowerCase()}">${booking.status}</span></td>
            <td class="actions">
                <button onclick="editBooking('${booking.id}')"><i class="fas fa-edit"></i></button>
                <button class="delete" onclick="deleteBooking('${booking.id}')"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
    });
}

function openBookingModal(bookingId = '') {
    const modal = document.getElementById('booking-modal');
    const title = document.getElementById('booking-modal-title');
    const form = document.getElementById('booking-form');

    form.reset();
    document.getElementById('booking-id').value = bookingId;

    // Populate guest dropdown
    const guestSelect = document.getElementById('booking-guest-id');
    guestSelect.innerHTML = '<option value="">Select Guest</option>';
    guests.forEach(guest => {
        const option = document.createElement('option');
        option.value = guest.id;
        option.textContent = guest.name;
        guestSelect.appendChild(option);
    });

    // Populate room dropdown (only available rooms for new bookings, all rooms for existing edit)
    const roomSelect = document.getElementById('booking-room-id');
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    
    // Filter rooms for new booking, or include current room for editing
    const availableRooms = rooms.filter(r => r.status === 'Available');

    // If editing, find the current booking and room
    let currentBookingRoomId = null;
    if (bookingId) {
        const bookingToEdit = bookings.find(b => b.id === bookingId);
        if (bookingToEdit) {
            currentBookingRoomId = bookingToEdit.roomId;
        }
    }

    rooms.forEach(room => {
        if (room.status === 'Available' || room.id === currentBookingRoomId) {
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `${room.roomNumber} (${room.type}, $${room.price.toFixed(2)}/night)`;
            roomSelect.appendChild(option);
        }
    });


    if (bookingId) {
        title.textContent = 'Edit Booking';
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            document.getElementById('booking-guest-id').value = booking.guestId;
            document.getElementById('booking-room-id').value = booking.roomId;
            document.getElementById('check-in-date').value = booking.checkInDate;
            document.getElementById('check-out-date').value = booking.checkOutDate;
            document.getElementById('booking-status').value = booking.status;
            document.getElementById('total-price').value = booking.totalPrice.toFixed(2);
        }
    } else {
        title.textContent = 'Add New Booking';
        document.getElementById('booking-status').value = 'Confirmed'; // Default status
        document.getElementById('check-in-date').min = new Date().toISOString().split('T')[0];
        document.getElementById('check-out-date').min = new Date().toISOString().split('T')[0];
    }
    modal.style.display = 'flex';

    // Add event listeners for date and room changes to update total price
    document.getElementById('check-in-date').addEventListener('change', updateTotalPrice);
    document.getElementById('check-out-date').addEventListener('change', updateTotalPrice);
    document.getElementById('booking-room-id').addEventListener('change', updateTotalPrice);
}

function updateTotalPrice() {
    const checkIn = document.getElementById('check-in-date').value;
    const checkOut = document.getElementById('check-out-date').value;
    const roomId = document.getElementById('booking-room-id').value;

    if (checkIn && checkOut && roomId) {
        const room = rooms.find(r => r.id === roomId);
        if (room) {
            const numNights = calculateNights(checkIn, checkOut);
            if (numNights > 0) {
                document.getElementById('total-price').value = (numNights * room.price).toFixed(2);
            } else {
                document.getElementById('total-price').value = '0.00';
            }
        }
    } else {
        document.getElementById('total-price').value = '0.00';
    }
}


document.getElementById('booking-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const bookingId = document.getElementById('booking-id').value;
    const guestId = document.getElementById('booking-guest-id').value;
    const roomId = document.getElementById('booking-room-id').value;
    const checkInDate = document.getElementById('check-in-date').value;
    const checkOutDate = document.getElementById('check-out-date').value;
    const status = document.getElementById('booking-status').value;
    const totalPrice = parseFloat(document.getElementById('total-price').value);

    if (!guestId || !roomId || !checkInDate || !checkOutDate) {
        alert('Please fill in all required booking fields.');
        return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
        alert('Check-out date must be after check-in date.');
        return;
    }

    const room = rooms.find(r => r.id === roomId);
    if (!room) {
        alert('Selected room not found.');
        return;
    }

    // Check for room availability (only for new bookings or if room changed in edit)
    if (!bookingId || (bookingId && bookings.find(b => b.id === bookingId).roomId !== roomId)) {
        const isRoomBooked = bookings.some(b => 
            b.roomId === roomId &&
            b.status !== 'Cancelled' &&
            b.id !== bookingId && // Exclude current booking if editing
            ((new Date(checkInDate) < new Date(b.checkOutDate)) && (new Date(checkOutDate) > new Date(b.checkInDate)))
        );
        if (isRoomBooked) {
            alert('This room is not available for the selected dates.');
            return;
        }
    }

    let originalRoomStatus;
    if (bookingId) {
        // Edit booking
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex > -1) {
            originalRoomStatus = rooms.find(r => r.id === bookings[bookingIndex].roomId).status;
            // Revert original room status if room is changed or booking status changes from 'booked'
            if (bookings[bookingIndex].roomId !== roomId || (bookings[bookingIndex].status === 'Booked' && status !== 'Booked')) {
                const prevRoom = rooms.find(r => r.id === bookings[bookingIndex].roomId);
                if (prevRoom) {
                    prevRoom.status = 'Available'; // Or determine based on other bookings
                }
            }

            bookings[bookingIndex] = {
                ...bookings[bookingIndex],
                guestId, roomId, checkInDate, checkOutDate, status, totalPrice
            };
        }
    } else {
        // Add new booking
        const newBooking = { id: generateId(), guestId, roomId, checkInDate, checkOutDate, status, totalPrice, bookedDate: new Date().toISOString().split('T')[0] };
        bookings.push(newBooking);
    }

    // Update room status based on booking status
    if (status === 'Confirmed' || status === 'Pending' || status === 'Checked-in') {
        room.status = 'Booked';
    } else if (status === 'Cancelled' || status === 'Checked-out') {
        // Check if there are other active bookings for the room
        const hasOtherActiveBookings = bookings.some(b => 
            b.roomId === roomId && 
            b.status !== 'Cancelled' && 
            b.status !== 'Checked-out' &&
            b.id !== bookingId // Exclude current booking if it's being marked cancelled/checked-out
        );
        if (!hasOtherActiveBookings) {
             room.status = 'Available';
        }
    }
    
    saveData();
    renderBookings();
    renderRooms(); // Re-render rooms to show updated status
    updateDashboard();
    closeModal('booking-modal');
});

function editBooking(id) {
    openBookingModal(id);
}

function deleteBooking(id) {
    if (confirm('Are you sure you want to delete this booking?')) {
        const bookingToDelete = bookings.find(b => b.id === id);
        if (bookingToDelete) {
            // Find the room associated with the booking
            const room = rooms.find(r => r.id === bookingToDelete.roomId);
            if (room && (bookingToDelete.status === 'Confirmed' || bookingToDelete.status === 'Pending' || bookingToDelete.status === 'Checked-in')) {
                // Check if there are other active bookings for this room
                const hasOtherActiveBookings = bookings.some(b => 
                    b.roomId === room.id && 
                    b.status !== 'Cancelled' && 
                    b.status !== 'Checked-out' &&
                    b.id !== id // Exclude the current booking being deleted
                );
                if (!hasOtherActiveBookings) {
                    room.status = 'Available';
                }
            }
        }
        bookings = bookings.filter(b => b.id !== id);
        saveData();
        renderBookings();
        renderRooms(); // Update room status potentially
        updateDashboard();
    }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    showSection('dashboard');
});