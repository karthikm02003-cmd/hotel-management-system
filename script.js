document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('content-area');
    const navLinks = document.querySelectorAll('nav ul li a');

    // --- Dummy Data Generation ---
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getRandomDate(start, end) {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    }

    const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
    const statuses = ['Confirmed', 'Checked-in', 'Checked-out', 'Cancelled'];

    const dummyGuests = Array.from({ length: 20 }).map((_, i) => {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
        const phone = `+1-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`;
        const city = cities[Math.floor(Math.random() * cities.length)];

        return {
            id: generateUUID(),
            name: `${firstName} ${lastName}`,
            email: email,
            phone: phone,
            address: `${Math.floor(Math.random() * 900) + 100} Main St, ${city}, USA`
        };
    });

    const dummyBookings = Array.from({ length: 30 }).map((_, i) => {
        const guest = dummyGuests[Math.floor(Math.random() * dummyGuests.length)];
        const roomNumber = Math.floor(100 + Math.random() * 400); // Rooms 100-499
        const checkIn = getRandomDate(new Date(2023, 0, 1), new Date(2024, 11, 31));
        const checkOut = new Date(checkIn.getTime());
        checkOut.setDate(checkIn.getDate() + Math.floor(1 + Math.random() * 7)); // 1 to 7 nights
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const pricePerNight = Math.floor(100 + Math.random() * 200);
        const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalPrice = pricePerNight * nights;

        return {
            id: generateUUID(),
            guestName: guest.name,
            roomNumber: roomNumber,
            checkIn: checkIn.toISOString().split('T')[0], // YYYY-MM-DD
            checkOut: checkOut.toISOString().split('T')[0], // YYYY-MM-DD
            status: status,
            totalPrice: totalPrice.toFixed(2),
            guestId: guest.id // Link to guest data
        };
    });

    // --- Generic Table Creator ---
    function createInteractiveTable(headers, data, options = {}) {
        const {
            addActions = true, // Add Edit/Delete buttons
            searchable = true, // Add search input
            idPrefix = ''
        } = options;

        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        // Search functionality
        if (searchable) {
            const searchDiv = document.createElement('div');
            searchDiv.className = 'search-input-container';
            const searchLabel = document.createElement('label');
            searchLabel.textContent = 'Search:';
            searchLabel.htmlFor = `${idPrefix}-search-input`;
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.id = `${idPrefix}-search-input`;
            searchInput.placeholder = `Search ${idPrefix}...`;

            searchDiv.appendChild(searchLabel);
            searchDiv.appendChild(searchInput);
            tableContainer.appendChild(searchDiv);

            searchInput.addEventListener('keyup', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const rows = tableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const rowText = row.textContent.toLowerCase();
                    row.style.display = rowText.includes(searchTerm) ? '' : 'none';
                });
            });
        }

        const table = document.createElement('table');
        const tableHead = document.createElement('thead');
        const tableBody = document.createElement('tbody');
        const headerRow = document.createElement('tr');

        // Create table headers
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            th.setAttribute('data-column', headerText.toLowerCase().replace(/\s/g, '')); // For sorting
            headerRow.appendChild(th);
        });

        if (addActions) {
            const th = document.createElement('th');
            th.textContent = 'Actions';
            headerRow.appendChild(th);
        }
        tableHead.appendChild(headerRow);
        table.appendChild(tableHead);

        // Populate table body
        function populateTableBody(dataToRender) {
            tableBody.innerHTML = ''; // Clear existing rows
            dataToRender.forEach(item => {
                const tr = document.createElement('tr');
                headers.forEach(headerText => {
                    const td = document.createElement('td');
                    const key = headerText.toLowerCase().replace(/\s/g, '');
                    let value = item[key];

                    // Special formatting for dates or currency
                    if (key.includes('date') || key.includes('in') || key.includes('out')) {
                        value = value ? new Date(value).toLocaleDateString() : '';
                    } else if (key.includes('price')) {
                        value = `$${parseFloat(value).toFixed(2)}`;
                    }
                    td.textContent = value;
                    tr.appendChild(td);
                });

                if (addActions) {
                    const td = document.createElement('td');
                    td.className = 'action-buttons';

                    const editButton = document.createElement('button');
                    editButton.innerHTML = '<i class="fas fa-edit"></i>';
                    editButton.title = 'Edit';
                    editButton.addEventListener('click', () => alert(`Edit item with ID: ${item.id}`));

                    const deleteButton = document.createElement('button');
                    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
                    deleteButton.title = 'Delete';
                    deleteButton.className = 'delete';
                    deleteButton.addEventListener('click', () => {
                        if (confirm(`Are you sure you want to delete ${item.name || item.guestName}?`)) {
                            alert(`Simulating deletion of item with ID: ${item.id}`);
                            // In a real app, you'd send a request to the backend and re-render the table
                        }
                    });

                    td.appendChild(editButton);
                    td.appendChild(deleteButton);
                    tr.appendChild(td);
                }
                tableBody.appendChild(tr);
            });
        }

        populateTableBody(data);
        table.appendChild(tableBody);
        tableContainer.appendChild(table);

        return tableContainer;
    }


    // --- View Rendering Functions ---
    function renderBookings() {
        contentArea.innerHTML = '<h2>Current Bookings</h2>';
        const headers = ['ID', 'Guest Name', 'Room Number', 'Check In', 'Check Out', 'Status', 'Total Price'];
        const table = createInteractiveTable(headers, dummyBookings, { idPrefix: 'bookings' });
        contentArea.appendChild(table);
    }

    function renderGuests() {
        contentArea.innerHTML = '<h2>Hotel Guests</h2>';
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Address'];
        const table = createInteractiveTable(headers, dummyGuests, { idPrefix: 'guests' });
        contentArea.appendChild(table);
    }

    function renderReports() {
        contentArea.innerHTML = '<h2>Management Reports & Dashboard</h2>';

        // Calculate metrics
        const totalBookings = dummyBookings.length;
        const totalGuests = dummyGuests.length;
        const confirmedBookings = dummyBookings.filter(b => b.status === 'Confirmed').length;
        const checkedInBookings = dummyBookings.filter(b => b.status === 'Checked-in').length;
        const checkedOutBookings = dummyBookings.filter(b => b.status === 'Checked-out').length;
        const cancelledBookings = dummyBookings.filter(b => b.status === 'Cancelled').length;

        const totalRevenue = dummyBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

        const today = new Date();
        const activeBookings = dummyBookings.filter(b => {
            const checkInDate = new Date(b.checkIn);
            const checkOutDate = new Date(b.checkOut);
            return today >= checkInDate && today < checkOutDate && b.status === 'Checked-in';
        });

        // Simplified occupancy: Assuming 500 rooms total for this dummy data.
        const totalRooms = 500;
        const occupancyRate = totalRooms > 0 ? (activeBookings.length / totalRooms) * 100 : 0;

        const upcomingBookings = dummyBookings.filter(b => {
            const checkInDate = new Date(b.checkIn);
            // Consider "upcoming" as bookings starting from tomorrow onwards.
            return checkInDate > today && b.status === 'Confirmed';
        }).length;


        const dashboardGrid = document.createElement('div');
        dashboardGrid.className = 'dashboard-grid';

        const createCard = (title, value, description, className = '', progressBarValue = null) => {
            const card = document.createElement('div');
            card.className = `dashboard-card ${className}`;
            card.innerHTML = `
                <h3>${title}</h3>
                <p class="value">${value}</p>
                <p>${description}</p>
            `;
            if (progressBarValue !== null) {
                const progressBarContainer = document.createElement('div');
                progressBarContainer.className = 'progress-bar-container';
                const progressBar = document.createElement('div');
                progressBar.className = 'progress-bar';
                progressBar.style.width = `${progressBarValue}%`;
                progressBar.setAttribute('aria-valuenow', progressBarValue);
                progressBar.setAttribute('aria-valuemin', '0');
                progressBar.setAttribute('aria-valuemax', '100');
                progressBarContainer.appendChild(progressBar);
                card.appendChild(progressBarContainer);
            }
            return card;
        };

        dashboardGrid.appendChild(createCard('Total Bookings', totalBookings, 'All bookings ever recorded.'));
        dashboardGrid.appendChild(createCard('Total Guests', totalGuests, 'Unique guests in the system.'));
        dashboardGrid.appendChild(createCard('Active Check-ins', checkedInBookings, 'Guests currently staying in the hotel.'));
        dashboardGrid.appendChild(createCard('Upcoming Bookings', upcomingBookings, 'Confirmed bookings for future dates.', 'upcoming'));
        dashboardGrid.appendChild(createCard('Total Revenue', `$${totalRevenue.toFixed(2)}`, 'Total revenue generated from all bookings.', 'revenue'));
        dashboardGrid.appendChild(createCard('Occupancy Rate', `${occupancyRate.toFixed(1)}%`, 'Current occupancy based on active check-ins and total rooms.', 'occupancy', occupancyRate));


        contentArea.appendChild(dashboardGrid);
    }

    // --- Tab Switching Logic ---
    function activateTab(activeTabId) {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        document.getElementById(activeTabId).classList.add('active');

        switch (activeTabId) {
            case 'nav-bookings':
                renderBookings();
                break;
            case 'nav-guests':
                renderGuests();
                break;
            case 'nav-reports':
                renderReports();
                break;
            default:
                renderBookings(); // Default view
                break;
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(e.target.id);
        });
    });

    // Initial page load: render bookings view
    activateTab('nav-bookings');
});