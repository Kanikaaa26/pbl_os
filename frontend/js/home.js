// Home Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initializeHomePage();
});

function initializeHomePage() {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.about-card, .feature-card').forEach(card => {
        observer.observe(card);
    });

    // Add smooth scrolling for anchor links (only for same-page anchors)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        // Only apply smooth scrolling for anchors that don't link to other pages
        if (href !== '#' && !href.includes('.html')) {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });

    // Add CPU core animations
    animateCpuCores();

    // Add typing effect to hero subtitle (optional)
    // typeWriterEffect();
}

function animateCpuCores() {
    const cores = document.querySelectorAll('.cpu-core');
    cores.forEach((core, index) => {
        core.style.animationDelay = `${index * 0.5}s`;
    });
}

function typeWriterEffect() {
    const element = document.querySelector('.hero-subtitle');
    const text = element.textContent;
    element.textContent = '';
    element.style.borderRight = '2px solid var(--secondary-color)';

    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
            element.style.borderRight = 'none';
        }
    }, 100);
}

// Add CSS for animation classes
const style = document.createElement('style');
style.textContent = `
    .about-card, .feature-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .about-card.animate-in, .feature-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }

    .about-card:nth-child(1) { transition-delay: 0.1s; }
    .about-card:nth-child(2) { transition-delay: 0.2s; }
    .about-card:nth-child(3) { transition-delay: 0.3s; }
    .about-card:nth-child(4) { transition-delay: 0.4s; }

    .feature-card:nth-child(1) { transition-delay: 0.1s; }
    .feature-card:nth-child(2) { transition-delay: 0.2s; }
    .feature-card:nth-child(3) { transition-delay: 0.3s; }
    .feature-card:nth-child(4) { transition-delay: 0.4s; }
    .feature-card:nth-child(5) { transition-delay: 0.5s; }
    .feature-card:nth-child(6) { transition-delay: 0.6s; }
`;
document.head.appendChild(style);