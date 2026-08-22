import { chromium, devices } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = process.argv[2] || '/tmp/shots/before';
fs.mkdirSync(OUT, { recursive: true });

const user = { username: 'lab_demo', license_level: 'Enterprise', license_end_date: '2027-03-01', limit: 500 };
const objects = ['705-31', '812-4', '633-20'];
const mkReport = (i, obj) => ({
  id: `r${i}`,
  object_number: obj,
  laboratory_number: `A${i}-${i % 7 + 1}/БП`,
  test_type: i % 3 === 0 ? 'FC' : i % 3 === 1 ? 'FCE' : 'Вибро',
  datetime: new Date(2026, 5, 28 - (i % 28), 10, 30).toISOString(),
  data: { 'Дата выдачи протокола': `0${(i % 9) + 1}.06.2026`, 'Глубина отбора, м': `${(i % 20) + 1}.5` }
});
const allReports = [];
let n = 0;
for (const obj of objects) for (let k = 0; k < (obj === '705-31' ? 14 : 6); k++) allReports.push(mkReport(n++, obj));

async function mockApi(context, { logged = false } = {}) {
  await context.route('**/reports/sample_id/**', r => r.fulfill({ json: { id: 'demo-sample' } }));
  await context.route('**/auth/user/**', r => logged
    ? r.fulfill({ json: user })
    : r.fulfill({ status: 401, json: { detail: 'unauthorized' } }));
  await context.route('**/auth/sign-in/**', r => r.fulfill({ json: { ok: true } }));
  await context.route('**/auth/sign-out/**', r => r.fulfill({ json: { ok: true } }));
  await context.route('**/reports/count/**', r => r.fulfill({ json: 37 }));
  await context.route('**/reports/objects/', r => r.fulfill({ json: objects }));
  for (const obj of objects)
    await context.route(`**/reports/objects/${obj}`, r => r.fulfill({ json: allReports.filter(x => x.object_number === obj) }));
  await context.route('**/stat/period_count**', r => r.fulfill({ json: {
    '2026-01-01': 12, '2026-02-01': 31, '2026-03-01': 22, '2026-04-01': 48, '2026-05-01': 65, '2026-06-01': 41, '2026-07-01': 58
  }}));
  await context.route(/\/reports\/\?id=/, r => {
    if (r.request().method() === 'GET') return r.fulfill({ json: allReports[0] });
    return r.fulfill({ json: { ok: true } });
  });
  await context.route('**/files/**', r => r.fulfill({ json: [] }));
  await context.route('**/test_type_files/**', r => r.fulfill({ json: [] }));
  await context.route('**/reports/qr*', r => r.fulfill({ body: Buffer.from(''), contentType: 'image/png' }));
  await context.route('**/auth/token/**', r => r.fulfill({ json: { access_token: 'tok_demo_123' } }));
  await context.route('https://cdn.jsdelivr.net/**', r => r.abort());
}

const targets = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const t of targets) {
  // public pages (logged out)
  let ctx = await browser.newContext({ viewport: t.viewport, isMobile: t.isMobile, hasTouch: t.hasTouch, deviceScaleFactor: t.deviceScaleFactor });
  await mockApi(ctx, { logged: false });
  let page = await ctx.newPage();
  const errors = [];
  page.on('console', m => {
    if (m.type() === 'error') {
      const url = m.location().url;
      errors.push(url ? `${m.text()} (${url})` : m.text());
    }
  });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${t.name}-home-top.png` });
  // прокатываем страницу, чтобы scroll-reveal блоки проявились до fullPage-снимка
  await page.evaluate(async () => {
    const se = document.scrollingElement;
    await new Promise(res => {
      let y = 0;
      const step = () => {
        y += 300; se.scrollTop = y;
        if (y < se.scrollHeight) setTimeout(step, 110); else res();
      };
      step();
    });
    se.scrollTop = 0;
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${t.name}-home-full.png`, fullPage: true });

  // mobile menu open
  if (t.isMobile) {
    await page.click('.header__toggle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/${t.name}-menu.png` });
    await page.keyboard.press('Escape').catch(() => {});
    await page.mouse.click(10, 400);
    await page.waitForTimeout(400);
  }

  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${t.name}-login.png`, fullPage: true });

  await page.goto(BASE + '/report/demo-sample', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${t.name}-report.png`, fullPage: true });
  await ctx.close();

  // logged-in cabinet
  ctx = await browser.newContext({ viewport: t.viewport, isMobile: t.isMobile, hasTouch: t.hasTouch, deviceScaleFactor: t.deviceScaleFactor });
  await mockApi(ctx, { logged: true });
  page = await ctx.newPage();
  page.on('console', m => {
    if (m.type() === 'error') {
      const url = m.location().url;
      errors.push(url ? `${m.text()} (${url})` : m.text());
    }
  });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/${t.name}-cabinet-top.png` });
  await page.screenshot({ path: `${OUT}/${t.name}-cabinet-full.png`, fullPage: true });
  await ctx.close();

  fs.writeFileSync(`${OUT}/${t.name}-console.txt`, errors.join('\n') || 'no errors');
}
await browser.close();
console.log('done ->', OUT);
