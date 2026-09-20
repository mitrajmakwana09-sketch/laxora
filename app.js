"use strict";

/* =========================================================
   LUXORA - MAIN APPLICATION JAVASCRIPT
   File: js/app.js
   ========================================================= */


/* =========================================================
   GLOBAL CONFIG
   ========================================================= */

const LUXORA_APP = {

    storage: {
        loggedIn: "luxoraLoggedIn",
        userEmail: "luxoraUserEmail",
        wishlist: "luxoraWishlist",
        booking: "luxoraBooking",
        bookings: "luxoraBookings",
        lastBooking: "luxoraLastBooking",
        paymentStatus: "luxoraPaymentStatus"
    },

    pages: {
        home: "index.html",
        login: "login.html",
        register: "register.html",
        cars: "cars.html",
        bookings: "bookings.html",
        payment: "payment.html",
        profile: "profile.html",
        adminLogin: "admin-login.html"
    }

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initLUXORA();

});


/* =========================================================
   INITIALIZE LUXORA
   ========================================================= */

function initLUXORA() {

    initMobileMenu();

    initNavbarScroll();

    initPageLoader();

    initCurrentPage();

    initLoginState();

    initWishlist();

    initSmoothScroll();

    initBackToTop();

    initBookingButtons();

    initServiceWorker();

    updateUserUI();

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {

    const toggle =
        document.querySelector(
            ".nav-toggle, .menu-toggle, .mobile-menu-btn"
        );

    const nav =
        document.querySelector(
            ".nav-links, .navbar-menu, .mobile-nav"
        );

    if (!toggle || !nav) return;

    toggle.addEventListener("click", () => {

        toggle.classList.toggle("active");

        nav.classList.toggle("active");

        document.body.classList.toggle(
            "menu-open"
        );

    });


    /* Close menu after clicking link */

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            toggle.classList.remove("active");

            nav.classList.remove("active");

            document.body.classList.remove(
                "menu-open"
            );

        });

    });

}


/* =========================================================
   NAVBAR SCROLL EFFECT
   ========================================================= */

function initNavbarScroll() {

    const navbar =
        document.querySelector(
            ".navbar, .main-navbar, header"
        );

    if (!navbar) return;

    const checkScroll = () => {

        if (window.scrollY > 40) {

            navbar.classList.add(
                "scrolled"
            );

        } else {

            navbar.classList.remove(
                "scrolled"
            );

        }

    };

    window.addEventListener(
        "scroll",
        checkScroll,
        { passive: true }
    );

    checkScroll();

}


/* =========================================================
   PAGE LOADER
   ========================================================= */

function initPageLoader() {

    const loader =
        document.querySelector(
            ".page-loader, #pageLoader, .loader-screen"
        );

    if (!loader) return;

    window.addEventListener(
        "load",
        () => {

            setTimeout(() => {

                loader.classList.add(
                    "hide"
                );

                setTimeout(() => {

                    loader.style.display =
                        "none";

                }, 500);

            }, 500);

        }
    );

}


/* =========================================================
   CURRENT PAGE
   ========================================================= */

function initCurrentPage() {

    let currentPage =
        window.location.pathname
            .split("/")
            .pop();

    if (!currentPage) {
        currentPage = "index.html";
    }

    document
        .querySelectorAll(
            ".nav-links a, .navbar a"
        )
        .forEach(link => {

            const href =
                link.getAttribute("href");

            if (!href) return;

            const linkPage =
                href.split("/").pop();

            if (
                linkPage === currentPage
            ) {

                link.classList.add(
                    "active"
                );

            }

        });

}


/* =========================================================
   LOGIN STATE
   ========================================================= */

function initLoginState() {

    const isLoggedIn =
        localStorage.getItem(
            LUXORA_APP.storage.loggedIn
        ) === "true";

    document
        .querySelectorAll(
            ".login-link"
        )
        .forEach(link => {

            if (isLoggedIn) {

                link.textContent =
                    "Profile";

                link.href =
                    LUXORA_APP.pages.profile;

            }

        });


    document
        .querySelectorAll(
            ".logout-btn, [data-logout]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                logoutUser
            );

        });

}


/* =========================================================
   UPDATE USER UI
   ========================================================= */

function updateUserUI() {

    const email =
        localStorage.getItem(
            LUXORA_APP.storage.userEmail
        );

    if (!email) return;


    document
        .querySelectorAll(
            "[data-user-email]"
        )
        .forEach(element => {

            element.textContent =
                email;

        });

}


/* =========================================================
   LOGIN CHECK
   ========================================================= */

function requireLogin() {

    const isLoggedIn =
        localStorage.getItem(
            LUXORA_APP.storage.loggedIn
        ) === "true";

    if (!isLoggedIn) {

        localStorage.setItem(
            "luxoraRedirectAfterLogin",
            window.location.href
        );

        window.location.href =
            LUXORA_APP.pages.login;

        return false;

    }

    return true;

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser(event) {

    if (event) {
        event.preventDefault();
    }

    localStorage.removeItem(
        LUXORA_APP.storage.loggedIn
    );

    localStorage.removeItem(
        LUXORA_APP.storage.userEmail
    );

    window.location.href =
        LUXORA_APP.pages.home;

}


/* =========================================================
   WISHLIST
   ========================================================= */

function getWishlist() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_APP.storage.wishlist
            )
        ) || [];

    } catch {

        return [];

    }

}


function saveWishlist(wishlist) {

    localStorage.setItem(
        LUXORA_APP.storage.wishlist,
        JSON.stringify(wishlist)
    );

}


function toggleWishlist(carId, button = null) {

    let wishlist =
        getWishlist();

    const id =
        Number(carId);

    const index =
        wishlist.indexOf(id);

    if (index === -1) {

        wishlist.push(id);

        if (button) {
            button.classList.add("active");
        }

        showNotification(
            "Car added to wishlist"
        );

    } else {

        wishlist.splice(index, 1);

        if (button) {
            button.classList.remove("active");
        }

        showNotification(
            "Car removed from wishlist"
        );

    }

    saveWishlist(wishlist);

    updateWishlistCount();

}


function initWishlist() {

    const wishlist =
        getWishlist();

    document
        .querySelectorAll(
            "[data-car-id]"
        )
        .forEach(element => {

            const id =
                Number(
                    element.dataset.carId
                );

            if (
                wishlist.includes(id)
            ) {

                element.classList.add(
                    "active"
                );

            }

        });

    updateWishlistCount();

}


function updateWishlistCount() {

    const count =
        getWishlist().length;

    document
        .querySelectorAll(
            ".wishlist-count, [data-wishlist-count]"
        )
        .forEach(element => {

            element.textContent =
                count;

            element.style.display =
                count > 0
                    ? "inline-flex"
                    : "none";

        });

}


/* =========================================================
   BOOKING BUTTONS
   ========================================================= */

function initBookingButtons() {

    document
        .querySelectorAll(
            "[data-book-car]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const carId =
                        button.dataset.bookCar;

                    if (!carId) return;

                    localStorage.setItem(
                        "luxoraSelectedCar",
                        carId
                    );

                    window.location.href =
                        LUXORA_APP.pages.bookings;

                }
            );

        });

}


/* =========================================================
   BOOKING DATA
   ========================================================= */

function getBookingData() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_APP.storage.booking
            )
        );

    } catch {

        return null;

    }

}


function saveBookingData(data) {

    localStorage.setItem(
        LUXORA_APP.storage.booking,
        JSON.stringify(data)
    );

}


function clearBookingData() {

    localStorage.removeItem(
        LUXORA_APP.storage.booking
    );

}


/* =========================================================
   GET ALL BOOKINGS
   ========================================================= */

function getAllBookings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_APP.storage.bookings
            )
        ) || [];

    } catch {

        return [];

    }

}


function saveAllBookings(bookings) {

    localStorage.setItem(
        LUXORA_APP.storage.bookings,
        JSON.stringify(bookings)
    );

}


/* =========================================================
   ADD BOOKING
   ========================================================= */

function addBooking(booking) {

    const bookings =
        getAllBookings();

    bookings.push(booking);

    saveAllBookings(bookings);

    localStorage.setItem(
        LUXORA_APP.storage.lastBooking,
        JSON.stringify(booking)
    );

}


/* =========================================================
   CURRENCY FORMAT
   ========================================================= */

function formatINR(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        Number(amount) || 0
    );

}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(number) {

    return new Intl.NumberFormat(
        "en-IN"
    ).format(
        Number(number) || 0
    );

}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(date) {

    if (!date) return "-";

    const dateObject =
        new Date(date);

    if (isNaN(dateObject)) {
        return date;
    }

    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   CALCULATE RENTAL DAYS
   ========================================================= */

function calculateRentalDays(
    pickupDate,
    returnDate
) {

    if (!pickupDate || !returnDate) {
        return 1;
    }

    const start =
        new Date(pickupDate);

    const end =
        new Date(returnDate);

    const difference =
        end.getTime() -
        start.getTime();

    const days =
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        );

    return Math.max(
        1,
        days
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

function showNotification(
    message,
    type = "success"
) {

    let notification =
        document.querySelector(
            ".luxora-notification"
        );

    if (!notification) {

        notification =
            document.createElement("div");

        notification.className =
            "luxora-notification";

        document.body.appendChild(
            notification
        );

    }

    notification.className =
        `luxora-notification ${type}`;

    notification.textContent =
        message;

    requestAnimationFrame(() => {

        notification.classList.add(
            "show"
        );

    });

    setTimeout(() => {

        notification.classList.remove(
            "show"
        );

    }, 2500);

}


/* =========================================================
   SMOOTH SCROLL
   ========================================================= */

function initSmoothScroll() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link.getAttribute(
                            "href"
                        );

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target =
                        document.querySelector(
                            targetId
                        );

                    if (!target) return;

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });

}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function initBackToTop() {

    const button =
        document.querySelector(
            ".back-to-top"
        );

    if (!button) return;

    window.addEventListener(
        "scroll",
        () => {

            if (window.scrollY > 500) {

                button.classList.add(
                    "show"
                );

            } else {

                button.classList.remove(
                    "show"
                );

            }

        },
        { passive: true }
    );


    button.addEventListener(
        "click",
        () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }
    );

}


/* =========================================================
   SERVICE WORKER / PWA
   ========================================================= */

function initServiceWorker() {

    if (
        "serviceWorker" in navigator
    ) {

        window.addEventListener(
            "load",
            () => {

                navigator.serviceWorker
                    .register(
                        "service-worker.js"
                    )
                    .then(
                        registration => {

                            console.log(
                                "LUXORA Service Worker registered:",
                                registration.scope
                            );

                        }
                    )
                    .catch(
                        error => {

                            console.warn(
                                "Service Worker registration failed:",
                                error
                            );

                        }
                    );

            }
        );

    }

}


/* =========================================================
   CHECK ONLINE STATUS
   ========================================================= */

function initOnlineStatus() {

    window.addEventListener(
        "online",
        () => {

            showNotification(
                "You are back online.",
                "success"
            );

        }
    );


    window.addEventListener(
        "offline",
        () => {

            showNotification(
                "You are currently offline.",
                "warning"
            );

        }
    );

}


/* =========================================================
   CONFIRM ACTION
   ========================================================= */

function confirmAction(
    message,
    callback
) {

    const result =
        window.confirm(message);

    if (
        result &&
        typeof callback === "function"
    ) {

        callback();

    }

}


/* =========================================================
   COPY TO CLIPBOARD
   ========================================================= */

async function copyToClipboard(
    text
) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        showNotification(
            "Copied successfully."
        );

    } catch {

        showNotification(
            "Unable to copy.",
            "error"
        );

    }

}


/* =========================================================
   COUNTER ANIMATION
   ========================================================= */

function animateCounter(
    element,
    target,
    duration = 1500
) {

    if (!element) return;

    const start =
        Number(element.textContent) || 0;

    const difference =
        target - start;

    const startTime =
        performance.now();


    function update(currentTime) {

        const elapsed =
            currentTime -
            startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );

        const value =
            Math.floor(
                start +
                difference *
                progress
            );

        element.textContent =
            formatNumber(value);

        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }

    requestAnimationFrame(
        update
    );

}


/* =========================================================
   IMAGE ERROR HANDLER
   ========================================================= */

function initImageFallback() {

    document
        .querySelectorAll("img")
        .forEach(image => {

            image.addEventListener(
                "error",
                () => {

                    image.classList.add(
                        "image-error"
                    );

                }
            );

        });

}


/* =========================================================
   PREVENT DOUBLE SUBMIT
   ========================================================= */

function preventDoubleSubmit() {

    document
        .querySelectorAll(
            "form"
        )
        .forEach(form => {

            form.addEventListener(
                "submit",
                event => {

                    if (
                        form.dataset.submitted ===
                        "true"
                    ) {

                        event.preventDefault();

                        return;

                    }

                    form.dataset.submitted =
                        "true";

                }
            );

        });

}


/* =========================================================
   INIT EXTRA FEATURES
   ========================================================= */

initOnlineStatus();

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initImageFallback();

        preventDoubleSubmit();

    }
);


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.LUXORA = {

    config: LUXORA_APP,

    loginRequired:
        requireLogin,

    logout:
        logoutUser,

    wishlist: {
        get: getWishlist,
        save: saveWishlist,
        toggle: toggleWishlist,
        updateCount: updateWishlistCount
    },

    booking: {
        get: getBookingData,
        save: saveBookingData,
        clear: clearBookingData,
        getAll: getAllBookings,
        saveAll: saveAllBookings,
        add: addBooking
    },

    utility: {
        formatINR,
        formatNumber,
        formatDate,
        calculateRentalDays,
        escapeHTML,
        showNotification,
        copyToClipboard,
        confirmAction,
        animateCounter
    }

};