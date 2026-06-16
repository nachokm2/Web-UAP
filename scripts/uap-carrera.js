(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var tabsContainer = document.getElementById('malla-tabs');
        if (!tabsContainer) return;

        tabsContainer.addEventListener('click', function (e) {
            var btn = e.target.closest('.malla-tab');
            if (!btn) return;

            var idx = btn.getAttribute('data-sem');
            if (idx === null) return;

            document.querySelectorAll('.malla-panel').forEach(function (p) {
                p.style.display = 'none';
            });
            document.querySelectorAll('.malla-tab').forEach(function (t) {
                t.classList.remove('active');
            });

            var panel = document.querySelector('.malla-panel[data-semester="' + idx + '"]');
            if (panel) panel.style.display = 'block';
            btn.classList.add('active');
        });
    });
})();
