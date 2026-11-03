const db = require('../database/db');
const certService = require('../services/certificate');
const path = require('path');
const fs = require('fs');

// GET /certificates/mine — the user's certificates
const mine = async (req, res) => {
  const r = await db.query(
    `SELECT c.*, l.level_number, l.title_en FROM certificates c
     JOIN levels l ON l.id = c.level_id WHERE c.user_id=$1 ORDER BY l.level_number`,
    [req.user.id]
  );
  res.json({ certificates: r.rows });
};

// POST /certificates/generate {level_id, score} — manual issue (used when exam pass didn't auto-issue)
const generate = async (req, res) => {
  const { level_id, score } = req.body;
  try {
    const cert = await certService.issue(db, { userId: req.user.id, levelId: level_id, score: score || 0 });
    res.json({ certificate: cert });
  } catch (e) {
    console.error('certGenerate:', e);
    res.status(500).json({ error: 'Certificate generation failed' });
  }
};

// GET /verify/:code — public verification (JSON ?format=json, else branded HTML)
const verify = async (req, res) => {
  try {
    const r = await db.query(
      `SELECT c.*, l.level_number, l.title_en, u.full_name FROM certificates c
       JOIN levels l ON l.id=c.level_id JOIN users u ON u.id=c.user_id
       WHERE c.certificate_number=$1`,
      [req.params.code]
    );
    const cert = r.rows[0];
    if (!cert) {
      return req.query.format === 'json' ? res.status(404).json({ valid: false })
        : res.status(404).send(verifyPage({ status: 'invalid', code: req.params.code }));
    }
    // log the view (rate-limit friendly: single row per view)
    db.query(`INSERT INTO audit_log (admin_user_id, action, target_table, metadata)
              VALUES (NULL,'view','certificates',$1)`, [JSON.stringify({ code: cert.certificate_number, event: 'verify' })])
      .catch(() => {});

    if (req.query.format === 'json') {
      return res.json({
        valid: !cert.revoked_at, revoked: !!cert.revoked_at,
        name: cert.full_name, level: cert.level_number, title: cert.title_en,
        score: cert.final_score, issued_at: cert.issued_at, file: cert.pdf_url,
      });
    }
    res.send(verifyPage({ status: cert.revoked_at ? 'revoked' : 'valid', cert }));
  } catch (e) {
    console.error('verify:', e);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// GET /certificates/file/:file — serve the SVG or on-demand PDF
const serveFile = async (req, res) => {
  const file = path.basename(req.params.file);
  const code = file.replace(/\.(svg|pdf)$/, '');

  if (file.endsWith('.pdf')) {
    const ctx = await certService.loadForRender(db, code);
    if (!ctx) return res.status(404).json({ error: 'Not found' });
    db.query('UPDATE certificates SET download_count=download_count+1 WHERE certificate_number=$1', [code]).catch(() => {});
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${code}.pdf"`);
    return certService.renderPdfStream(ctx, res);
  }

  const p = path.join(certService.CERT_DIR, file);
  if (!file.endsWith('.svg') || !fs.existsSync(p)) return res.status(404).json({ error: 'Not found' });
  db.query('UPDATE certificates SET download_count=download_count+1 WHERE certificate_number=$1', [code]).catch(() => {});
  res.type('image/svg+xml').send(fs.readFileSync(p));
};

// POST /certificates/:code/revoke — admin
const revoke = async (req, res) => {
  const r = await db.query(
    'UPDATE certificates SET revoked_at=NOW(), revoked_reason=$2 WHERE certificate_number=$1 RETURNING *',
    [req.params.code, req.body.reason || 'Revoked by admin']
  );
  if (!r.rows[0]) return res.status(404).json({ error: 'Certificate not found' });
  res.json({ certificate: r.rows[0] });
};

function verifyPage({ status, cert, code }) {
  const valid = status === 'valid';
  const color = valid ? '#0F5132' : '#B91C1C';
  const head = valid ? 'Certificate Verified ✓' : status === 'revoked' ? 'Certificate Revoked' : 'Not Found';
  const body = valid
    ? `<p style="font-size:20px;font-weight:700">${esc(cert.full_name || 'Isoko Learner')}</p>
       <p>Level ${cert.level_number} — ${esc(cert.title_en)}</p>
       <p>Score: <strong>${Math.round(cert.final_score || 0)}%</strong> · Issued ${new Date(cert.issued_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
       ${cert.pdf_url ? `<a href="${cert.pdf_url}" style="display:inline-block;margin-top:16px;background:#0F5132;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700">View Certificate</a>` : ''}`
    : `<p style="color:#57534E">${status === 'revoked' ? `This certificate has been revoked. ${esc(cert?.revoked_reason || '')}` : `No certificate found for code ${esc(code || '')}.`}</p>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Isoko Academy — Verify</title></head>
<body style="margin:0;font-family:system-ui,Arial;background:#F5EFE6;display:flex;align-items:center;justify-content:center;min-height:100vh">
  <div style="background:#fff;border:3px solid ${color};border-radius:20px;padding:48px;max-width:440px;text-align:center;margin:16px">
    <img src="/admin/assets/logo.png" alt="Isoko Academy" style="height:44px;margin-bottom:24px">
    <h1 style="color:${color};font-size:24px;margin:0 0 16px">${head}</h1>${body}
    <p style="margin-top:24px;font-size:11px;color:#A8A29E">Verified via isoko.academy — educational certificate, not a license.</p>
  </div></body></html>`;
}

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

module.exports = { mine, generate, verify, serveFile, revoke };
