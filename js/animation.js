/* FLAVORBOOK ANIMATION & SLIDER ENGINE */

document.addEventListener('DOMContentLoaded', () => {
  // 1. SCROLL REVEAL ANIMATIONS (IntersectionObserver Fallback)
  const revealElements = document.querySelectorAll('.reveal-fade-up');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add a slight stagger delay if data-delay is specified
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('active');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 2. STATISTICS COUNTER ANIMATION
  const statNumbers = document.querySelectorAll('.stat-number');
  
  if (statNumbers.length > 0) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const endValue = Number(target.getAttribute('data-count'));
          let startValue = 0;
          const duration = 2000; // 2 seconds
          const stepTime = Math.abs(Math.floor(duration / endValue));
          
          const timer = setInterval(() => {
            startValue += 1;
            target.innerText = startValue + (target.getAttribute('data-suffix') || '');
            if (startValue >= endValue) {
              target.innerText = endValue + (target.getAttribute('data-suffix') || '');
              clearInterval(timer);
            }
          }, Math.max(stepTime, 15));
          
          observer.unobserve(target);
        }
      });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(num => counterObserver.observe(num));
  }

  // 3. POPULAR RECIPES SLIDER (Auto-scrolling Carousel)
  const slider = document.querySelector('.slider-container');
  if (slider) {
    let isDown = false;
    let startX;
    let scrollLeft;
    let autoScrollTimer;

    const startAutoScroll = () => {
      autoScrollTimer = setInterval(() => {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (slider.scrollLeft >= maxScroll - 5) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }, 3500);
    };

    const stopAutoScroll = () => {
      clearInterval(autoScrollTimer);
    };

    // Auto-scroll hooks
    startAutoScroll();
    slider.addEventListener('mouseenter', stopAutoScroll);
    slider.addEventListener('mouseleave', startAutoScroll);

    // Click & Drag mouse actions
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      stopAutoScroll();
    });

    slider.addEventListener('mouseleave', () => {
      isDown = false;
      slider.classList.remove('active');
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      slider.classList.remove('active');
      startAutoScroll();
    });

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; // scroll speed modifier
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  // 4. TESTIMONIALS SLIDER
  const testimonialContainer = document.querySelector('.testimonial-cards-container');
  if (testimonialContainer) {
    const cards = testimonialContainer.querySelectorAll('.testimonial-card');
    let activeIndex = 0;
    let testimonialTimer;

    function showTestimonial(index) {
      cards.forEach((card, i) => {
        card.classList.remove('active');
        if (i === index) {
          card.classList.add('active');
        }
      });
    }

    function nextTestimonial() {
      activeIndex = (activeIndex + 1) % cards.length;
      showTestimonial(activeIndex);
    }

    // Auto slide
    testimonialTimer = setInterval(nextTestimonial, 5000);

    testimonialContainer.addEventListener('mouseenter', () => {
      clearInterval(testimonialTimer);
    });

    testimonialContainer.addEventListener('mouseleave', () => {
      testimonialTimer = setInterval(nextTestimonial, 5000);
    });
  }

  // 5. GSAP ANIMATIONS ENHANCEMENT (if GSAP is loaded)
  if (window.gsap) {
    // GSAP floating elements
    gsap.to('.hero-floating-veg img', {
      y: 'random(-20, 20)',
      rotation: 'random(-15, 15)',
      duration: 'random(3, 6)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.5
    });

    // Hero Text Fade Reveal
    gsap.from('.hero-text h1', {
      x: -50,
      opacity: 0,
      duration: 1,
      ease: 'power3.out'
    });
    
    gsap.from('.hero-text p, .hero-buttons', {
      x: -30,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: 'power3.out'
    });

    // Hero Image Zoom In
    gsap.from('.hero-image-container img', {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: 'back.out(1.2)'
    });
  }
});
