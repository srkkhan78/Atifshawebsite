const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper: read all submissions
function readSubmissions() {
  if (!fs.existsSync(SUBMISSIONS_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8')); }
  catch { return []; }
}

// Helper: save a new submission
function saveSubmission(data) {
  const submissions = readSubmissions();
  submissions.unshift({ id: Date.now(), date: new Date().toISOString(), ...data });
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// POST /api/contact — receive a quote form submission
app.post('/api/contact', (req, res) => {
  const { name, email, service, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }
  saveSubmission({ name, email, service: service || 'Not specified', message });
  res.json({ ok: true });
});

// GET /admin — view all submissions (password protected via query param)
const ADMIN_PASS = process.env.ADMIN_PASS || 'atifsha2026';

app.get('/admin', (req, res) => {
  if (req.query.pass !== ADMIN_PASS) {
    return res.send(`
      <!DOCTYPE html><html><head><title>Admin Login</title>
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0b0f1a;color:#e2e8f0;}
      form{display:flex;flex-direction:column;gap:12px;background:#111827;padding:32px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);}
      input{padding:10px 14px;border-radius:6px;border:1px solid rgba(255,255,255,0.12);background:#1a2235;color:#e2e8f0;font-size:14px;}
      button{padding:10px;border-radius:6px;background:#6366f1;color:#fff;border:none;cursor:pointer;font-weight:600;}
      h2{margin:0 0 8px;}</style></head>
      <body><form method="GET" action="/admin"><h2>🔐 Admin Login</h2>
      <input type="password" name="pass" placeholder="Password" required />
      <button type="submit">Enter</button></form></body></html>
    `);
  }

  const submissions = readSubmissions();
  const rows = submissions.length === 0
    ? '<tr><td colspan="5" style="text-align:center;color:#64748b;padding:40px;">No submissions yet.</td></tr>'
    : submissions.map(s => `
        <tr>
          <td>${new Date(s.date).toLocaleString()}</td>
          <td><strong>${esc(s.name)}</strong></td>
          <td><a href="mailto:${esc(s.email)}" style="color:#818cf8;">${esc(s.email)}</a></td>
          <td>${esc(s.service)}</td>
          <td style="max-width:320px;white-space:pre-wrap;">${esc(s.message)}</td>
        </tr>`).join('');

  res.send(`<!DOCTYPE html><html><head><title>Quote Submissions</title>
  <meta charset="UTF-8"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Segoe UI',sans-serif;background:#0b0f1a;color:#e2e8f0;padding:40px 24px;}
    h1{font-size:1.6rem;margin-bottom:6px;}
    .sub{color:#64748b;font-size:0.85rem;margin-bottom:28px;}
    .count{display:inline-block;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.35);
           color:#818cf8;padding:3px 12px;border-radius:999px;font-size:0.78rem;font-weight:600;margin-left:10px;}
    table{width:100%;border-collapse:collapse;background:#111827;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);}
    th{background:#1a2235;padding:14px 16px;text-align:left;font-size:0.78rem;font-weight:600;
       text-transform:uppercase;letter-spacing:0.06em;color:#64748b;border-bottom:1px solid rgba(255,255,255,0.08);}
    td{padding:14px 16px;font-size:0.875rem;border-bottom:1px solid rgba(255,255,255,0.05);vertical-align:top;}
    tr:last-child td{border-bottom:none;}
    tr:hover td{background:rgba(255,255,255,0.02);}
    .logout{float:right;font-size:0.8rem;color:#64748b;text-decoration:none;}
    .logout:hover{color:#818cf8;}
    a{color:#818cf8;}
  </style></head>
  <body>
    <h1>📋 Quote Submissions <span class="count">${submissions.length} total</span></h1>
    <p class="sub">All contact form submissions from your website &nbsp;·&nbsp;
       <a href="/admin" class="logout">Refresh</a></p>
    <table>
      <thead><tr>
        <th>Date</th><th>Name</th><th>Email</th><th>Service</th><th>Message</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </body></html>`);
});

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
