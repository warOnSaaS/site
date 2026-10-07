// Light/dark switch, and live previews scaled to fit their box.
(function () {
  var root = document.documentElement;
  var dark = function () { return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; };
  document.querySelectorAll('[data-mode-toggle]').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = dark() ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('wos-theme', next); } catch (e) {}
    });
  });

  // <div class="frame" data-w="880" data-h="600"><iframe ...></div>: the page inside is laid out at
  // data-w by data-h pixels, then scaled down to the width of the box.
  var frames = [].slice.call(document.querySelectorAll('.frame[data-w]'));
  function fit() {
    frames.forEach(function (f) {
      var w = +f.dataset.w, h = +f.dataset.h, s = Math.min(1, f.clientWidth / w);
      var i = f.querySelector('iframe');
      i.style.width = w + 'px'; i.style.height = h + 'px'; i.style.transform = 'scale(' + s + ')';
      f.style.height = Math.round(h * s) + 'px';
    });
  }
  if (frames.length) { fit(); addEventListener('resize', fit); }

  // an iframe that grows to the height of what it shows
  document.querySelectorAll('iframe[data-autoheight]').forEach(function (i) {
    function size() { try { i.style.height = Math.max(320, i.contentDocument.body.offsetHeight) + 'px'; } catch (e) {} }
    i.addEventListener('load', function () {
      size();
      try { new ResizeObserver(size).observe(i.contentDocument.body); } catch (e) {}
    });
  });
})();
