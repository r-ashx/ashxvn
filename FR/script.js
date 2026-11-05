/**
 * FASHIONORISER — CLIENT SCRIPT
 * Configured with Google Apps Script & Razorpay Integrations
 */

// CONFIGURATION PLACEHOLDERS
const GOOGLE_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
const RAZORPAY_PAYMENT_LINK = "PASTE_YOUR_RAZORPAY_PAYMENT_LINK_HERE";

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initScrollObserver();
    initAdviceForm();
    initCommunityPayment();
});

/* ==========================================
   1. HEADER SCROLL BEHAVIOR
   ========================================== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active section indicator
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================
   2. MOBILE NAVIGATION DRAWER
   ========================================== */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function toggleMenu(open) {
        const isOpen = open !== undefined ? open : !mobileMenu.classList.contains('active');
        mobileToggle.classList.toggle('active', isOpen);
        mobileMenu.classList.toggle('active', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen);
        mobileMenu.setAttribute('aria-hidden', !isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    mobileToggle.addEventListener('click', () => toggleMenu());

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => toggleMenu(false));
    });
}

/* ==========================================
   3. INTERSECTION OBSERVER (SCROLL REVEAL)
   ========================================== */
function initScrollObserver() {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const observerOptions = {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));
}

/* ==========================================
   4. 1:1 ADVICE FORM VALIDATION & SUBMISSION
   ========================================== */
function initAdviceForm() {
    const form = document.getElementById('adviceForm');
    const successBox = document.getElementById('formSuccess');
    const submitBtn = document.getElementById('submitBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate Form Fields
        const isValid = validateForm(form);
        if (!isValid) return;

        // Set Loading State
        setLoadingState(true);

        // Gather Data
        const formData = {
            timestamp: new Date().toISOString(),
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            mobile: form.mobile.value.trim(),
            age: form.age.value.trim() || 'N/A',
            skinTone: form.skinTone.value.trim(),
            place: form.place.value.trim(),
            service: form.service.value,
            question: form.question.value.trim() || 'N/A'
        };

        try {
            if (GOOGLE_SCRIPT_URL.includes("PASTE_YOUR_")) {
                // Simulate success if URL not set
                console.warn("Google Apps Script URL not configured. Simulating response.");
                await new Promise(resolve => setTimeout(resolve, 1200));
            } else {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            }

            // Show Success State
            form.style.display = 'none';
            successBox.classList.add('active');

        } catch (error) {
            alert("There was an issue submitting your request. Please try again or reach out via social media.");
            console.error("Submission Error:", error);
        } finally {
            setLoadingState(false);
        }
    });

    // Real-time error clearing
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('input', () => {
            const group = input.closest('.field-group');
            if (group) group.classList.remove('invalid');
        });
    });
}

function validateForm(form) {
    let valid = true;

    // Helper functions
    const setError = (fieldId, errorId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.closest('.field-group').classList.add('invalid');
            valid = false;
        }
    };

    const clearError = (fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.closest('.field-group').classList.remove('invalid');
        }
    };

    // Name Validation
    if (!form.name.value.trim()) {
        setError('userName', 'nameError');
    } else {
        clearError('userName');
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.value.trim())) {
        setError('userEmail', 'emailError');
    } else {
        clearError('userEmail');
    }

    // Mobile Validation (10 digits)
    const mobileClean = form.mobile.value.trim().replace(/\D/g, '');
    if (mobileClean.length < 10) {
        setError('userMobile', 'mobileError');
    } else {
        clearError('userMobile');
    }

    // Skin Tone
    if (!form.skinTone.value.trim()) {
        setError('userSkinTone', 'skinToneError');
    } else {
        clearError('userSkinTone');
    }

    // Place
    if (!form.place.value.trim()) {
        setError('userPlace', 'placeError');
    } else {
        clearError('userPlace');
    }

    // Service
    if (!form.service.value) {
        setError('userService', 'serviceError');
    } else {
        clearError('userService');
    }

    return valid;
}

function setLoadingState(loading) {
    const submitBtn = document.getElementById('submitBtn');
    if (loading) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    } else {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

/* ==========================================
   5. COMMUNITY PAYMENT REDIRECT
   ========================================== */
function initCommunityPayment() {
    const communityBtn = document.getElementById('communityBtn');
    if (!communityBtn) return;

    communityBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (RAZORPAY_PAYMENT_LINK.includes("PASTE_YOUR_")) {
            alert("Payment link is not configured yet. Please check back soon!");
        } else {
            window.open(RAZORPAY_PAYMENT_LINK, '_blank', 'noopener,noreferrer');
        }
    });
}