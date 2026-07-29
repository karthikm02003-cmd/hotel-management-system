document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const checkInDateInput = document.getElementById('check-in-date');
    const checkOutDateInput = document.getElementById('check-out-date');
    const dateErrorMessage = document.getElementById('date-error');
    const roomCardsContainer = document.getElementById('room-cards-container');
    const noRoomsMessage = document.getElementById('no-rooms-message');

    const bookingModal = document.getElementById('booking-modal');
    const bookingModalCloseButton = bookingModal.querySelector('.close-button');
    const modalRoomTitle = document.getElementById('modal-room-title');
    const bookingForm = document.getElementById('booking-form');
    const guestNameInput = document.getElementById('guest-name');
    const guestEmailInput = document.getElementById('guest-email');
    const guestPhoneInput = document.getElementById('guest-phone');
    const summaryRoomType = document.getElementById('summary-room-type');
    const summaryRoomPrice = document.getElementById('summary-room-price');
    const summaryCheckIn = document.getElementById('summary-check-in');
    const summaryCheckOut = document.getElementById('summary-check-out');
    const summaryTotalNights = document.getElementById('summary-total-nights');
    const summaryTotalPrice = document.getElementById('summary-total-price');

    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationModalCloseButton = confirmationModal.querySelector('.close-button');
    const closeConfirmationBtn = confirmationModal.querySelector('.close-confirmation-btn');
    const confGuestName = document.getElementById('conf-guest-name');
    const confRoomNumber = document.getElementById('conf-room-number');
    const confCheckIn = document.getElementById('conf-check-in');
    const confCheckOut = document.getElementById('conf-check-out');

    // --- State Variables ---
    let rooms = [
        {
            id: 'R001',
            type: 'Standard King',
            description: 'Comfortable room with a king-size bed and city view.',
            price: 120,
            capacity: 2,
            amenities: ['Free WiFi', 'Flat-screen TV', 'Mini-bar'],
            bookings: [
                { guestName: 'John Doe', checkIn: '2023-11-10', checkOut: '2023-11-12' },
                { guestName: 'Jane Smith', checkIn: '2023-12-01', checkOut: '2023-12-03' }
            ]
        },
        {
            id: 'R002',
            type: 'Standard King',
            description: 'Comfortable room with a king-size bed and city view.',
            price: 120,
            capacity: 2,
            amenities: ['Free WiFi', 'Flat-screen TV', 'Mini-bar'],
            bookings: []
        },
        {
            id: 'R003',
            type: 'Deluxe Twin',
            description: 'Spacious room with two twin beds and garden view.',
            price: 150,
            capacity: 2,
            amenities: ['Free WiFi', 'Flat-screen TV', 'Coffee Maker'],
            bookings: [
                { guestName: 'Alice Johnson', checkIn: '2023-11-15', checkOut: '2023-11-18' }
            ]
        },
        {
            id: 'R004',
            type: 'Deluxe Twin',
            description: 'Spacious room with two twin beds and garden view.',
            price: 150,
            capacity: 2,
            amenities: ['Free WiFi', 'Flat-screen TV', 'Coffee Maker'],
            bookings: []
        },
        {
            id: 'R005',
            type: 'Executive Suite',
            description: 'Luxurious suite with separate living area and ocean view.',
            price: 250,
            capacity: 3,
            amenities: ['Free WiFi', 'Large TV', 'Jacuzzi', 'Breakfast included'],
            bookings: [
                { guestName: 'Bob Williams', checkIn: '2023-11-20', checkOut: '2023-11-25' }
            ]
        },
        {
            id: 'R006',
            type: 'Executive Suite',
            description: 'Luxurious suite with separate living area and ocean view.',
            price: 250,
            capacity: 3,
            amenities: ['Free WiFi', 'Large TV', 'Jacuzzi', 'Breakfast included'],
            bookings: []
        }
    ];

    let selectedCheckInDate = null;
    let selectedCheckOutDate = null;
    let selectedRoom = null; // Stores the room object for the current booking attempt

    // --- Helper Functions ---

    /**
     * Formats a date string (YYYY-MM-DD) into a more readable format (Month Day, Year).
     * @param {string} dateString
     * @returns {string}
     */
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00'); // Add T00:00:00 to avoid timezone issues
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Checks if a specific room is available for the given check-in and check-out dates.
     * @param {object} room - The room object.
     * @param {string} checkIn - The desired check-in date (YYYY-MM-DD).
     * @param {string} checkOut - The desired check-out date (YYYY-MM-DD).
     * @returns {boolean} - True if the room is available, false otherwise.
     */
    const isRoomAvailable = (room, checkIn, checkOut) => {
        const newCheckIn = new Date(checkIn + 'T00:00:00');
        const newCheckOut = new Date(checkOut + 'T00:00:00');

        for (const booking of room.bookings) {
            const existingCheckIn = new Date(booking.checkIn + 'T00:00:00');
            const existingCheckOut = new Date(booking.checkOut + 'T00:00:00');

            // Check for overlap:
            // (StartA < EndB) && (EndA > StartB)
            if (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn) {
                return false; // Overlap found, room is not available
            }
        }
        return true; // No overlaps, room is available
    };

    /**
     * Calculates the number of nights between two date strings.
     * @param {string} checkIn - Check-in date (YYYY-MM-DD).
     * @param {string} checkOut - Check-out date (YYYY-MM-DD).
     * @returns {number} - Number of nights.
     */
    const calculateNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const startDate = new Date(checkIn + 'T00:00:00');
        const endDate = new Date(checkOut + 'T00:00:00');
        const timeDiff = endDate.getTime() - startDate.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    /**
     * Opens the booking modal and populates it with room data.
     * @param {object} roomData - The room object to book.
     */
    const openBookingModal = (roomData) => {
        selectedRoom = roomData;
        modalRoomTitle.textContent = `Book ${roomData.type} - Room ${roomData.id}`;
        summaryRoomType.textContent = roomData.type;
        summaryRoomPrice.textContent = roomData.price.toFixed(2);
        summaryCheckIn.textContent = formatDateForDisplay(selectedCheckInDate);
        summaryCheckOut.textContent = formatDateForDisplay(selectedCheckOutDate);

        const nights = calculateNights(selectedCheckInDate, selectedCheckOutDate);
        const totalPrice = nights * roomData.price;
        summaryTotalNights.textContent = nights;
        summaryTotalPrice.textContent = totalPrice.toFixed(2);

        // Clear previous form data
        bookingForm.reset();

        bookingModal.classList.add('active');
    };

    /**
     * Closes the booking modal.
     */
    const closeBookingModal = () => {
        bookingModal.classList.remove('active');
        selectedRoom = null;
    };

    /**
     * Opens the booking confirmation modal.
     * @param {object} bookingDetails - Details of the confirmed booking.
     */
    const openConfirmationModal = (bookingDetails) => {
        confGuestName.textContent = bookingDetails.guestName;
        confRoomNumber.textContent = bookingDetails.roomId;
        confCheckIn.textContent = formatDateForDisplay(bookingDetails.checkIn);
        confCheckOut.textContent = formatDateForDisplay(bookingDetails.checkOut);
        confirmationModal.classList.add('active');
    };

    /**
     * Closes the confirmation modal.
     */
    const closeConfirmationModal = () => {
        confirmationModal.classList.remove('active');
    };

    // --- Core UI Rendering ---

    /**
     * Renders all room cards based on the current date selections.
     */
    const renderRooms = () => {
        roomCardsContainer.innerHTML = ''; // Clear previous room cards
        let availableRoomsCount = 0;

        rooms.forEach(room => {
            const isAvailable = selectedCheckInDate && selectedCheckOutDate
                ? isRoomAvailable(room, selectedCheckInDate, selectedCheckOutDate)
                : true; // If no dates selected, assume available for display

            const roomCard = document.createElement('div');
            roomCard.className = `room-card ${isAvailable ? '' : 'booked'}`;
            roomCard.dataset.roomId = room.id;

            roomCard.innerHTML = `
                <div class="room-card-header">
                    <h3>${room.type} - Room ${room.id}</h3>
                    <span class="price">$${room.price}/night</span>
                </div>
                <div class="room-card-body">
                    <p>${room.description}</p>
                    <p><strong>Capacity:</strong> ${room.capacity} people</p>
                    <p><strong>Amenities:</strong> ${room.amenities.join(', ')}</p>
                </div>
                <div class="room-card-footer">
                    <span class="status ${isAvailable ? 'available' : 'booked'}">
                        ${isAvailable ? 'Available' : 'Booked'}
                    </span>
                </div>
            `;

            if (isAvailable && selectedCheckInDate && selectedCheckOutDate) {
                roomCard.addEventListener('click', () => openBookingModal(room));
                availableRoomsCount++;
            } else if (!isAvailable || !selectedCheckInDate || !selectedCheckOutDate) {
                // If dates are not selected or room is booked, prevent click
                roomCard.classList.add('disabled');
            }

            roomCardsContainer.appendChild(roomCard);
        });

        // Show/hide no rooms message
        if (selectedCheckInDate && selectedCheckOutDate && availableRoomsCount === 0) {
            noRoomsMessage.classList.remove('hidden');
        } else {
            noRoomsMessage.classList.add('hidden');
        }
    };

    // --- Event Handlers ---

    /**
     * Handles changes to the check-in and check-out date inputs.
     */
    const handleDateChange = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day

        const checkInVal = checkInDateInput.value;
        const checkOutVal = checkOutDateInput.value;

        if (checkInVal) {
            const checkIn = new Date(checkInVal + 'T00:00:00');
            if (checkIn < today) {
                dateErrorMessage.textContent = 'Check-in date cannot be in the past.';
                selectedCheckInDate = null;
                renderRooms();
                return;
            }
        }

        if (checkInVal && checkOutVal) {
            const checkIn = new Date(checkInVal + 'T00:00:00');
            const checkOut = new Date(checkOutVal + 'T00:00:00');

            if (checkOut <= checkIn) {
                dateErrorMessage.textContent = 'Check-out date must be after check-in date.';
                selectedCheckInDate = null;
                selectedCheckOutDate = null;
                renderRooms();
                return;
            }
            dateErrorMessage.textContent = '';
            selectedCheckInDate = checkInVal;
            selectedCheckOutDate = checkOutVal;
        } else {
            dateErrorMessage.textContent = '';
            selectedCheckInDate = null;
            selectedCheckOutDate = null;
        }
        renderRooms();
    };

    /**
     * Handles the booking form submission.
     * @param {Event} event - The form submission event.
     */
    const handleBookingSubmit = (event) => {
        event.preventDefault();

        if (!selectedRoom || !selectedCheckInDate || !selectedCheckOutDate) {
            alert('Please select a room and valid dates first.');
            return;
        }

        const guestName = guestNameInput.value.trim();
        const guestEmail = guestEmailInput.value.trim();
        const guestPhone = guestPhoneInput.value.trim();

        if (!guestName || !guestEmail || !guestPhone) {
            alert('Please fill in all guest details.');
            return;
        }

        const newBooking = {
            guestName,
            guestEmail,
            guestPhone,
            checkIn: selectedCheckInDate,
            checkOut: selectedCheckOutDate
        };

        // Add booking to the selected room's bookings array
        selectedRoom.bookings.push(newBooking);

        // Update the rooms array (this simulates a backend update)
        rooms = rooms.map(room => (room.id === selectedRoom.id ? selectedRoom : room));

        // Close modal and re-render rooms to show updated availability
        closeBookingModal();
        renderRooms();

        // Show confirmation
        openConfirmationModal({
            guestName: guestName,
            roomId: selectedRoom.id,
            checkIn: selectedCheckInDate,
            checkOut: selectedCheckOutDate
        });

        console.log('Booking Confirmed:', newBooking, 'for Room:', selectedRoom.id);
    };

    // --- Initialization ---

    /**
     * Sets up initial UI state and event listeners.
     */
    const initializeApp = () => {
        // Set min date for check-in to today
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        checkInDateInput.setAttribute('min', todayString);
        checkOutDateInput.setAttribute('min', todayString);

        // Event Listeners for date inputs
        checkInDateInput.addEventListener('change', handleDateChange);
        checkOutDateInput.addEventListener('change', handleDateChange);

        // Event Listener for booking form submission
        bookingForm.addEventListener('submit', handleBookingSubmit);

        // Event Listeners for modal close buttons
        bookingModalCloseButton.addEventListener('click', closeBookingModal);
        confirmationModalCloseButton.addEventListener('click', closeConfirmationModal);
        closeConfirmationBtn.addEventListener('click', closeConfirmationModal);

        // Close modal if clicking outside content
        window.addEventListener('click', (event) => {
            if (event.target === bookingModal) {
                closeBookingModal();
            }
            if (event.target === confirmationModal) {
                closeConfirmationModal();
            }
        });

        // Initial render of rooms
        renderRooms();
    };

    initializeApp();
});