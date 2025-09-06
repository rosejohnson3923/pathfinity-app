// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80; // Account for fixed navbar
                const targetPosition = target.offsetTop - offset;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                navMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    });
    
    // Navbar scroll effect
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Add shadow on scroll
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.pillar, .component, .impact-card, .option-card, .animate-on-scroll').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Counter animation for statistics
    const animateCounter = (element) => {
        const target = parseInt(element.innerText.replace(/[^0-9]/g, ''));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        // Function to format number with commas
        const formatNumber = (num) => {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        };
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.innerText = formatNumber(Math.floor(current)) + (element.innerText.includes('+') ? '+' : '');
                requestAnimationFrame(updateCounter);
            } else {
                element.innerText = formatNumber(target) + (element.innerText.includes('+') ? '+' : '');
            }
        };
        
        updateCounter();
    };
    
    // Observe stat numbers for counter animation
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('.stat-number, .metric-number').forEach(stat => {
        statObserver.observe(stat);
    });
    
    // Contact Form Modal Functionality
    const contactModal = document.getElementById('contact-modal');
    const contactForm = document.getElementById('contact-form');
    const closeModal = document.querySelector('.close-modal');
    const contactButtons = document.querySelectorAll('.contact-btn');
    
    // Open modal when contact buttons are clicked
    contactButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const reason = button.getAttribute('data-reason');
            openContactModal(reason);
        });
    });
    
    // Close modal when X is clicked
    closeModal.addEventListener('click', closeContactModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === contactModal) {
            closeContactModal();
        }
    });
    
    // Open modal and pre-select reason
    function openContactModal(reason) {
        contactModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Pre-select the appropriate reason checkbox
        if (reason) {
            const reasonCheckbox = document.getElementById(`reason-${reason}`);
            if (reasonCheckbox) {
                reasonCheckbox.checked = true;
            }
        }
        
        // Focus on first input
        setTimeout(() => {
            document.getElementById('contact-name').focus();
        }, 100);
    }
    
    // Close modal
    function closeContactModal() {
        contactModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        contactForm.reset();
    }
    
    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate at least one reason is selected
        const reasonCheckboxes = document.querySelectorAll('input[name="reasons"]:checked');
        if (reasonCheckboxes.length === 0) {
            alert('Please select at least one contact reason.');
            return;
        }
        
        // Collect form data
        const formData = new FormData(contactForm);
        const reasons = Array.from(reasonCheckboxes).map(cb => cb.value);
        
        // Create email content
        const emailData = {
            name: formData.get('name'),
            email: formData.get('email'),
            organization: formData.get('organization') || 'Not provided',
            phone: formData.get('phone') || 'Not provided',
            reasons: reasons.join(', '),
            message: formData.get('message')
        };
        
        // Create mailto link
        const subject = `Contact Form: ${reasons.join(', ')} - ${emailData.name}`;
        const body = `
Name: ${emailData.name}
Email: ${emailData.email}
Organization: ${emailData.organization}
Phone: ${emailData.phone}
Contact Reasons: ${emailData.reasons}

Message:
${emailData.message}
        `.trim();
        
        const mailtoLink = `mailto:e4a@esposure4all.onmicrosoft.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message and close modal
        alert('Your email client should now open with your message. Thank you for contacting Esposure4All!');
        closeContactModal();
    });
    
    // Accessibility: Keyboard navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, index) => {
        link.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && index < navLinks.length - 1) {
                navLinks[index + 1].focus();
            } else if (e.key === 'ArrowLeft' && index > 0) {
                navLinks[index - 1].focus();
            }
        });
    });
    
    // Performance monitoring
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page load time: ${pageLoadTime}ms`);
        });
    }
});

// Animation styles have been moved to styles.css