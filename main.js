document.addEventListener('DOMContentLoaded', () => {
  // 01. Central Data Store
  const PAVILIONS = {
    'pavilion-01': {
      name: 'Pavilion 01 — East Basin',
      shortName: 'Pavilion 01',
      rate: 840,
      maxGuests: 2
    },
    'pavilion-02': {
      name: 'Pavilion 02 — West Ridge',
      shortName: 'Pavilion 02',
      rate: 890,
      maxGuests: 2
    },
    'pavilion-03': {
      name: 'Pavilion 03 — Boulder Site',
      shortName: 'Pavilion 03',
      rate: 940,
      maxGuests: 2
    },
    'pavilion-04': {
      name: 'Pavilion 04 — South Highlands',
      shortName: 'Pavilion 04',
      rate: 1020,
      maxGuests: 2
    },
    'buyout': {
      name: 'Property Buyout — All 4 Pavilions',
      shortName: 'Full Property Buyout',
      rate: 3400,
      maxGuests: 8
    }
  };

  // 02. Header Scroll Contrast Inversion
  const siteHeader = document.getElementById('site-header');
  const syncHeaderContrast = () => {
    if (!siteHeader) return;
    if (window.scrollY > 50) {
      siteHeader.classList.add('is-scrolled');
    } else {
      siteHeader.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', syncHeaderContrast, { passive: true });
  syncHeaderContrast();

  // 03. Mobile Navigation Drawer & Accessibility
  const menuToggle = document.getElementById('menu-toggle');
  const navDrawer = document.getElementById('nav-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  const closeDrawer = () => {
    if (!navDrawer || !menuToggle) return;
    navDrawer.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openDrawer = () => {
    if (!navDrawer || !menuToggle) return;
    navDrawer.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  if (menuToggle && navDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navDrawer.classList.contains('is-open');
      if (isOpen) closeDrawer();
      else openDrawer();
    });

    drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navDrawer.classList.contains('is-open')) {
        closeDrawer();
      }
    });

    navDrawer.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = navDrawer.querySelectorAll('a, button');
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    });
  }

  // 04. Reservation Engine Inputs
  const shelterSelect = document.getElementById('shelter-select');
  const guestSelect = document.getElementById('guest-count');
  const checkInInput = document.getElementById('check-in-date');
  const checkOutInput = document.getElementById('check-out-date');
  const rateDisplay = document.getElementById('summary-rate-display');
  const totalDisplay = document.getElementById('summary-total-display');
  const taxDisplay = document.getElementById('summary-tax-display');
  const estDisplay = document.getElementById('summary-est-display');
  const dockRate = document.getElementById('dock-rate-display');
  const bookingForm = document.getElementById('reservation-form');

  const syncGuestCountOptions = (maxGuests) => {
    if (!guestSelect) return;
    const currentVal = parseInt(guestSelect.value, 10) || 2;
    guestSelect.innerHTML = '';
    for (let i = 1; i <= maxGuests; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i} Adult${i > 1 ? 's' : ''}`;
      if (i === Math.min(currentVal, maxGuests)) opt.selected = true;
      guestSelect.appendChild(opt);
    }
  };

  const toISODate = (d) => d.toISOString().split('T')[0];

  const initialToday = new Date();
  const initialMinDeparture = new Date(initialToday);
  initialMinDeparture.setDate(initialMinDeparture.getDate() + 2);

  if (checkInInput && checkOutInput) {
    checkInInput.min = toISODate(initialToday);
    checkInInput.value = toISODate(initialToday);
    checkOutInput.min = toISODate(initialMinDeparture);
    checkOutInput.value = toISODate(initialMinDeparture);

    checkInInput.addEventListener('change', () => {
      const inDate = new Date(checkInInput.value);
      if (isNaN(inDate)) return;
      const nextMin = new Date(inDate);
      nextMin.setDate(nextMin.getDate() + 2);
      checkOutInput.min = toISODate(nextMin);
      if (new Date(checkOutInput.value) < nextMin) {
        checkOutInput.value = toISODate(nextMin);
      }
      calculatePricing();
    });

    checkOutInput.addEventListener('change', calculatePricing);
  }

  function calculatePricing() {
    if (!shelterSelect || !checkInInput || !checkOutInput) return;
    const shelter = PAVILIONS[shelterSelect.value] || PAVILIONS['pavilion-01'];
    const inDate = new Date(checkInInput.value);
    const outDate = new Date(checkOutInput.value);
    let diffDays = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 2) diffDays = 2;

    const baseCost = shelter.rate * diffDays;
    const tax = Math.round(baseCost * 0.12);
    const grandTotal = baseCost + tax;

    if (rateDisplay) rateDisplay.textContent = `$${shelter.rate.toLocaleString()} × ${diffDays} nights`;
    if (totalDisplay) totalDisplay.textContent = `$${baseCost.toLocaleString()}`;
    if (taxDisplay) taxDisplay.textContent = `+ $${tax.toLocaleString()} local bed tax (12%)`;
    if (estDisplay) estDisplay.textContent = `Est. Total: $${grandTotal.toLocaleString()} USD`;
    if (dockRate) dockRate.textContent = `From $${shelter.rate.toLocaleString()} / night`;
  }

  if (shelterSelect) {
    shelterSelect.addEventListener('change', () => {
      const shelter = PAVILIONS[shelterSelect.value] || PAVILIONS['pavilion-01'];
      syncGuestCountOptions(shelter.maxGuests);
      calculatePricing();
    });
  }

  const pavilionCardBtns = document.querySelectorAll('.pavilion-card__btn');
  pavilionCardBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.pavilion;
      if (shelterSelect && PAVILIONS[key]) {
        shelterSelect.value = key;
        syncGuestCountOptions(PAVILIONS[key].maxGuests);
        calculatePricing();
      }
    });
  });

  calculatePricing();

  // 05. Reservation Modal
  const modal = document.getElementById('booking-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDetails = document.getElementById('modal-details');

  if (bookingForm && modal) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const shelter = PAVILIONS[shelterSelect.value] || PAVILIONS['pavilion-01'];
      const guests = guestSelect ? guestSelect.value : 2;
      const inDate = checkInInput.value;
      const outDate = checkOutInput.value;
      const bookingId = 'SON-' + Math.floor(100000 + Math.random() * 900000);

      if (modalDetails) {
        modalDetails.innerHTML = `
          <div><span>Reference</span><strong>${bookingId}</strong></div>
          <div><span>Structure</span><strong>${shelter.shortName}</strong></div>
          <div><span>Dates</span><strong>${inDate} → ${outDate}</strong></div>
          <div><span>Occupancy</span><strong>${guests} Adult${guests > 1 ? 's' : ''}</strong></div>
        `;
      }
      modal.showModal();
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', () => modal.close());
    }

    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      const isInDialog = (rect.top <= e.clientY && e.clientY <= rect.top + rect.height
        && rect.left <= e.clientX && e.clientX <= rect.left + rect.width);
      if (!isInDialog) modal.close();
    });
  }

  // 06. Floating Reservation Dock
  const floatingDock = document.getElementById('floating-dock');
  const bookingSection = document.getElementById('booking');

  window.addEventListener('scroll', () => {
    if (!floatingDock) return;
    const scrollY = window.scrollY;
    const pastHero = scrollY > window.innerHeight * 0.7;
    const bookingTop = bookingSection ? bookingSection.offsetTop - 300 : Infinity;
    const inBooking = scrollY > bookingTop;

    if (pastHero && !inBooking) {
      floatingDock.classList.add('is-active');
      floatingDock.setAttribute('aria-hidden', 'false');
    } else {
      floatingDock.classList.remove('is-active');
      floatingDock.setAttribute('aria-hidden', 'true');
    }
  }, { passive: true });

  // 07. Scroll Reveals
  const revealElements = document.querySelectorAll('.pavilion-card, .timeline__item, .intro__narrative-col, .booking-section__grid');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(el => {
      el.classList.add('scroll-reveal');
      observer.observe(el);
    });
  }
});