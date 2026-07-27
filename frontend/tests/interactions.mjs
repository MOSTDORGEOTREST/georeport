import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const OUT = '/tmp/shots/interact';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
let failures = 0;
const ok = (name, cond, extra = '') => {
  if (!cond) failures += 1;
  results.push(`${cond ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`);
};

const user = { username: 'lab_demo', license_level: 'Enterprise', license_end_date: '2027-03-01', limit: 500 };
const objects = ['705-31', '812-4', '633-20'];
const mkReport = (i, obj) => ({
  id: `r${i}`, object_number: obj, laboratory_number: `A${i}-${i % 7 + 1}/БП`,
  test_type: i % 3 === 0 ? 'FC' : i % 3 === 1 ? 'FCE' : 'Вибро',
  datetime: new Date(2026, 5, 28 - (i % 28), 10, 30).toISOString(),
  data: { 'Дата выдачи протокола': `0${(i % 9) + 1}.06.2026` }
});
const allReports = [];
let n = 0;
for (const obj of objects) for (let k = 0; k < (obj === '705-31' ? 14 : 6); k++) allReports.push(mkReport(n++, obj));

let signedIn = false;
let deleteCalled = false;
let createCalled = false;
let createdQrId = null;

async function mockApi(context) {
  await context.route('**/reports/sample_id/**', r => r.fulfill({ json: { id: 'demo-sample' } }));
  await context.route('**/auth/user/**', r => signedIn
    ? r.fulfill({ json: user })
    : r.fulfill({ status: 401, json: { detail: 'unauthorized' } }));
  await context.route('**/auth/sign-in/**', r => {
    const body = r.request().postData() || '';
    if (body.includes('username=demo') && body.includes('password=demo')) {
      signedIn = true;
      return r.fulfill({ json: { ok: true } });
    }
    return r.fulfill({ status: 401, json: { detail: 'bad creds' } });
  });
  await context.route('**/auth/sign-out/**', r => { signedIn = false; r.fulfill({ json: { ok: true } }); });
  await context.route('**/reports/my-count/**', r => r.fulfill({ json: { count: 37 } }));
  await context.route('**/reports/objects/', r => r.fulfill({ json: objects }));
  for (const obj of objects)
    await context.route(`**/reports/objects/${obj}/`, r => r.fulfill({ json: allReports.filter(x => x.object_number === obj) }));
  await context.route('**/stat/period_count**', r => r.fulfill({ json: { '2026-05-01': 65, '2026-06-01': 41, '2026-07-01': 58 } }));
  await context.route(/\/reports\/\?id=/, r => {
    const m = r.request().method();
    if (m === 'GET') return r.fulfill({ json: allReports[0] });
    if (m === 'DELETE') { deleteCalled = true; return r.fulfill({ json: { ok: true } }); }
    return r.fulfill({ json: { ok: true } });
  });
  await context.route('**/reports/', r => {
    if (r.request().method() === 'POST') { createCalled = true; return r.fulfill({ json: { ok: true, id: 'new1' } }); }
    return r.fallback();
  });
  await context.route('**/files/**', r => r.fulfill({ json: [] }));
  await context.route('**/test_type_files/**', r => r.fulfill({ json: [] }));
  await context.route(/\/reports\/qr\/?\?id=/, r => {
    createdQrId = new URL(r.request().url()).searchParams.get('id');
    return r.fulfill({ body: Buffer.from('89504e470d0a1a0a', 'hex'), contentType: 'image/png' });
  });
  await context.route('**/auth/token/**', r => r.fulfill({ json: { access_token: 'tok_demo_123' } }));
}

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

// ── Desktop: login flow ──
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await mockApi(ctx);
let page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push(String(e)));
page.on('console', m => {
  if (m.type() === 'error' && !m.text().includes('401')) {
    const url = m.location().url;
    errors.push(url ? `${m.text()} (${url})` : m.text());
  }
});

await page.goto(BASE + '/login', { waitUntil: 'networkidle' });

// wrong creds -> error message
await page.fill('#login-username', 'wrong');
await page.fill('#login-password', 'nope');
await page.click('.login-form__submit');
await page.waitForTimeout(600);
ok('login: ошибка при неверных данных', await page.locator('.login-form__error').isVisible());

// password visibility toggle
await page.click('.login-form__toggle');
ok('login: показ пароля', await page.locator('#login-password').getAttribute('type') === 'text');
await page.click('.login-form__toggle');

// correct creds -> cabinet
await page.fill('#login-username', 'demo');
await page.fill('#login-password', 'demo');
await page.click('.login-form__submit');
await page.waitForTimeout(1500);
ok('login: вход и кабинет', await page.locator('.personal__title').isVisible());
ok('cabinet: статистика (3 карточки)', await page.locator('.stat').count() >= 3);
ok('cabinet: прогресс лимита 7%', (await page.locator('.stat__percent').textContent())?.trim() === '7%');

// form validation: submit disabled until required fields
ok('form: submit заблокирован', await page.locator('.form__submit').isDisabled());
await page.fill('#inputObj', '999-99');
await page.fill('#inputLabNo', 'B1-1');
await page.fill('#inputType', 'FC');
ok('form: submit активен', !(await page.locator('.form__submit').isDisabled()));

// add/remove param rows
const rowsBefore = await page.locator('.form__row--pair').count();
await page.click('.form__add-row');
const rowsAfter = await page.locator('.form__row--pair').count();
ok('form: добавить параметр', rowsAfter === rowsBefore + 1);
await page.locator('.form__row-remove').last().click();
ok('form: удалить параметр', await page.locator('.form__row--pair').count() === rowsBefore);

// row pair validation: key without value blocks
await page.locator('.form__row--pair input').first().fill('Глубина');
await page.click('.form__submit');
await page.waitForTimeout(400);
ok('form: toast о незаполненной паре', await page.locator('.toast').count() > 0);
await page.locator('.form__row--pair input').nth(1).fill('2.5');

// create report
await page.click('.form__submit');
await page.waitForTimeout(900);
ok('form: POST /reports/ вызван', createCalled);
ok('form: QR запрошен с ID созданного протокола', createdQrId === 'new1', createdQrId || 'ID отсутствует');
ok('form: сообщение об успехе', await page.locator('.form__success').isVisible());

// table: filter dropdown
await page.click('.dropdown-btn');
await page.waitForTimeout(300);
ok('table: dropdown открыт', await page.locator('.dropdown-menu').isVisible());
await page.locator('.dropdown-item', { hasText: '812-4' }).click();
await page.waitForTimeout(400);
const rows812 = await page.locator('.table tbody tr').count();
ok('table: фильтр по объекту', rows812 === 6, `${rows812} строк`);
await page.screenshot({ path: `${OUT}/filter.png` });

// reset filter, pagination
await page.click('.dropdown-btn');
await page.locator('.dropdown-item', { hasText: 'Все объекты' }).first().click();
await page.waitForTimeout(400);
ok('table: пагинация видна', await page.locator('.pagination').isVisible());
await page.locator('.pagination__pages .page-btn', { hasText: '2' }).click();
await page.waitForTimeout(300);
ok('table: страница 2 активна', (await page.locator('.page-btn--active').textContent())?.trim() === '2');

// edit flow: prefills form + shows editing banner + scrolls
await page.locator('.action-btn--edit').first().click();
await page.waitForTimeout(900);
ok('edit: форма в режиме редактирования', await page.locator('.form-desc--editing').isVisible());
ok('edit: поля заблокированы', await page.locator('#inputObj').isDisabled());
await page.screenshot({ path: `${OUT}/edit-mode.png` });
await page.click('.form-head__cancel');
await page.waitForTimeout(300);
ok('edit: отмена возвращает форму', !(await page.locator('.form-desc--editing').isVisible()));

// delete modal
await page.locator('.action-btn--delete').first().click();
await page.waitForTimeout(300);
ok('delete: модалка открыта', await page.locator('.modal').isVisible());
await page.screenshot({ path: `${OUT}/delete-modal.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
ok('delete: Escape закрывает', !(await page.locator('.modal').isVisible()));
await page.locator('.action-btn--delete').first().click();
await page.waitForTimeout(200);
await page.locator('.modal .btn-danger').click();
await page.waitForTimeout(500);
ok('delete: DELETE вызван + toast', deleteCalled && await page.locator('.toast').count() > 0);

// token modal
await page.click('.token-btn');
await page.waitForTimeout(400);
ok('token: модалка с сообщением', (await page.locator('.modal__text').textContent() || '').includes('буфер'));
await page.locator('.modal .btn-accent').click();

// chart rendered
ok('chart: canvas отрисован', await page.locator('.chart-container canvas').isVisible());
await ctx.close();

// ── Mobile: drawer + cards ──
signedIn = false;
ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mockApi(ctx);
page = await ctx.newPage();
page.on('pageerror', e => errors.push(String(e)));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.click('.header__toggle');
await page.waitForTimeout(500);
ok('mobile: drawer открыт', await page.locator('.drawer--open .drawer__panel').isVisible());
ok('mobile: скролл заблокирован', await page.evaluate(() => document.body.style.overflow) === 'hidden');
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
const drawerHidden = !(await page.locator('.drawer--open').count());
ok('mobile: Escape закрывает drawer', drawerHidden);

// cookie accept persists
await page.click('.cookie__btn');
await page.waitForTimeout(300);
ok('cookie: баннер скрыт', await page.locator('.cookie').count() === 0);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
ok('cookie: не показывается после reload', await page.locator('.cookie').count() === 0);

// mobile cabinet cards
signedIn = true;
await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
ok('mobile: карточки вместо таблицы', await page.locator('.cards .card').count() > 0 && !(await page.locator('.table-wrapper').isVisible()));

// touch targets >= 40px
const smallTargets = await page.evaluate(() => {
  const sel = ['.card-btn', '.page-btn', '.header__toggle', '.dropdown-btn', '.form__add-row'];
  const bad = [];
  for (const s of sel) {
    document.querySelectorAll(s).forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.height < 40)) bad.push(`${s}:${Math.round(r.height)}`);
    });
  }
  return bad;
});
ok('mobile: touch-таргеты ≥40px', smallTargets.length === 0, smallTargets.join(','));

await ctx.close();
await browser.close();

results.push('');
results.push(errors.length ? 'JS ERRORS:\n' + errors.join('\n') : 'JS ERRORS: none');
fs.writeFileSync(`${OUT}/results.txt`, results.join('\n'));
console.log(results.join('\n'));
if (failures > 0 || errors.length > 0) process.exitCode = 1;
