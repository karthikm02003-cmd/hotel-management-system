document.addEventListener('DOMContentLoaded', () => {
    // Initial dummy data for rooms
    let rooms = [
        { id: '101', type: 'Standard', price: 100.00, status: 'Available' },
        { id: '102', type: 'Deluxe', price: 150.00, status: 'Occupied' },
        { id: '103', type: 'Suite', price: 250.00, status: 'Needs Cleaning' },
        { id: '104', type: 'Standard', price: 100.00, status: 'Available' },
        { id: '105', type: 'Deluxe', price: 150.00, status: 'Available' },
        { id: '201', type: 'Standard', price: 110.00, status: 'Occupied' },
        { id: '202', type: 'Deluxe', price: 160.00, status: 'Available' },
    ];

    const roomListDiv = document.getElementById('roomList');
    const addRoomForm = document.getElementById('addRoomForm');
    const filterStatusSelect = document.getElementById('filterStatus');

    /**
     * Renders the list of rooms based on the provided array.
     * @param {Array<Object>} [filteredRooms=rooms] - The array of rooms to render. Defaults to the global 'rooms' array.
     */
    function renderRooms(filteredRooms = rooms) {
        roomListDiv.innerHTML = ''; // Clear existing rooms

        if (filteredRooms.length === 0) {
            roomListDiv.innerHTML = '<p class="no-rooms-message">No rooms found matching the criteria.</p>';
            return;
        }

        filteredRooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.classList.add('room-card');
            roomCard.dataset.roomId = room.id; // Store room ID for easy access

            // Generate unique class name for status (e.g., "status-NeedsCleaning")
            const statusClassName = `status-${room.status.replace(/\s+/g, '')}`;

            roomCard.innerHTML = `
                <div class="room-details">
                    <h3>Room ${room.id} (${room.type})</h3>
                    <p>Price: $${room.price.toFixed(2)}/night</p>
                    <p>Status: <span class="status ${statusClassName}">${room.status}</span></p>
                </div>
                <div class="room-actions">
                    ${room.status === 'Available' ?
                        `<button class="btn btn-primary check-in-btn">Check-in</button>` : ''
                    }
                    ${room.status === 'Occupied' ?
                        `<button class="btn btn-success check-out-btn">Check-out</button>` : ''
                    }
                    ${room.status === 'Needs Cleaning' ?
                        `<button class="btn btn-warning mark-cleaned-btn">Mark Cleaned</button>` : ''
                    }
                    ${room.status === 'Available' || room.status === 'Occupied' ?
                        `<button class="btn btn-danger needs-cleaning-btn">Needs Cleaning</button>` : ''
                    }
                </div>
            `;
            roomListDiv.appendChild(roomCard);
        });
    }

    /**
     * Handles the submission of the add room form.
     * @param {Event} event - The form submission event.
     */
    function addRoom(event) {
        event.preventDefault(); // Prevent form submission and page reload

        const roomNumber = document.getElementById('roomNumber').value.trim();
        const roomType = document.getElementById('roomType').value;
        const roomPrice = parseFloat(document.getElementById('roomPrice').value);

        // Basic validation
        if (!roomNumber) {
            alert('Please enter a room number.');
            return;
        }
        if (isNaN(roomPrice) || roomPrice <= 0) {
            alert('Please enter a valid positive price for the room.');
            return;
        }

        // Check if room number already exists
        if (rooms.some(room => room.id === roomNumber)) {
            alert(`Room number ${roomNumber} already exists.`);
            return;
        }

        const newRoom = {
            id: roomNumber,
            type: roomType,
            price: roomPrice,
            status: 'Available' // New rooms are always available
        };

        rooms.push(newRoom);
        applyFilter(); // Re-render the room list, applying current filter
        addRoomForm.reset(); // Clear the form
    }

    /**
     * Updates the status of a specific room.
     * @param {string} roomId - The ID of the room to update.
     * @param {string} newStatus - The new status for the room.
     */
    function updateRoomStatus(roomId, newStatus) {
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        if (roomIndex > -1) {
            rooms[roomIndex].status = newStatus;
            applyFilter(); // Re-render to show updated status, applying current filter
        }
    }

    /**
     * Handles click events on room action buttons (e.g., Check-in, Check-out).
     * Uses event delegation to efficiently handle clicks on dynamically added buttons.
     * @param {Event} event - The click event.
     */
    function handleRoomAction(event) {
        const target = event.target;
        const roomCard = target.closest('.room-card');

        if (!roomCard) return; // Not a click on a room card or its child

        const roomId = roomCard.dataset.roomId;

        if (target.classList.contains('check-in-btn')) {
            updateRoomStatus(roomId, 'Occupied');
        } else if (target.classList.contains('check-out-btn')) {
            updateRoomStatus(roomId, 'Needs Cleaning'); // After check-out, it needs cleaning
        } else if (target.classList.contains('mark-cleaned-btn')) {
            updateRoomStatus(roomId, 'Available');
        } else if (target.classList.contains('needs-cleaning-btn')) {
            updateRoomStatus(roomId, 'Needs Cleaning');
        }
    }

    /**
     * Applies the selected filter to the room list and re-renders.
     */
    function applyFilter() {
        const selectedStatus = filterStatusSelect.value;
        let filteredRooms = rooms;

        if (selectedStatus !== 'All') {
            filteredRooms = rooms.filter(room => room.status === selectedStatus);
        }
        renderRooms(filteredRooms);
    }

    // --- Event Listeners ---
    addRoomForm.addEventListener('submit', addRoom);
    roomListDiv.addEventListener('click', handleRoomAction); // Event delegation for room actions
    filterStatusSelect.addEventListener('change', applyFilter);

    // Initial render when the page loads
    applyFilter(); // Call applyFilter to initially render rooms with 'All' selected
});