"use strict";

/* =========================================================
   LUXORA - BOOKINGS JAVASCRIPT
   File: js/bookings.js
   ========================================================= */

const LUXORA_BOOKINGS = {

    data: {
        cars: "../data/cars.json",
        locations: "../data/locations.json",
        bookings: "../data/bookings.json"
    },

    storage: {
        selectedCar: "luxoraSelectedCar",
        booking: "luxoraBooking",
        bookings: "luxoraBookings",
        lastBooking: "luxoraLastBooking"
    },

    prices: {
        insurance: 1500,
        driver: 3000,
        childSeat: 500,
        delivery: 1000,
        serviceFee: 500
    }

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initBookings();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initBookings() {

    setupMobileMenu();

    setupDateFields();

    setupBookingForm();

    setupServiceCalculations();

    setupLocationFields();

    await loadBookingData();

    loadSelectedCar();

    calculateBooking();

}


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let luxoraCars = [];
let luxoraLocations = [];
let luxoraJsonBookings = [];


/* =========================================================
   LOAD DATA
   ========================================================= */

async function loadBookingData() {

    try {

        const [
            cars,
            locations,
            bookings
        ] = await Promise.all([

            loadJSON(
                LUXORA_BOOKINGS.data.cars
            ),

            loadJSON(
                LUXORA_BOOKINGS.data.locations
            ),

            loadJSON(
                LUXORA_BOOKINGS.data.bookings
            )

        ]);


        luxoraCars =
            cars || [];

        luxoraLocations =
            locations || [];

        luxoraJsonBookings =
            bookings || [];


    } catch (error) {

        console.error(
            "Booking data loading error:",
            error
        );

    }

}


/* =========================================================
   LOAD JSON
   ========================================================= */

async function loadJSON(url) {

    try {

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Unable to load ${url}`
            );

        }

        return await response.json();

    } catch (error) {

        console.error(error);

        return [];

    }

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

}


/* =========================================================
   LOAD SELECTED CAR
   ========================================================= */

function loadSelectedCar() {

    const selectedId =
        localStorage.getItem(
            LUXORA_BOOKINGS.storage.selectedCar
        );

    const storedBooking =
        getStoredBooking();


    let car = null;


    if (selectedId) {

        car =
            luxoraCars.find(
                item =>
                    String(item.id) ===
                    String(selectedId)
            );

    }


    if (!car && storedBooking) {

        car =
            luxoraCars.find(
                item =>
                    item.name ===
                    storedBooking.carName
            );

    }


    if (!car) {

        car =
            luxoraCars.find(
                item =>
                    item.name ===
                    "BMW 7 Series"
            );

    }


    if (!car) return;


    window.luxoraSelectedCar =
        car;


    displaySelectedCar(car);

}


/* =========================================================
   DISPLAY SELECTED CAR
   ========================================================= */

function displaySelectedCar(car) {

    const image =
        document.querySelector(
            "#selectedCarImage"
        );

    const name =
        document.querySelector(
            "#selectedCarName"
        );

    const brand =
        document.querySelector(
            "#selectedCarBrand"
        );

    const price =
        document.querySelector(
            "#selectedCarPrice"
        );


    if (image) {

        image.src =
            car.image;

        image.alt =
            car.name;

    }


    if (name) {

        name.textContent =
            car.name;

    }


    if (brand) {

        brand.textContent =
            car.brand;

    }


    if (price) {

        price.textContent =
            formatINR(car.price);

    }


    document
        .querySelectorAll(
            "[data-selected-car]"
        )
        .forEach(element => {

            element.textContent =
                car.name;

        });


    document
        .querySelectorAll(
            "[data-car-price]"
        )
        .forEach(element => {

            element.textContent =
                formatINR(car.price);

        });

}


/* =========================================================
   LOCATION FIELDS
   ========================================================= */

function setupLocationFields() {

    const pickup =
        document.querySelector(
            "#pickupLocation"
        );

    const returnLocation =
        document.querySelector(
            "#returnLocation"
        );


    if (!pickup && !returnLocation) {
        return;
    }


    if (pickup) {

        pickup.innerHTML = `
            <option value="">
                Select Pickup Location
            </option>
        `;

    }


    if (returnLocation) {

        returnLocation.innerHTML = `
            <option value="">
                Select Return Location
            </option>
        `;

    }


    luxoraLocations
        .filter(
            location =>
                location.available === true
        )
        .forEach(location => {

            const label =
                `${location.name} - ${location.city}`;


            if (pickup) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    location.name;

                option.textContent =
                    label;

                pickup.appendChild(
                    option
                );

            }


            if (returnLocation) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    location.name;

                option.textContent =
                    label;

                returnLocation.appendChild(
                    option
                );

            }

        });


    const storedBooking =
        getStoredBooking();


    if (storedBooking) {

        if (pickup) {

            pickup.value =
                storedBooking.pickupLocation ||
                "";

        }


        if (returnLocation) {

            returnLocation.value =
                storedBooking.returnLocation ||
                "";

        }

    }

}


/* =========================================================
   DATE FIELDS
   ========================================================= */

function setupDateFields() {

    const pickupDate =
        document.querySelector(
            "#pickupDate"
        );

    const returnDate =
        document.querySelector(
            "#returnDate"
        );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    if (pickupDate) {

        pickupDate.min =
            today;

    }


    if (returnDate) {

        returnDate.min =
            today;

    }


    if (pickupDate) {

        pickupDate.addEventListener(
            "change",
            () => {

                if (returnDate) {

                    returnDate.min =
                        pickupDate.value;

                    if (
                        returnDate.value &&
                        returnDate.value <
                        pickupDate.value
                    ) {

                        returnDate.value =
                            pickupDate.value;

                    }

                }

                calculateBooking();

            }
        );

    }


    if (returnDate) {

        returnDate.addEventListener(
            "change",
            calculateBooking
        );

    }


    const storedBooking =
        getStoredBooking();


    if (storedBooking) {

        if (pickupDate) {

            pickupDate.value =
                storedBooking.pickupDate ||
                "";

        }


        if (returnDate) {

            returnDate.value =
                storedBooking.returnDate ||
                "";

        }

    }

}


/* =========================================================
   SERVICE CALCULATION EVENTS
   ========================================================= */

function setupServiceCalculations() {

    document
        .querySelectorAll(
            'input[type="checkbox"]'
        )
        .forEach(checkbox => {

            checkbox.addEventListener(
                "change",
                calculateBooking
            );

        });

}


/* =========================================================
   BOOKING CALCULATION
   ========================================================= */

function calculateBooking() {

    const car =
        window.luxoraSelectedCar;

    if (!car) return;


    const pickupDate =
        getValue(
            "#pickupDate"
        );

    const returnDate =
        getValue(
            "#returnDate"
        );


    const days =
        calculateDays(
            pickupDate,
            returnDate
        );


    const carRental =
        Number(car.price || 0) *
        days;


    const insurance =
        isChecked(
            "#insurance"
        )
            ? LUXORA_BOOKINGS.prices.insurance *
              days
            : 0;


    const driver =
        isChecked(
            "#driver"
        )
            ? LUXORA_BOOKINGS.prices.driver *
              days
            : 0;


    const childSeat =
        isChecked(
            "#childSeat"
        )
            ? LUXORA_BOOKINGS.prices.childSeat
            : 0;


    const delivery =
        isChecked(
            "#delivery"
        )
            ? LUXORA_BOOKINGS.prices.delivery
            : 0;


    const serviceFee =
        LUXORA_BOOKINGS.prices.serviceFee;


    const total =
        carRental +
        insurance +
        driver +
        childSeat +
        delivery +
        serviceFee;


    updateBookingSummary({
        days,
        carRental,
        insurance,
        driver,
        childSeat,
        delivery,
        serviceFee,
        total
    });

}


/* =========================================================
   UPDATE SUMMARY
   ========================================================= */

function updateBookingSummary(data) {

    setText(
        "#rentalDays",
        `${data.days} ${
            data.days === 1
                ? "Day"
                : "Days"
        }`
    );


    setText(
        "#summaryDays",
        data.days
    );


    setText(
        "#carRental",
        formatINR(
            data.carRental
        )
    );


    setText(
        "#insurancePrice",
        formatINR(
            data.insurance
        )
    );


    setText(
        "#driverPrice",
        formatINR(
            data.driver
        )
    );


    setText(
        "#childSeatPrice",
        formatINR(
            data.childSeat
        )
    );


    setText(
        "#deliveryPrice",
        formatINR(
            data.delivery
        )
    );


    setText(
        "#serviceFee",
        formatINR(
            data.serviceFee
        )
    );


    setText(
        "#totalPrice",
        formatINR(
            data.total
        )
    );


    document
        .querySelectorAll(
            "[data-total-price]"
        )
        .forEach(element => {

            element.textContent =
                formatINR(
                    data.total
                );

        });

}


/* =========================================================
   BOOKING FORM
   ========================================================= */

function setupBookingForm() {

    const form =
        document.querySelector(
            "#bookingForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            submitBooking(form);

        }
    );

}


/* =========================================================
   SUBMIT BOOKING
   ========================================================= */

function submitBooking(form) {

    const car =
        window.luxoraSelectedCar;


    if (!car) {

        showMessage(
            "Please select a car first.",
            "error"
        );

        return;

    }


    const pickupLocation =
        getValue(
            "#pickupLocation"
        );

    const returnLocation =
        getValue(
            "#returnLocation"
        );

    const pickupDate =
        getValue(
            "#pickupDate"
        );

    const pickupTime =
        getValue(
            "#pickupTime"
        );

    const returnDate =
        getValue(
            "#returnDate"
        );

    const returnTime =
        getValue(
            "#returnTime"
        );

    const name =
        getValue(
            "#driverName, #name"
        );

    const phone =
        getValue(
            "#phone"
        );

    const email =
        getValue(
            "#email"
        );

    const license =
        getValue(
            "#license"
        );

    const specialRequest =
        getValue(
            "#specialRequest"
        );


    /* Validation */

    if (!pickupLocation) {

        showMessage(
            "Please select pickup location.",
            "error"
        );

        return;

    }


    if (!returnLocation) {

        showMessage(
            "Please select return location.",
            "error"
        );

        return;

    }


    if (!pickupDate) {

        showMessage(
            "Please select pickup date.",
            "error"
        );

        return;

    }


    if (!returnDate) {

        showMessage(
            "Please select return date.",
            "error"
        );

        return;

    }


    if (
        new Date(returnDate) <
        new Date(pickupDate)
    ) {

        showMessage(
            "Return date cannot be before pickup date.",
            "error"
        );

        return;

    }


    if (!name) {

        showMessage(
            "Please enter your name.",
            "error"
        );

        return;

    }


    if (!phone) {

        showMessage(
            "Please enter your phone number.",
            "error"
        );

        return;

    }


    if (!email) {

        showMessage(
            "Please enter your email.",
            "error"
        );

        return;

    }


    const terms =
        document.querySelector(
            "#terms"
        );


    if (
        terms &&
        !terms.checked
    ) {

        showMessage(
            "Please accept the booking terms.",
            "error"
        );

        return;

    }


    const days =
        calculateDays(
            pickupDate,
            returnDate
        );


    const carRental =
        Number(car.price) *
        days;


    const insurance =
        isChecked("#insurance")
            ? LUXORA_BOOKINGS.prices.insurance *
              days
            : 0;


    const driver =
        isChecked("#driver")
            ? LUXORA_BOOKINGS.prices.driver *
              days
            : 0;


    const childSeat =
        isChecked("#childSeat")
            ? LUXORA_BOOKINGS.prices.childSeat
            : 0;


    const delivery =
        isChecked("#delivery")
            ? LUXORA_BOOKINGS.prices.delivery
            : 0;


    const serviceFee =
        LUXORA_BOOKINGS.prices.serviceFee;


    const total =
        carRental +
        insurance +
        driver +
        childSeat +
        delivery +
        serviceFee;


    const booking = {

        id:
            generateBookingId(),

        carId:
            car.id,

        carName:
            car.name,

        brand:
            car.brand,

        pricePerDay:
            car.price,

        carImage:
            car.image,

        pickupLocation:
            pickupLocation,

        returnLocation:
            returnLocation,

        pickupDate:
            pickupDate,

        pickupTime:
            pickupTime,

        returnDate:
            returnDate,

        returnTime:
            returnTime,

        days:
            days,

        name:
            name,

        phone:
            phone,

        email:
            email,

        license:
            license,

        specialRequest:
            specialRequest,

        insurance:
            isChecked("#insurance"),

        driver:
            isChecked("#driver"),

        childSeat:
            isChecked("#childSeat"),

        delivery:
            isChecked("#delivery"),

        pricing: {

            carRental:
                carRental,

            insurance:
                insurance,

            driver:
                driver,

            childSeat:
                childSeat,

            delivery:
                delivery,

            serviceFee:
                serviceFee,

            total:
                total

        },

        status:
            "Pending",

        paymentStatus:
            "Pending",

        createdAt:
            new Date().toISOString()

    };


    /* Save current booking */

    localStorage.setItem(
        LUXORA_BOOKINGS.storage.booking,
        JSON.stringify(booking)
    );


    /* Save to local booking history */

    const localBookings =
        getLocalBookings();


    localBookings.push(
        booking
    );


    localStorage.setItem(
        LUXORA_BOOKINGS.storage.bookings,
        JSON.stringify(
            localBookings
        )
    );


    /* Continue to payment */

    window.location.href =
        "payment.html";

}


/* =========================================================
   GET STORED BOOKING
   ========================================================= */

function getStoredBooking() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_BOOKINGS.storage.booking
            )
        );

    } catch {

        return null;

    }

}


/* =========================================================
   GET LOCAL BOOKINGS
   ========================================================= */

function getLocalBookings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_BOOKINGS.storage.bookings
            )
        ) || [];

    } catch {

        return [];

    }

}


/* =========================================================
   GENERATE BOOKING ID
   ========================================================= */

function generateBookingId() {

    const random =
        Math.floor(
            10000 +
            Math.random() *
            90000
        );

    return `LX-${random}`;

}


/* =========================================================
   CALCULATE DAYS
   ========================================================= */

function calculateDays(
    startDate,
    endDate
) {

    if (
        !startDate ||
        !endDate
    ) {

        return 1;

    }


    const start =
        new Date(startDate);

    const end =
        new Date(endDate);


    const difference =
        end.getTime() -
        start.getTime();


    if (difference < 0) {

        return 1;

    }


    return Math.max(
        1,
        Math.ceil(
            difference /
            (1000 * 60 * 60 * 24)
        )
    );

}


/* =========================================================
   VALUE HELPER
   ========================================================= */

function getValue(selector) {

    const element =
        document.querySelector(
            selector
        );

    return element
        ? element.value.trim()
        : "";

}


/* =========================================================
   TEXT HELPER
   ========================================================= */

function setText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   CHECKBOX HELPER
   ========================================================= */

function isChecked(selector) {

    const element =
        document.querySelector(
            selector
        );

    return element
        ? element.checked
        : false;

}


/* =========================================================
   INR FORMAT
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
   SHOW MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "error"
) {

    let box =
        document.querySelector(
            ".booking-message"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );

        box.className =
            "booking-message";

        const form =
            document.querySelector(
                "#bookingForm"
            );

        if (form) {

            form.prepend(
                box
            );

        } else {

            document.body.prepend(
                box
            );

        }

    }


    box.textContent =
        message;

    box.className =
        `booking-message ${type}`;

    box.style.display =
        "block";


    setTimeout(() => {

        box.style.display =
            "none";

    }, 3500);

}


/* =========================================================
   LOAD EXISTING BOOKING INTO FORM
   ========================================================= */

function loadBookingIntoForm() {

    const booking =
        getStoredBooking();

    if (!booking) return;


    setInputValue(
        "#pickupLocation",
        booking.pickupLocation
    );

    setInputValue(
        "#returnLocation",
        booking.returnLocation
    );

    setInputValue(
        "#pickupDate",
        booking.pickupDate
    );

    setInputValue(
        "#pickupTime",
        booking.pickupTime
    );

    setInputValue(
        "#returnDate",
        booking.returnDate
    );

    setInputValue(
        "#returnTime",
        booking.returnTime
    );

    setInputValue(
        "#driverName, #name",
        booking.name
    );

    setInputValue(
        "#phone",
        booking.phone
    );

    setInputValue(
        "#email",
        booking.email
    );

    setInputValue(
        "#license",
        booking.license
    );

    setInputValue(
        "#specialRequest",
        booking.specialRequest
    );


    setCheckbox(
        "#insurance",
        booking.insurance
    );

    setCheckbox(
        "#driver",
        booking.driver
    );

    setCheckbox(
        "#childSeat",
        booking.childSeat
    );

    setCheckbox(
        "#delivery",
        booking.delivery
    );


    calculateBooking();

}


/* =========================================================
   INPUT VALUE
   ========================================================= */

function setInputValue(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (element) {

        element.value =
            value || "";

    }

}


/* =========================================================
   CHECKBOX VALUE
   ========================================================= */

function setCheckbox(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (element) {

        element.checked =
            Boolean(value);

    }

}


/* =========================================================
   SAVE BOOKING
   ========================================================= */

function saveBooking(booking) {

    localStorage.setItem(
        LUXORA_BOOKINGS.storage.booking,
        JSON.stringify(
            booking
        )
    );


    const bookings =
        getLocalBookings();


    const existingIndex =
        bookings.findIndex(
            item =>
                item.id ===
                booking.id
        );


    if (
        existingIndex >= 0
    ) {

        bookings[
            existingIndex
        ] = booking;

    } else {

        bookings.push(
            booking
        );

    }


    localStorage.setItem(
        LUXORA_BOOKINGS.storage.bookings,
        JSON.stringify(
            bookings
        )
    );

}


/* =========================================================
   EXPORT
   ========================================================= */

window.LUXORA_BOOKINGS_API = {

    calculateBooking,

    submitBooking,

    getStoredBooking,

    getLocalBookings,

    saveBooking,

    calculateDays,

    formatINR,

    generateBookingId

};