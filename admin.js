/* =========================================================
   LUXORA - ADMIN JAVASCRIPT
   File: js/admin.js
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL CONFIGURATION
   ========================================================= */

const LUXORA_ADMIN = {
    paths: {
        cars: "../data/cars.json",
        users: "../data/users.json",
        bookings: "../data/bookings.json",
        locations: "../data/locations.json"
    },

    storage: {
        adminLoggedIn: "luxoraAdminLoggedIn",
        adminUser: "luxoraAdminUser",
        cars: "luxoraAdminCars",
        bookings: "luxoraBookings",
        users: "luxoraUsers"
    }
};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initAdmin();

});


/* =========================================================
   INITIALIZE ADMIN
   ========================================================= */

async function initAdmin() {

    try {

        setupAdminNavigation();
        setupSidebar();
        setupLogout();
        setupSearch();
        setupFilters();
        setupModalClose();

        await loadAdminData();

        console.log("LUXORA Admin initialized successfully.");

    } catch (error) {

        console.error("Admin initialization error:", error);

    }

}


/* =========================================================
   LOAD ALL ADMIN DATA
   ========================================================= */

async function loadAdminData() {

    const [cars, users, bookings, locations] = await Promise.all([
        loadJSON(LUXORA_ADMIN.paths.cars),
        loadJSON(LUXORA_ADMIN.paths.users),
        loadJSON(LUXORA_ADMIN.paths.bookings),
        loadJSON(LUXORA_ADMIN.paths.locations)
    ]);

    window.luxoraCars = cars || [];
    window.luxoraUsers = users || [];
    window.luxoraBookings = bookings || [];
    window.luxoraLocations = locations || [];

    updateDashboardStats();

    renderRecentBookings();
    renderCars();
    renderCustomers();
    renderBookingTable();
    renderLocations();

}


/* =========================================================
   LOAD JSON
   ========================================================= */

async function loadJSON(url) {

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Unable to load ${url}`);
        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return [];

    }

}


/* =========================================================
   DASHBOARD STATISTICS
   ========================================================= */

function updateDashboardStats() {

    const cars = window.luxoraCars || [];
    const users = window.luxoraUsers || [];
    const bookings = window.luxoraBookings || [];

    const availableCars = cars.filter(
        car => car.available === true
    ).length;

    const totalRevenue = bookings.reduce((total, booking) => {

        return total + Number(
            booking?.pricing?.total || 0
        );

    }, 0);

    const confirmedBookings = bookings.filter(
        booking => booking.status === "Confirmed"
    ).length;

    updateElement("totalCars", cars.length);
    updateElement("availableCars", availableCars);
    updateElement("totalCustomers", users.length);
    updateElement("totalBookings", bookings.length);
    updateElement("confirmedBookings", confirmedBookings);

    updateElement(
        "totalRevenue",
        formatCurrency(totalRevenue)
    );

}


/* =========================================================
   UPDATE ELEMENT
   ========================================================= */

function updateElement(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   CURRENCY FORMAT
   ========================================================= */

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);

}


/* =========================================================
   RECENT BOOKINGS
   ========================================================= */

function renderRecentBookings() {

    const container =
        document.getElementById("recentBookings");

    if (!container) return;

    const bookings = window.luxoraBookings || [];

    const recentBookings =
        bookings.slice(0, 5);

    container.innerHTML = "";

    recentBookings.forEach(booking => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <strong>${escapeHTML(booking.id)}</strong>
            </td>

            <td>
                ${escapeHTML(
                    booking.customer?.name || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    booking.car?.name || "-"
                )}
            </td>

            <td>
                ${formatCurrency(
                    booking.pricing?.total || 0
                )}
            </td>

            <td>
                <span class="status ${getStatusClass(
                    booking.status
                )}">
                    ${escapeHTML(
                        booking.status || "Pending"
                    )}
                </span>
            </td>
        `;

        container.appendChild(row);

    });

}


/* =========================================================
   BOOKING TABLE
   ========================================================= */

function renderBookingTable(data = null) {

    const tableBody =
        document.getElementById("bookingTableBody");

    if (!tableBody) return;

    const bookings =
        data || window.luxoraBookings || [];

    tableBody.innerHTML = "";

    if (bookings.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    No bookings found.
                </td>
            </tr>
        `;

        return;

    }


    bookings.forEach(booking => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>
                <strong>${escapeHTML(
                    booking.id
                )}</strong>
            </td>

            <td>
                ${escapeHTML(
                    booking.customer?.name || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    booking.car?.name || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    booking.booking?.pickupDate || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    booking.booking?.returnDate || "-"
                )}
            </td>

            <td>
                ${formatCurrency(
                    booking.pricing?.total || 0
                )}
            </td>

            <td>
                <span class="status ${getStatusClass(
                    booking.status
                )}">
                    ${escapeHTML(
                        booking.status || "Pending"
                    )}
                </span>
            </td>

            <td>
                <button
                    class="admin-action view"
                    onclick="viewBooking('${booking.id}')">
                    View
                </button>

                <button
                    class="admin-action delete"
                    onclick="deleteBooking('${booking.id}')">
                    Delete
                </button>
            </td>

        `;

        tableBody.appendChild(row);

    });

}


/* =========================================================
   CARS TABLE / GRID
   ========================================================= */

function renderCars(data = null) {

    const container =
        document.getElementById("carsContainer");

    if (!container) return;

    const cars =
        data || window.luxoraCars || [];

    container.innerHTML = "";

    if (cars.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No cars available.
            </div>
        `;

        return;

    }


    cars.forEach(car => {

        const card = document.createElement("div");

        card.className = "admin-car-card";

        card.innerHTML = `

            <div class="car-image">

                <img
                    src="${escapeAttribute(car.image)}"
                    alt="${escapeAttribute(car.name)}"
                    loading="lazy"
                >

                <span class="car-status ${
                    car.available
                        ? "available"
                        : "unavailable"
                }">
                    ${
                        car.available
                            ? "Available"
                            : "Unavailable"
                    }
                </span>

            </div>

            <div class="car-content">

                <small>
                    ${escapeHTML(car.brand)}
                </small>

                <h3>
                    ${escapeHTML(car.name)}
                </h3>

                <div class="car-specs">

                    <span>
                        ${escapeHTML(
                            String(car.seats)
                        )} Seats
                    </span>

                    <span>
                        ${escapeHTML(
                            car.transmission
                        )}
                    </span>

                    <span>
                        ${escapeHTML(
                            car.fuel
                        )}
                    </span>

                </div>

                <div class="car-bottom">

                    <strong>
                        ${formatCurrency(
                            car.price
                        )}
                        <small>/day</small>
                    </strong>

                    <button
                        class="admin-action edit"
                        onclick="editCar(${car.id})">
                        Edit
                    </button>

                </div>

            </div>

        `;

        container.appendChild(card);

    });

}


/* =========================================================
   CUSTOMERS
   ========================================================= */

function renderCustomers(data = null) {

    const tableBody =
        document.getElementById("customerTableBody");

    if (!tableBody) return;

    const users =
        data || window.luxoraUsers || [];

    tableBody.innerHTML = "";


    if (users.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    No customers found.
                </td>
            </tr>
        `;

        return;

    }


    users.forEach(user => {

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>

                <div class="customer-info">

                    <img
                        src="${escapeAttribute(
                            user.profileImage
                        )}"
                        alt="${escapeAttribute(
                            user.name
                        )}"
                    >

                    <div>

                        <strong>
                            ${escapeHTML(
                                user.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                user.email
                            )}
                        </small>

                    </div>

                </div>

            </td>

            <td>
                ${escapeHTML(user.phone)}
            </td>

            <td>
                ${escapeHTML(
                    user.address?.city || "-"
                )}
            </td>

            <td>
                ${user.totalBookings || 0}
            </td>

            <td>
                ${formatCurrency(
                    user.totalSpent || 0
                )}
            </td>

            <td>
                <span class="membership">
                    ${escapeHTML(
                        user.membership || "Silver"
                    )}
                </span>
            </td>

            <td>
                <span class="status ${getStatusClass(
                    user.status
                )}">
                    ${escapeHTML(
                        user.status
                    )}
                </span>
            </td>

            <td>

                <button
                    class="admin-action view"
                    onclick="viewCustomer(${user.id})">
                    View
                </button>

            </td>

        `;

        tableBody.appendChild(row);

    });

}


/* =========================================================
   LOCATIONS
   ========================================================= */

function renderLocations() {

    const select =
        document.getElementById("locationSelect");

    if (!select) return;

    const locations =
        window.luxoraLocations || [];

    select.innerHTML = `
        <option value="">
            Select Location
        </option>
    `;

    locations
        .filter(location => location.available)
        .forEach(location => {

            const option =
                document.createElement("option");

            option.value = location.name;

            option.textContent =
                `${location.name} - ${location.city}`;

            select.appendChild(option);

        });

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById("adminSearch");

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        event => {

            const query =
                event.target.value
                    .toLowerCase()
                    .trim();

            const bookings =
                window.luxoraBookings || [];

            const filtered =
                bookings.filter(booking => {

                    const customer =
                        booking.customer?.name
                            ?.toLowerCase() || "";

                    const car =
                        booking.car?.name
                            ?.toLowerCase() || "";

                    const id =
                        booking.id
                            ?.toLowerCase() || "";

                    return (
                        customer.includes(query) ||
                        car.includes(query) ||
                        id.includes(query)
                    );

                });

            renderBookingTable(filtered);

        }
    );

}


/* =========================================================
   FILTERS
   ========================================================= */

function setupFilters() {

    const statusFilter =
        document.getElementById("statusFilter");

    if (!statusFilter) return;

    statusFilter.addEventListener(
        "change",
        event => {

            const value =
                event.target.value;

            const bookings =
                window.luxoraBookings || [];

            if (!value) {

                renderBookingTable(bookings);
                return;

            }

            const filtered =
                bookings.filter(
                    booking =>
                        booking.status === value
                );

            renderBookingTable(filtered);

        }
    );

}


/* =========================================================
   ADMIN NAVIGATION
   ========================================================= */

function setupAdminNavigation() {

    const links =
        document.querySelectorAll(
            ".admin-sidebar a"
        );

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    links.forEach(link => {

        const href =
            link.getAttribute("href");

        if (
            href &&
            href.split("/").pop() === currentPage
        ) {

            link.classList.add("active");

        }

    });

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function setupSidebar() {

    const menuButton =
        document.querySelector(
            ".sidebar-toggle"
        );

    const sidebar =
        document.querySelector(
            ".admin-sidebar"
        );

    if (!menuButton || !sidebar) return;

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("open");

        }
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            ".admin-logout"
        );

    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                localStorage.removeItem(
                    LUXORA_ADMIN.storage.adminLoggedIn
                );

                localStorage.removeItem(
                    LUXORA_ADMIN.storage.adminUser
                );

                window.location.href =
                    "admin-login.html";

            }
        );

    });

}


/* =========================================================
   BOOKING VIEW
   ========================================================= */

function viewBooking(id) {

    const booking =
        window.luxoraBookings.find(
            item => item.id === id
        );

    if (!booking) return;

    alert(
        `Booking ID: ${booking.id}\n\n` +
        `Customer: ${booking.customer?.name}\n` +
        `Car: ${booking.car?.name}\n` +
        `Status: ${booking.status}\n` +
        `Total: ${formatCurrency(
            booking.pricing?.total || 0
        )}`
    );

}


/* =========================================================
   CUSTOMER VIEW
   ========================================================= */

function viewCustomer(id) {

    const user =
        window.luxoraUsers.find(
            item => item.id === id
        );

    if (!user) return;

    alert(
        `Customer: ${user.name}\n\n` +
        `Email: ${user.email}\n` +
        `Phone: ${user.phone}\n` +
        `Membership: ${user.membership}\n` +
        `Bookings: ${user.totalBookings}\n` +
        `Total Spent: ${formatCurrency(
            user.totalSpent || 0
        )}`
    );

}


/* =========================================================
   EDIT CAR
   ========================================================= */

function editCar(id) {

    const car =
        window.luxoraCars.find(
            item => item.id === id
        );

    if (!car) return;

    localStorage.setItem(
        "luxoraEditCar",
        JSON.stringify(car)
    );

    window.location.href =
        "edit-car.html";

}


/* =========================================================
   DELETE BOOKING
   ========================================================= */

function deleteBooking(id) {

    const confirmation =
        confirm(
            `Are you sure you want to delete booking ${id}?`
        );

    if (!confirmation) return;

    window.luxoraBookings =
        window.luxoraBookings.filter(
            booking => booking.id !== id
        );

    localStorage.setItem(
        LUXORA_ADMIN.storage.bookings,
        JSON.stringify(
            window.luxoraBookings
        )
    );

    renderBookingTable();
    updateDashboardStats();

}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    if (!status) return "pending";

    return status
        .toLowerCase()
        .replace(/\s+/g, "-");

}


/* =========================================================
   MODAL CLOSE
   ========================================================= */

function setupModalClose() {

    document
        .querySelectorAll(".modal-close")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const modal =
                        button.closest(".modal");

                    if (modal) {
                        modal.classList.remove(
                            "show"
                        );
                    }

                }
            );

        });

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);

}


/* =========================================================
   EXPORT ADMIN DATA
   ========================================================= */

function exportBookingsCSV() {

    const bookings =
        window.luxoraBookings || [];

    if (bookings.length === 0) {

        alert("No booking data available.");
        return;

    }

    let csv =
        "Booking ID,Customer,Car,Pickup Date,Return Date,Total,Status\n";

    bookings.forEach(booking => {

        csv += [
            booking.id,
            booking.customer?.name || "",
            booking.car?.name || "",
            booking.booking?.pickupDate || "",
            booking.booking?.returnDate || "",
            booking.pricing?.total || 0,
            booking.status || ""
        ]
        .map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",");

        csv += "\n";

    });


    const blob =
        new Blob(
            [csv],
            { type: "text/csv;charset=utf-8;" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "LUXORA-bookings.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


/* =========================================================
   EXPORT CUSTOMERS CSV
   ========================================================= */

function exportCustomersCSV() {

    const users =
        window.luxoraUsers || [];

    if (users.length === 0) {

        alert("No customer data available.");
        return;

    }

    let csv =
        "User ID,Name,Email,Phone,City,Membership,Bookings,Total Spent,Status\n";

    users.forEach(user => {

        csv += [
            user.userId,
            user.name,
            user.email,
            user.phone,
            user.address?.city || "",
            user.membership || "",
            user.totalBookings || 0,
            user.totalSpent || 0,
            user.status || ""
        ]
        .map(value =>
            `"${String(value).replace(/"/g, '""')}"`
        )
        .join(",");

        csv += "\n";

    });


    const blob =
        new Blob(
            [csv],
            { type: "text/csv;charset=utf-8;" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "LUXORA-customers.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

}


/* =========================================================
   CALCULATE TOTAL REVENUE
   ========================================================= */

function calculateTotalRevenue() {

    const bookings =
        window.luxoraBookings || [];

    return bookings.reduce(
        (total, booking) => {

            return total +
                Number(
                    booking.pricing?.total || 0
                );

        },
        0
    );

}


/* =========================================================
   GET AVAILABLE CARS
   ========================================================= */

function getAvailableCars() {

    return (window.luxoraCars || [])
        .filter(car => car.available === true);

}


/* =========================================================
   GET ACTIVE CUSTOMERS
   ========================================================= */

function getActiveCustomers() {

    return (window.luxoraUsers || [])
        .filter(user => user.status === "Active");

}


/* =========================================================
   ADMIN DATA API
   ========================================================= */

window.LUXORA_ADMIN = LUXORA_ADMIN;

window.LUXORA_ADMIN_FUNCTIONS = {

    loadAdminData,
    updateDashboardStats,
    renderCars,
    renderCustomers,
    renderBookingTable,
    renderRecentBookings,
    calculateTotalRevenue,
    getAvailableCars,
    getActiveCustomers,
    exportBookingsCSV,
    exportCustomersCSV,
    viewBooking,
    viewCustomer,
    editCar,
    deleteBooking

};