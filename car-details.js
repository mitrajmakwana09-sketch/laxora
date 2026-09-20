"use strict";

/* =========================================================
   LUXORA - CAR DETAILS JAVASCRIPT
   File: js/car-details.js
   ========================================================= */

const LUXORA_CAR_DETAILS = {

    dataFile: "data/cars.json",

    storage: {
        selectedCar: "luxoraSelectedCar",
        wishlist: "luxoraWishlist",
        booking: "luxoraBooking"
    }

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initCarDetails();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initCarDetails() {

    setupMobileMenu();

    setupBackButton();

    const cars =
        await loadCars();

    if (!cars.length) {

        showError(
            "Unable to load car information."
        );

        return;

    }


    const car =
        getSelectedCar(
            cars
        );


    if (!car) {

        showError(
            "Car not found."
        );

        return;

    }


    window.luxoraCurrentCar =
        car;


    renderCarDetails(
        car
    );

    setupWishlist(
        car
    );

    setupBookingButton(
        car
    );

    setupImageGallery();

}


/* =========================================================
   LOAD CARS
   ========================================================= */

async function loadCars() {

    try {

        const response =
            await fetch(
                LUXORA_CAR_DETAILS.dataFile
            );


        if (!response.ok) {

            throw new Error(
                "cars.json could not be loaded."
            );

        }


        const data =
            await response.json();


        return Array.isArray(data)
            ? data
            : [];


    } catch (error) {

        console.error(
            "LUXORA cars error:",
            error
        );

        return [];

    }

}


/* =========================================================
   GET SELECTED CAR
   ========================================================= */

function getSelectedCar(
    cars
) {

    /*
       Priority:

       1. URL ?id=1
       2. LocalStorage selected car
       3. First car
    */


    const params =
        new URLSearchParams(
            window.location.search
        );


    const urlId =
        params.get("id");


    if (urlId) {

        const car =
            cars.find(
                item =>
                    String(item.id) ===
                    String(urlId)
            );


        if (car) {

            saveSelectedCar(
                car
            );

            return car;

        }

    }


    const storedId =
        localStorage.getItem(
            LUXORA_CAR_DETAILS.storage.selectedCar
        );


    if (storedId) {

        const car =
            cars.find(
                item =>
                    String(item.id) ===
                    String(storedId)
            );


        if (car) {

            return car;

        }

    }


    return cars[0] || null;

}


/* =========================================================
   SAVE SELECTED CAR
   ========================================================= */

function saveSelectedCar(
    car
) {

    localStorage.setItem(
        LUXORA_CAR_DETAILS.storage.selectedCar,
        String(car.id)
    );

}


/* =========================================================
   RENDER CAR DETAILS
   ========================================================= */

function renderCarDetails(
    car
) {

    /* -----------------------------
       Basic information
    ----------------------------- */

    setText(
        "#carName",
        car.name
    );


    setText(
        "#carBrand",
        car.brand
    );


    setText(
        "#carPrice",
        formatINR(
            car.price
        )
    );


    setText(
        "#carYear",
        car.year
    );


    setText(
        "#carType",
        car.type
    );


    setText(
        "#carSeats",
        car.seats
    );


    setText(
        "#carTransmission",
        car.transmission
    );


    setText(
        "#carFuel",
        car.fuel
    );


    setText(
        "#carEngine",
        car.engine
    );


    setText(
        "#carDrive",
        car.drive
    );


    setText(
        "#carColor",
        car.color
    );


    setText(
        "#carRating",
        car.rating
    );


    setText(
        "#carReviews",
        car.reviews
    );


    setText(
        "#carDescription",
        car.description
    );


    /* -----------------------------
       Main image
    ----------------------------- */

    const mainImage =
        document.querySelector(
            "#mainCarImage"
        );


    if (mainImage) {

        mainImage.src =
            car.image;

        mainImage.alt =
            car.name;

    }


    /* -----------------------------
       Availability
    ----------------------------- */

    renderAvailability(
        car
    );


    /* -----------------------------
       Specifications
    ----------------------------- */

    renderSpecifications(
        car
    );


    /* -----------------------------
       Features
    ----------------------------- */

    renderFeatures(
        car
    );


    /* -----------------------------
       Gallery
    ----------------------------- */

    renderGallery(
        car
    );


    /* -----------------------------
       Dynamic car elements
    ----------------------------- */

    document
        .querySelectorAll(
            "[data-car-name]"
        )
        .forEach(
            element => {

                element.textContent =
                    car.name;

            }
        );


    document
        .querySelectorAll(
            "[data-car-brand]"
        )
        .forEach(
            element => {

                element.textContent =
                    car.brand;

            }
        );


    document
        .querySelectorAll(
            "[data-car-price]"
        )
        .forEach(
            element => {

                element.textContent =
                    formatINR(
                        car.price
                    );

            }
        );


    /* -----------------------------
       Page title
    ----------------------------- */

    document.title =
        `${car.name} | LUXORA`;

}


/* =========================================================
   AVAILABILITY
   ========================================================= */

function renderAvailability(
    car
) {

    const badges =
        document.querySelectorAll(
            ".availability-badge, #availabilityBadge"
        );


    badges.forEach(
        badge => {

            if (car.available) {

                badge.textContent =
                    "Available";

                badge.classList.remove(
                    "unavailable"
                );

                badge.classList.add(
                    "available"
                );

            } else {

                badge.textContent =
                    "Currently Unavailable";

                badge.classList.remove(
                    "available"
                );

                badge.classList.add(
                    "unavailable"
                );

            }

        }
    );


    const bookButtons =
        document.querySelectorAll(
            "[data-book-car], #bookCarBtn, #bookNowBtn"
        );


    if (!car.available) {

        bookButtons.forEach(
            button => {

                button.disabled =
                    true;

                button.classList.add(
                    "disabled"
                );

                button.textContent =
                    "Currently Unavailable";

            }
        );

    }

}


/* =========================================================
   SPECIFICATIONS
   ========================================================= */

function renderSpecifications(
    car
) {

    const container =
        document.querySelector(
            "#carSpecifications"
        );


    if (!container) return;


    const specifications = [

        {
            icon: "fa-chair",
            label: "Seats",
            value: car.seats
                ? `${car.seats} Seats`
                : "—"
        },

        {
            icon: "fa-gears",
            label: "Transmission",
            value:
                car.transmission || "—"
        },

        {
            icon: "fa-gas-pump",
            label: "Fuel",
            value:
                car.fuel || "—"
        },

        {
            icon: "fa-calendar",
            label: "Year",
            value:
                car.year || "—"
        },

        {
            icon: "fa-engine",
            label: "Engine",
            value:
                car.engine || "—"
        },

        {
            icon: "fa-road",
            label: "Drive",
            value:
                car.drive || "—"
        }

    ];


    container.innerHTML =
        specifications
            .map(
                item => `

                    <div class="spec-item">

                        <div class="spec-icon">

                            <i class="fa-solid ${item.icon}"></i>

                        </div>

                        <div class="spec-content">

                            <span class="spec-label">
                                ${escapeHTML(item.label)}
                            </span>

                            <strong>
                                ${escapeHTML(String(item.value))}
                            </strong>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   FEATURES
   ========================================================= */

function renderFeatures(
    car
) {

    const container =
        document.querySelector(
            "#carFeatures"
        );


    if (!container) return;


    const features =
        Array.isArray(
            car.features
        )
            ? car.features
            : [];


    if (!features.length) {

        container.innerHTML = `
            <div class="no-features">
                No features available.
            </div>
        `;

        return;

    }


    container.innerHTML =
        features
            .map(
                feature => `

                    <div class="feature-item">

                        <i class="fa-solid fa-check"></i>

                        <span>
                            ${escapeHTML(feature)}
                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   GALLERY
   ========================================================= */

function renderGallery(
    car
) {

    const gallery =
        document.querySelector(
            "#carGallery"
        );


    if (!gallery) return;


    let images = [];


    if (
        Array.isArray(
            car.gallery
        )
    ) {

        images =
            car.gallery;

    }


    if (
        car.image &&
        !images.includes(car.image)
    ) {

        images.unshift(
            car.image
        );

    }


    if (!images.length) {

        gallery.innerHTML =
            "";

        return;

    }


    gallery.innerHTML =
        images
            .map(
                (image, index) => `

                    <button
                        type="button"
                        class="gallery-thumb ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                        data-gallery-image="${escapeAttribute(image)}"
                        aria-label="View image ${index + 1}"
                    >

                        <img
                            src="${escapeAttribute(image)}"
                            alt="${escapeAttribute(car.name)} image ${index + 1}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        >

                    </button>

                `
            )
            .join("");


    setupGalleryEvents();

}


/* =========================================================
   GALLERY EVENTS
   ========================================================= */

function setupGalleryEvents() {

    const thumbnails =
        document.querySelectorAll(
            ".gallery-thumb"
        );


    const mainImage =
        document.querySelector(
            "#mainCarImage"
        );


    thumbnails.forEach(
        thumbnail => {

            thumbnail.addEventListener(
                "click",
                () => {

                    const image =
                        thumbnail.dataset
                            .galleryImage;


                    if (
                        mainImage &&
                        image
                    ) {

                        mainImage.src =
                            image;

                    }


                    thumbnails.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    thumbnail.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   IMAGE GALLERY
   ========================================================= */

function setupImageGallery() {

    const mainImage =
        document.querySelector(
            "#mainCarImage"
        );


    if (!mainImage) return;


    mainImage.addEventListener(
        "error",
        () => {

            mainImage.src =
                createFallbackImage();

        }
    );

}


/* =========================================================
   WISHLIST
   ========================================================= */

function setupWishlist(
    car
) {

    const buttons =
        document.querySelectorAll(
            "#wishlistBtn, [data-wishlist]"
        );


    if (!buttons.length) return;


    updateWishlistUI(
        car
    );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    toggleWishlist(
                        car
                    );

                }
            );

        }
    );

}


/* =========================================================
   TOGGLE WISHLIST
   ========================================================= */

function toggleWishlist(
    car
) {

    let wishlist =
        getWishlist();


    const carId =
        String(car.id);


    const exists =
        wishlist.some(
            id =>
                String(id) ===
                carId
        );


    if (exists) {

        wishlist =
            wishlist.filter(
                id =>
                    String(id) !==
                    carId
            );

    } else {

        wishlist.push(
            car.id
        );

    }


    saveWishlist(
        wishlist
    );


    updateWishlistUI(
        car
    );


    showNotification(
        exists
            ? "Removed from wishlist"
            : "Added to wishlist"
    );

}


/* =========================================================
   GET WISHLIST
   ========================================================= */

function getWishlist() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_CAR_DETAILS.storage.wishlist
            )
        ) || [];

    } catch {

        return [];

    }

}


/* =========================================================
   SAVE WISHLIST
   ========================================================= */

function saveWishlist(
    wishlist
) {

    localStorage.setItem(
        LUXORA_CAR_DETAILS.storage.wishlist,
        JSON.stringify(
            wishlist
        )
    );

}


/* =========================================================
   UPDATE WISHLIST UI
   ========================================================= */

function updateWishlistUI(
    car
) {

    const wishlist =
        getWishlist();


    const isSaved =
        wishlist.some(
            id =>
                String(id) ===
                String(car.id)
        );


    document
        .querySelectorAll(
            "#wishlistBtn, [data-wishlist]"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    isSaved
                );


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        isSaved
                            ? "fa-solid fa-heart"
                            : "fa-regular fa-heart";

                }


                button.setAttribute(
                    "aria-label",
                    isSaved
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                );

            }
        );

}


/* =========================================================
   BOOKING BUTTON
   ========================================================= */

function setupBookingButton(
    car
) {

    const buttons =
        document.querySelectorAll(
            "#bookCarBtn, #bookNowBtn, [data-book-car]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    if (!car.available) {

                        showNotification(
                            "This car is currently unavailable.",
                            "error"
                        );

                        return;

                    }


                    saveSelectedCar(
                        car
                    );


                    localStorage.setItem(
                        LUXORA_CAR_DETAILS.storage.booking,
                        JSON.stringify({

                            carId:
                                car.id,

                            carName:
                                car.name,

                            brand:
                                car.brand,

                            pricePerDay:
                                car.price,

                            carImage:
                                car.image

                        })
                    );


                    /*
                       Booking page
                    */

                    window.location.href =
                        `bookings.html?id=${encodeURIComponent(car.id)}`;

                }
            );

        }
    );

}


/* =========================================================
   BACK BUTTON
   ========================================================= */

function setupBackButton() {

    const button =
        document.querySelector(
            "#backButton"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            if (
                document.referrer &&
                document.referrer
                    .includes(
                        window.location.hostname
                    )
            ) {

                history.back();

            } else {

                window.location.href =
                    "cars.html";

            }

        }
    );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function setupMobileMenu() {

    const toggle =
        document.querySelector(
            ".nav-toggle"
        );

    const menu =
        document.querySelector(
            ".nav-links"
        );


    if (!toggle || !menu) return;


    toggle.addEventListener(
        "click",
        () => {

            toggle.classList.toggle(
                "active"
            );

            menu.classList.toggle(
                "active"
            );

        }
    );


    menu.querySelectorAll(
        "a"
    ).forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    toggle.classList.remove(
                        "active"
                    );

                    menu.classList.remove(
                        "active"
                    );

                }
            );

        }
    );

}


/* =========================================================
   INR FORMAT
   ========================================================= */

function formatINR(
    amount
) {

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
   SET TEXT
   ========================================================= */

function setText(
    selector,
    value
) {

    const elements =
        document.querySelectorAll(
            selector
        );


    elements.forEach(
        element => {

            element.textContent =
                value !== undefined &&
                value !== null &&
                value !== ""
                    ? value
                    : "—";

        }
    );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
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
   ATTRIBUTE ESCAPE
   ========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
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
            document.createElement(
                "div"
            );

        notification.className =
            "luxora-notification";


        document.body.appendChild(
            notification
        );

    }


    notification.textContent =
        message;


    notification.classList.remove(
        "success",
        "error",
        "show"
    );


    notification.classList.add(
        type
    );


    requestAnimationFrame(
        () => {

            notification.classList.add(
                "show"
            );

        }
    );


    setTimeout(
        () => {

            notification.classList.remove(
                "show"
            );

        },
        2800
    );

}


/* =========================================================
   ERROR
   ========================================================= */

function showError(
    message
) {

    const container =
        document.querySelector(
            ".car-details-container"
        );


    if (container) {

        container.innerHTML = `

            <div class="car-error">

                <i class="fa-solid fa-car-burst"></i>

                <h2>
                    Car Not Available
                </h2>

                <p>
                    ${escapeHTML(message)}
                </p>

                <a
                    href="cars.html"
                    class="btn btn-gold"
                >
                    Browse Cars
                </a>

            </div>

        `;

    } else {

        showNotification(
            message,
            "error"
        );

    }

}


/* =========================================================
   FALLBACK IMAGE
   ========================================================= */

function createFallbackImage() {

    return `
        data:image/svg+xml;charset=UTF-8,
        ${encodeURIComponent(`
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1200"
                height="700"
                viewBox="0 0 1200 700"
            >
                <rect
                    width="1200"
                    height="700"
                    fill="#111"
                />

                <text
                    x="600"
                    y="340"
                    text-anchor="middle"
                    fill="#c9a227"
                    font-size="42"
                    font-family="Arial"
                >
                    LUXORA
                </text>

                <text
                    x="600"
                    y="390"
                    text-anchor="middle"
                    fill="#aaa"
                    font-size="20"
                    font-family="Arial"
                >
                    Luxury Car Rental
                </text>
            </svg>
        `)}
    `;

}


/* =========================================================
   GLOBAL API
   ========================================================= */

window.LUXORA_CAR_DETAILS_API = {

    loadCars,

    getSelectedCar,

    saveSelectedCar,

    toggleWishlist,

    getWishlist,

    formatINR

};