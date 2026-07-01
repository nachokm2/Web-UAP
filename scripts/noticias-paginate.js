(function () {
  var btn = document.getElementById('noticias-load-more');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var next = parseInt(btn.getAttribute('data-next-batch'), 10);
    var total = parseInt(btn.getAttribute('data-total-batches'), 10);
    document.querySelectorAll('.news-card[data-batch="' + next + '"]').forEach(function (el) {
      el.style.display = '';
    });
    next += 1;
    btn.setAttribute('data-next-batch', String(next));
    if (next >= total) btn.style.display = 'none';
  });
})();
