/*
 * script.js
 *
 * This file handles all interactive functionalities of the portfolio website,
 * including loading animations, scroll progress, GSAP animations,
 * Particle.js integration, contact form validation, GitHub API integration,
 * and the back-to-top button.
 */

// Ensure all DOM-related operations run after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', function() {

    // --- Global Variables and Initial Setup ---

    // GitHub API username - Corrected syntax: added missing closing quote
    const username = 'deenadhayalankk';

    // Elements for loading animation
    const loadingScreen = document.getElementById("loading");
    const nameLoaderLetters = document.querySelectorAll("#name-loader span"); // Corrected ID usage
    const loadingTextLetters = document.querySelectorAll(".loading-text span"); // Ensure this matches HTML if used

    // Scroll progress bar element
    const scrollIndicator = document.getElementById("scroll-indicator");
    const scrollBar = document.getElementById('scroll-bar'); // For click functionality

    // Contact form elements
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoading = document.getElementById('submitLoading');
    const formMessage = document.getElementById('formMessage');
    const messageText = document.getElementById('messageText');
    const messageInput = document.getElementById('message');

    // Back to Top Button
    const backToTopButton = document.getElementById('backToTop');

    // --- Utility Functions ---

    /**
     * Displays a message on the contact form.
     * @param {string} text - The message to display.
     * @param {'success' | 'error'} type - The type of message (success or error).
     */
    function showFormMessage(text, type) {
        if (formMessage && messageText) {
            messageText.innerHTML = text;
            formMessage.className = `mt-4 p-4 rounded-lg ${
                type === 'success'
                    ? 'validation-success'
                    : 'validation-error'
            }`;
            formMessage.classList.remove('hidden'); // Ensure it's visible

            // Auto-hide message after 8 seconds
            setTimeout(() => {
                formMessage.classList.add('hidden');
            }, 8000);
        }
    }

    /**
     * Detects if a given text string is likely gibberish.
     * Provides an array of errors if gibberish is detected.
     * @param {string} text - The input text to validate.
     * @returns {{isValid: boolean, errors: string[]}} - Validation result.
     */
    function detectGibberish(text) {
        const errors = [];

        // Remove extra whitespace and normalize
        const cleanText = text.trim().replace(/\s+/g, ' ');

        // 1. Check minimum length
        if (cleanText.length < 10) {
            errors.push('Message must be at least 10 characters long.');
        }

        // 2. Check minimum word count
        const words = cleanText.split(' ').filter(word => word.length > 0);
        if (words.length < 3) {
            errors.push('Message must contain at least 3 words.');
        }

        // 3. Check for excessive character repetition (e.g., "aaaaaa", "!!!!!!")
        const charRepetition = /(.)\1{4,}/g;
        if (charRepetition.test(cleanText)) {
            errors.push('Message contains too many repeated characters.');
        }

        // 4. Check for excessive word repetition
        const wordCounts = {};
        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
            if (cleanWord.length > 2) {
                wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
            }
        });

        const repeatedWords = Object.entries(wordCounts).filter(([word, count]) => count > 2);
        if (repeatedWords.length > 0) {
            errors.push('Message contains too many repeated words.');
        }

        // 5. Check for random character sequences (e.g., "asdfgh", "qwerty")
        const randomPatterns = [
            /asdfgh/i, /qwerty/i, /zxcvbn/i, /123456/i, /abcdef/i,
            /[!@#$%^&*]{3,}/
        ];

        for (const pattern of randomPatterns) {
            if (pattern.test(cleanText)) {
                errors.push('Message contains random character sequences.');
                break;
            }
        }

        // 5.5. Check for consecutive numbers (but allow normal text)
        const consecutiveNumbers = /[0-9]{4,}/;
        if (consecutiveNumbers.test(cleanText)) {
            errors.push('Message contains random number sequences.');
        }

        // 6. Check for meaningful content (at least some words with 3+ characters)
        const meaningfulWords = words.filter(word => word.length >= 3);
        if (meaningfulWords.length < 2) {
            errors.push('Message must contain meaningful words (3+ characters).');
        }

        // 7. Check for excessive punctuation
        const punctuationCount = (cleanText.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
        if (punctuationCount > cleanText.length * 0.3) {
            errors.push('Message contains too much punctuation.');
        }

        // 8. Check for all caps (shouting)
        const upperCaseWords = words.filter(word => word === word.toUpperCase() && word.length > 2);
        if (upperCaseWords.length > words.length * 0.5) {
            errors.push('Please avoid typing in all capital letters.');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // --- Event Listeners and Animations ---

    // Scroll Progress Bar Logic
    let tickingScroll = false;
    function updateScrollIndicator() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;

        if (scrollIndicator) {
            scrollIndicator.style.height = `${scrollPercent}%`;
        }
        tickingScroll = false;
    }

    window.addEventListener("scroll", () => {
        if (!tickingScroll) {
            requestAnimationFrame(updateScrollIndicator);
            tickingScroll = true;
        }
    });

    // Click on scroll bar to navigate
    if (scrollBar) {
        scrollBar.addEventListener('click', function(e) {
            const rect = scrollBar.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percent = clickY / rect.height;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const targetScroll = percent * docHeight;
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        });
    }

    // Loading Animation (GSAP)
    // Register GSAP plugins if not already registered globally
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.warn("GSAP or ScrollTrigger not loaded. Animations may not work.");
    }

    // Animate each letter with stagger for the loading screen
    if (nameLoaderLetters.length > 0) {
        gsap.to(nameLoaderLetters, {
            opacity: 1,
            duration: 1.2,
            stagger: 0.15,
            onUpdate: function() {
                nameLoaderLetters.forEach((el, i) => {
                    gsap.to(el, {
                        color: "#ffffff",
                        duration: 0.2,
                        delay: i * 0.15,
                    });
                    gsap.to(el, {
                        color: "rgba(255,255,255,0.1)",
                        duration: 0.2,
                        delay: i * 0.15 + 0.4,
                    });
                    // Note: ::after pseudo-elements cannot be directly animated with GSAP
                    // This part of the animation might need a different approach or be purely CSS
                    // For now, keeping the original intent, but be aware of limitations.
                });
            },
            onComplete: () => {
                gsap.to(loadingScreen, {
                    opacity: 0,
                    duration: 1,
                    delay: 0.5,
                    onComplete: () => {
                        if (loadingScreen) {
                            loadingScreen.style.display = "none";
                        }
                    },
                });
            },
        });
    }


    // GSAP Animations for sections
    // Hero Section elements
    gsap.from(".hero-left", {
        opacity: 0,
        x: -50,
        duration: 1.2,
        ease: "power3.out",
    });

    gsap.from(".hero-right", {
        opacity: 0,
        x: 50,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3,
    });

    // Journey Section cards
    gsap.utils.toArray(".journey-card").forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 80,
            duration: .4,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
            delay: index * 0.1,
        });
    });

    // Generic fade-in animation for elements with class 'fade-in'
    gsap.utils.toArray('.fade-in').forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 40,
            duration: 1.2,
            ease: "power3.out",
        });
    });

    // Project card animation
    gsap.from(".project-card", {
        scrollTrigger: {
            trigger: ".project-card",
            start: "top 85%",
            toggleActions: "play none none reset"
        },
        opacity: 0,
        y: 60,
        duration: 1,
        ease: "power3.out"
    });

    // About section image and text
    gsap.from("#about-img", {
        scrollTrigger: {
            trigger: "#about-img",
            start: "top 80%",
            toggleActions: "play none none reset",
        },
        opacity: 0,
        x: -100,
        duration: .4,
        ease: "power3.out"
    });

    gsap.from("#about-text", {
        scrollTrigger: {
            trigger: "#about-text",
            start: "top 80%",
            toggleActions: "play none none reset",
        },
        opacity: 0,
        y: 50,
        duration: .4,
        ease: "power3.out",
        delay: 0.2
    });

    // Tech Stack section heading
    gsap.from("#techstack h2", {
        scrollTrigger: {
            trigger: "#techstack",
            start: "top 80%",
            toggleActions: "play none none reset"
        },
        opacity: 0,
        y: -40,
        duration: 1.2,
        ease: "power3.out"
    });

    // Tech Stack individual cards/groups
    gsap.utils.toArray("#techstack .group").forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reset"
            },
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out",
            delay: i * 0.1,
        });
    });

    // Tech categories
    gsap.utils.toArray('.tech-category').forEach((section, index) => {
        gsap.from(section, {
            opacity: 0,
            y: 60,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // General section reveal animation
    gsap.utils.toArray('.reveal-section').forEach(section => {
        gsap.from(section, {
            opacity: 0,
            y: 60,
            duration: 1,
            scrollTrigger: {
                trigger: section,
                start: "top 80%",
                toggleActions: "play none none reset"
            }
        });
    });

    // Upcoming projects cards
    gsap.utils.toArray(".upcoming-card").forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: "#upcoming-projects",
                start: "top 85%",
                toggleActions: "play none none reset"
            },
            opacity: 0,
            y: 60,
            duration: 1,
            ease: "power3.out",
            delay: i * 0.15,
        });
    });

    // --- Particle.js Initialization ---
    // Ensure particlesJS is loaded before calling it
    if (typeof particlesJS !== 'undefined') {
        particlesJS("particles-hero", {
            "particles": {
                "number": {
                    "value": 200,
                    "density": { "enable": true, "value_area": 800 }
                },
                "color": { "value": "#ffffff" },
                "opacity": { "value": 0.7, "random": false },
                "size": { "value": 4, "random": true },
                "line_linked": { "enable": false },
                "move": {
                    "enable": true,
                    "speed": 1,
                    "direction": "bottom",
                    "out_mode": "out"
                }
            },
            "interactivity": {
                "events": {
                    "onhover": { "enable": false },
                    "onclick": { "enable": false }
                }
            },
            "retina_detect": true
        });

        particlesJS("particles-projects", {
            "particles": {
                "number": { "value": 50 },
                "color": { "value": "ffffff" },
                "shape": { "type": "circle" },
                "opacity": {
                    "value": 0.5,
                    "random": true
                },
                "size": {
                    "value": 4,
                    "random": true
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "ffffff",
                    "opacity": 0.4,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 3,
                    "direction": "none",
                    "out_mode": "out"
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": { "enable": true, "mode": "grab" },
                    "onclick": { "enable": true, "mode": "push" }
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": { "opacity": 1 }
                    },
                    "push": { "particles_nb": 4 }
                }
            },
            "retina_detect": true
        });
    } else {
        console.warn("particles.js library not loaded. Particle effects will not be visible.");
    }


    // --- Animated Download Button Functionality ---
    const downloadInput = document.querySelector('.download-label .download-input');
    const downloadLink = document.querySelector('a[download]');

    if (downloadInput && downloadLink) {
        downloadInput.addEventListener('change', function() {
            if (this.checked) {
                // Trigger the download after animation starts
                setTimeout(() => {
                    // Create a temporary link to trigger download
                    const tempLink = document.createElement('a');
                    tempLink.href = downloadLink.href;
                    tempLink.download = downloadLink.download || 'resume.pdf';
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);

                    // Reset the checkbox after animation completes
                    setTimeout(() => {
                        this.checked = false;
                    }, 4000); // Reset after animation completes
                }, 500); // Small delay to let animation start
            }
        });
    }

    // --- Contact Form Functionality ---
    if (contactForm) {
        // Real-time validation for message input
        let validationTimeout;
        if (messageInput) {
            messageInput.addEventListener('input', function() {
                clearTimeout(validationTimeout);

                validationTimeout = setTimeout(() => {
                    const validation = detectGibberish(this.value);
                    const messageContainer = this.parentElement;

                    // Remove existing validation messages
                    const existingError = messageContainer.querySelector('.validation-error');
                    if (existingError) {
                        existingError.remove();
                    }
                    const existingSuccess = messageContainer.querySelector('.validation-success');
                    if (existingSuccess) {
                        existingSuccess.remove();
                    }

                    // Remove existing validation classes
                    this.classList.remove('border-red-500', 'border-green-500');

                    if (this.value.trim() === '') {
                        return; // Don't show validation for empty field
                    }

                    if (!validation.isValid) {
                        this.classList.add('border-red-500');
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'validation-error text-red-500 text-sm mt-1';
                        errorDiv.innerHTML = validation.errors.join('<br>');
                        messageContainer.appendChild(errorDiv);

                        // Auto-remove error message after 2.5 seconds
                        setTimeout(() => {
                            if (errorDiv.parentNode) {
                                errorDiv.remove();
                            }
                        }, 2500);
                    } else {
                        this.classList.add('border-green-500');
                        const successDiv = document.createElement('div');
                        successDiv.className = 'validation-success text-green-500 text-sm mt-1';
                        successDiv.textContent = 'Message looks good!';
                        messageContainer.appendChild(successDiv);

                        // Auto-remove success message after 1.5 seconds
                        setTimeout(() => {
                            if (successDiv.parentNode) {
                                successDiv.remove();
                            }
                        }, 1500);
                    }
                }, 500); // Debounce validation
            });

            // Clear validation on focus
            messageInput.addEventListener('focus', function() {
                const existingError = this.parentElement.querySelector('.validation-error');
                const existingSuccess = this.parentElement.querySelector('.validation-success');
                if (existingError) existingError.remove();
                if (existingSuccess) existingSuccess.remove();
                this.classList.remove('border-red-500', 'border-green-500');
            });
        }


        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Show loading state
            if (submitBtn) submitBtn.disabled = true;
            if (submitText) submitText.classList.add('hidden');
            if (submitLoading) submitLoading.classList.remove('hidden');

            const formData = new FormData(contactForm);
            const message = formData.get('message');
            const validation = detectGibberish(message);

            if (!validation.isValid) {
                showFormMessage(`Please fix the following issues:<br>${validation.errors.join('<br>')}`, 'error');
                // Reset button state
                if (submitBtn) submitBtn.disabled = false;
                if (submitText) submitText.classList.remove('hidden');
                if (submitLoading) submitLoading.classList.add('hidden');
                return;
            }

            const data = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            try {
                // Using Formspree for form submission
                const response = await fetch('https://formspree.io/f/mjkrlgar', { // Replace with your Formspree endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    showFormMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send message via Formspree.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);

                // Fallback: Offer to send email directly if Formspree fails
                const emailSubject = encodeURIComponent(`Portfolio Contact: ${data.subject}`);
                const emailBody = encodeURIComponent(`
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
                `);
                const mailtoLink = `mailto:abhijeetbhale7@gmail.com?subject=${emailSubject}&body=${emailBody}`; // Replace with your email
                showFormMessage(`Form submission failed. <a href="${mailtoLink}" class="underline">Click here to send email directly</a> or try again later.`, 'error');
            } finally {
                // Reset button state
                if (submitBtn) submitBtn.disabled = false;
                if (submitText) submitText.classList.remove('hidden');
                if (submitLoading) submitLoading.classList.add('hidden');
            }
        });
    }

    // --- Performance Optimizations ---

    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });

    // Preload critical images
    const criticalImages = [
        './assets/AbhijeetBhalePortfolio.jpg', // Ensure this path is correct
        './assets/cursor.png' // Ensure this path is correct
    ];

    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });

    // Service Worker registration for PWA features
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js') // Ensure sw.js exists
                .then(registration => {
                    console.log('Service Worker registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('Service Worker registration failed: ', registrationError);
                });
        });
    }

    // --- GitHub API Integration ---
    const githubEndpoints = {
        user: `https://api.github.com/users/${username}`,
        repos: `https://api.github.com/users/${username}/repos`,
        activity: `https://api.github.com/users/${username}/events`
    };

    /**
     * Fetches and displays GitHub user data (repos, followers, stars, commits).
     */
    async function fetchGitHubData() {
        try {
            const [userResponse, reposResponse] = await Promise.all([
                fetch(githubEndpoints.user),
                fetch(githubEndpoints.repos)
            ]);

            if (userResponse.ok && reposResponse.ok) {
                const userData = await userResponse.json();
                const reposData = await reposResponse.json();

                // Update stats
                document.getElementById('githubRepos').textContent = userData.public_repos;
                document.getElementById('githubFollowers').textContent = userData.followers;

                // Calculate total stars
                const totalStars = reposData.reduce((sum, repo) => sum + repo.stargazers_count, 0);
                document.getElementById('githubStars').textContent = totalStars;

                // Calculate recent commits (last 30 days)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                // Fetch commits from a broader search, as user events might not include all commits
                const commitsResponse = await fetch(`https://api.github.com/search/commits?q=author:${username}+committer-date:>${thirtyDaysAgo.toISOString().split('T')[0]}`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json' // Required for commit search API
                    }
                });
                if (commitsResponse.ok) {
                    const commitsData = await commitsResponse.json();
                    document.getElementById('githubCommits').textContent = commitsData.total_count;
                }

                // Load activity feed
                loadGitHubActivity();

                // Load language stats
                loadGitHubLanguages(reposData);
            }
        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            // Show fallback data if API calls fail
            document.getElementById('githubRepos').textContent = '15+';
            document.getElementById('githubStars').textContent = '25+';
            document.getElementById('githubFollowers').textContent = '10+';
            document.getElementById('githubCommits').textContent = '50+';
        }
    }

    /**
     * Loads and displays recent GitHub activity.
     */
    async function loadGitHubActivity() {
        try {
            const response = await fetch(githubEndpoints.activity);
            if (response.ok) {
                const activityData = await response.json();
                const activityContainer = document.getElementById('githubActivity');

                if (activityContainer) {
                    activityContainer.innerHTML = ''; // Clear loading state

                    // Show recent activity (last 5 events)
                    const recentActivity = activityData.slice(0, 5);

                    recentActivity.forEach(event => {
                        const activityItem = createActivityItem(event);
                        activityContainer.appendChild(activityItem);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading GitHub activity:', error);
        }
    }

    /**
     * Creates an HTML element for a GitHub activity item.
     * @param {Object} event - The GitHub event object.
     * @returns {HTMLElement} - The created activity item element.
     */
    function createActivityItem(event) {
        const item = document.createElement('div');
        item.className = 'flex items-center space-x-4 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800';

        const eventType = event.type;
        const repoName = event.repo?.name || 'Unknown Repository';
        const createdAt = new Date(event.created_at).toLocaleDateString();

        let icon, text;

        switch (eventType) {
            case 'PushEvent':
                icon = 'fas fa-code';
                text = `Pushed to ${repoName}`;
                break;
            case 'CreateEvent':
                icon = 'fas fa-plus';
                text = `Created ${repoName}`;
                break;
            case 'ForkEvent':
                icon = 'fas fa-code-branch';
                text = `Forked ${repoName}`;
                break;
            case 'WatchEvent':
                icon = 'fas fa-star';
                text = `Starred ${repoName}`;
                break;
            default:
                icon = 'fas fa-circle';
                text = `Activity in ${repoName}`;
        }

        item.innerHTML = `
            <div class="w-10 h-10 bg-[#1DCD9F] rounded-full flex items-center justify-center">
                <i class="${icon} text-white"></i>
            </div>
            <div class="flex-1">
                <p class="text-white font-medium">${text}</p>
                <p class="text-gray-400 text-sm">${createdAt}</p>
            </div>
            <a href="https://github.com/${repoName}" target="_blank" class="text-[#1DCD9F] hover:text-[#17b890]">
                <i class="fas fa-external-link-alt"></i>
            </a>
        `;
        return item;
    }

    /**
     * Loads and displays GitHub language statistics.
     * @param {Array<Object>} reposData - Array of repository data from GitHub API.
     */
    function loadGitHubLanguages(reposData) {
        const languageStats = {};

        reposData.forEach(repo => {
            if (repo.language) {
                languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
            }
        });

        // Sort languages by frequency and take top 6
        const sortedLanguages = Object.entries(languageStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 6);

        const languagesContainer = document.getElementById('githubLanguages');
        if (languagesContainer) {
            languagesContainer.innerHTML = '';

            sortedLanguages.forEach(([language, count]) => {
                const languageCard = document.createElement('div');
                languageCard.className = 'bg-[#111] p-4 rounded-xl border border-gray-800 text-center hover:border-[#1DCD9F] transition-all duration-300';

                languageCard.innerHTML = `
                    <div class="text-2xl font-bold text-[#1DCD9F] mb-2">${language}</div>
                    <div class="text-gray-400 text-sm">${count} repositories</div>
                `;
                languagesContainer.appendChild(languageCard);
            });
        }
    }

    // Initialize GitHub data loading
    fetchGitHubData();

    // --- Back to Top Button Functionality ---
    if (backToTopButton) {
        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Scroll to top when button is clicked
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

}); // End DOMContentLoaded
