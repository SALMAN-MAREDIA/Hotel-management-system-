// Gallery filter functionality
document.addEventListener('DOMContentLoaded', function () {
  // Gallery filter
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

  // Room image fallback - show gradient placeholder when image fails to load
  document.querySelectorAll('img[data-fallback]').forEach(function (img) {
    img.addEventListener('error', function () {
      this.style.display = 'none';
      var fallback = this.nextElementSibling;
      if (fallback) fallback.style.display = 'flex';
    });
  });

  // Auto-dismiss alerts after 5 seconds
  var alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      var bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
      if (bsAlert) bsAlert.close();
    }, 5000);
  });

  // Navbar scroll effect
  window.addEventListener('scroll', function () {
    var navbar = document.querySelector('.navbar.fixed-top');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('shadow-lg');
        navbar.style.padding = '0.4rem 0';
      } else {
        navbar.classList.remove('shadow-lg');
        navbar.style.padding = '0.8rem 0';
      }
    }
  });

  // Smooth scroll for anchor links
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
});
