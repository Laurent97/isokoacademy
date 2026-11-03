/* Isoko Academy Admin — zero-dependency SPA.
   Served by the backend at /admin (or open directly — set API_BASE). */

const API_BASE = location.protocol.startsWith('http')
  ? `${location.origin}/api`
  : 'http://localhost:3100/api';

const state = { token: localStorage.getItem('isoko_admin_token') };

const $ = (sel) => document.querySelector(sel);
const el = (html) => {
  const d = document.createElement('div');
  d.innerHTML = html.trim();
  return d.firstChild;
};

async function api(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(opts.headers || {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) logout();
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const fmt = {
  date: (d) => (d ? new Date(d).toLocaleString() : '—'),
  num: (n) => (n == null ? '0' : Number(n).toLocaleString()),
  money: (n) => `$${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
};

/* ---------------- auth ---------------- */

async function login() {
  const phone = $('#login-phone').value.trim();
  const otpRow = $('#otp-row');
  const msg = $('#login-msg');
  if (!otpRow.classList.contains('hidden')) {
    const code = $('#login-otp').value.trim();
    try {
      const data = await api('/auth/verify-otp', {
        method: 'POST',
        body: { phone_number: phone, code },
      });
      if (data.user.role === 'user') {
        msg.textContent = 'This account has no admin role.';
        return;
      }
      state.token = data.token;
      localStorage.setItem('isoko_admin_token', data.token);
      showApp();
    } catch (e) {
      msg.textContent = e.message;
    }
    return;
  }
  try {
    const data = await api('/auth/send-otp', {
      method: 'POST',
      body: { phone_number: phone },
    });
    otpRow.classList.remove('hidden');
    $('#login-btn').textContent = 'Verify & Sign in';
    msg.textContent = data.dev_otp ? `Dev OTP: ${data.dev_otp}` : 'Code sent.';
  } catch (e) {
    msg.textContent = e.message;
  }
}

function logout() {
  state.token = null;
  localStorage.removeItem('isoko_admin_token');
  $('#app-view').classList.add('hidden');
  $('#login-view').classList.remove('hidden');
}

function showApp() {
  $('#login-view').classList.add('hidden');
  $('#app-view').classList.remove('hidden');
  route();
}

/* ---------------- views ---------------- */

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function viewDashboard(main) {
  const s = await api('/admin/stats');
  main.innerHTML = `
    <h2>Dashboard</h2><p class="sub">Platform overview</p>
    <div class="grid cols4">
      <div class="card"><div class="stat-label">Total users</div><div class="stat-num">${fmt.num(s.users.total)}</div>
        <div class="muted small">${fmt.num(s.users.new_7d)} new this week</div></div>
      <div class="card"><div class="stat-label">Active (7d)</div><div class="stat-num">${fmt.num(s.users.active_7d)}</div></div>
      <div class="card"><div class="stat-label">Lessons completed</div><div class="stat-num">${fmt.num(s.lessons_completed)}</div></div>
      <div class="card"><div class="stat-label">Exams</div><div class="stat-num">${fmt.num(s.exams.passed)} / ${fmt.num(s.exams.failed)}</div>
        <div class="muted small">passed / failed</div></div>
      <div class="card"><div class="stat-label">Trades placed</div><div class="stat-num">${fmt.num(s.orders.total)}</div>
        <div class="muted small">${fmt.num(s.orders.open)} open</div></div>
      <div class="card"><div class="stat-label">AUXX issued</div><div class="stat-num">${fmt.num(s.auxx.issued)}</div>
        <div class="muted small">${fmt.money(s.auxx.revenue_usdt)} revenue</div></div>
      <div class="card"><div class="stat-label">AI calls</div><div class="stat-num">${fmt.num(s.ai.calls)}</div>
        <div class="muted small">${fmt.money(s.ai.cost)} cost · ${fmt.num(s.ai.flagged)} flagged</div></div>
      <div class="card"><div class="stat-label">Attention</div><div class="stat-num">${fmt.num(s.pending_deposits) + fmt.num(s.open_tickets)}</div>
        <div class="muted small">${fmt.num(s.pending_deposits)} deposits · ${fmt.num(s.open_tickets)} tickets</div></div>
    </div>`;
}

async function viewUsers(main) {
  main.innerHTML = `
    <h2>Users</h2><p class="sub">Search, block, or reset sandbox accounts</p>
    <div class="toolbar"><input id="uq" placeholder="Search phone, name, email..." /></div>
    <div id="utable"><div class="empty">Loading…</div></div>`;

  async function render(q) {
    const data = await api(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    $('#utable').innerHTML = `
      <table><thead><tr>
        <th>Phone</th><th>Name</th><th>Level</th><th>XP</th><th>Readiness</th>
        <th>Sandbox</th><th>Last active</th><th>Status</th><th></th>
      </tr></thead><tbody>
      ${data.users.map(u => `
        <tr>
          <td>${esc(u.phone_number)}</td>
          <td>${esc(u.full_name || '—')}</td>
          <td>L${u.current_level ?? 0}</td>
          <td>${fmt.num(u.total_xp)}</td>
          <td>${Math.round(u.readiness_score || 0)}%</td>
          <td>${fmt.money(u.balance_usd)}</td>
          <td class="small">${fmt.date(u.last_active_at)}</td>
          <td>${u.is_blocked ? '<span class="tag red">blocked</span>' : '<span class="tag green">active</span>'}</td>
          <td><div class="row-actions">
            ${u.is_blocked
              ? `<button class="btn sm ok" data-a="unblock" data-id="${u.id}">Unblock</button>`
              : `<button class="btn sm danger" data-a="block" data-id="${u.id}">Block</button>`}
            <button class="btn sm secondary" data-a="reset" data-id="${u.id}">Reset</button>
          </div></td>
        </tr>`).join('') || '<tr><td colspan="9" class="empty">No users</td></tr>'}
      </tbody></table>`;
  }

  $('#uq').addEventListener('input', (e) => render(e.target.value));
  $('#utable').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-a]');
    if (!b) return;
    const { a, id } = b.dataset;
    if (a === 'block') await api(`/admin/users/${id}/block`, { method: 'POST', body: { reason: 'Blocked via dashboard' } });
    if (a === 'unblock') await api(`/admin/users/${id}/unblock`, { method: 'POST' });
    if (a === 'reset') await api(`/admin/users/${id}/reset-sandbox`, { method: 'POST' });
    render($('#uq').value);
  });
  render('');
}

async function viewContent(main) {
  const data = await api('/admin/content/lessons');
  const tag = (s) => ({ draft: 'gray', review: 'orange', published: 'green' }[s] || 'gray');
  main.innerHTML = `
    <h2>Content</h2><p class="sub">Lesson publish states (${data.lessons.length} lessons)</p>
    <table><thead><tr>
      <th>Level</th><th>#</th><th>Title</th><th>State</th><th>Trust</th><th>Native review</th><th></th>
    </tr></thead><tbody>
    ${data.lessons.map(l => `
      <tr>
        <td>L${l.level_number}</td><td>${l.lesson_number}</td>
        <td>${esc(l.title_en)}</td>
        <td><span class="tag ${tag(l.state)}">${l.state}</span></td>
        <td>${l.content_trust_score}%</td>
        <td>${l.native_speaker_approved ? '<span class="tag green">yes</span>' : '<span class="tag gray">pending</span>'}</td>
        <td><div class="row-actions">
          ${l.state !== 'published'
            ? `<button class="btn sm ok" data-s="published" data-id="${l.id}">Publish</button>` : ''}
          ${l.state === 'published'
            ? `<button class="btn sm secondary" data-s="draft" data-id="${l.id}">Unpublish</button>` : ''}
          ${l.state === 'draft'
            ? `<button class="btn sm secondary" data-s="review" data-id="${l.id}">→ Review</button>` : ''}
        </div></td>
      </tr>`).join('')}
    </tbody></table>`;
  main.addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-s]');
    if (!b) return;
    await api(`/admin/lessons/${b.dataset.id}/state`, { method: 'POST', body: { state: b.dataset.s } });
    viewContent(main);
  });
}

async function viewDeposits(main) {
  const data = await api('/admin/deposits');
  const tag = (s) => ({ pending: 'orange', confirmed: 'green', failed: 'red', manual_review: 'blue' }[s] || 'gray');
  main.innerHTML = `
    <h2>Crypto Deposits</h2><p class="sub">USDT deposits purchasing AUXX</p>
    <table><thead><tr>
      <th>User</th><th>USDT</th><th>AUXX</th><th>Status</th><th>Conf.</th><th>Date</th><th></th>
    </tr></thead><tbody>
    ${data.deposits.map(d => `
      <tr>
        <td>${esc(d.phone_number)}</td>
        <td>${fmt.money(d.amount_usdt)}</td>
        <td>${fmt.num(d.auxx_credited)}</td>
        <td><span class="tag ${tag(d.status)}">${d.status}</span></td>
        <td>${d.confirmations}/${d.required_confirmations}</td>
        <td class="small">${fmt.date(d.created_at)}</td>
        <td>${d.status === 'pending' || d.status === 'manual_review' ? `
          <div class="row-actions">
            <button class="btn sm ok" data-s="confirmed" data-id="${d.id}">Confirm</button>
            <button class="btn sm danger" data-s="failed" data-id="${d.id}">Reject</button>
          </div>` : ''}</td>
      </tr>`).join('') || '<tr><td colspan="7" class="empty">No deposits</td></tr>'}
    </tbody></table>`;
  main.addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-s]');
    if (!b) return;
    await api(`/admin/deposits/${b.dataset.id}/status`, { method: 'POST', body: { status: b.dataset.s } });
    viewDeposits(main);
  });
}

async function viewAi(main) {
  const data = await api('/admin/ai/flagged');
  main.innerHTML = `
    <h2>AI Coach — Flagged Interactions</h2>
    <p class="sub">Responses flagged for admin review</p>
    ${data.interactions.map(i => `
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span class="tag orange">${esc(i.feature)}</span>
          <span class="muted small">${esc(i.phone_number)} · ${fmt.date(i.created_at)}</span>
        </div>
        <div class="muted small">Input</div><pre class="mini">${esc(i.input_text || '')}</pre>
        <div class="muted small" style="margin-top:6px">Output</div><pre class="mini">${esc(i.output_text || '')}</pre>
        ${i.flag_reason ? `<div class="small" style="margin-top:6px;color:var(--error)">${esc(i.flag_reason)}</div>` : ''}
      </div>`).join('') || '<div class="empty">No flagged interactions</div>'}`;
}

async function viewAudit(main) {
  const data = await api('/admin/audit');
  main.innerHTML = `
    <h2>Audit Log</h2><p class="sub">Immutable record of admin actions</p>
    <table><thead><tr>
      <th>Time</th><th>Admin</th><th>Role</th><th>Action</th><th>Table</th><th>Reason</th>
    </tr></thead><tbody>
    ${data.entries.map(e => `
      <tr>
        <td class="small">${fmt.date(e.created_at)}</td>
        <td>${esc(e.admin_phone || '—')}</td>
        <td><span class="tag blue">${e.role}</span></td>
        <td><span class="tag ${e.action === 'block' || e.action === 'delete' ? 'red' : 'gray'}">${e.action}</span></td>
        <td>${esc(e.table_name || '—')}</td>
        <td class="small">${esc(e.reason || '—')}</td>
      </tr>`).join('') || '<tr><td colspan="6" class="empty">No audit entries</td></tr>'}
    </tbody></table>`;
}

async function viewSettings(main) {
  const data = await api('/admin/settings');
  const s = data.settings;
  const field = (key, label) => `
    <div style="margin-bottom:14px">
      <label class="muted small" style="display:block;margin-bottom:4px">${label}</label>
      <input id="set-${key}" value="${esc(s[key] || '')}" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:14px">
    </div>`;
  main.innerHTML = `
    <h2>Settings</h2><p class="sub">Certificate signers shown on every issued certificate</p>
    <div class="card" style="max-width:520px">
      ${field('cert_head_of_curriculum', 'Head of Curriculum — signature name')}
      ${field('cert_curriculum_title', 'Head of Curriculum — title')}
      ${field('cert_director', 'Director — signature name')}
      ${field('cert_director_title', 'Director — title')}
      <button class="btn" onclick="saveSettings()">Save</button>
      <span id="set-msg" class="small" style="margin-left:12px"></span>
    </div>`;
}

async function saveSettings() {
  const keys = ['cert_head_of_curriculum', 'cert_curriculum_title', 'cert_director', 'cert_director_title'];
  const settings = Object.fromEntries(keys.map(k => [k, $(`#set-${k}`).value]));
  const r = await api('/admin/settings', { method: 'POST', body: settings });
  $('#set-msg').textContent = r.message || 'Saved';
  setTimeout(() => { const el = $('#set-msg'); if (el) el.textContent = ''; }, 3000);
}

/* ---------------- router ---------------- */

const VIEWS = {
  '#/settings': viewSettings,
  '#/dashboard': viewDashboard,
  '#/users': viewUsers,
  '#/content': viewContent,
  '#/deposits': viewDeposits,
  '#/ai': viewAi,
  '#/audit': viewAudit,
};

async function route() {
  const hash = location.hash in VIEWS ? location.hash : '#/dashboard';
  document.querySelectorAll('[data-nav]').forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === hash));
  const main = $('#main');
  main.innerHTML = '<div class="empty">Loading…</div>';
  try {
    await VIEWS[hash](main);
  } catch (e) {
    main.innerHTML = `<div class="empty">${esc(e.message)}</div>`;
  }
}

/* ---------------- boot ---------------- */

$('#login-btn').addEventListener('click', login);
$('#login-otp').addEventListener('keydown', (e) => e.key === 'Enter' && login());
$('#login-phone').addEventListener('keydown', (e) => e.key === 'Enter' && login());
$('#logout-btn').addEventListener('click', logout);
window.addEventListener('hashchange', route);

if (state.token) showApp();
