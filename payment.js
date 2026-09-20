"use strict";

/* =========================================================
   LUXORA - PAYMENT JAVASCRIPT
   File: js/payment.js

   NOTE:
   This is a FRONTEND DEMO payment system.
   It does NOT process real money.
   ========================================================= */

const LUXORA_PAYMENT = {

    storage: {
        booking: "luxoraBooking",
        bookings: "luxoraBookings",
        lastBooking: "luxoraLastBooking",
        paymentStatus: "luxoraPaymentStatus"
    },

    pages: {
        success: "payment-success.html"
    }

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initPayment();

    }
);


/* =========================================================
   INITIALIZE PAYMENT
   ========================================================= */

function initPayment() {

    const booking =
        getBooking();


    if (!booking) {

        showNoBooking();

        return;

    }


    window.luxoraCurrentBooking =
        booking;


    renderBookingSummary(
        booking
    );


    setupPaymentTabs();

    setupCardForm();

    setupUPIForm();

    setupBankForm();

    setupPaymentButton();

    setupCardFormatting();

    setupInputValidation();

}


/* =========================================================
   GET BOOKING
   ========================================================= */

function getBooking() {

    try {

        const data =
            localStorage.getItem(
                LUXORA_PAYMENT.storage.booking
            );


        if (!data) {

            return null;

        }


        return JSON.parse(
            data
        );


    } catch (error) {

        console.error(
            "Booking data error:",
            error
        );


        return null;

    }

}


/* =========================================================
   RENDER BOOKING SUMMARY
   ========================================================= */

function renderBookingSummary(
    booking
) {

    const pricing =
        booking.pricing || {};


    const carPrice =
        Number(
            pricing.carRental ??
            booking.carRental ??
            (
                Number(
                    booking.pricePerDay
                ) *
                Number(
                    booking.days || 1
                )
            )
        );


    const insurance =
        Number(
            pricing.insurance ??
            (
                booking.insurance
                    ? 1500 *
                      Number(
                          booking.days || 1
                      )
                    : 0
            )
        );


    const driver =
        Number(
            pricing.driver ??
            (
                booking.driver
                    ? 3000 *
                      Number(
                          booking.days || 1
                      )
                    : 0
            )
        );


    const childSeat =
        Number(
            pricing.childSeat ??
            (
                booking.childSeat
                    ? 500
                    : 0
            )
        );


    const delivery =
        Number(
            pricing.delivery ??
            (
                booking.delivery
                    ? 1000
                    : 0
            )
        );


    const serviceFee =
        Number(
            pricing.serviceFee ??
            500
        );


    const total =
        Number(
            pricing.total ??
            booking.total ??
            (
                carPrice +
                insurance +
                driver +
                childSeat +
                delivery +
                serviceFee
            )
        );


    /* -----------------------------
       Car
    ----------------------------- */

    setText(
        "#paymentCarName",
        booking.carName || "Luxury Car"
    );


    setText(
        "#paymentCarBrand",
        booking.brand || ""
    );


    setText(
        "#paymentCarPrice",
        formatINR(
            booking.pricePerDay || 0
        )
    );


    const carImage =
        document.querySelector(
            "#paymentCarImage"
        );


    if (
        carImage &&
        booking.carImage
    ) {

        carImage.src =
            booking.carImage;

        carImage.alt =
            booking.carName ||
            "Luxury Car";

    }


    /* -----------------------------
       Rental Details
    ----------------------------- */

    setText(
        "#paymentPickupLocation",
        booking.pickupLocation || "—"
    );


    setText(
        "#paymentReturnLocation",
        booking.returnLocation || "—"
    );


    setText(
        "#paymentPickupDate",
        formatDate(
            booking.pickupDate
        )
    );


    setText(
        "#paymentReturnDate",
        formatDate(
            booking.returnDate
        )
    );


    setText(
        "#paymentPickupTime",
        booking.pickupTime || "—"
    );


    setText(
        "#paymentReturnTime",
        booking.returnTime || "—"
    );


    setText(
        "#paymentDays",
        `${booking.days || 1} ${
            Number(booking.days || 1) === 1
                ? "Day"
                : "Days"
        }`
    );


    /* -----------------------------
       Pricing
    ----------------------------- */

    setText(
        "#paymentCarRental",
        formatINR(
            carPrice
        )
    );


    setText(
        "#paymentInsurance",
        formatINR(
            insurance
        )
    );


    setText(
        "#paymentDriver",
        formatINR(
            driver
        )
    );


    setText(
        "#paymentChildSeat",
        formatINR(
            childSeat
        )
    );


    setText(
        "#paymentDelivery",
        formatINR(
            delivery
        )
    );


    setText(
        "#paymentServiceFee",
        formatINR(
            serviceFee
        )
    );


    setText(
        "#paymentTotal",
        formatINR(
            total
        )
    );


    document
        .querySelectorAll(
            "[data-payment-total]"
        )
        .forEach(
            element => {

                element.textContent =
                    formatINR(
                        total
                    );

            }
        );


    /* -----------------------------
       Optional pricing rows
    ----------------------------- */

    togglePriceRow(
        "#insuranceRow",
        insurance > 0
    );


    togglePriceRow(
        "#driverRow",
        driver > 0
    );


    togglePriceRow(
        "#childSeatRow",
        childSeat > 0
    );


    togglePriceRow(
        "#deliveryRow",
        delivery > 0
    );

}


/* =========================================================
   PAYMENT TABS
   ========================================================= */

function setupPaymentTabs() {

    const tabs =
        document.querySelectorAll(
            "[data-payment-method]"
        );


    const panels =
        document.querySelectorAll(
            ".payment-panel"
        );


    if (!tabs.length) return;


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    const method =
                        tab.dataset
                            .paymentMethod;


                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    panels.forEach(
                        panel => {

                            panel.classList.remove(
                                "active"
                            );


                            const panelMethod =
                                panel.dataset
                                    .paymentPanel;


                            if (
                                panelMethod ===
                                method
                            ) {

                                panel.classList.add(
                                    "active"
                                );

                            }

                        }
                    );


                    setPaymentMethod(
                        method
                    );

                }
            );

        }
    );

}


/* =========================================================
   CURRENT PAYMENT METHOD
   ========================================================= */

let currentPaymentMethod =
    "card";


function setPaymentMethod(
    method
) {

    currentPaymentMethod =
        method || "card";


    const hiddenInput =
        document.querySelector(
            "#paymentMethod"
        );


    if (hiddenInput) {

        hiddenInput.value =
            currentPaymentMethod;

    }

}


/* =========================================================
   CARD FORM
   ========================================================= */

function setupCardForm() {

    const cardForm =
        document.querySelector(
            "#cardPaymentForm"
        );


    if (!cardForm) return;


    cardForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            processPayment();

        }
    );

}


/* =========================================================
   UPI FORM
   ========================================================= */

function setupUPIForm() {

    const upiForm =
        document.querySelector(
            "#upiPaymentForm"
        );


    if (!upiForm) return;


    upiForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            processPayment();

        }
    );

}


/* =========================================================
   BANK FORM
   ========================================================= */

function setupBankForm() {

    const bankForm =
        document.querySelector(
            "#bankPaymentForm"
        );


    if (!bankForm) return;


    bankForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            processPayment();

        }
    );

}


/* =========================================================
   PAYMENT BUTTON
   ========================================================= */

function setupPaymentButton() {

    const buttons =
        document.querySelectorAll(
            "#payNowBtn, #paymentButton, [data-pay-now]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    processPayment();

                }
            );

        }
    );

}


/* =========================================================
   PROCESS PAYMENT
   ========================================================= */

function processPayment() {

    const booking =
        getBooking();


    if (!booking) {

        showPaymentMessage(
            "Booking information not found.",
            "error"
        );

        return;

    }


    if (
        !validatePaymentMethod()
    ) {

        return;

    }


    if (
        window.luxoraPaymentProcessing
    ) {

        return;

    }


    window.luxoraPaymentProcessing =
        true;


    showProcessingOverlay();


    /*
       Demo payment processing.

       This does NOT charge a real card,
       UPI or bank account.
    */

    const processingTime =
        2200;


    setTimeout(
        () => {

            completePayment(
                booking
            );

        },
        processingTime
    );

}


/* =========================================================
   VALIDATE PAYMENT METHOD
   ========================================================= */

function validatePaymentMethod() {

    switch (
        currentPaymentMethod
    ) {

        case "card":

            return validateCard();


        case "upi":

            return validateUPI();


        case "netbanking":

            return validateBank();


        default:

            showPaymentMessage(
                "Please select a payment method.",
                "error"
            );

            return false;

    }

}


/* =========================================================
   CARD VALIDATION
   ========================================================= */

function validateCard() {

    const cardNumber =
        getValue(
            "#cardNumber"
        ).replace(
            /\s/g,
            ""
        );


    const cardName =
        getValue(
            "#cardName"
        );


    const expiry =
        getValue(
            "#cardExpiry"
        );


    const cvv =
        getValue(
            "#cardCVV"
        );


    if (
        cardNumber.length !== 16 ||
        !/^\d+$/.test(
            cardNumber
        )
    ) {

        showPaymentMessage(
            "Please enter a valid 16-digit card number.",
            "error"
        );

        return false;

    }


    if (
        !cardName ||
        cardName.length < 2
    ) {

        showPaymentMessage(
            "Please enter the cardholder name.",
            "error"
        );

        return false;

    }


    if (
        !/^\d{2}\/\d{2}$/.test(
            expiry
        )
    ) {

        showPaymentMessage(
            "Please enter expiry date as MM/YY.",
            "error"
        );

        return false;

    }


    if (
        !/^\d{3,4}$/.test(
            cvv
        )
    ) {

        showPaymentMessage(
            "Please enter a valid CVV.",
            "error"
        );

        return false;

    }


    return true;

}


/* =========================================================
   UPI VALIDATION
   ========================================================= */

function validateUPI() {

    const upi =
        getValue(
            "#upiId, #upi"
        );


    if (!upi) {

        showPaymentMessage(
            "Please enter your UPI ID.",
            "error"
        );

        return false;

    }


    /*
       Demo UPI format:
       name@bank
    */

    if (
        !/^[\w.-]+@[\w.-]+$/.test(
            upi
        )
    ) {

        showPaymentMessage(
            "Please enter a valid UPI ID.",
            "error"
        );

        return false;

    }


    return true;

}


/* =========================================================
   BANK VALIDATION
   ========================================================= */

function validateBank() {

    const bank =
        document.querySelector(
            "#bankName, #bankSelect"
        );


    if (
        !bank ||
        !bank.value
    ) {

        showPaymentMessage(
            "Please select your bank.",
            "error"
        );

        return false;

    }


    return true;

}


/* =========================================================
   CARD FORMATTING
   ========================================================= */

function setupCardFormatting() {

    const cardNumber =
        document.querySelector(
            "#cardNumber"
        );


    const expiry =
        document.querySelector(
            "#cardExpiry"
        );


    const cvv =
        document.querySelector(
            "#cardCVV"
        );


    if (cardNumber) {

        cardNumber.addEventListener(
            "input",
            () => {

                let value =
                    cardNumber.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            16
                        );


                value =
                    value.replace(
                        /(.{4})/g,
                        "$1 "
                    )
                        .trim();


                cardNumber.value =
                    value;


                updateCardVisual();

            }
        );

    }


    if (expiry) {

        expiry.addEventListener(
            "input",
            () => {

                let value =
                    expiry.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            4
                        );


                if (
                    value.length >= 3
                ) {

                    value =
                        value.slice(
                            0,
                            2
                        ) +
                        "/" +
                        value.slice(
                            2
                        );

                }


                expiry.value =
                    value;


                updateCardVisual();

            }
        );

    }


    if (cvv) {

        cvv.addEventListener(
            "input",
            () => {

                cvv.value =
                    cvv.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            4
                        );

            }
        );

    }

}


/* =========================================================
   CARD VISUAL
   ========================================================= */

function updateCardVisual() {

    const cardNumber =
        getValue(
            "#cardNumber"
        );


    const cardName =
        getValue(
            "#cardName"
        );


    const expiry =
        getValue(
            "#cardExpiry"
        );


    setText(
        "#visualCardNumber",
        cardNumber ||
        "•••• •••• •••• ••••"
    );


    setText(
        "#visualCardName",
        cardName ||
        "CARD HOLDER"
    );


    setText(
        "#visualCardExpiry",
        expiry ||
        "MM/YY"
    );

}


/* =========================================================
   INPUT LIVE VALIDATION
   ========================================================= */

function setupInputValidation() {

    document
        .querySelectorAll(
            "#cardName, #upiId, #upi, #bankName, #bankSelect"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    () => {

                        input.classList.remove(
                            "input-error"
                        );

                    }
                );

            }
        );


    const cardName =
        document.querySelector(
            "#cardName"
        );


    if (cardName) {

        cardName.addEventListener(
            "input",
            updateCardVisual
        );

    }

}


/* =========================================================
   COMPLETE PAYMENT
   ========================================================= */

function completePayment(
    booking
) {

    const bookingId =
        booking.id ||
        generateBookingId();


    const completedBooking = {

        ...booking,

        id:
            bookingId,

        status:
            "Confirmed",

        paymentStatus:
            "Paid",

        paymentMethod:
            currentPaymentMethod,

        paidAt:
            new Date().toISOString()

    };


    /* -----------------------------
       Save last booking
    ----------------------------- */

    localStorage.setItem(
        LUXORA_PAYMENT.storage.lastBooking,
        JSON.stringify(
            completedBooking
        )
    );


    /* -----------------------------
       Update current booking
    ----------------------------- */

    localStorage.setItem(
        LUXORA_PAYMENT.storage.booking,
        JSON.stringify(
            completedBooking
        )
    );


    /* -----------------------------
       Payment status
    ----------------------------- */

    localStorage.setItem(
        LUXORA_PAYMENT.storage.paymentStatus,
        "success"
    );


    /* -----------------------------
       Update booking history
    ----------------------------- */

    updateBookingHistory(
        completedBooking
    );


    /* -----------------------------
       Success
    ----------------------------- */

    showSuccessState(
        completedBooking
    );

}


/* =========================================================
   UPDATE BOOKING HISTORY
   ========================================================= */

function updateBookingHistory(
    booking
) {

    let bookings = [];


    try {

        bookings =
            JSON.parse(
                localStorage.getItem(
                    LUXORA_PAYMENT.storage.bookings
                )
            ) || [];

    } catch {

        bookings = [];

    }


    const index =
        bookings.findIndex(
            item =>
                item.id ===
                booking.id
        );


    if (
        index >= 0
    ) {

        bookings[index] =
            booking;

    } else {

        bookings.push(
            booking
        );

    }


    localStorage.setItem(
        LUXORA_PAYMENT.storage.bookings,
        JSON.stringify(
            bookings
        )
    );

}


/* =========================================================
   PROCESSING OVERLAY
   ========================================================= */

function showProcessingOverlay() {

    let overlay =
        document.querySelector(
            "#paymentProcessing"
        );


    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );


        overlay.id =
            "paymentProcessing";


        overlay.innerHTML = `

            <div class="payment-processing-box">

                <div class="payment-spinner"></div>

                <div class="processing-icon">

                    <i class="fa-solid fa-lock"></i>

                </div>

                <h3>
                    Processing Payment
                </h3>

                <p>
                    Please wait while we
                    securely process your
                    demo payment.
                </p>

                <div class="processing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>

        `;


        document.body.appendChild(
            overlay
        );

    }


    overlay.classList.add(
        "active"
    );


    document.body.classList.add(
        "payment-processing-active"
    );

}


/* =========================================================
   HIDE PROCESSING
   ========================================================= */

function hideProcessingOverlay() {

    const overlay =
        document.querySelector(
            "#paymentProcessing"
        );


    if (overlay) {

        overlay.classList.remove(
            "active"
        );

    }


    document.body.classList.remove(
        "payment-processing-active"
    );

}


/* =========================================================
   SUCCESS STATE
   ========================================================= */

function showSuccessState(
    booking
) {

    hideProcessingOverlay();


    window.luxoraPaymentProcessing =
        false;


    /*
       If a custom success modal
       exists, use it.
    */

    const modal =
        document.querySelector(
            "#paymentSuccessModal"
        );


    if (modal) {

        modal.classList.add(
            "active"
        );


        setText(
            "#successBookingId",
            booking.id
        );


        setText(
            "#successAmount",
            formatINR(
                getBookingTotal(
                    booking
                )
            )
        );


        setText(
            "#successCarName",
            booking.carName
        );


        setupSuccessButton();

        return;

    }


    /*
       Otherwise redirect to
       payment-success.html
    */

    window.location.href =
        `${LUXORA_PAYMENT.pages.success}?id=${encodeURIComponent(
            booking.id
        )}`;

}


/* =========================================================
   SUCCESS BUTTON
   ========================================================= */

function setupSuccessButton() {

    const button =
        document.querySelector(
            "#successContinueBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            window.location.href =
                `${LUXORA_PAYMENT.pages.success}`;

        }
    );

}


/* =========================================================
   NO BOOKING
   ========================================================= */

function showNoBooking() {

    const container =
        document.querySelector(
            ".payment-container"
        );


    if (
        !container
    ) {

        return;

    }


    container.innerHTML = `

        <div class="payment-empty">

            <div class="payment-empty-icon">

                <i class="fa-solid fa-receipt"></i>

            </div>

            <h2>
                No Booking Found
            </h2>

            <p>
                Please select a car and
                complete the booking details
                before making payment.
            </p>

            <a
                href="cars.html"
                class="btn btn-gold"
            >
                Browse Luxury Cars
            </a>

        </div>

    `;

}


/* =========================================================
   PRICE ROW TOGGLE
   ========================================================= */

function togglePriceRow(
    selector,
    show
) {

    const row =
        document.querySelector(
            selector
        );


    if (!row) return;


    row.style.display =
        show
            ? ""
            : "none";

}


/* =========================================================
   GET BOOKING TOTAL
   ========================================================= */

function getBookingTotal(
    booking
) {

    if (
        booking.pricing &&
        booking.pricing.total
    ) {

        return Number(
            booking.pricing.total
        );

    }


    if (
        booking.total
    ) {

        return Number(
            booking.total
        );

    }


    return (
        Number(
            booking.pricePerDay || 0
        ) *
        Number(
            booking.days || 1
        )
    );

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
   SET TEXT
   ========================================================= */

function setText(
    selector,
    value
) {

    document
        .querySelectorAll(
            selector
        )
        .forEach(
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
   FORMAT DATE
   ========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "—";

    }


    const parsed =
        new Date(
            date
        );


    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {

        return date;

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
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
   PAYMENT MESSAGE
   ========================================================= */

function showPaymentMessage(
    message,
    type = "error"
) {

    let box =
        document.querySelector(
            ".payment-message"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );


        box.className =
            "payment-message";


        const container =
            document.querySelector(
                ".payment-container"
            );


        if (container) {

            container.prepend(
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
        `payment-message ${type}`;


    box.style.display =
        "block";


    setTimeout(
        () => {

            box.style.display =
                "none";

        },
        3500
    );

}


/* =========================================================
   EXPORT GLOBAL API
   ========================================================= */

window.LUXORA_PAYMENT_API = {

    getBooking,

    renderBookingSummary,

    processPayment,

    validatePaymentMethod,

    validateCard,

    validateUPI,

    validateBank,

    formatINR,

    getBookingTotal,

    generateBookingId

};