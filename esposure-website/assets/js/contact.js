document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    // Handle form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(contactForm);
        const inquiryType = formData.get('inquiry-type');
        const timeline = formData.get('timeline');
        
        // Create email content
        const emailData = {
            name: formData.get('name'),
            email: formData.get('email'),
            organization: formData.get('organization') || 'Not provided',
            phone: formData.get('phone') || 'Not provided',
            inquiryType: inquiryType,
            timeline: timeline || 'Not specified',
            message: formData.get('message')
        };
        
        // Create subject line based on inquiry type
        let subject = 'Contact Form Inquiry';
        switch(inquiryType) {
            case 'p-saas':
                subject = 'P-SaaS Implementation Inquiry';
                break;
            case 'platform':
                subject = 'DEEP™ Platform Licensing Inquiry';
                break;
            case 'partnership':
                subject = 'Strategic Partnership Inquiry';
                break;
            case 'pathfinity':
                subject = 'Pathfinity Integration Inquiry';
                break;
            case 'consultation':
                subject = 'EdTech Consulting Inquiry';
                break;
            default:
                subject = 'General Inquiry';
        }
        
        subject += ` - ${emailData.name}`;
        
        // Create email body
        const body = `
Contact Information:
Name: ${emailData.name}
Email: ${emailData.email}
Organization: ${emailData.organization}
Phone: ${emailData.phone}

Inquiry Details:
Type of Inquiry: ${emailData.inquiryType}
Project Timeline: ${emailData.timeline}

Message:
${emailData.message}

---
This message was sent from the Esposure contact form at esposure.gg/contact
        `.trim();
        
        // Create mailto link
        const mailtoLink = `mailto:noreply@esposure.gg?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success message
        alert('Your email client should now open with your message. Thank you for contacting Esposure!');
        
        // Reset form
        contactForm.reset();
    });
    
    // Mobile menu functionality (if needed)
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});