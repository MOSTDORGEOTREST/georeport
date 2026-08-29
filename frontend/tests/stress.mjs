// Стресс-тест вёрстки экстремально длинными данными из «реальной» БД:
// длинные лаб.номера, типы испытаний, ключи параметров, логины, лицензии.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = process.argv[2] || '/tmp/shots/stress';
fs.mkdirSync(OUT, { recursive: true });

const user = {
  username: 'laboratoriya_geotehnicheskih_issledovaniy_gk_spetsfundamentstroy',
  license_level: 'Enterprise Unlimited',
  license_end_date: '2027-12-31',
  limit: 1000000
};
const objects = [
  '705-31-2026/АБВ-Мостовой-переход-через-р-Кама-доп-изыскания',
  '812-4',
  'Объект №633-20/БИС-вторая-очередь'
];
const longData = {
  'Коэффициент фильтрационной консолидации Cv, см²/мин': '0.000123456789',
  'Модуль деформации при вторичной консолидации Eoed, МПа': '12345.6789',
  'Дата выдачи протокола': '01.09.2026',
  'Примечание к испытанию (условия отбора и транспортировки образца)': 'Образец ненарушенной структуры, отобран методом задавливания тонкостенного грунтоноса, глубина 24.5 м, транспортировка в термоконтейнере'
};
const mkReport = (i, obj) => ({
  id: `r${i}`,
  object_number: obj,
  laboratory_number: `А${i}-${i % 7 + 1}/БП-2026-ДЛИННЫЙ-НОМЕР-ОБРАЗЦА-${i}`,
  test_type: i % 2 === 0 ? 'Трёхосное сжатие КД с этапом разгрузки и повторного нагружения' : 'FC',
  datetime: new Date(2026, 5, 28 - (i % 28), 10, 30).toISOString(),
  data: longData
});
const allReports = [];
let n = 0;
for (const obj of objects) for (let k = 0; k < 5; k++) allReports.push(mkReport(n++, obj));

async function mockApi(context) {
  await context.route('**/reports/sample_id/**', r => r.fulfill({ json: { id: 'demo-sample' } }));
  await context.route('**/auth/user/**', r => r.fulfill({ json: user }));
  await context.route('**/reports/my-count/**', r => r.fulfill({ json: { count: 987654 } }));
  await context.route('**/reports/objects/', r => r.fulfill({ json: objects }));
  for (const obj of objects)
    await context.route(`**/reports/objects/${encodeURIComponent(obj)}/`, r => r.fulfill({ json: allReports.filter(x => x.object_number === obj) }));
  await context.route('**/stat/period_count**', r => r.fulfill({ json: { '2026-05-01': 65, '2026-06-01': 41 } }));
  await context.route(/\/reports\/\?id=/, r => r.fulfill({ json: allReports[0] }));
  await context.route('**/files/**', r => r.fulfill({ json: [
    { link: 'k1', filename: 'Протокол_трёхосного_сжатия_образец_А0-1_БП_очень_длинное_имя_файла_отчёта.pdf' }
  ] }));
  await context.route('**/test_type_files/**', r => r.fulfill({ json: [] }));
  await context.route('**/auth/token/**', r => r.fulfill({ json: { access_token: 'tok' } }));
}

const targets = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'w360', viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true },
];

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const problems = [];

async function checkOverflow(page, tag) {
  const over = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const bad = [];
    if (document.documentElement.scrollWidth > docW + 1) bad.push(`HSCROLL:${document.documentElement.scrollWidth}>${docW}`);
    document.querySelectorAll('body *').forEach(el => {
      if (el.closest('.drawer') || el.closest('.strip') || el.closest('.table-wrapper')) return;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || cs.position === 'fixed') return;
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > docW + 6) {
        bad.push(`${typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName}:${Math.round(r.right)}`);
      }
      // текст вылезает из родителя по горизонтали
      if (el.children.length === 0 && el.scrollWidth > el.clientWidth + 8 && cs.overflow === 'visible' && cs.whiteSpace === 'nowrap') {
        bad.push(`textclip .${typeof el.className === 'string' ? el.className.split(' ')[0] : el.tagName}`);
      }
    });
    return [...new Set(bad)].slice(0, 12);
  });
  if (over.length) problems.push(`${tag}: ${over.join(', ')}`);
}

for (const t of targets) {
  const ctx = await browser.newContext({ viewport: t.viewport, isMobile: t.isMobile, hasTouch: t.hasTouch });
  await mockApi(ctx);
  const page = await ctx.newPage();

  // кабинет с длинными данными
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${OUT}/${t.name}-cabinet.png`, fullPage: true });
  await checkOverflow(page, `${t.name} cabinet`);

  // выпадающий фильтр с длинными объектами
  await page.click('.dropdown-btn');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${t.name}-dropdown.png` });
  await checkOverflow(page, `${t.name} dropdown`);
  await page.keyboard.press('Escape');

  // выбранный длинный объект в кнопке фильтра
  await page.click('.dropdown-btn');
  await page.waitForTimeout(300);
  await page.locator('.dropdown-item').nth(1).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${t.name}-filter-long.png` });
  await checkOverflow(page, `${t.name} filter-long`);

  // страница протокола с длинными ключами/значениями
  await page.goto(BASE + '/report/demo-sample', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${t.name}-report.png`, fullPage: true });
  await checkOverflow(page, `${t.name} report`);

  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${OUT}/problems.txt`, problems.join('\n') || 'no problems');
console.log(problems.join('\n') || 'no problems');
