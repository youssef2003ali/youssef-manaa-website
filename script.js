// Portfolio JavaScript - Youssef Ali Manaa
// Author: Youssef Ali Manaa
// Description: Interactive functionality for personal portfolio website

'use strict';

// Global variables
let isMenuOpen = false;
let lastScrollTop = 0;

// Theme Management
class ThemeManager {
    constructor() {
        this.isDark = localStorage.getItem('theme') === 'dark';
        this.init();
    }

    init() {
        this.applyTheme();
        this.setupThemeToggle();
    }

    applyTheme() {
        const body = document.body;
        const themeIcons = document.querySelectorAll('.theme-toggle i');
        
        if (this.isDark) {
            body.setAttribute('data-theme', 'dark');
            themeIcons.forEach(icon => icon.className = 'fas fa-sun');
        } else {
            body.removeAttribute('data-theme');
            themeIcons.forEach(icon => icon.className = 'fas fa-moon');
        }
    }

    toggle() {
        this.isDark = !this.isDark;
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
        this.applyTheme();
    }

    setupThemeToggle() {
        const toggleButtons = document.querySelectorAll('.theme-toggle');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggle());
        });
    }
}

// Mobile Navigation Manager
class MobileNavManager {
    constructor() {
        this.mobileNav = document.getElementById('mobileNav');
        this.toggleButton = document.querySelector('.mobile-menu-toggle');
        this.toggleIcon = this.toggleButton?.querySelector('i');
        this.init();
    }

    init() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggle());
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Close menu when pressing Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    toggle() {
        if (this.mobileNav.classList.contains('active')) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.mobileNav.classList.add('active');
        if (this.toggleIcon) {
            this.toggleIcon.className = 'fas fa-times';
        }
        isMenuOpen = true;
        document.body.style.overflow = 'hidden'; // Prevent scrolling when menu is open
    }

    close() {
        this.mobileNav.classList.remove('active');
        if (this.toggleIcon) {
            this.toggleIcon.className = 'fas fa-bars';
        }
        isMenuOpen = false;
        document.body.style.overflow = ''; // Restore scrolling
    }

    handleOutsideClick(e) {
        if (!this.mobileNav.contains(e.target) && 
            !this.toggleButton.contains(e.target) && 
            isMenuOpen) {
            this.close();
        }
    }
}

// Smooth Scrolling Manager
class ScrollManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmoothScrolling();
        this.setupHeaderHide();
        this.setupScrollAnimations();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                
                if (target) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    if (isMenuOpen) {
                        window.mobileNav.close();
                    }
                }
            });
        });
    }

    setupHeaderHide() {
        const header = document.querySelector('header');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll(
            '.skill-category, .experience-card, .project-card, .stat-item'
        );
        
        animatedElements.forEach(el => observer.observe(el));
    }
}

// Contact Form Manager
class ContactFormManager {
    constructor() {
        this.form = document.querySelector('.contact-form form');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        // Validate form
        if (!this.validateForm(data)) {
            return;
        }

        // Create mailto link
        const mailtoLink = this.createMailtoLink(data);
        
        // Open email client
        window.location.href = mailtoLink;
        
        // Show success notification
        NotificationManager.show(
            'Thank you for your message! Your email client should open now.', 
            'success'
        );
        
        // Reset form
        this.form.reset();
    }

    validateForm(data) {
        const requiredFields = ['name', 'email', 'subject', 'message'];
        const missingFields = requiredFields.filter(field => !data[field] || !data[field].trim());
        
        if (missingFields.length > 0) {
            NotificationManager.show('Please fill in all required fields.', 'error');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            NotificationManager.show('Please enter a valid email address.', 'error');
            return false;
        }

        return true;
    }

    createMailtoLink(data) {
        const subject = encodeURIComponent(data.subject);
        const body = encodeURIComponent(
            `Name: ${data.name}\n` +
            `Email: ${data.email}\n\n` +
            `Message:\n${data.message}`
        );
        
        return `mailto:youssefa700@gmail.com?subject=${subject}&body=${body}`;
    }
}

// Notification Manager
class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Set styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: '10000',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease',
            maxWidth: '400px',
            fontWeight: '500',
            fontSize: '0.9rem'
        });

        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto-remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// Typing Animation Manager
class TypingAnimationManager {
    constructor() {
        this.element = document.querySelector('.hero .subtitle');
        this.texts = [
            'Data Scientist & AI Developer',
            'Machine Learning Engineer',
            'Computer Engineering Student',
            'AI Enthusiast & Innovator'
        ];
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
        this.init();
    }

    init() {
        if (this.element) {
            setTimeout(() => this.type(), 2000);
        }
    }

    type() {
        const currentText = this.texts[this.currentTextIndex];
        
        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;
        } else {
            this.element.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;
        }

        let typeSpeed = this.isDeleting ? 50 : 100;

        if (!this.isDeleting && this.currentCharIndex === currentText.length) {
            typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentCharIndex === 0) {
            this.isDeleting = false;
            this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// Interactive Elements Manager
class InteractiveElementsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSkillHover();
        this.setupProjectHover();
        this.setupStatCounters();
        this.setupKeyboardShortcuts();
    }

    setupSkillHover() {
        const skillCategories = document.querySelectorAll('.skill-category');
        
        skillCategories.forEach(category => {
            category.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            category.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupProjectHover() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px) scale(1.01)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    setupStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent);
        const increment = target / 50;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = element.textContent.replace(/\d+/, target.toString());
                clearInterval(timer);
            } else {
                element.textContent = element.textContent.replace(/\d+/, Math.floor(current).toString());
            }
        }, 30);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Toggle theme with Ctrl/Cmd + D
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                window.themeManager.toggle();
            }
            
            // Go to contact with Ctrl/Cmd + Enter
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
            }
            
            // Close mobile menu with Escape
            if (e.key === 'Escape' && isMenuOpen) {
                window.mobileNav.close();
            }
        });
    }
}

// Performance Manager
class PerformanceManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.preloadCriticalAssets();
        this.setupPerformanceMonitoring();
    }

    setupLazyLoading() {
        // Lazy load images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    preloadCriticalAssets() {
        // Preload critical fonts
        const fontPreloads = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
        ];

        fontPreloads.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font;
            link.as = 'style';
            link.onload = function() { this.rel = 'stylesheet'; };
            document.head.appendChild(link);
        });
    }

    setupPerformanceMonitoring() {
        // Log performance metrics
        window.addEventListener('load', () => {
            if ('performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Performance:', {
                    'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
                    'Full Load Time': Math.round(perfData.loadEventEnd - perfData.fetchStart),
                    'First Paint': Math.round(performance.getEntriesByType('paint')[0]?.startTime || 0)
                });
            }
        });
    }
}

// Utility Functions
const Utils = {
    // Debounce function for performance
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Get current section for navigation highlighting
    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 100;
        
        for (let section of sections) {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            
            if (scrollPos >= top && scrollPos < top + height) {
                return section.id;
            }
        }
        return null;
    },

    // Smooth scroll to element
    scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = element.offsetTop - headerHeight - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
};

// Navigation Highlighting
class NavigationHighlighter {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-nav a[href^="#"]');
        this.sections = document.querySelectorAll('section[id]');
        this.init();
    }

    init() {
        this.highlightCurrentSection = Utils.throttle(this.highlightCurrentSection.bind(this), 100);
        window.addEventListener('scroll', this.highlightCurrentSection);
    }

    highlightCurrentSection() {
        const scrollPos = window.pageYOffset + 150;
        let currentSection = '';

        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
}

// Error Handler
class ErrorHandler {
    static init() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            // You could send error reports to a service here
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            e.preventDefault();
        });
    }

    static handleAsyncError(error, context = '') {
        console.error(`Async error ${context}:`, error);
        NotificationManager.show(
            'Something went wrong. Please try again later.',
            'error'
        );
    }
}

// Global functions for HTML onclick handlers
function toggleTheme() {
    if (window.themeManager) {
        window.themeManager.toggle();
    }
}

function toggleMobileMenu() {
    if (window.mobileNav) {
        window.mobileNav.toggle();
    }
}

function closeMobileMenu() {
    if (window.mobileNav) {
        window.mobileNav.close();
    }
}

// Application Initialization
class App {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                this.start();
            }
        } catch (error) {
            ErrorHandler.handleAsyncError(error, 'App initialization');
        }
    }

    start() {
        try {
            // Initialize error handling first
            ErrorHandler.init();

            // Initialize all managers
            window.themeManager = new ThemeManager();
            window.mobileNav = new MobileNavManager();
            window.scrollManager = new ScrollManager();
            window.contactForm = new ContactFormManager();
            window.interactiveElements = new InteractiveElementsManager();
            window.navigationHighlighter = new NavigationHighlighter();
            window.performanceManager = new PerformanceManager();
            
            // Initialize animations after a short delay
            setTimeout(() => {
                window.typingAnimation = new TypingAnimationManager();
            }, 1000);

            this.isInitialized = true;
            
            // Log successful initialization
            console.log('🎉 Portfolio initialized successfully!');
            console.log('👨‍💻 Youssef Ali Manaa - Data Scientist & AI Developer');
            console.log('📧 Contact: youssefa700@gmail.com');
            console.log('🔗 GitHub: github.com/youssef2003ali');
            console.log('⌨️  Keyboard shortcuts:');
            console.log('   • Ctrl/Cmd + D: Toggle theme');
            console.log('   • Ctrl/Cmd + Enter: Go to contact');
            console.log('   • Escape: Close mobile menu');

        } catch (error) {
            ErrorHandler.handleAsyncError(error, 'App startup');
        }
    }
}

// Initialize the application
new App();

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        MobileNavManager,
        ScrollManager,
        ContactFormManager,
        NotificationManager,
        Utils
    };
}