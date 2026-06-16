(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        var menuBtn = document.querySelector('.mobile-menu-btn');
        var nav = document.querySelector('.nav');

        if (menuBtn && nav) {
            menuBtn.addEventListener('click', function () {
                nav.classList.toggle('active');
                if (window.innerWidth <= 768) {
                    document.querySelectorAll('.careers-grid-3col').forEach(function (g) {
                        g.style.gridTemplateColumns = '1fr';
                        g.style.gap = '0';
                    });
                }
            });
        }

        document.querySelectorAll('.nav .dropdown > a').forEach(function (link) {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    var li = this.parentElement;
                    var isActive = li.classList.contains('active');

                    document.querySelectorAll('.nav .dropdown.active').forEach(function (d) {
                        if (d !== li) d.classList.remove('active');
                    });

                    if (!isActive) {
                        li.classList.add('active');
                        var grid = li.querySelector('.careers-grid-3col');
                        if (grid) {
                            grid.style.gridTemplateColumns = '1fr';
                            grid.style.gap = '0';
                        }
                    } else {
                        li.classList.remove('active');
                    }
                }
            });
        });

        // Cierra el menú al hacer click fuera
        document.addEventListener('click', function (e) {
            if (nav && !nav.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
                nav.classList.remove('active');
                document.querySelectorAll('.nav .dropdown.active').forEach(function (d) {
                    d.classList.remove('active');
                });
            }
        });
    });
})();
