const backTop = document.getElementById('backTop');
if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('visible', window.scrollY > 600);
  });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const payload = Object.fromEntries(formData.entries());
    const submitBtn = contactForm.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    formStatus.textContent = '';

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        formStatus.textContent = "Thanks, I'll get back to you soon.";
        formStatus.style.color = 'var(--cyan)';
        contactForm.reset();
      } else {
        formStatus.textContent = data.error || 'Something went wrong, please try again.';
        formStatus.style.color = '#ff6b6b';
      }
    } catch (err) {
      formStatus.textContent = 'Network error, please try again later.';
      formStatus.style.color = '#ff6b6b';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}