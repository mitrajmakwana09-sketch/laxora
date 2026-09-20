"use strict";

/* =========================================================
   LUXORA - PROFILE JAVASCRIPT
   File: js/profile.js
   ========================================================= */

const LUXORA_PROFILE = {

    dataFile: "data/users.json",

    storage: {
        loggedIn: "luxoraLoggedIn",
        userEmail: "luxoraUserEmail",
        currentUser: "luxoraCurrentUser",
        users: "luxoraUsers",
        bookings: "luxoraBookings"
    }

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initProfile();

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initProfile() {

    setupMobileMenu();

    setupProfileForm();

    setupPasswordForm();

    setupAvatarUpload();

    setupLogout();

    setupEditMode();

    setupDeleteAccount();

    const user =
        await loadCurrentUser();


    if (!user) {

        showLoginRequired();

        return;

    }


    window.luxoraCurrentUser =
        user;


    renderProfile(
        user
    );

    renderStatistics(
        user
    );

}


/* =========================================================
   LOAD CURRENT USER
   ========================================================= */

async function loadCurrentUser() {

    /* -----------------------------------------
       First check LocalStorage
    ----------------------------------------- */

    const storedUser =
        getStoredUser();


    if (storedUser) {

        return storedUser;

    }


    const email =
        localStorage.getItem(
            LUXORA_PROFILE.storage.userEmail
        );


    if (!email) {

        return null;

    }


    /* -----------------------------------------
       Try users.json
    ----------------------------------------- */

    try {

        const response =
            await fetch(
                LUXORA_PROFILE.dataFile
            );


        if (response.ok) {

            const users =
                await response.json();


            const user =
                users.find(
                    item =>
                        String(
                            item.email
                        ).toLowerCase() ===
                        String(
                            email
                        ).toLowerCase()
                );


            if (user) {

                saveCurrentUser(
                    user
                );


                return user;

            }

        }

    } catch (error) {

        console.error(
            "Profile users.json error:",
            error
        );

    }


    return null;

}


/* =========================================================
   GET STORED USER
   ========================================================= */

function getStoredUser() {

    try {

        const data =
            localStorage.getItem(
                LUXORA_PROFILE.storage.currentUser
            );


        if (!data) {

            return null;

        }


        return JSON.parse(
            data
        );

    } catch {

        return null;

    }

}


/* =========================================================
   SAVE CURRENT USER
   ========================================================= */

function saveCurrentUser(
    user
) {

    localStorage.setItem(
        LUXORA_PROFILE.storage.currentUser,
        JSON.stringify(
            user
        )
    );


    if (user.email) {

        localStorage.setItem(
            LUXORA_PROFILE.storage.userEmail,
            user.email
        );

    }


    localStorage.setItem(
        LUXORA_PROFILE.storage.loggedIn,
        "true"
    );

}


/* =========================================================
   RENDER PROFILE
   ========================================================= */

function renderProfile(
    user
) {

    /* -----------------------------------------
       Name
    ----------------------------------------- */

    setText(
        "#profileName",
        user.name || "LUXORA Member"
    );


    setText(
        "#userName",
        user.name || "LUXORA Member"
    );


    setText(
        "#profileEmail",
        user.email || "—"
    );


    setText(
        "#userEmail",
        user.email || "—"
    );


    setText(
        "#profilePhone",
        user.phone || "—"
    );


    setText(
        "#profileAddress",
        user.address || "—"
    );


    setText(
        "#profileMembership",
        user.membership || "Standard"
    );


    setText(
        "#profileRole",
        user.role || "Customer"
    );


    /* -----------------------------------------
       Form fields
    ----------------------------------------- */

    setInput(
        "#profileNameInput, #name",
        user.name
    );


    setInput(
        "#profileEmailInput, #email",
        user.email
    );


    setInput(
        "#profilePhoneInput, #phone",
        user.phone
    );


    setInput(
        "#profileAddressInput, #address",
        user.address
    );


    /* -----------------------------------------
       Profile image
    ----------------------------------------- */

    const image =
        document.querySelector(
            "#profileImage"
        );


    if (
        image &&
        user.profileImage
    ) {

        image.src =
            user.profileImage;

        image.alt =
            user.name ||
            "LUXORA User";

    }


    /* -----------------------------------------
       Preferences
    ----------------------------------------- */

    if (
        user.preferences
    ) {

        setInput(
            "#preferredCar",
            user.preferences.preferredCar
        );


        setInput(
            "#preferredLocation",
            user.preferences.preferredLocation
        );

    }


    /* -----------------------------------------
       Status
    ----------------------------------------- */

    const status =
        user.status ||
        "Active";


    document
        .querySelectorAll(
            "#profileStatus, .profile-status"
        )
        .forEach(
            element => {

                element.textContent =
                    status;

                element.classList.toggle(
                    "active",
                    String(
                        status
                    ).toLowerCase() ===
                    "active"
                );

            }
        );

}


/* =========================================================
   PROFILE STATISTICS
   ========================================================= */

function renderStatistics(
    user
) {

    const bookings =
        getBookings();


    const userEmail =
        String(
            user.email || ""
        ).toLowerCase();


    const userBookings =
        bookings.filter(
            booking => {

                const email =
                    String(
                        booking.email ||
                        booking.customer?.email ||
                        ""
                    ).toLowerCase();


                return (
                    email ===
                    userEmail
                );

            }
        );


    const totalBookings =
        userBookings.length ||
        Number(
            user.totalBookings || 0
        );


    const totalSpent =
        userBookings.reduce(
            (
                total,
                booking
            ) => {

                return (
                    total +
                    getBookingTotal(
                        booking
                    )
                );

            },
            0
        );


    const completed =
        userBookings.filter(
            booking =>
                String(
                    booking.status || ""
                ).toLowerCase() ===
                "completed"
        ).length;


    const confirmed =
        userBookings.filter(
            booking =>
                String(
                    booking.status || ""
                ).toLowerCase() ===
                "confirmed"
        ).length;


    setText(
        "#totalBookings",
        totalBookings
    );


    setText(
        "#totalSpent",
        formatINR(
            totalSpent ||
            Number(
                user.totalSpent || 0
            )
        )
    );


    setText(
        "#completedBookings",
        completed
    );


    setText(
        "#confirmedBookings",
        confirmed
    );


    /* -----------------------------------------
       Generic statistics
    ----------------------------------------- */

    document
        .querySelectorAll(
            "[data-stat-bookings]"
        )
        .forEach(
            element => {

                element.textContent =
                    totalBookings;

            }
        );


    document
        .querySelectorAll(
            "[data-stat-spent]"
        )
        .forEach(
            element => {

                element.textContent =
                    formatINR(
                        totalSpent ||
                        Number(
                            user.totalSpent || 0
                        )
                    );

            }
        );

}


/* =========================================================
   PROFILE FORM
   ========================================================= */

function setupProfileForm() {

    const form =
        document.querySelector(
            "#profileForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            updateProfile();

        }
    );

}


/* =========================================================
   UPDATE PROFILE
   ========================================================= */

function updateProfile() {

    const user =
        getStoredUser();


    if (!user) {

        showMessage(
            "Please login first.",
            "error"
        );

        return;

    }


    const name =
        getValue(
            "#profileNameInput, #name"
        );


    const email =
        getValue(
            "#profileEmailInput, #email"
        );


    const phone =
        getValue(
            "#profilePhoneInput, #phone"
        );


    const address =
        getValue(
            "#profileAddressInput, #address"
        );


    if (!name) {

        showMessage(
            "Please enter your name.",
            "error"
        );

        return;

    }


    if (
        email &&
        !validateEmail(email)
    ) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        return;

    }


    if (
        phone &&
        !validatePhone(phone)
    ) {

        showMessage(
            "Please enter a valid phone number.",
            "error"
        );

        return;

    }


    const updatedUser = {

        ...user,

        name:
            name,

        email:
            email,

        phone:
            phone,

        address:
            address

    };


    saveCurrentUser(
        updatedUser
    );


    updateLocalUserList(
        updatedUser
    );


    renderProfile(
        updatedUser
    );


    showMessage(
        "Profile updated successfully.",
        "success"
    );

}


/* =========================================================
   PASSWORD FORM
   ========================================================= */

function setupPasswordForm() {

    const form =
        document.querySelector(
            "#passwordForm"
        );


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            changePassword();

        }
    );


    document
        .querySelectorAll(
            ".toggle-password"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const targetId =
                            button.dataset
                                .target;


                        const input =
                            document.getElementById(
                                targetId
                            );


                        if (!input) return;


                        if (
                            input.type ===
                            "password"
                        ) {

                            input.type =
                                "text";


                            button.innerHTML =
                                '<i class="fa-regular fa-eye-slash"></i>';

                        } else {

                            input.type =
                                "password";


                            button.innerHTML =
                                '<i class="fa-regular fa-eye"></i>';

                        }

                    }
                );

            }
        );

}


/* =========================================================
   CHANGE PASSWORD
   ========================================================= */

function changePassword() {

    const currentPassword =
        getValue(
            "#currentPassword"
        );


    const newPassword =
        getValue(
            "#newPassword"
        );


    const confirmPassword =
        getValue(
            "#confirmPassword"
        );


    if (!currentPassword) {

        showMessage(
            "Please enter your current password.",
            "error"
        );

        return;

    }


    if (
        newPassword.length < 6
    ) {

        showMessage(
            "New password must contain at least 6 characters.",
            "error"
        );

        return;

    }


    if (
        newPassword !==
        confirmPassword
    ) {

        showMessage(
            "New passwords do not match.",
            "error"
        );

        return;

    }


    /*
       Frontend demo only.

       A real application must verify
       the password on a secure backend.
    */

    const email =
        localStorage.getItem(
            LUXORA_PROFILE.storage.userEmail
        );


    if (email) {

        let passwords = {};


        try {

            passwords =
                JSON.parse(
                    localStorage.getItem(
                        "luxoraDemoPasswords"
                    )
                ) || {};

        } catch {

            passwords = {};

        }


        passwords[email] =
            newPassword;


        localStorage.setItem(
            "luxoraDemoPasswords",
            JSON.stringify(
                passwords
            )
        );

    }


    const form =
        document.querySelector(
            "#passwordForm"
        );


    if (form) {

        form.reset();

    }


    showMessage(
        "Password changed successfully.",
        "success"
    );

}


/* =========================================================
   AVATAR UPLOAD
   ========================================================= */

function setupAvatarUpload() {

    const input =
        document.querySelector(
            "#avatarInput"
        );


    const image =
        document.querySelector(
            "#profileImage"
        );


    if (!input || !image) return;


    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];


            if (!file) return;


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showMessage(
                    "Please select a valid image.",
                    "error"
                );

                return;

            }


            /*
               Keep demo image reasonably small.
            */

            if (
                file.size >
                2 * 1024 * 1024
            ) {

                showMessage(
                    "Please choose an image under 2MB.",
                    "error"
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const imageData =
                        event.target.result;


                    image.src =
                        imageData;


                    const user =
                        getStoredUser();


                    if (user) {

                        user.profileImage =
                            imageData;


                        saveCurrentUser(
                            user
                        );


                        updateLocalUserList(
                            user
                        );

                    }


                    showMessage(
                        "Profile photo updated.",
                        "success"
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


/* =========================================================
   EDIT MODE
   ========================================================= */

function setupEditMode() {

    const editButton =
        document.querySelector(
            "#editProfileBtn"
        );


    const cancelButton =
        document.querySelector(
            "#cancelEditBtn"
        );


    const form =
        document.querySelector(
            "#profileForm"
        );


    if (
        editButton &&
        form
    ) {

        editButton.addEventListener(
            "click",
            () => {

                form.classList.add(
                    "editing"
                );


                enableForm(
                    form
                );


                editButton.style.display =
                    "none";


                if (cancelButton) {

                    cancelButton.style.display =
                        "inline-flex";

                }

            }
        );

    }


    if (
        cancelButton &&
        form
    ) {

        cancelButton.addEventListener(
            "click",
            async () => {

                form.classList.remove(
                    "editing"
                );


                disableForm(
                    form
                );


                const user =
                    getStoredUser();


                if (user) {

                    renderProfile(
                        user
                    );

                }


                if (editButton) {

                    editButton.style.display =
                        "inline-flex";

                }


                cancelButton.style.display =
                    "none";

            }
        );

    }

}


/* =========================================================
   ENABLE FORM
   ========================================================= */

function enableForm(
    form
) {

    form
        .querySelectorAll(
            "input, textarea, select"
        )
        .forEach(
            input => {

                if (
                    input.id !==
                    "profileEmailInput"
                ) {

                    input.disabled =
                        false;

                }

            }
        );

}


/* =========================================================
   DISABLE FORM
   ========================================================= */

function disableForm(
    form
) {

    form
        .querySelectorAll(
            "input, textarea, select"
        )
        .forEach(
            input => {

                input.disabled =
                    true;

            }
        );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    document
        .querySelectorAll(
            "#logoutBtn, [data-logout]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        logoutUser();

                    }
                );

            }
        );

}


/* =========================================================
   LOGOUT USER
   ========================================================= */

function logoutUser() {

    localStorage.removeItem(
        LUXORA_PROFILE.storage.loggedIn
    );


    localStorage.removeItem(
        LUXORA_PROFILE.storage.userEmail
    );


    localStorage.removeItem(
        LUXORA_PROFILE.storage.currentUser
    );


    showMessage(
        "Logged out successfully.",
        "success"
    );


    setTimeout(
        () => {

            window.location.href =
                "login.html";

        },
        700
    );

}


/* =========================================================
   DELETE ACCOUNT - DEMO
   ========================================================= */

function setupDeleteAccount() {

    const button =
        document.querySelector(
            "#deleteAccountBtn"
        );


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to delete this demo account?"
                );


            if (!confirmed) {

                return;

            }


            const user =
                getStoredUser();


            if (user) {

                removeLocalUser(
                    user
                );

            }


            localStorage.removeItem(
                LUXORA_PROFILE.storage.currentUser
            );


            localStorage.removeItem(
                LUXORA_PROFILE.storage.loggedIn
            );


            localStorage.removeItem(
                LUXORA_PROFILE.storage.userEmail
            );


            showMessage(
                "Demo account deleted.",
                "success"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "register.html";

                },
                900
            );

        }
    );

}


/* =========================================================
   UPDATE LOCAL USERS
   ========================================================= */

function updateLocalUserList(
    updatedUser
) {

    let users = [];


    try {

        users =
            JSON.parse(
                localStorage.getItem(
                    LUXORA_PROFILE.storage.users
                )
            ) || [];

    } catch {

        users = [];

    }


    if (!users.length) {

        return;

    }


    const index =
        users.findIndex(
            user =>
                String(
                    user.email
                ).toLowerCase() ===
                String(
                    updatedUser.email
                ).toLowerCase()
        );


    if (
        index >= 0
    ) {

        users[index] =
            updatedUser;


        localStorage.setItem(
            LUXORA_PROFILE.storage.users,
            JSON.stringify(
                users
            )
        );

    }

}


/* =========================================================
   REMOVE LOCAL USER
   ========================================================= */

function removeLocalUser(
    user
) {

    let users = [];


    try {

        users =
            JSON.parse(
                localStorage.getItem(
                    LUXORA_PROFILE.storage.users
                )
            ) || [];

    } catch {

        users = [];

    }


    users =
        users.filter(
            item =>
                String(
                    item.email
                ).toLowerCase() !==
                String(
                    user.email
                ).toLowerCase()
        );


    localStorage.setItem(
        LUXORA_PROFILE.storage.users,
        JSON.stringify(
            users
        )
    );

}


/* =========================================================
   GET BOOKINGS
   ========================================================= */

function getBookings() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_PROFILE.storage.bookings
            )
        ) || [];

    } catch {

        return [];

    }

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
   LOGIN REQUIRED
   ========================================================= */

function showLoginRequired() {

    const container =
        document.querySelector(
            ".profile-container"
        );


    if (!container) {

        window.location.href =
            "login.html";

        return;

    }


    container.innerHTML = `

        <div class="profile-login-required">

            <div class="profile-login-icon">

                <i class="fa-solid fa-user-lock"></i>

            </div>

            <h2>
                Login Required
            </h2>

            <p>
                Please login to access
                your LUXORA profile.
            </p>

            <a
                href="login.html"
                class="btn btn-gold"
            >
                Login to LUXORA
            </a>

        </div>

    `;

}


/* =========================================================
   VALIDATE EMAIL
   ========================================================= */

function validateEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            email
        );

}


/* =========================================================
   VALIDATE PHONE
   ========================================================= */

function validatePhone(
    phone
) {

    const cleaned =
        phone.replace(
            /\D/g,
            ""
        );


    return (
        cleaned.length >= 10 &&
        cleaned.length <= 15
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
   SET INPUT
   ========================================================= */

function setInput(
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
   MESSAGE
   ========================================================= */

function showMessage(
    message,
    type = "success"
) {

    let box =
        document.querySelector(
            ".profile-message"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );


        box.className =
            "profile-message";


        const container =
            document.querySelector(
                ".profile-container"
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
        `profile-message ${type}`;


    box.style.display =
        "block";


    setTimeout(
        () => {

            box.style.display =
                "none";

        },
        3000
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
   GLOBAL API
   ========================================================= */

window.LUXORA_PROFILE_API = {

    loadCurrentUser,

    getStoredUser,

    saveCurrentUser,

    updateProfile,

    changePassword,

    logoutUser,

    getBookings,

    renderProfile,

    renderStatistics,

    formatINR

};