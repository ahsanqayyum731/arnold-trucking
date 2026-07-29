/* ==========================================================================
   ARNOLD'S TRUCKING LOGISTICS LLC - Main JavaScript Logic
   Includes: Leaflet Map, 3D Yellow Hino Box Truck 360° Interaction, Live Tracking, 
   Driver App & Freight Quote Forms, Testimonials Carousel, Chatbot & Admin Console.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Hide Page Loader
  const loader = document.getElementById('loader');
  setTimeout(() => {
    if (loader) loader.classList.add('loaded');
  }, 700);

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close menu when link clicked
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  // Smooth Scroll Active Link Observer
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      const navItem = document.querySelector(`.nav-menu a[href*=${sectionId}]`);
      
      if (navItem) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          navItem.classList.add('active');
        }
      }
    });
  });

  // Animated Stats Counter
  const statNumbers = document.querySelectorAll('.stat-number');
  let animatedStats = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const target = +stat.getAttribute('data-target');
      let count = 0;
      const increment = Math.ceil(target / 40);
      const updateCount = () => {
        count += increment;
        if (count < target) {
          stat.innerText = count;
          setTimeout(updateCount, 40);
        } else {
          stat.innerText = target;
        }
      };
      updateCount();
    });
  };

  window.addEventListener('scroll', () => {
    const statsSection = document.querySelector('.hero-stats-grid');
    if (statsSection && !animatedStats) {
      const pos = statsSection.getBoundingClientRect().top;
      if (pos < window.innerHeight - 100) {
        animateCounters();
        animatedStats = true;
      }
    }
  });
  if (document.querySelector('.hero-stats-grid')) {
    animateCounters();
    animatedStats = true;
  }

  // --------------------------------------------------------------------------
  // Interactive 3D Yellow Hino Box Truck Viewer (360° Rotatable with MC #1682000)
  // --------------------------------------------------------------------------
  const truck3D = document.getElementById('interactive-truck');
  const truckContainer = document.querySelector('.truck-3d-container');
  const autoRotateBtn = document.getElementById('auto-rotate-btn');
  const rotateLeftBtn = document.getElementById('rotate-left-btn');
  const rotateRightBtn = document.getElementById('rotate-right-btn');

  if (truck3D && truckContainer) {
    let isDragging = false;
    let previousMouseX = 0;
    let currentRotationY = -35;
    let currentRotationX = -12;
    let autoSpin = true;

    // Toggle Auto Spin button
    if (autoRotateBtn) {
      autoRotateBtn.addEventListener('click', () => {
        autoSpin = !autoSpin;
        if (autoSpin) {
          truck3D.classList.add('auto-spin');
          autoRotateBtn.classList.add('active');
          autoRotateBtn.innerHTML = '<i data-lucide="refresh-cw"></i> 360° Auto Spin';
        } else {
          truck3D.classList.remove('auto-spin');
          autoRotateBtn.classList.remove('active');
          autoRotateBtn.innerHTML = '<i data-lucide="pause"></i> Spin Paused';
        }
        if (window.lucide) window.lucide.createIcons();
      });
    }

    // Manual Rotate Left / Right Buttons
    if (rotateLeftBtn) {
      rotateLeftBtn.addEventListener('click', () => {
        autoSpin = false;
        truck3D.classList.remove('auto-spin');
        if (autoRotateBtn) autoRotateBtn.classList.remove('active');
        currentRotationY -= 45;
        truck3D.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
      });
    }

    if (rotateRightBtn) {
      rotateRightBtn.addEventListener('click', () => {
        autoSpin = false;
        truck3D.classList.remove('auto-spin');
        if (autoRotateBtn) autoRotateBtn.classList.remove('active');
        currentRotationY += 45;
        truck3D.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
      });
    }

    // Drag logic
    truckContainer.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
      if (autoSpin) {
        truck3D.classList.remove('auto-spin');
      }
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    truckContainer.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - previousMouseX;
        currentRotationY += deltaX * 1.2;
        previousMouseX = e.clientX;
        truck3D.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
      }
    });

    // Touch support for mobile
    truckContainer.addEventListener('touchstart', (e) => {
      isDragging = true;
      previousMouseX = e.touches[0].clientX;
      if (autoSpin) {
        truck3D.classList.remove('auto-spin');
      }
    });

    window.addEventListener('touchend', () => { isDragging = false; });

    truckContainer.addEventListener('touchmove', (e) => {
      if (isDragging) {
        const deltaX = e.touches[0].clientX - previousMouseX;
        currentRotationY += deltaX * 1.2;
        previousMouseX = e.touches[0].clientX;
        truck3D.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
      }
    });
  }

  // --------------------------------------------------------------------------
  // Leaflet Interactive Map & Shipment Tracking
  // --------------------------------------------------------------------------
  let map;
  let activePolyline;
  let truckMarker;
  let originMarker;
  let destMarker;

  const trackingDatabase = {
    'ARNOLD-777': {
      ref: 'ARNOLD-777',
      status: 'transit',
      statusText: 'In Transit',
      origin: 'Huntersville, NC',
      destination: 'Atlanta, GA',
      originCoords: [35.4107, -80.8428],
      destCoords: [33.7490, -84.3880],
      progress: 60,
      steps: ['ordered', 'loaded', 'transit'],
      pingTime: '12 mins ago (I-85 Southbound)'
    },
    'ARNOLD-999': {
      ref: 'ARNOLD-999',
      status: 'delivered',
      statusText: 'Delivered',
      origin: 'Charlotte, NC',
      destination: 'Chicago, IL',
      originCoords: [35.2271, -80.8431],
      destCoords: [41.8781, -87.6298],
      progress: 100,
      steps: ['ordered', 'loaded', 'transit', 'delivered'],
      pingTime: 'Delivered Today at 08:30 AM'
    }
  };

  const initMap = () => {
    const mapElement = document.getElementById('logistics-map');
    if (!mapElement || typeof L === 'undefined') return;

    map = L.map('logistics-map', {
      center: [35.4107, -80.8428],
      zoom: 6,
      zoomControl: true
    });

    // Dark Mode Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Initial default tracking load
    loadTrackingData('ARNOLD-777');
  };

  const customIcon = (color, symbol) => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="
        background: ${color};
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid #FFF;
        box-shadow: 0 0 12px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFF;
        font-weight: bold;
        font-size: 12px;
      ">${symbol}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  };

  const loadTrackingData = (code) => {
    const data = trackingDatabase[code.toUpperCase()];
    const resultBox = document.getElementById('tracking-result-box');
    
    if (!data) {
      showToast('Shipment reference code not found. Try ARNOLD-777.', 'warning');
      return;
    }

    if (resultBox) resultBox.classList.remove('hidden');

    // Update UI elements
    document.getElementById('tracker-ref-id').innerText = data.ref;
    document.getElementById('tracker-status-badge').innerText = data.statusText;
    document.getElementById('tracker-origin').innerText = data.origin;
    document.getElementById('tracker-destination').innerText = data.destination;
    document.getElementById('tracker-ping-time').innerText = data.pingTime;

    // Timeline Steps
    const steps = ['ordered', 'loaded', 'transit', 'delivered'];
    steps.forEach(s => {
      const el = document.getElementById(`step-${s}`);
      if (el) {
        if (data.steps.includes(s)) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });

    // Update Map
    if (map) {
      if (activePolyline) map.removeLayer(activePolyline);
      if (truckMarker) map.removeLayer(truckMarker);
      if (originMarker) map.removeLayer(originMarker);
      if (destMarker) map.removeLayer(destMarker);

      const oLat = data.originCoords[0];
      const oLng = data.originCoords[1];
      const dLat = data.destCoords[0];
      const dLng = data.destCoords[1];

      // Interpolate current position based on progress %
      const curLat = oLat + (dLat - oLat) * (data.progress / 100);
      const curLng = oLng + (dLng - oLng) * (data.progress / 100);

      originMarker = L.marker(data.originCoords, { icon: customIcon('#0EA5E9', 'NC') }).addTo(map)
        .bindPopup(`<b>HQ / Origin:</b> ${data.origin}`);
      destMarker = L.marker(data.destCoords, { icon: customIcon('#F59E0B', 'DEST') }).addTo(map)
        .bindPopup(`<b>Destination:</b> ${data.destination}`);
      
      truckMarker = L.marker([curLat, curLng], { icon: customIcon('#F97316', '🚛') }).addTo(map)
        .bindPopup(`<b>Hino Box Truck Status:</b> ${data.ref} - ${data.statusText}`).openPopup();

      activePolyline = L.polyline([data.originCoords, [curLat, curLng], data.destCoords], {
        color: '#F97316',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.85
      }).addTo(map);

      map.fitBounds([data.originCoords, data.destCoords], { padding: [50, 50] });
    }
  };

  initMap();

  // Search button event
  const trackingBtn = document.getElementById('tracking-search-btn');
  const trackingInput = document.getElementById('tracking-input');
  if (trackingBtn && trackingInput) {
    trackingBtn.addEventListener('click', () => {
      const code = trackingInput.value.trim();
      if (code) loadTrackingData(code);
    });
  }

  // --------------------------------------------------------------------------
  // Form Custom File Upload Labels
  // --------------------------------------------------------------------------
  const setupFileInput = (inputId) => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('change', (e) => {
      const fileName = e.target.files[0]?.name || 'File Selected';
      const label = input.nextElementSibling.querySelector('.file-label-text');
      if (label) label.innerText = fileName;
    });
  };
  setupFileInput('driver-cdl');
  setupFileInput('driver-insurance');

  // Local State Storage for Applications & Quotes
  const appState = {
    driverApps: [
      {
        id: 1,
        date: '2026-07-24',
        name: 'Carlos Mendez',
        company: 'Mendez Express',
        phone: '(704) 555-0182',
        location: 'Charlotte, NC',
        truckType: 'Yellow Hino 26ft Box Truck with Liftgate',
        experience: '4 Yrs',
        files: 'CDL_Mendez.pdf, COI.pdf',
        status: 'Pending'
      }
    ],
    quotes: [
      {
        id: 1,
        date: '2026-07-25',
        company: 'Piedmont Distribution',
        contact: 'Sarah Jenkins',
        phone: '(980) 555-0199',
        route: 'Huntersville, NC -> Atlanta, GA',
        weight: '6,200 lbs',
        trailer: 'Yellow Hino 26ft Box Truck with Liftgate',
        notes: 'Ground pickup required',
        status: 'Quoted'
      }
    ]
  };

  // Driver Application Form Handler
  const driverForm = document.getElementById('driver-application-form');
  if (driverForm) {
    driverForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('driver-name').value;
      const location = document.getElementById('driver-location').value;
      const truck = document.getElementById('driver-truck-type').value;
      const exp = document.getElementById('driver-experience').value;

      appState.driverApps.unshift({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        name: name,
        company: document.getElementById('driver-company').value || 'N/A',
        phone: document.getElementById('driver-phone').value,
        location: location,
        truckType: truck,
        experience: `${exp} Yrs`,
        files: 'CDL_Uploaded.pdf, Insurance_COI.pdf',
        status: 'Submitted'
      });

      updateAdminTables();
      driverForm.reset();
      showToast('Lease-On Application Submitted! CEO Rodney Arnold will contact you shortly.', 'success');
    });
  }

  // Freight Quote Form Handler
  const quoteForm = document.getElementById('shipper-quote-form');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const company = document.getElementById('quote-company').value;
      const contact = document.getElementById('quote-contact').value;
      const pickup = document.getElementById('quote-pickup').value;
      const delivery = document.getElementById('quote-delivery').value;
      const weight = document.getElementById('quote-weight').value;
      const trailer = document.getElementById('quote-trailer').value;

      appState.quotes.unshift({
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        company: company,
        contact: contact,
        phone: document.getElementById('quote-phone').value,
        route: `${pickup} -> ${delivery}`,
        weight: `${weight} lbs`,
        trailer: trailer,
        notes: document.getElementById('quote-notes').value || 'Standard delivery',
        status: 'Calculated'
      });

      updateAdminTables();
      quoteForm.reset();
      showToast(`Freight Rate Calculated for ${company}! Check your email inbox shortly.`, 'success');
    });
  }

  // Contact Message Form Handler
  const contactForm = document.getElementById('contact-email-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      contactForm.reset();
      showToast('Thank you! Message sent directly to CEO Rodney Arnold & dispatch desk.', 'success');
    });
  }

  // --------------------------------------------------------------------------
  // Testimonials Carousel
  // --------------------------------------------------------------------------
  const track = document.getElementById('testimonial-track');
  const prevBtn = document.getElementById('prev-review-btn');
  const nextBtn = document.getElementById('next-review-btn');
  const dotsContainer = document.getElementById('slider-dots');

  if (track) {
    const slides = Array.from(track.children);
    let currentSlide = 0;

    // Create pagination dots
    slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(index));
      if (dotsContainer) dotsContainer.appendChild(dot);
    });

    const updateDots = (index) => {
      if (!dotsContainer) return;
      const dots = Array.from(dotsContainer.children);
      dots.forEach((d, i) => {
        if (i === index) d.classList.add('active');
        else d.classList.remove('active');
      });
    };

    const goToSlide = (index) => {
      currentSlide = index;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      updateDots(currentSlide);
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
        goToSlide(currentSlide);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
        goToSlide(currentSlide);
      });
    }

    // Auto-slide every 6 seconds
    setInterval(() => {
      currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
      goToSlide(currentSlide);
    }, 6000);
  }

  // --------------------------------------------------------------------------
  // FAQ Accordion
  // --------------------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // --------------------------------------------------------------------------
  // Floating AI Chatbot ("ArnoldBot")
  // --------------------------------------------------------------------------
  const chatbotToggle = document.getElementById('chatbot-toggle-btn');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatBody = document.getElementById('chat-body');
  const chatInputForm = document.getElementById('chat-input-form');
  const chatMessageInput = document.getElementById('chat-message-input');

  if (chatbotToggle && chatbotWindow) {
    chatbotToggle.addEventListener('click', () => {
      chatbotWindow.classList.toggle('hidden');
    });
  }

  const addChatMessage = (text, isUser = false) => {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', isUser ? 'user-msg' : 'bot-msg');
    msgDiv.innerHTML = `<div class="msg-content"><p>${text}</p></div>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const handleBotResponse = (query) => {
    const q = query.toLowerCase();
    let response = "Thank you for contacting ARNOLD'S TRUCKING LOGISTICS LLC! CEO Rodney Arnold and our dispatch team are ready to handle your box truck shipping needs. You can call us directly at (646) 545-9289.";

    if (q.includes('quote') || q.includes('rate') || q.includes('price')) {
      response = "To request an instant rate quote for your 26ft Box Truck shipment, please fill out our Quote Form on this page or call (646) 545-9289.";
    } else if (q.includes('lease') || q.includes('driver') || q.includes('apply') || q.includes('join')) {
      response = "We welcome qualified Box Truck owner-operators! Apply under our MC #1682000 using the 'Join Our Fleet' section on this page.";
    } else if (q.includes('track') || q.includes('status') || q.includes('where')) {
      response = "You can enter your shipment reference code (e.g. ARNOLD-777) in our Live Tracking section to view real-time location on the map.";
    } else if (q.includes('address') || q.includes('location') || q.includes('owner') || q.includes('ceo') || q.includes('phone')) {
      response = "ARNOLD'S TRUCKING LOGISTICS LLC is owned by CEO Rodney Arnold. Office Address: 13810 BOREN ST #101, HUNTERSVILLE, NC, 28078. Phone: (646) 545-9289. MC #1682000, USDOT #4314007.";
    }

    setTimeout(() => {
      addChatMessage(response, false);
    }, 600);
  };

  if (chatInputForm) {
    chatInputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = chatMessageInput.value.trim();
      if (val) {
        addChatMessage(val, true);
        chatMessageInput.value = '';
        handleBotResponse(val);
      }
    });
  }

  // Quick Action Buttons inside Chatbot
  document.querySelectorAll('.chat-opt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-value');
      addChatMessage(btn.innerText, true);
      handleBotResponse(val);
    });
  });

  // --------------------------------------------------------------------------
  // Admin Dashboard Portal Overlay
  // --------------------------------------------------------------------------
  const adminToggleBtn = document.getElementById('admin-toggle-btn');
  const adminFooterBtn = document.getElementById('admin-trigger-footer');
  const adminOverlay = document.getElementById('admin-dashboard-overlay');
  const adminCloseBtn = document.getElementById('admin-close-btn');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginBox = document.getElementById('admin-login-box');
  const adminContentBox = document.getElementById('admin-content-box');
  const loginErrorMsg = document.getElementById('login-error-msg');

  const openAdmin = () => adminOverlay.classList.remove('hidden');
  const closeAdmin = () => adminOverlay.classList.add('hidden');

  if (adminToggleBtn) adminToggleBtn.addEventListener('click', openAdmin);
  if (adminFooterBtn) adminFooterBtn.addEventListener('click', (e) => { e.preventDefault(); openAdmin(); });
  if (adminCloseBtn) adminCloseBtn.addEventListener('click', closeAdmin);

  // Login handler
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('admin-username').value;
      const p = document.getElementById('admin-password').value;

      if (u === 'admin' && p === 'arnoldstrucking') {
        adminLoginBox.classList.add('hidden');
        adminContentBox.classList.remove('hidden');
        loginErrorMsg.classList.add('hidden');
        updateAdminTables();
      } else {
        loginErrorMsg.classList.remove('hidden');
      }
    });
  }

  // Admin Tab Switcher
  const adminTabs = document.querySelectorAll('.admin-tab-btn');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      adminTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetId = `tab-${tab.getAttribute('data-tab')}`;
      document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // Render Admin Tables
  function updateAdminTables() {
    const driverTbody = document.getElementById('driver-apps-tbody');
    const quoteTbody = document.getElementById('shipper-quotes-tbody');
    const countDrivers = document.getElementById('count-driver-apps');
    const countQuotes = document.getElementById('count-shipper-quotes');

    if (countDrivers) countDrivers.innerText = appState.driverApps.length;
    if (countQuotes) countQuotes.innerText = appState.quotes.length;

    if (driverTbody) {
      driverTbody.innerHTML = appState.driverApps.map(app => `
        <tr>
          <td>${app.date}</td>
          <td><strong>${app.name}</strong><br><small>${app.phone}</small></td>
          <td>${app.location}</td>
          <td>${app.truckType}</td>
          <td>${app.experience}</td>
          <td><span class="badge badge-accent">📄 View Files</span></td>
          <td><span class="badge">${app.status}</span></td>
          <td><button class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="alert('Driver verified under MC #1682000!')">Approve</button></td>
        </tr>
      `).join('');
    }

    if (quoteTbody) {
      quoteTbody.innerHTML = appState.quotes.map(q => `
        <tr>
          <td>${q.date}</td>
          <td><strong>${q.company}</strong><br><small>${q.contact}</small></td>
          <td>${q.phone}</td>
          <td>${q.route}</td>
          <td>${q.weight}</td>
          <td>${q.trailer}</td>
          <td>${q.notes}</td>
          <td><button class="btn btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" onclick="alert('Rate sheet dispatched!')">Send Rate</button></td>
        </tr>
      `).join('');
    }
  }

  // Admin Live Tracking Controller
  const trackingProgressSlider = document.getElementById('admin-truck-progress');
  const progressValueText = document.getElementById('admin-progress-value');
  const updateTrackingBtn = document.getElementById('admin-update-tracking-btn');
  const trackingUpdateAlert = document.getElementById('tracking-update-alert');

  if (trackingProgressSlider && progressValueText) {
    trackingProgressSlider.addEventListener('input', (e) => {
      progressValueText.innerText = `${e.target.value}%`;
    });
  }

  if (updateTrackingBtn) {
    updateTrackingBtn.addEventListener('click', () => {
      const selectedTruck = document.getElementById('admin-select-truck').value;
      const newStatus = document.getElementById('admin-truck-status').value;
      const newProgress = parseInt(trackingProgressSlider.value);

      if (trackingDatabase[selectedTruck]) {
        trackingDatabase[selectedTruck].progress = newProgress;
        trackingDatabase[selectedTruck].status = newStatus;
        trackingDatabase[selectedTruck].statusText = newStatus.toUpperCase();
        trackingDatabase[selectedTruck].pingTime = `Updated by CEO Rodney Arnold just now (${newProgress}%)`;

        loadTrackingData(selectedTruck);
        if (trackingUpdateAlert) {
          trackingUpdateAlert.classList.remove('hidden');
          setTimeout(() => trackingUpdateAlert.classList.add('hidden'), 4000);
        }
      }
    });
  }

  // Helper function for Toast Notifications
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="color: var(--color-primary);"></i><span>${message}</span>`;
    container.appendChild(toast);

    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }
});
