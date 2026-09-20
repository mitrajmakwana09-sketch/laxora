"use strict";

/* =========================================================
   LUXORA - CARS JAVASCRIPT
   File: js/cars.js
   ========================================================= */

const LUXORA_CARS = {

    dataFile: "data/cars.json",

    storage: {
        selectedCar: "luxoraSelectedCar",
        wishlist: "luxoraWishlist"
    }

};


let luxoraCars = [];
let filteredCars = [];


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initCarsPage();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initCarsPage() {

    setupMobileMenu();

    setupFilters();

    setupSearch();

    setupSort();

    await loadCars();

    renderCars();

    updateWishlistCount();

}


/* =========================================================
   LOAD CARS
   ========================================================= */

async function loadCars() {

    try {

        const response =
            await fetch(
                LUXORA_CARS.dataFile
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load cars.json"
            );

        }


        const data =
            await response.json();


        luxoraCars =
            Array.isArray(data)
                ? data
                : [];


        filteredCars =
            [...luxoraCars];


    } catch (error) {

        console.error(
            "LUXORA Cars Error:",
            error
        );


        showCarsError();

    }

}


/* =========================================================
   RENDER CARS
   ========================================================= */

function renderCars() {

    const container =
        document.querySelector(
            "#carsContainer"
        );


    if (!container) return;


    if (!filteredCars.length) {

        showNoCars(
            container
        );

        updateResultsCount();

        return;

    }


    container.innerHTML =
        filteredCars
            .map(
                car =>
                    createCarCard(
                        car
                    )
            )
            .join("");


    attachCarEvents();

    updateResultsCount();

}


/* =========================================================
   CREATE CAR CARD
   ========================================================= */

function createCarCard(
    car
) {

    const wishlist =
        getWishlist();


    const isWishlisted =
        wishlist.some(
            id =>
                String(id) ===
                String(car.id)
        );


    const availability =
        car.available
            ? `
                <span class="availability available">
                    <i class="fa-solid fa-circle"></i>
                    Available
                </span>
            `
            : `
                <span class="availability unavailable">
                    <i class="fa-solid fa-circle"></i>
                    Unavailable
                </span>
            `;


    const features =
        getCardFeatures(
            car
        );


    return `

        <article
            class="car-card"
            data-car-id="${escapeAttribute(car.id)}"
        >

            <!-- CAR IMAGE -->

            <div class="car-image-wrapper">

                <img
                    class="car-image"
                    src="${escapeAttribute(car.image)}"
                    alt="${escapeAttribute(car.name)}"
                    loading="lazy"
                    onerror="this.src='${createFallbackImage()}'"
                >


                <div class="car-image-overlay"></div>


                <div class="car-top">

                    ${availability}


                    <button
                        class="wishlist-btn ${
                            isWishlisted
                                ? "active"
                                : ""
                        }"
                        data-wishlist-id="${escapeAttribute(car.id)}"
                        type="button"
                        aria-label="Add to wishlist"
                    >

                        <i class="${
                            isWishlisted
                                ? "fa-solid"
                                : "fa-regular"
                        } fa-heart"></i>

                    </button>

                </div>


                ${
                    car.rating
                        ? `
                            <div class="car-rating">

                                <i class="fa-solid fa-star"></i>

                                <span>
                                    ${escapeHTML(
                                        car.rating
                                    )}
                                </span>

                                ${
                                    car.reviews
                                        ? `
                                            <small>
                                                (${escapeHTML(
                                                    car.reviews
                                                )})
                                            </small>
                                        `
                                        : ""
                                }

                            </div>
                        `
                        : ""
                }

            </div>


            <!-- CAR CONTENT -->

            <div class="car-content">

                <div class="car-heading">

                    <div>

                        <span class="car-brand">
                            ${escapeHTML(
                                car.brand || ""
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                car.name
                            )}
                        </h3>

                    </div>


                    ${
                        car.year
                            ? `
                                <span class="car-year">
                                    ${escapeHTML(
                                        car.year
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>


                ${
                    car.type
                        ? `
                            <p class="car-type">
                                ${escapeHTML(
                                    car.type
                                )}
                            </p>
                        `
                        : ""
                }


                <!-- SPECIFICATIONS -->

                <div class="car-specs">

                    <div class="car-spec">

                        <i class="fa-solid fa-user-group"></i>

                        <span>
                            ${
                                car.seats
                                    ? `${escapeHTML(
                                        car.seats
                                      )} Seats`
                                    : "—"
                            }
                        </span>

                    </div>


                    <div class="car-spec">

                        <i class="fa-solid fa-gears"></i>

                        <span>
                            ${
                                car.transmission
                                    ? escapeHTML(
                                        car.transmission
                                      )
                                    : "—"
                            }
                        </span>

                    </div>


                    <div class="car-spec">

                        <i class="fa-solid fa-gas-pump"></i>

                        <span>
                            ${
                                car.fuel
                                    ? escapeHTML(
                                        car.fuel
                                      )
                                    : "—"
                            }
                        </span>

                    </div>

                </div>


                <!-- EXTRA FEATURES -->

                ${
                    features
                        ? `
                            <div class="car-features">

                                ${features}

                            </div>
                        `
                        : ""
                }


                <!-- PRICE -->

                <div class="car-footer">

                    <div class="car-price">

                        <small>
                            Starting from
                        </small>

                        <strong>
                            ${formatINR(
                                car.price
                            )}
                        </strong>

                        <span>
                            / day
                        </span>

                    </div>


                    <div class="car-actions">

                        <button
                            type="button"
                            class="details-btn"
                            data-details-id="${escapeAttribute(
                                car.id
                            )}"
                        >
                            View Details
                        </button>


                        <button
                            type="button"
                            class="book-btn"
                            data-book-id="${escapeAttribute(
                                car.id
                            )}"
                            ${
                                car.available
                                    ? ""
                                    : "disabled"
                            }
                        >

                            ${
                                car.available
                                    ? "Book Now"
                                    : "Unavailable"
                            }

                        </button>

                    </div>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   CARD FEATURES
   ========================================================= */

function getCardFeatures(
    car
) {

    if (
        !Array.isArray(
            car.features
        )
    ) {

        return "";

    }


    return car.features
        .slice(
            0,
            3
        )
        .map(
            feature =>
                `
                    <span>
                        <i class="fa-solid fa-check"></i>
                        ${escapeHTML(feature)}
                    </span>
                `
        )
        .join("");

}


/* =========================================================
   ATTACH CARD EVENTS
   ========================================================= */

function attachCarEvents() {

    /* -----------------------------
       View Details
    ----------------------------- */

    document
        .querySelectorAll(
            "[data-details-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const car =
                            findCar(
                                button.dataset
                                    .detailsId
                            );


                        if (!car) return;


                        selectCar(
                            car
                        );


                        window.location.href =
                            `car-details.html?id=${encodeURIComponent(
                                car.id
                            )}`;

                    }
                );

            }
        );


    /* -----------------------------
       Book Now
    ----------------------------- */

    document
        .querySelectorAll(
            "[data-book-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        if (
                            button.disabled
                        ) {

                            return;

                        }


                        const car =
                            findCar(
                                button.dataset
                                    .bookId
                            );


                        if (!car) return;


                        selectCar(
                            car
                        );


                        localStorage.setItem(
                            "luxoraBooking",
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


                        window.location.href =
                            `bookings.html?id=${encodeURIComponent(
                                car.id
                            )}`;

                    }
                );

            }
        );


    /* -----------------------------
       Wishlist
    ----------------------------- */

    document
        .querySelectorAll(
            "[data-wishlist-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const car =
                            findCar(
                                button.dataset
                                    .wishlistId
                            );


                        if (!car) return;


                        toggleWishlist(
                            car
                        );

                    }
                );

            }
        );

}


/* =========================================================
   SELECT CAR
   ========================================================= */

function selectCar(
    car
) {

    localStorage.setItem(
        LUXORA_CARS.storage.selectedCar,
        String(car.id)
    );

}


/* =========================================================
   FIND CAR
   ========================================================= */

function findCar(
    id
) {

    return luxoraCars.find(
        car =>
            String(car.id) ===
            String(id)
    );

}


/* =========================================================
   FILTER SYSTEM
   ========================================================= */

function setupFilters() {

    const brand =
        document.querySelector(
            "#brandFilter"
        );

    const transmission =
        document.querySelector(
            "#transmissionFilter"
        );

    const fuel =
        document.querySelector(
            "#fuelFilter"
        );

    const price =
        document.querySelector(
            "#priceFilter"
        );


    if (brand) {

        brand.addEventListener(
            "change",
            applyFilters
        );

    }


    if (transmission) {

        transmission.addEventListener(
            "change",
            applyFilters
        );

    }


    if (fuel) {

        fuel.addEventListener(
            "change",
            applyFilters
        );

    }


    if (price) {

        price.addEventListener(
            "change",
            applyFilters
        );

    }


    populateBrandFilter();

}


/* =========================================================
   POPULATE BRAND FILTER
   ========================================================= */

function populateBrandFilter() {

    const select =
        document.querySelector(
            "#brandFilter"
        );


    if (!select) return;


    const existing =
        select.querySelectorAll(
            "option"
        );


    /*
       Don't duplicate manually
       added options.
    */

    if (
        existing.length > 1
    ) {

        return;

    }


    const brands =
        [
            ...new Set(
                luxoraCars
                    .map(
                        car =>
                            car.brand
                    )
                    .filter(Boolean)
            )
        ]
        .sort();


    brands.forEach(
        brand => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                brand;


            option.textContent =
                brand;


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   APPLY FILTERS
   ========================================================= */

function applyFilters() {

    const search =
        getValue(
            "#carSearch, #searchCars"
        ).toLowerCase();


    const brand =
        getValue(
            "#brandFilter"
        );


    const transmission =
        getValue(
            "#transmissionFilter"
        );


    const fuel =
        getValue(
            "#fuelFilter"
        );


    const price =
        getValue(
            "#priceFilter"
        );


    filteredCars =
        luxoraCars.filter(
            car => {

                const matchesSearch =
                    !search ||
                    String(
                        car.name || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        car.brand || ""
                    )
                        .toLowerCase()
                        .includes(search) ||

                    String(
                        car.type || ""
                    )
                        .toLowerCase()
                        .includes(search);


                const matchesBrand =
                    !brand ||
                    brand === "all" ||
                    car.brand === brand;


                const matchesTransmission =
                    !transmission ||
                    transmission === "all" ||
                    car.transmission ===
                        transmission;


                const matchesFuel =
                    !fuel ||
                    fuel === "all" ||
                    car.fuel === fuel;


                const matchesPrice =
                    matchPrice(
                        car.price,
                        price
                    );


                return (
                    matchesSearch &&
                    matchesBrand &&
                    matchesTransmission &&
                    matchesFuel &&
                    matchesPrice
                );

            }
        );


    applySorting();

    renderCars();

}


/* =========================================================
   PRICE FILTER
   ========================================================= */

function matchPrice(
    price,
    selectedPrice
) {

    if (
        !selectedPrice ||
        selectedPrice === "all"
    ) {

        return true;

    }


    const value =
        Number(price) || 0;


    switch (
        selectedPrice
    ) {

        case "0-15000":

            return value <= 15000;


        case "15000-20000":

            return (
                value > 15000 &&
                value <= 20000
            );


        case "20000-25000":

            return (
                value > 20000 &&
                value <= 25000
            );


        case "25000+":

            return value > 25000;


        default:

            return true;

    }

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const search =
        document.querySelector(
            "#carSearch, #searchCars"
        );


    if (!search) return;


    search.addEventListener(
        "input",
        debounce(
            applyFilters,
            250
        )
    );

}


/* =========================================================
   SORT
   ========================================================= */

function setupSort() {

    const sort =
        document.querySelector(
            "#sortCars"
        );


    if (!sort) return;


    sort.addEventListener(
        "change",
        () => {

            applySorting();

            renderCars();

        }
    );

}


/* =========================================================
   APPLY SORTING
   ========================================================= */

function applySorting() {

    const sort =
        getValue(
            "#sortCars"
        );


    switch (
        sort
    ) {

        case "price-low":

            filteredCars.sort(
                (
                    a,
                    b
                ) =>
                    Number(a.price) -
                    Number(b.price)
            );

            break;


        case "price-high":

            filteredCars.sort(
                (
                    a,
                    b
                ) =>
                    Number(b.price) -
                    Number(a.price)
            );

            break;


        case "rating":

            filteredCars.sort(
                (
                    a,
                    b
                ) =>
                    Number(b.rating || 0) -
                    Number(a.rating || 0)
            );

            break;


        case "name":

            filteredCars.sort(
                (
                    a,
                    b
                ) =>
                    String(
                        a.name
                    ).localeCompare(
                        String(
                            b.name
                        )
                    )
            );

            break;


        default:

            break;

    }

}


/* =========================================================
   WISHLIST
   ========================================================= */

function getWishlist() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_CARS.storage.wishlist
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
        LUXORA_CARS.storage.wishlist,
        JSON.stringify(
            wishlist
        )
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


    const id =
        String(car.id);


    const exists =
        wishlist.some(
            item =>
                String(item) ===
                id
        );


    if (exists) {

        wishlist =
            wishlist.filter(
                item =>
                    String(item) !==
                    id
            );


        showNotification(
            `${car.name} removed from wishlist`,
            "success"
        );

    } else {

        wishlist.push(
            car.id
        );


        showNotification(
            `${car.name} added to wishlist`,
            "success"
        );

    }


    saveWishlist(
        wishlist
    );


    updateWishlistButtons();

    updateWishlistCount();

}


/* =========================================================
   UPDATE WISHLIST BUTTONS
   ========================================================= */

function updateWishlistButtons() {

    const wishlist =
        getWishlist();


    document
        .querySelectorAll(
            "[data-wishlist-id]"
        )
        .forEach(
            button => {

                const id =
                    String(
                        button.dataset
                            .wishlistId
                    );


                const active =
                    wishlist.some(
                        item =>
                            String(item) ===
                            id
                    );


                button.classList.toggle(
                    "active",
                    active
                );


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        active
                            ? "fa-solid fa-heart"
                            : "fa-regular fa-heart";

                }

            }
        );

}


/* =========================================================
   WISHLIST COUNT
   ========================================================= */

function updateWishlistCount() {

    const count =
        getWishlist().length;


    document
        .querySelectorAll(
            ".wishlist-count, #wishlistCount"
        )
        .forEach(
            element => {

                element.textContent =
                    count;

                element.style.display =
                    count > 0
                        ? "inline-flex"
                        : "none";

            }
        );

}


/* =========================================================
   RESULTS COUNT
   ========================================================= */

function updateResultsCount() {

    const count =
        filteredCars.length;


    document
        .querySelectorAll(
            "#resultsCount, .results-count"
        )
        .forEach(
            element => {

                element.textContent =
                    `${count} ${
                        count === 1
                            ? "Car"
                            : "Cars"
                    }`;

            }
        );

}


/* =========================================================
   NO CARS
   ========================================================= */

function showNoCars(
    container
) {

    container.innerHTML = `

        <div class="no-cars">

            <div class="no-cars-icon">

                <i class="fa-solid fa-car-side"></i>

            </div>

            <h3>
                No Cars Found
            </h3>

            <p>
                Try changing your search
                or filter options.
            </p>

            <button
                type="button"
                id="clearFilters"
                class="btn btn-gold"
            >
                Clear Filters
            </button>

        </div>

    `;


    const clearButton =
        document.querySelector(
            "#clearFilters"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFilters
        );

    }

}


/* =========================================================
   CLEAR FILTERS
   ========================================================= */

function clearFilters() {

    const selectors = [

        "#carSearch",
        "#searchCars",
        "#brandFilter",
        "#transmissionFilter",
        "#fuelFilter",
        "#priceFilter",
        "#sortCars"

    ];


    selectors.forEach(
        selector => {

            const element =
                document.querySelector(
                    selector
                );


            if (!element) return;


            if (
                element.tagName ===
                "SELECT"
            ) {

                element.value =
                    "all";

            } else {

                element.value =
                    "";

            }

        }
    );


    filteredCars =
        [...luxoraCars];


    renderCars();

}


/* =========================================================
   ERROR
   ========================================================= */

function showCarsError() {

    const container =
        document.querySelector(
            "#carsContainer"
        );


    if (!container) return;


    container.innerHTML = `

        <div class="no-cars">

            <div class="no-cars-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h3>
                Unable to Load Cars
            </h3>

            <p>
                Please make sure cars.json
                is available.
            </p>

            <button
                type="button"
                class="btn btn-gold"
                onclick="location.reload()"
            >
                Try Again
            </button>

        </div>

    `;

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


    menu
        .querySelectorAll(
            "a"
        )
        .forEach(
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
   GET VALUE
   ========================================================= */

function getValue(
    selector
) {

    const element =
        document.querySelector(
            selector
        );


    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
    callback,
    delay
) {

    let timer;


    return function () {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                () => {

                    callback.apply(
                        this,
                        arguments
                    );

                },
                delay
            );

    };

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
        2500
    );

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
            >

                <rect
                    width="1200"
                    height="700"
                    fill="#111111"
                />

                <text
                    x="600"
                    y="340"
                    text-anchor="middle"
                    fill="#c9a227"
                    font-size="48"
                    font-family="Arial"
                >
                    LUXORA
                </text>

                <text
                    x="600"
                    y="390"
                    text-anchor="middle"
                    fill="#999999"
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

window.LUXORA_CARS_API = {

    loadCars,

    findCar,

    selectCar,

    getWishlist,

    saveWishlist,

    toggleWishlist,

    applyFilters,

    clearFilters,

    formatINR

};