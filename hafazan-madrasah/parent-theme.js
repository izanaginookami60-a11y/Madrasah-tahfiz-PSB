(function () {
  try {
    // Toggle/Init Theme support for parent-app.html
    // Theme source priority:
    // 1) localStorage parentTheme
    // 2) prefers-color-scheme
    var stored = localStorage.getItem('parentTheme');
    var theme = stored;

    if (!theme) {
      var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');

    // Expose helper so admin panel or buttons can call it
    window.setParentTheme = function (nextTheme) {
      if (nextTheme !== 'dark' && nextTheme !== 'light') return;
      localStorage.setItem('parentTheme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };
  } catch (e) {
    // no-op
  }
})();

