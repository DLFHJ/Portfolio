// Lightweight interactions: mobile nav toggle, smooth scrolling, theme toggle
// Font load checker: logs whether the Aspekta font has loaded. Useful for debugging.
if (document.fonts) {
	document.fonts.ready.then(() => {
		const loadedAspekta = document.fonts.check('700 16px "Aspekta"');
		const loadedIBM = document.fonts.check('16px "IBM Plex Sans"');
		console.info('Font check:', { Aspekta: loadedAspekta, 'IBM Plex Sans': loadedIBM });
	});
}
(function(){
	const nav = document.getElementById('primary-nav');
	const navToggle = document.getElementById('nav-toggle');
	const themeToggle = document.getElementById('theme-toggle');
	const yearEl = document.getElementById('year');

	// set year
	if(yearEl) yearEl.textContent = new Date().getFullYear();

	// mobile nav
	if(navToggle && nav){
		navToggle.addEventListener('click', ()=>{
			const open = nav.classList.toggle('open');
			navToggle.setAttribute('aria-expanded', String(open));
		});
	}

	// smooth scroll for internal links
	document.addEventListener('click', (e)=>{
		const a = e.target.closest('a');
		if(!a) return;
		const href = a.getAttribute('href')||'';
		if(href.startsWith('#') && href.length>1){
			const target = document.getElementById(href.slice(1));
			if(target){
				e.preventDefault();
				target.scrollIntoView({behavior:'smooth',block:'start'});
				// close mobile nav after click
				if(nav && nav.classList.contains('open')){
					nav.classList.remove('open');
					navToggle.setAttribute('aria-expanded','false');
				}
			}
		}
	});

	// theme (dark / light) with localStorage
	const applyTheme = (t)=>{
		if(t==='dark') document.documentElement.setAttribute('data-theme','dark');
		else document.documentElement.removeAttribute('data-theme');
		if(themeToggle) themeToggle.textContent = t==='dark' ? '☀️' : '🌙';
	};

	const saved = localStorage.getItem('theme');
	if(saved) applyTheme(saved);
	else{
		// respect user preference
		const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		applyTheme(prefersDark ? 'dark' : 'light');
	}

	if(themeToggle){
		themeToggle.addEventListener('click', ()=>{
			const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
			const next = isDark ? 'light' : 'dark';
			applyTheme(next);
			localStorage.setItem('theme', next);
		});
	}

})();
