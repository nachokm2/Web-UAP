(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var tabsContainer = document.getElementById('malla-tabs');
        if (!tabsContainer) return;

        var tabs = Array.prototype.slice.call(tabsContainer.querySelectorAll('.malla-tab'));

        function activate(btn, focus) {
            var idx = btn.getAttribute('data-sem');
            if (idx === null) return;

            document.querySelectorAll('.malla-panel').forEach(function (p) {
                p.style.display = 'none';
            });
            tabs.forEach(function (t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
                t.setAttribute('tabindex', '-1');
            });

            var panel = document.querySelector('.malla-panel[data-semester="' + idx + '"]');
            if (panel) panel.style.display = 'block';
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');
            btn.setAttribute('tabindex', '0');
            if (focus) btn.focus();
        }

        tabsContainer.addEventListener('click', function (e) {
            var btn = e.target.closest('.malla-tab');
            if (!btn) return;
            activate(btn, false);
        });

        // Navegación por teclado (WAI-ARIA Authoring Practices: patrón "tabs")
        tabsContainer.addEventListener('keydown', function (e) {
            var current = e.target.closest('.malla-tab');
            if (!current) return;
            var currentIdx = tabs.indexOf(current);
            if (currentIdx === -1) return;

            var targetIdx = null;
            if (e.key === 'ArrowRight') targetIdx = (currentIdx + 1) % tabs.length;
            else if (e.key === 'ArrowLeft') targetIdx = (currentIdx - 1 + tabs.length) % tabs.length;
            else if (e.key === 'Home') targetIdx = 0;
            else if (e.key === 'End') targetIdx = tabs.length - 1;
            else return;

            e.preventDefault();
            activate(tabs[targetIdx], true);
        });
    });
})();
