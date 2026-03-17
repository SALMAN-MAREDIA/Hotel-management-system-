// Main JavaScript — Hotel Oasis
document.addEventListener('DOMContentLoaded', function () {

  // ===== Gallery Filter =====
  var filterBtns = document.querySelectorAll('.gallery-filter');
  var galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');

      filterBtns.forEach(function (b) {
        b.classList.remove('btn-warning', 'active');
        b.classList.add('btn-outline-warning');
      });
      this.classList.remove('btn-outline-warning');
      this.classList.add('btn-warning', 'active');

      galleryItems.forEach(function (item) {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.classList.remove('hidden');
          item.style.display = '';
        } else {
          item.classList.add('hidden');
          item.style.display = 'none';
        }
      });
    });
  });

  // ===== Room Image Fallback =====
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      var fallback = this.nextElementSibling;
      if (fallback) fallback.style.display = 'flex';
    });
  });

  // ===== Auto-dismiss Alerts =====
  var alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) bsAlert.close();
    }, 5000);
  });

  // ===== Navbar Scroll Effect =====
  var navbar = document.querySelector('.navbar.fixed-top');
  function updateNavbar() {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();

  // ===== Mobile Navbar: Close on Link Click & Backdrop =====
  var navbarCollapse = document.getElementById('navbarNav');
  var navbarBackdrop = document.getElementById('navbar-backdrop');
  var navbarToggler = document.getElementById('navbar-toggler');

  if (navbarCollapse && navbarBackdrop) {
    // Close menu when a nav link is clicked (mobile)
    var navLinks = navbarCollapse.querySelectorAll('.nav-link');
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      });
    });

    // Show/hide backdrop with menu
    navbarCollapse.addEventListener('show.bs.collapse', function () {
      navbarBackdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    });

    navbarCollapse.addEventListener('hide.bs.collapse', function () {
      navbarBackdrop.classList.remove('show');
      document.body.style.overflow = '';
    });

    // Close menu when backdrop is clicked
    navbarBackdrop.addEventListener('click', function () {
      var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) bsCollapse.hide();
    });
  }

  // ===== Smooth Scroll for Anchor Links =====
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId !== '#') {
        e.preventDefault();
        var target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
  // ===== Reveal on Scroll Animation =====
  var revealElements = document.querySelectorAll('.reveal-on-scroll');
  
  if (revealElements.length > 0) {
    var revealCallback = function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    };

    var revealObserver = new IntersectionObserver(revealCallback, {
      threshold: 0.1,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }
});
