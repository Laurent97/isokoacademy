const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const PDFDocument = require('pdfkit');

const GREEN = '#0F5132';
const AMBER = '#D97706';
const SAND = '#F5EFE6';
const INK = '#0C0A09';
const MUTED = '#57534E';

const ROOT = path.join(__dirname, '..', '..', '..');
// Writable cert cache dir: the bundled dir when possible (local), the OS
// temp dir on read-only filesystems (Vercel). Files are only a cache —
// serveFile re-renders from the DB record when a file is missing.
const CERT_DIR = (() => {
  const candidates = [
    process.env.CERT_DIR,
    path.join(__dirname, '..', '..', 'certificates'),
    path.join(os.tmpdir(), 'isoko-certificates'),
  ].filter(Boolean);
  for (const dir of candidates) {
    try { fs.mkdirSync(dir, { recursive: true }); fs.accessSync(dir, fs.constants.W_OK); return dir; } catch {}
  }
  return candidates[candidates.length - 1];
})();
const STAMP_PATH = path.join(__dirname, '..', '..', 'certificates-stamp.png');
const SIG1_PATH = path.join(__dirname, '..', '..', 'assets', 'sig1.png');
const SIG2_PATH = path.join(__dirname, '..', '..', 'assets', 'sig2.png');
const LOGO_PATH = path.join(ROOT, 'mobile', 'assets', 'images', 'logo.png');

/** Cache an SVG to disk when the filesystem allows it; never fatal. */
function cacheSvg(code, svg) {
  try { fs.writeFileSync(path.join(CERT_DIR, `${code}.svg`), svg); } catch {}
}

const escXml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// split a long description into <=maxChars lines for SVG text (no auto-wrap)
function wrapSvgText(text, maxChars) {
  const words = String(text || '').split(' ');
  const lines = [''];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if ((cur + ' ' + w).trim().length > maxChars && cur) lines.push(w);
    else lines[lines.length - 1] = (cur + ' ' + w).trim();
  }
  return lines.slice(0, 2);
}

function generateCode(level) {
  return `ISOKO-L${level}-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function dataUri(file, mime) {
  try { return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`; } catch { return null; }
}

async function getSigners(db) {
  const r = await db.query("SELECT key,value FROM app_settings WHERE key LIKE 'cert_%'").catch(() => ({ rows: [] }));
  const s = Object.fromEntries(r.rows.map(x => [x.key, x.value]));
  return {
    sig1: s.cert_head_of_curriculum || 'Ngabo Jean Laurent',
    sig1Title: s.cert_curriculum_title || 'Head of Curriculum',
    sig2: s.cert_director || 'Jean-Paul Habimana',
    sig2Title: s.cert_director_title || 'Director, Isoko Academy',
  };
}

// ---------- shared layout ----------
function layout(c) {
  const d = new Date(c.issuedAt);
  return {
    ...c,
    dateStr: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    name: c.name || 'Isoko Learner',
  };
}

// ---------- SVG render (browser display) ----------
async function renderSvg(c) {
  const L = layout(c);
  const qr = await QRCode.toDataURL(L.verifyUrl, { errorCorrectionLevel: 'H', margin: 1, width: 320 });
  const logo = dataUri(LOGO_PATH, 'image/png');
  const stamp = dataUri(STAMP_PATH, 'image/png');
  const sig1Img = dataUri(SIG1_PATH, 'image/png');
  const sig2Img = dataUri(SIG2_PATH, 'image/png');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123">
<rect width="794" height="1123" fill="${SAND}"/>
<rect x="24" y="24" width="746" height="1075" fill="none" stroke="${GREEN}" stroke-width="4"/>
<rect x="38" y="38" width="718" height="1047" fill="none" stroke="${GREEN}" stroke-width="1"/>
<g fill="${GREEN}"><rect x="30" y="30" width="8" height="8"/><rect x="756" y="30" width="8" height="8"/><rect x="30" y="1085" width="8" height="8"/><rect x="756" y="1085" width="8" height="8"/></g>
<g fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.05">
  ${[140, 240, 340, 440, 540, 640].map(x => `<path d="M${x} 90 L${x + 20} 70 L${x + 40} 90 L${x + 20} 110 Z"/>`).join('')}
  ${[140, 240, 340, 440, 540, 640].map(x => `<path d="M${x} 1033 L${x + 20} 1013 L${x + 40} 1033 L${x + 20} 1053 Z"/>`).join('')}
</g>
${logo ? `<image href="${logo}" x="60" y="58" width="160" height="47" preserveAspectRatio="xMinYMid meet"/>` : ''}
<text x="397" y="200" text-anchor="middle" font-family="Verdana,Arial" font-weight="800" font-size="38" fill="${GREEN}" letter-spacing="4">CERTIFICATE</text>
<text x="397" y="236" text-anchor="middle" font-family="Verdana,Arial" font-weight="700" font-size="18" fill="${GREEN}" letter-spacing="7">OF COMPLETION</text>
<rect x="352" y="252" width="90" height="3" fill="${AMBER}"/>
<text x="397" y="330" text-anchor="middle" font-family="Verdana,Arial" font-size="15" fill="${MUTED}">This is to certify that</text>
<text x="397" y="392" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="40" fill="${INK}">${escXml(L.name)}</text>
<rect x="307" y="410" width="180" height="1" fill="${GREEN}"/>
<text x="397" y="462" text-anchor="middle" font-family="Verdana,Arial" font-size="15" fill="${MUTED}">has successfully completed</text>
<text x="397" y="506" text-anchor="middle" font-family="Verdana,Arial" font-weight="800" font-size="25" fill="${INK}">Level ${L.levelNum} — ${escXml(L.levelTitle)}</text>
${wrapSvgText(L.levelDesc, 72).map((ln, i) =>
  `<text x="397" y="${532 + i * 18}" text-anchor="middle" font-family="Verdana,Arial" font-size="12.5" fill="${MUTED}">${escXml(ln)}</text>`).join('\n')}
<text x="397" y="590" text-anchor="middle" font-family="Verdana,Arial" font-size="15" fill="${INK}">with a final score of <tspan font-weight="800">${L.score}%</tspan></text>
<text x="397" y="617" text-anchor="middle" font-family="Verdana,Arial" font-size="15" fill="${INK}">on ${L.dateStr}</text>
${sig1Img ? `<image href="${sig1Img}" x="70" y="688" width="190" height="60" preserveAspectRatio="xMidYMid meet"/>` : `<text x="165" y="740" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="21" fill="${AMBER}">${escXml(L.sig1)}</text>`}
${sig2Img ? `<image href="${sig2Img}" x="280" y="688" width="190" height="60" preserveAspectRatio="xMidYMid meet"/>` : `<text x="375" y="740" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="21" fill="${AMBER}">${escXml(L.sig2)}</text>`}
<g stroke="${INK}" stroke-width="1"><line x1="85" y1="756" x2="245" y2="756"/><line x1="295" y1="756" x2="455" y2="756"/></g>
<g font-family="Verdana,Arial" font-size="12" font-weight="700" fill="${INK}">
  <text x="165" y="774" text-anchor="middle">${escXml(L.sig1)}</text>
  <text x="375" y="774" text-anchor="middle">${escXml(L.sig2)}</text>
</g>
<g font-family="Verdana,Arial" font-size="10" fill="${MUTED}">
  <text x="165" y="790" text-anchor="middle">${escXml(L.sig1Title)}</text>
  <text x="375" y="790" text-anchor="middle">${escXml(L.sig2Title)}</text>
</g>
${stamp ? `<image href="${stamp}" x="560" y="645" width="125" height="125"/>` : ''}
<line x1="80" y1="950" x2="714" y2="950" stroke="${GREEN}" stroke-width="0.75"/>
<g font-family="monospace" font-size="13" fill="${MUTED}">
  <text x="90" y="988">Verification code</text>
  <text x="90" y="1014" font-size="17" fill="${INK}" font-weight="700">${L.code}</text>
  <text x="90" y="1044" font-size="12">Verify at isoko.academy/verify</text>
</g>
<image href="${qr}" x="604" y="962" width="106" height="106"/>
<text x="657" y="1084" text-anchor="middle" font-family="Verdana,Arial" font-size="9" fill="${MUTED}">Scan to verify</text>
<text x="397" y="1108" text-anchor="middle" font-family="Verdana,Arial" font-size="8" fill="${MUTED}">This certificate confirms completion of Isoko Academy coursework. It is not a trading license, not financial advice,</text>
<text x="397" y="1120" text-anchor="middle" font-family="Verdana,Arial" font-size="8" fill="${MUTED}">and not a guarantee of trading performance.</text>
</svg>`;
}

// ---------- PDF render (native PDFKit, A4) ----------
async function renderPdfStream(c, out) {
  const L = layout(c);
  const qrBuf = await QRCode.toBuffer(L.verifyUrl, { errorCorrectionLevel: 'H', margin: 1, width: 300 });
  const doc = new PDFDocument({ size: 'A4', margin: 0, info: { Title: `Isoko Academy Certificate ${L.code}`, Author: 'Isoko Academy' } });
  doc.pipe(out);
  const W = 595.28, H = 841.89, cx = W / 2;

  doc.rect(0, 0, W, H).fill(SAND);
  doc.rect(18, 18, W - 36, H - 36).lineWidth(3).stroke(GREEN);
  doc.rect(28, 28, W - 56, H - 56).lineWidth(0.75).stroke(GREEN);
  for (const [x, y] of [[22, 22], [W - 28, 22], [22, H - 28], [W - 28, H - 28]]) doc.rect(x, y, 6, 6).fill(GREEN);

  // subtle imigongo diamonds top/bottom inside border
  doc.opacity(0.05).lineWidth(1);
  for (let x = 100; x < W - 100; x += 76) {
    doc.path(`M${x} 62 L${x + 15} 48 L${x + 30} 62 L${x + 15} 76 Z`).stroke(INK);
    doc.path(`M${x} ${H - 62} L${x + 15} ${H - 76} L${x + 30} ${H - 62} L${x + 15} ${H - 48} Z`).stroke(INK);
  }
  doc.opacity(1);

  if (fs.existsSync(LOGO_PATH)) doc.image(LOGO_PATH, 46, 44, { width: 118 });

  doc.font('Helvetica-Bold').fontSize(30).fillColor(GREEN);
  doc.text('C E R T I F I C A T E', 0, 146, { align: 'center', width: W });
  doc.fontSize(14).text('O F   C O M P L E T I O N', 0, 184, { align: 'center', width: W });
  doc.rect(cx - 34, 206, 68, 2.4).fill(AMBER);

  doc.font('Helvetica').fontSize(11).fillColor(MUTED).text('This is to certify that', 0, 244, { align: 'center', width: W });
  doc.font('Times-Italic').fontSize(30).fillColor(INK).text(L.name, 0, 268, { align: 'center', width: W });
  doc.rect(cx - 68, 312, 136, 0.75).fill(GREEN);

  doc.font('Helvetica').fontSize(11).fillColor(MUTED).text('has successfully completed', 0, 340, { align: 'center', width: W });
  doc.font('Helvetica-Bold').fontSize(19).fillColor(INK).text(`Level ${L.levelNum} — ${L.levelTitle}`, 40, 366, { align: 'center', width: W - 80 });
  doc.font('Helvetica').fontSize(9.5).fillColor(MUTED).text(L.levelDesc, 60, 394, { align: 'center', width: W - 120 });
  doc.fontSize(11).fillColor(INK).text(`with a final score of ${L.score}%`, 0, 430, { align: 'center', width: W });
  doc.text(`on ${L.dateStr}`, 0, 450, { align: 'center', width: W });

  // signatures (real signature images when available, script font fallback)
  const sigY = 560;
  if (fs.existsSync(SIG1_PATH)) doc.image(SIG1_PATH, 75, sigY - 20, { fit: [140, 46], align: 'center', valign: 'center' });
  else doc.font('Times-Italic').fontSize(16).fillColor(AMBER).text(L.sig1, 70, sigY, { width: 160, align: 'center' });
  if (fs.existsSync(SIG2_PATH)) doc.image(SIG2_PATH, 280, sigY - 20, { fit: [140, 46], align: 'center', valign: 'center' });
  else doc.font('Times-Italic').fontSize(16).fillColor(AMBER).text(L.sig2, 270, sigY, { width: 160, align: 'center' });
  doc.rect(90, sigY + 28, 140, 0.75).fill(INK).rect(290, sigY + 28, 140, 0.75).fill(INK);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(INK);
  doc.text(L.sig1, 70, sigY + 34, { width: 160, align: 'center' });
  doc.text(L.sig2, 270, sigY + 34, { width: 160, align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor(MUTED);
  doc.text(L.sig1Title, 70, sigY + 46, { width: 160, align: 'center' });
  doc.text(L.sig2Title, 270, sigY + 46, { width: 160, align: 'center' });

  // official stamp — own column right of the signatures, inside the border
  if (fs.existsSync(STAMP_PATH)) doc.image(STAMP_PATH, 445, sigY - 40, { width: 105 });

  // verification strip
  const vy = 700;
  doc.moveTo(60, vy).lineTo(W - 60, vy).lineWidth(0.6).stroke(GREEN);
  doc.font('Courier').fontSize(9).fillColor(MUTED).text('Verification code', 72, vy + 22);
  doc.font('Courier-Bold').fontSize(13).fillColor(INK).text(L.code, 72, vy + 40);
  doc.font('Courier').fontSize(9).fillColor(MUTED).text('Verify at isoko.academy/verify', 72, vy + 66);
  doc.image(qrBuf, W - 172, vy + 14, { width: 96 });
  doc.font('Helvetica').fontSize(7).fillColor(MUTED).text('Scan to verify', W - 172, vy + 114, { width: 96, align: 'center' });

  doc.font('Helvetica').fontSize(6.5).fillColor(MUTED)
    .text('This certificate confirms completion of Isoko Academy coursework. It is not a trading license, not financial advice, and not a guarantee of trading performance.',
      60, H - 52, { align: 'center', width: W - 120 });
  doc.end();
}

// ---------- issue ----------
async function issue(db, { userId, levelId, score }) {
  const existing = await db.query('SELECT * FROM certificates WHERE user_id=$1 AND level_id=$2', [userId, levelId]);
  if (existing.rows[0]) {
    // re-render file so design changes apply to already-issued certs
    const ctx = await loadForRender(db, existing.rows[0].certificate_number);
    if (ctx) cacheSvg(existing.rows[0].certificate_number, await renderSvg(ctx));
    return existing.rows[0];
  }

  const lv = await db.query('SELECT level_number, title_en, description_en FROM levels WHERE id=$1', [levelId]);
  const u = await db.query('SELECT full_name, email, phone_number FROM users WHERE id=$1', [userId]);
  const signers = await getSigners(db);
  const L = lv.rows[0];
  const user = u.rows[0];
  const code = generateCode(L.level_number);
  const base = process.env.ADMIN_URL || 'http://localhost:3100';
  const verifyUrl = `${base}/verify/${code}`;

  const certData = {
    name: user.full_name || user.email || user.phone_number,
    levelTitle: L.title_en, levelDesc: L.description_en || '', levelNum: L.level_number,
    score: Math.round(score), code, issuedAt: new Date(), verifyUrl, ...signers,
  };
  const svg = await renderSvg(certData);
  cacheSvg(code, svg);
  const pdfUrl = `${base}/api/certificates/file/${code}.pdf`;

  const r = await db.query(
    `INSERT INTO certificates (user_id, level_id, certificate_number, verification_url, share_url, final_score, pdf_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (user_id, level_id) DO UPDATE SET certificate_number=EXCLUDED.certificate_number
     RETURNING *`,
    [userId, levelId, code, verifyUrl, pdfUrl, Math.round(score), pdfUrl]
  );
  return r.rows[0];
}

/** Fetch the full cert record + render context for PDF on demand. */
async function loadForRender(db, code) {
  const r = await db.query(
    `SELECT c.*, l.level_number, l.title_en, l.description_en, u.full_name, u.email, u.phone_number
     FROM certificates c JOIN levels l ON l.id=c.level_id JOIN users u ON u.id=c.user_id
     WHERE c.certificate_number=$1`, [code]);
  if (!r.rows[0]) return null;
  const cert = r.rows[0];
  const signers = await getSigners(db);
  return {
    name: cert.full_name || cert.email || cert.phone_number,
    levelTitle: cert.title_en, levelDesc: cert.description_en || '', levelNum: cert.level_number,
    score: Math.round(cert.final_score || 0), code: cert.certificate_number,
    issuedAt: cert.issued_at, verifyUrl: cert.verification_url || `${process.env.ADMIN_URL || 'http://localhost:3100'}/verify/${code}`,
    ...signers,
  };
}

module.exports = { issue, renderSvg, renderPdfStream, loadForRender, generateCode, CERT_DIR };
