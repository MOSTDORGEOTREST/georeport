import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = process.argv[2] || '/tmp/shots/multires';
fs.mkdirSync(OUT, { recursive: true });

const user = { username: 'lab_demo', license_level: 'Enterprise', license_end_date: '2027-03-01', limit: 500 };
const objects = ['705-31', '812-4', '633-20'];
const mkReport = (i, obj) => ({
  id: `r${i}`, object_number: obj, laboratory_number: `A${i}-${i % 7 + 1}/БП`,
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
  await context.route('**/reports/my-count/**', r => r.fulfill({ json: { count: 37 } }));
  await context.route('**/reports/objects/', r => r.fulfill({ json: objects }));
  for (const obj of objects)
    await context.route(`**/reports/objects/${obj}/`, r => r.fulfill({ json: allReports.filter(x => x.object_number === obj) }));
  await context.route('**/stat/period_count**', r => r.fulfill({ json: {
    '2026-01-01': 12, '2026-02-01': 31, '2026-03-01': 22, '2026-04-01': 48, '2026-05-01': 65, '2026-06-01': 41, '2026-07-01': 58
  }}));
  await context.route(/\/reports\/\?id=/, r => r.fulfill({ json: allReports[0] }));
  await context.route('**/files/**', r => r.fulfill({ json: [] }));
  await context.route('**/test_type_files/**', r => r.fulfill({ json: [] }));
  await context.route('**/auth/token/**', r => r.fulfill({ json: { access_token: 'tok' } }));
}

const targets = [
  { name: 'w360', viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true },
  { name: 'w768', viewport: { width: 768, height: 1024 }, isMobile: true, hasTouch: true },
  { name: 'w860', viewport: { width: 860, height: 900 } },
  { name: 'w1024', viewport: { width: 1024, height: 800 } },
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const overflows = [];
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: t.viewport, isMobile: t.isMobile, hasTouch: t.hasTouch });
  await mockApi(ctx, { logged: true });
  const page = await ctx.newPage();

  for (const [label, path] of [['home', '/'], ['cabinet', '/login'], ['report', '/report/demo-sample']]) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1400);
    // прокрутить вниз, чтобы reveal-блоки проявились
    await page.evaluate(async () => {
      const se = document.scrollingElement;
      await new Promise(res => {
        let y = 0;
        const step = () => {
          y += 300; se.scrollTop = y; // мгновенно, в обход css smooth
          if (y < se.scrollHeight) setTimeout(step, 120); else res();
        };
        step();
      });
      se.scrollTop = 0;
    });
    await page.waitForTimeout(1100);
    await page.screenshot({ path: `${OUT}/${t.name}-${label}.png`, fullPage: true });
    const over = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const bad = [];
      if (document.documentElement.scrollWidth > docW + 1) bad.push(`hscroll:${document.documentElement.scrollWidth}>${docW}`);
      document.querySelectorAll('body *').forEach(el => {
        if (el.closest('.drawer')) return; // скрытая офф-канвас панель
        if (el.closest('.strip')) return; // бегущая строка: трек шире экрана по дизайну, обрезан overflow:hidden
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > docW + 6) && cs.position !== 'fixed') {
          bad.push(`${el.className && typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName}:${Math.round(r.right)}`);
        }
      });
      return [...new Set(bad)].slice(0, 8);
    });
    if (over.length) overflows.push(`${t.name} ${label}: ${over.join(', ')}`);
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/overflows.txt`, overflows.join('\n') || 'no overflows');
console.log(overflows.join('\n') || 'no overflows');
