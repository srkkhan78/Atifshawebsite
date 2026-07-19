// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
toggle?.addEventListener('click', () => navLinks?.classList.toggle('open'));

// Close mobile nav on link click
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Contact form
const form = document.getElementById('contactForm');
const msg = document.getElementById('formMsg');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  msg.textContent = '';

  const data = {
    name: form.name.value,
    email: form.email.value,
    service: form.service.value,
    message: form.message.value,
  };

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      msg.textContent = '✅ Message sent! We\'ll get back to you within 24 hours.';
      form.reset();
      setTimeout(() => { msg.textContent = ''; }, 6000);
    } else {
      msg.style.color = '#f87171';
      msg.textContent = '❌ Something went wrong. Please try WhatsApp instead.';
    }
  } catch {
    msg.style.color = '#f87171';
    msg.textContent = '❌ Could not send. Please try WhatsApp instead.';
  }

  btn.disabled = false;
  btn.textContent = 'Send Message →';
});

// Scroll-reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .step, .portfolio-card, .tech-pill').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
