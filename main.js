/* ============================================================
 *   SYBS 2309 — Shared JavaScript
 *   Cyber Khalil Academy | Mahmoud Khalil
 *   v2: year + reading progress + TOC scroll-spy + copy code
 *   ============================================================ */

(function () {
    'use strict';

    /* ---------- 1) سنة الحقوق ---------- */
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    /* ---------- 2) شريط تقدم القراءة ---------- */
    const progress = document.createElement('div');
    progress.className = 'reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    const onScrollProgress = function () {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const ratio = max > 0 ? doc.scrollTop / max : 0;
        progress.style.transform = 'scaleX(' + Math.min(ratio, 1) + ')';
    };
    /* ---------- 3) تتبع الفهرس (TOC scroll-spy) ---------- */
    const tocLinks = Array.prototype.slice.call(
        document.querySelectorAll('.toc-list a[href^="#"]')
    );

    const sections = [];
    tocLinks.forEach(function (link) {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) sections.push({ link: link, section: target });
    });

    // تخزين مواضع الأقسام لحظةَ التحميل وتحديثها عند تغيير المقاس فقط
    let sectionPositions = [];

    function computeSectionPositions() {
        sectionPositions = sections.map(function (item) {
            const rect = item.section.getBoundingClientRect();
            return {
                link: item.link,
                top: rect.top + window.scrollY
            };
        });
    }

    computeSectionPositions();
    window.addEventListener('resize', computeSectionPositions);

    const onScrollSpy = function () {
        if (!sectionPositions.length) return;

        const y = window.scrollY + 140;
        let current = sectionPositions[0];

        for (let i = 0; i < sectionPositions.length; i++) {
            if (sectionPositions[i].top <= y) current = sectionPositions[i];
        }

        sectionPositions.forEach(function (item) {
            const isActive = item === current;
            item.link.classList.toggle('active', isActive);
            if (isActive) {
                item.link.setAttribute('aria-current', 'true');
            } else {
                item.link.removeAttribute('aria-current');
            }
        });
    };

    /* ---------- 4) ربط المستمعين ---------- */
    let ticking = false;

    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
            onScrollProgress();
            onScrollSpy();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    /* ---------- 5) زر نسخ أكواد الشاشات ---------- */
    document.querySelectorAll('.code-window').forEach(function (win) {
        const head = win.querySelector('.code-head');
        const code = win.querySelector('pre code');
        if (!head || !code) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.innerHTML = '<i class="fas fa-copy"></i> نسخ';

        btn.addEventListener('click', function () {
            const text = code.textContent;

            const done = function (ok) {
                btn.classList.toggle('copied', ok);
                btn.innerHTML = ok
                ? '<i class="fas fa-check"></i> تم النسخ'
                : '<i class="fas fa-xmark"></i> تعذّر النسخ';

                setTimeout(function () {
                    btn.classList.remove('copied');
                    btn.innerHTML = '<i class="fas fa-copy"></i> نسخ';
                }, 1600);
            };

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text)
                .then(function () { done(true); })
                .catch(function () { done(false); });
            } else {
                done(false);
            }
        });

        head.appendChild(btn);
    });
})();
