//ALL THE CODE MARKED WITH COMMENTS IS FOR MY BOYFRIEND LOL just ignore this!!

document.addEventListener('DOMContentLoaded', function() {
    // Audio elements
    const clickSound = document.getElementById('clickSound');
    const hoverSound = document.getElementById('hoverSound');
    
    // Loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Hide loading screen after a delay
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1500);
    
    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('.nav-link, .next-button, .prev-button');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            if (hoverSound) {
                hoverSound.currentTime = 0;
                hoverSound.volume = 0.3;
                hoverSound.play().catch(e => console.log("Audio play prevented:", e));
            }
        });
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(e => console.log("Audio play prevented:", e));
            }
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Improved smooth scroll with better easing
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Carousel functionality
    initServiceCarousel();
});

function initServiceCarousel() {
    const track = document.querySelector('.carousel-track');
    const cards = document.querySelectorAll('.service-card');
    const nextButton = document.querySelector('.next-button');
    const prevButton = document.querySelector('.prev-button');
    const dots = document.querySelectorAll('.dot');
    
    if (!track || !cards.length || !nextButton || !prevButton) return;
    
    let currentIndex = 0;
    let cardsPerView = getCardsPerView();
    let maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
    
    // Initial setup
    updateButtonStates();
    updateActiveDot();
    
    // Update on window resize
    window.addEventListener('resize', () => {
        const newCardsPerView = getCardsPerView();
        
        // Only update if cards per view changed
        if (newCardsPerView !== cardsPerView) {
            cardsPerView = newCardsPerView;
            maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
            
            // Make sure current index is valid after resize
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
            
            goToSlide(currentIndex);
            updateButtonStates();
        }
    });
    
    // Button click handlers
    nextButton.addEventListener('click', () => {
        if (currentIndex < maxIndex) {
            goToSlide(currentIndex + 1);
        } else {
            // Bounce effect when reaching the end
            track.style.transform = `translateX(calc(-${currentIndex * 100}% - 20px))`;
            setTimeout(() => {
                track.style.transform = `translateX(-${currentIndex * 100}%)`;
            }, 200);
        }
    });
    
    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            goToSlide(currentIndex - 1);
        } else {
            // Bounce effect when at the beginning
            track.style.transform = `translateX(20px)`;
            setTimeout(() => {
                track.style.transform = `translateX(0)`;
            }, 200);
        }
    });
    
    // Dot click handlers
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.dataset.index);
            goToSlide(slideIndex);
        });
    });
    
    // Function to get number of cards per view based on screen size
    function getCardsPerView() {
        return window.innerWidth < 768 ? 1 : 3;
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentIndex = index;
        
        // Calculate percentage to move
        const slidePercentage = index * 100;
        
        // Move the track
        track.style.transform = `translateX(-${slidePercentage}%)`;
        
        // Update active dot
        updateActiveDot();
        
        // Update button states
        updateButtonStates();
    }
    
    // Update the active dot
    function updateActiveDot() {
        document.querySelectorAll('.dot').forEach((dot, index) => {
            if (parseInt(dot.dataset.index) === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Update button states (disabled when at start/end)
    function updateButtonStates() {
        prevButton.disabled = currentIndex === 0;
        nextButton.disabled = currentIndex === maxIndex;
        
        prevButton.style.opacity = currentIndex === 0 ? '0.5' : '1';
        nextButton.style.opacity = currentIndex === maxIndex ? '0.5' : '1';
    }
    
    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe left, go to next
            if (currentIndex < maxIndex) {
                goToSlide(currentIndex + 1);
            }
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe right, go to previous
            if (currentIndex > 0) {
                goToSlide(currentIndex - 1);
            }
        }
    }
}