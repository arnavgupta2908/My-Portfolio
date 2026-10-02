(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const url = u => /^https?:\/\//i.test((u || '').trim()) ? u.trim() : '';

  /* ---------- default data ---------- */
  const DEF_PROFILE = {
    name: 'Your Name',
    role: 'Student • Digital Creator • Web Developer',
    intro: 'I create engaging videos, eye-catching thumbnails, modern websites, and turn ideas into functional digital products.',
    about: "I'm a student who loves technology and creativity. I enjoy video editing, design and web development, and I like learning new tools, trying out ideas and turning them into real projects. I'm still learning, and every project teaches me something new.",
    email: 'hello@example.com', instagram: '', youtube: '', github: ''
  };
  const DEF_PROJECTS = [
    { icon: '🎵', title: 'Offline Music Player', desc: 'A modern offline music website with playlists, favorites, queue, recently played, shuffle, repeat, equalizer and album covers.', tech: ['HTML', 'CSS', 'JavaScript'], demo: '', src: '', img: '' },
    { icon: '📚', title: 'Student Study Dashboard', desc: 'A productivity dashboard for students to organize subjects, chapters, topics, notes and study progress.', tech: ['HTML', 'CSS', 'JavaScript', 'localStorage'], demo: '', src: '', img: '' },
    { icon: '🧑‍💻', title: 'Personal Portfolio', desc: 'This portfolio website: responsive, dark/light themes and editable from the browser.', tech: ['HTML', 'CSS', 'JavaScript'], demo: '', src: '', img: '' }
  ];
  let P = { ...DEF_PROFILE, ...store.get('pf_profile', {}) };
  let PR = store.get('pf_projects', DEF_PROJECTS);

  /* ---------- render profile ---------- */
  function renderProfile() {
    $$('[data-f]').forEach(el => el.textContent = P[el.dataset.f]);
    $$('[data-l]').forEach(a => {
      const k = a.dataset.l;
      if (k === 'email') a.href = 'mailto:' + P.email;
      else { const u = url(P[k]); a.href = u || '#'; a.toggleAttribute('hidden', !u && k !== 'email'); }
    });
    document.title = P.name + ' | Student Creator & Web Developer';
  }

  /* ---------- render projects ---------- */
  function renderProjects() {
    $('#projGrid').innerHTML = PR.map((p, i) => {
      const demo = url(p.demo), src = url(p.src), img = url(p.img);
      return `<article class="card glass proj in" style="--h:${(i * 65 + 230) % 360}">
        <div class="ctl"><button data-edit="${i}" aria-label="Edit ${esc(p.title)}">✎</button><button data-del="${i}" aria-label="Delete ${esc(p.title)}">✕</button></div>
        <div class="thumb">${img ? `<img src="${esc(img)}" alt="${esc(p.title)} preview" loading="lazy" onerror="this.remove()">` : esc(p.icon || '🌐')}</div>
        <div class="pbody"><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
        <ul class="tags">${(p.tech || []).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
        <div class="pbtn">
          <a class="btn sm" ${demo ? `href="${esc(demo)}" target="_blank" rel="noopener"` : 'aria-disabled="true"'}>${demo ? 'Live Demo' : 'Demo soon'}</a>
          <a class="btn sm ghost" ${src ? `href="${esc(src)}" target="_blank" rel="noopener"` : 'aria-disabled="true"'}>Source Code</a>
        </div></div></article>`;
    }).join('');
  }

  /* ---------- theme / menu ---------- */
  const root = document.documentElement, themeBtn = $('#theme');
  const setTheme = t => { root.dataset.theme = t; themeBtn.textContent = t === 'dark' ? '🌙' : '☀️'; store.set('pf_theme', t); };
  setTheme(store.get('pf_theme', matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  themeBtn.onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');

  const burger = $('#burger'), menu = $('#menu');
  const toggleMenu = open => { menu.classList.toggle('open', open); burger.setAttribute('aria-expanded', open); burger.textContent = open ? '✕' : '☰'; };
  burger.onclick = () => toggleMenu(!menu.classList.contains('open'));
  $$('#menu a').forEach(a => a.onclick = () => toggleMenu(false));

  /* ---------- scroll: reveal, spy, back to top ---------- */
  $$('.meter').forEach(m => $$('i', m).forEach((b, i) => { if (i < +m.dataset.l) { b.classList.add('on'); b.style.setProperty('--d', i * 0.15 + 's'); } }));
  const rev = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); } }), { threshold: .15 });
  $$('.reveal').forEach(el => rev.observe(el));

  const links = $$('#menu a');
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  const top = $('#toTop');
  addEventListener('scroll', () => top.classList.toggle('show', scrollY > 600), { passive: true });
  top.onclick = () => scrollTo({ top: 0 });

  /* ---------- contact form (opens your email app) ---------- */
  $('#contactForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const body = `${f.get('m')}\n\nFrom: ${f.get('n')} (${f.get('e')})`;
    location.href = `mailto:${P.email}?subject=${encodeURIComponent('Portfolio message from ' + f.get('n'))}&body=${encodeURIComponent(body)}`;
    $('#formMsg').textContent = 'Opening your email app to send the message…';
    e.target.reset();
  };

  /* ---------- edit mode ---------- */
  const bar = $('#bar'), dP = $('#dProfile'), dJ = $('#dProject');
  const setEdit = on => { document.body.classList.toggle('editing', on); bar.hidden = !on; $('#editBtn').textContent = on ? '✎ Editing' : '✎ Edit'; };
  $('#editBtn').onclick = () => setEdit(!document.body.classList.contains('editing'));
  $('#bDone').onclick = () => setEdit(false);
  $$('[data-close]').forEach(b => b.onclick = () => b.closest('dialog').close());

  $('#bProfile').onclick = () => {
    const f = $('#fProfile'); Object.keys(DEF_PROFILE).forEach(k => f.elements[k].value = P[k] || '');
    dP.showModal();
  };
  $('#fProfile').onsubmit = e => {
    const f = e.target; Object.keys(DEF_PROFILE).forEach(k => P[k] = f.elements[k].value.trim());
    store.set('pf_profile', P); renderProfile();
  };
  $('#reset').onclick = () => {
    if (confirm('Reset profile and projects to the defaults?')) { localStorage.removeItem('pf_profile'); localStorage.removeItem('pf_projects'); location.reload(); }
  };

  function openProject(i) {
    const f = $('#fProject'), p = PR[i] || {};
    f.elements.idx.value = i; $('#pTitle').textContent = i < 0 ? 'Add website' : 'Edit website';
    f.elements.title.value = p.title || ''; f.elements.desc.value = p.desc || '';
    f.elements.tech.value = (p.tech || []).join(', '); f.elements.demo.value = p.demo || '';
    f.elements.src.value = p.src || ''; f.elements.img.value = p.img || '';
    dJ.showModal();
  }
  $('#bAdd').onclick = () => openProject(-1);
  $('#fProject').onsubmit = e => {
    const f = e.target.elements, i = +f.idx.value;
    const p = { icon: PR[i]?.icon || '🌐', title: f.title.value.trim(), desc: f.desc.value.trim(),
      tech: f.tech.value.split(',').map(t => t.trim()).filter(Boolean), demo: f.demo.value.trim(), src: f.src.value.trim(), img: f.img.value.trim() };
    i < 0 ? PR.push(p) : PR[i] = p;
    store.set('pf_projects', PR); renderProjects();
  };
  $('#projGrid').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.edit) openProject(+b.dataset.edit);
    if (b.dataset.del && confirm('Delete this project?')) { PR.splice(+b.dataset.del, 1); store.set('pf_projects', PR); renderProjects(); }
  };

  $('#yr').textContent = new Date().getFullYear();
  renderProfile(); renderProjects();
})();
