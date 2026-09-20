"use strict";

/* =========================================================
   LUXORA - AUTHENTICATION JAVASCRIPT
   File: js/auth.js
   ========================================================= */

const LUXORA_AUTH = {

    storage: {
        loggedIn: "luxoraLoggedIn",
        userEmail: "luxoraUserEmail",
        user: "luxoraCurrentUser",
        users: "luxoraUsers",
        remember: "luxoraRememberMe",
        redirect: "luxoraRedirectAfterLogin"
    },

    pages: {
        home: "index.html",
        login: "login.html",
        register: "register.html",
        profile: "profile.html"
    }

};


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initAuth();

    }
);


/* =========================================================
   INITIALIZE AUTH
   ========================================================= */

function initAuth() {

    setupLoginForm();

    setupRegisterForm();

    setupLogoutButtons();

    setupPasswordToggle();

    protectPages();

    updateAuthUI();

}


/* =========================================================
   LOGIN FORM
   ========================================================= */

function setupLoginForm() {

    const form =
        document.getElementById("loginForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            await loginUser(form);

        }
    );

}


/* =========================================================
   LOGIN USER
   ========================================================= */

async function loginUser(form) {

    const emailInput =
        form.querySelector(
            '[name="email"], #email'
        );

    const passwordInput =
        form.querySelector(
            '[name="password"], #password'
        );

    const rememberInput =
        form.querySelector(
            '[name="remember"], #remember'
        );

    if (!emailInput || !passwordInput) {
        return;
    }

    const email =
        emailInput.value
            .trim()
            .toLowerCase();

    const password =
        passwordInput.value;

    const remember =
        rememberInput
            ? rememberInput.checked
            : false;


    /* Basic validation */

    if (!email) {

        showAuthMessage(
            "Please enter your email address.",
            "error"
        );

        emailInput.focus();

        return;

    }


    if (!isValidEmail(email)) {

        showAuthMessage(
            "Please enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;

    }


    if (!password) {

        showAuthMessage(
            "Please enter your password.",
            "error"
        );

        passwordInput.focus();

        return;

    }


    setAuthLoading(form, true);


    try {

        const users =
            await loadUsers();

        /*
         * Demo authentication:
         * users.json does not contain passwords,
         * therefore registered demo users are matched
         * by email.
         */

        let user =
            users.find(
                item =>
                    item.email?.toLowerCase() ===
                    email
            );


        /*
         * If user is not found in JSON,
         * check LocalStorage registered users.
         */

        if (!user) {

            const localUsers =
                getLocalUsers();

            user =
                localUsers.find(
                    item =>
                        item.email?.toLowerCase() ===
                        email
                );

        }


        /*
         * Demo fallback:
         * Allows login for any valid email if no user
         * database is available.
         */

        if (!user) {

            user = {
                id:
                    "LOCAL-" +
                    Date.now(),

                userId:
                    "USR-" +
                    Date.now(),

                name:
                    email
                        .split("@")[0]
                        .replace(
                            /[^a-zA-Z0-9]/g,
                            " "
                        ),

                email:
                    email,

                phone:
                    "",

                role:
                    "customer",

                membership:
                    "Silver",

                status:
                    "Active",

                createdAt:
                    new Date()
                        .toISOString()
                        .split("T")[0]
            };

        }


        /*
         * Store login session
         */

        localStorage.setItem(
            LUXORA_AUTH.storage.loggedIn,
            "true"
        );

        localStorage.setItem(
            LUXORA_AUTH.storage.userEmail,
            email
        );

        localStorage.setItem(
            LUXORA_AUTH.storage.user,
            JSON.stringify(user)
        );


        if (remember) {

            localStorage.setItem(
                LUXORA_AUTH.storage.remember,
                "true"
            );

        } else {

            localStorage.removeItem(
                LUXORA_AUTH.storage.remember
            );

        }


        showAuthMessage(
            "Login successful. Welcome to LUXORA.",
            "success"
        );


        /*
         * Redirect
         */

        setTimeout(() => {

            const redirect =
                localStorage.getItem(
                    LUXORA_AUTH.storage.redirect
                );

            localStorage.removeItem(
                LUXORA_AUTH.storage.redirect
            );

            window.location.href =
                redirect ||
                LUXORA_AUTH.pages.home;

        }, 900);


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        showAuthMessage(
            "Something went wrong. Please try again.",
            "error"
        );

    } finally {

        setAuthLoading(form, false);

    }

}


/* =========================================================
   REGISTER FORM
   ========================================================= */

function setupRegisterForm() {

    const form =
        document.getElementById("registerForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            registerUser(form);

        }
    );

}


/* =========================================================
   REGISTER USER
   ========================================================= */

function registerUser(form) {

    const nameInput =
        form.querySelector(
            '[name="name"], #name'
        );

    const emailInput =
        form.querySelector(
            '[name="email"], #email'
        );

    const phoneInput =
        form.querySelector(
            '[name="phone"], #phone'
        );

    const passwordInput =
        form.querySelector(
            '[name="password"], #password'
        );

    const confirmInput =
        form.querySelector(
            '[name="confirmPassword"], #confirmPassword, [name="confirm-password"]'
        );


    if (
        !nameInput ||
        !emailInput ||
        !passwordInput
    ) {

        return;

    }


    const name =
        nameInput.value.trim();

    const email =
        emailInput.value
            .trim()
            .toLowerCase();

    const phone =
        phoneInput
            ? phoneInput.value.trim()
            : "";

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmInput
            ? confirmInput.value
            : password;


    /* Validation */

    if (name.length < 2) {

        showAuthMessage(
            "Please enter your full name.",
            "error"
        );

        nameInput.focus();

        return;

    }


    if (!isValidEmail(email)) {

        showAuthMessage(
            "Please enter a valid email address.",
            "error"
        );

        emailInput.focus();

        return;

    }


    if (password.length < 6) {

        showAuthMessage(
            "Password must contain at least 6 characters.",
            "error"
        );

        passwordInput.focus();

        return;

    }


    if (password !== confirmPassword) {

        showAuthMessage(
            "Passwords do not match.",
            "error"
        );

        if (confirmInput) {
            confirmInput.focus();
        }

        return;

    }


    /*
     * Check existing local users
     */

    const localUsers =
        getLocalUsers();

    const exists =
        localUsers.some(
            user =>
                user.email?.toLowerCase() ===
                email
        );


    if (exists) {

        showAuthMessage(
            "An account with this email already exists.",
            "error"
        );

        return;

    }


    /*
     * Create new local user
     */

    const newUser = {

        id:
            "LOCAL-" +
            Date.now(),

        userId:
            "USR-" +
            Date.now(),

        name:
            name,

        email:
            email,

        phone:
            phone,

        role:
            "customer",

        membership:
            "Silver",

        totalBookings:
            0,

        totalSpent:
            0,

        status:
            "Active",

        address: {
            city: "",
            state: "",
            country: "India"
        },

        createdAt:
            new Date()
                .toISOString()
                .split("T")[0],

        lastLogin:
            new Date()
                .toISOString()
                .split("T")[0]

    };


    localUsers.push(
        newUser
    );

    localStorage.setItem(
        LUXORA_AUTH.storage.users,
        JSON.stringify(localUsers)
    );


    /*
     * Store demo account password locally.
     *
     * This is only for frontend demonstration.
     * Never store real passwords in LocalStorage
     * in a production application.
     */

    saveDemoPassword(
        email,
        password
    );


    showAuthMessage(
        "Account created successfully.",
        "success"
    );


    setTimeout(() => {

        window.location.href =
            LUXORA_AUTH.pages.login;

    }, 1000);

}


/* =========================================================
   LOAD USERS JSON
   ========================================================= */

async function loadUsers() {

    try {

        const response =
            await fetch(
                "../data/users.json"
            );

        if (!response.ok) {
            throw new Error(
                "users.json not found"
            );
        }

        return await response.json();

    } catch {

        /*
         * If auth.js is used on root pages,
         * try the root data path.
         */

        try {

            const response =
                await fetch(
                    "data/users.json"
                );

            if (!response.ok) {
                return [];
            }

            return await response.json();

        } catch {

            return [];

        }

    }

}


/* =========================================================
   LOCAL USERS
   ========================================================= */

function getLocalUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_AUTH.storage.users
            )
        ) || [];

    } catch {

        return [];

    }

}


/* =========================================================
   DEMO PASSWORD
   ========================================================= */

function saveDemoPassword(
    email,
    password
) {

    const passwords =
        getDemoPasswords();

    passwords[email] =
        password;

    localStorage.setItem(
        "luxoraDemoPasswords",
        JSON.stringify(passwords)
    );

}


function getDemoPasswords() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "luxoraDemoPasswords"
            )
        ) || {};

    } catch {

        return {};

    }

}


/* =========================================================
   PASSWORD TOGGLE
   ========================================================= */

function setupPasswordToggle() {

    document
        .querySelectorAll(
            "[data-password-toggle], .password-toggle"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const targetId =
                        button.dataset.target;

                    let input;

                    if (targetId) {

                        input =
                            document.getElementById(
                                targetId
                            );

                    } else {

                        input =
                            button
                                .closest(".password-field, .input-group")
                                ?.querySelector(
                                    "input"
                                );

                    }

                    if (!input) return;


                    if (
                        input.type ===
                        "password"
                    ) {

                        input.type =
                            "text";

                        button.classList.add(
                            "active"
                        );

                    } else {

                        input.type =
                            "password";

                        button.classList.remove(
                            "active"
                        );

                    }

                }
            );

        });

}


/* =========================================================
   LOGOUT BUTTONS
   ========================================================= */

function setupLogoutButtons() {

    document
        .querySelectorAll(
            ".logout-btn, [data-logout]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    logoutUser();

                }
            );

        });

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logoutUser() {

    localStorage.removeItem(
        LUXORA_AUTH.storage.loggedIn
    );

    localStorage.removeItem(
        LUXORA_AUTH.storage.userEmail
    );

    localStorage.removeItem(
        LUXORA_AUTH.storage.user
    );

    window.location.href =
        LUXORA_AUTH.pages.login;

}


/* =========================================================
   AUTH STATUS
   ========================================================= */

function isLoggedIn() {

    return (
        localStorage.getItem(
            LUXORA_AUTH.storage.loggedIn
        ) === "true"
    );

}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                LUXORA_AUTH.storage.user
            )
        );

    } catch {

        return null;

    }

}


/* =========================================================
   PROTECT PAGES
   ========================================================= */

function protectPages() {

    const protectedPages = [
        "profile.html",
        "my-bookings.html",
        "bookings.html",
        "payment.html"
    ];

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    if (
        protectedPages.includes(
            currentPage
        )
    ) {

        if (!isLoggedIn()) {

            localStorage.setItem(
                LUXORA_AUTH.storage.redirect,
                window.location.href
            );

            window.location.href =
                LUXORA_AUTH.pages.login;

        }

    }

}


/* =========================================================
   UPDATE AUTH UI
   ========================================================= */

function updateAuthUI() {

    const loggedIn =
        isLoggedIn();

    const user =
        getCurrentUser();


    document
        .querySelectorAll(
            "[data-auth-user]"
        )
        .forEach(element => {

            if (user) {

                element.textContent =
                    user.name || "LUXORA User";

            }

        });


    document
        .querySelectorAll(
            "[data-auth-email]"
        )
        .forEach(element => {

            if (user) {

                element.textContent =
                    user.email || "";

            }

        });


    document
        .querySelectorAll(
            ".guest-only"
        )
        .forEach(element => {

            element.style.display =
                loggedIn
                    ? "none"
                    : "";

        });


    document
        .querySelectorAll(
            ".user-only"
        )
        .forEach(element => {

            element.style.display =
                loggedIn
                    ? ""
                    : "none";

        });

}


/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


/* =========================================================
   PHONE VALIDATION
   ========================================================= */

function isValidPhone(phone) {

    return /^[0-9+\-\s]{8,15}$/
        .test(phone);

}


/* =========================================================
   AUTH MESSAGE
   ========================================================= */

function showAuthMessage(
    message,
    type = "error"
) {

    let messageBox =
        document.querySelector(
            ".auth-message"
        );


    if (!messageBox) {

        messageBox =
            document.createElement("div");

        messageBox.className =
            "auth-message";

        const form =
            document.querySelector(
                "#loginForm, #registerForm"
            );

        if (form) {

            form.prepend(
                messageBox
            );

        } else {

            document.body.prepend(
                messageBox
            );

        }

    }


    messageBox.textContent =
        message;

    messageBox.className =
        `auth-message ${type}`;

    messageBox.style.display =
        "block";


    clearTimeout(
        messageBox.authTimer
    );


    messageBox.authTimer =
        setTimeout(() => {

            messageBox.style.display =
                "none";

        }, 3500);

}


/* =========================================================
   BUTTON LOADING STATE
   ========================================================= */

function setAuthLoading(
    form,
    loading
) {

    if (!form) return;

    const button =
        form.querySelector(
            'button[type="submit"], .auth-submit'
        );

    if (!button) return;


    if (loading) {

        button.dataset.originalText =
            button.textContent;

        button.disabled =
            true;

        button.classList.add(
            "loading"
        );

        button.innerHTML = `
            <span class="auth-spinner"></span>
            Please wait...
        `;

    } else {

        button.disabled =
            false;

        button.classList.remove(
            "loading"
        );

        button.textContent =
            button.dataset.originalText ||
            "Continue";

    }

}


/* =========================================================
   AUTH GUARD
   ========================================================= */

function requireAuth() {

    if (isLoggedIn()) {
        return true;
    }


    localStorage.setItem(
        LUXORA_AUTH.storage.redirect,
        window.location.href
    );


    window.location.href =
        LUXORA_AUTH.pages.login;

    return false;

}


/* =========================================================
   REDIRECT IF LOGGED IN
   ========================================================= */

function redirectIfLoggedIn() {

    if (isLoggedIn()) {

        window.location.href =
            LUXORA_AUTH.pages.home;

    }

}


/* =========================================================
   GLOBAL EXPORT
   ========================================================= */

window.LUXORA_AUTH = {

    login:
        loginUser,

    register:
        registerUser,

    logout:
        logoutUser,

    isLoggedIn:
        isLoggedIn,

    getCurrentUser:
        getCurrentUser,

    requireAuth:
        requireAuth,

    redirectIfLoggedIn:
        redirectIfLoggedIn,

    validateEmail:
        isValidEmail,

    validatePhone:
        isValidPhone

};