// ================================================================
// ESPOSURE.GG - JAVASCRIPT FUNCTIONALITY
// Interactive features for enterprise-grade website
// ================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initThemeToggle();
    initSmoothScrolling();
    initScrollAnimations();
    initNavbarEffects();
    initMobileMenu();
});

// ================================================================
// THEME TOGGLE FUNCTIONALITY
// ================================================================
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    // Set initial theme (dark mode as default)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    }
    
    // Only proceed with icon updates if themeToggle exists
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (!themeIcon) return;
    
    if (savedTheme === 'light') {
        themeIcon.textContent = '☀️';
    } else {
        // Default to dark mode
        themeIcon.textContent = '🌙';
    }
    
    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        
        if (document.body.classList.contains('light-mode')) {
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        }
        
        // Add a subtle animation feedback
        themeToggle.style.transform = 'scale(0.95)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    });
}

// ================================================================
// SMOOTH SCROLLING NAVIGATION
// ================================================================
function initSmoothScrolling() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ================================================================
// SCROLL ANIMATIONS
// ================================================================
function initScrollAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Add stagger effect for grid items
                const parent = entry.target.parentElement;
                if (parent.classList.contains('stats-grid') || 
                    parent.classList.contains('features-grid') ||
                    parent.classList.contains('credibility-grid')) {
                    
                    const siblings = Array.from(parent.children);
                    const index = siblings.indexOf(entry.target);
                    
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 100);
                }
            }
        });
    }, observerOptions);

    // Observe all elements with animation class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ================================================================
// NAVBAR EFFECTS
// ================================================================
function initNavbarEffects() {
    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class for background effect
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });

    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    window.addEventListener('scroll', () => {
        const currentSection = getCurrentSection(sections);
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}

// Helper function to get current section in viewport
function getCurrentSection(sections) {
    const navbarHeight = document.querySelector('.navbar').offsetHeight;
    const scrollPosition = window.scrollY + navbarHeight + 100;
    
    for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.offsetTop <= scrollPosition) {
            return section.id;
        }
    }
    
    return sections[0]?.id || '';
}

// ================================================================
// MOBILE MENU
// ================================================================
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        // Close mobile menu when clicking on a link
        const mobileLinks = navMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
}

// ================================================================
// PERFORMANCE OPTIMIZATIONS
// ================================================================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for high-frequency events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================================================
// ENHANCED INTERACTIONS
// ================================================================

// Add hover effects for cards
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.feature-card, .credibility-item, .success-card, .stat');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// ================================================================
// ACCESSIBILITY ENHANCEMENTS
// ================================================================

// Keyboard navigation for dropdown
document.addEventListener('DOMContentLoaded', function() {
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    if (dropdownTrigger && dropdownContent) {
        dropdownTrigger.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdownContent.style.display = 
                    dropdownContent.style.display === 'block' ? 'none' : 'block';
            }
        });
    }
});

// Focus management for mobile menu
function manageFocus() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                // Focus first menu item when opening
                const firstLink = navMenu.querySelector('a');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            }
        });
    }
}

// ================================================================
// PERFORMANCE MONITORING
// ================================================================

// Simple performance tracking
window.addEventListener('load', function() {
    // Track page load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    // Log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`Page load time: ${loadTime}ms`);
        
        // Check if load time exceeds target (3 seconds)
        if (loadTime > 3000) {
            console.warn('Page load time exceeds 3 second target');
        }
    }
});

// ================================================================
// EXTERNAL LINK HANDLING
// ================================================================

// Add external link indicators and proper attributes
document.addEventListener('DOMContentLoaded', function() {
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="esposure.gg"])');
    
    externalLinks.forEach(link => {
        // Add external link indicator
        if (!link.querySelector('.external-icon')) {
            const icon = document.createElement('span');
            icon.className = 'external-icon';
            icon.innerHTML = ' ↗';
            icon.style.fontSize = '0.8em';
            icon.style.opacity = '0.7';
            link.appendChild(icon);
        }
        
        // Ensure proper attributes
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
});

// ================================================================
// ERROR HANDLING
// ================================================================

// Global error handler
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // In production, you might want to send errors to a logging service
    // logErrorToService(e.error);
});

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Get element offset from top of page
function getOffsetTop(element) {
    let offsetTop = 0;
    while (element) {
        offsetTop += element.offsetTop;
        element = element.offsetParent;
    }
    return offsetTop;
}

// ================================================================
// INITIALIZATION COMPLETE
// ================================================================

console.log('Esposure.gg website initialized successfully');