import { filterProducts, validateProducts } from './catalog-core.mjs';
const $ = id => document.getElementById(id);
let products = [], category = '全部';
let contact = { wechat:'X_XIN-0109', phone:'18479795181' };
let toastTimer;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function toast(message) {
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2600);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('已复制，可以粘贴发送'); }
  catch {
    const ta = element('textarea'); ta.value = text; document.body.append(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove();
    toast(ok ? '已复制，可以粘贴发送' : '无法自动复制，请长按选择文字');
  }
}
function openDialog(dialog) { dialog.showModal(); document.body.style.overflow = 'hidden'; }
for (const button of document.querySelectorAll('[data-open-source]')) button.addEventListener('click', () => openDialog($('sourceDialog')));
for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { if (!document.querySelector('dialog[open]')) document.body.style.overflow = ''; });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
function image(path, alt) {
  const img = element('img'); img.src = path; img.alt = alt; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
  img.addEventListener('error', () => img.replaceWith(element('span', '', '商品图片暂不可用')), {once:true});
  return img;
}
function showDetails(product) {
  const box = $('detailContent'); box.replaceChildren();
  const gallery = element('div', 'gallery');
  for (const src of product.images) gallery.append(image(src, product.name));
  if (product.images.length) box.append(gallery);
  if (product.images.length > 1) box.append(element('p', 'gallery-hint', `共 ${product.images.length} 张图片 · 左右滑动查看`));
  box.append(element('p', 'product-code', product.code));
  const heading = element('h2', 'detail-title', product.name); heading.id = 'detailTitle';
  box.append(heading, element('p', 'detail-price', '¥' + product.price + ' / ' + (product.unit || '件')));
  const list = element('dl', 'detail-grid');
  for (const [key, value] of [['品类', product.category], ['颜色', product.colors], ['尺码', product.sizes], ['面料', product.fabric], ['起拿', product.moq]]) {
    list.append(element('dt', '', key), element('dd', '', value || '请向商家确认'));
  }
  box.append(list, element('p', 'detail-note', '商品信息来自原二维码网页。价格、库存和发货时间请向商家确认。'));
  const actions = element('div', 'detail-actions');
  const copyProduct = element('button', 'button secondary', '复制款号与信息');
  copyProduct.addEventListener('click', () => copy(`${product.name}\n款号：${product.code}\n价格：¥${product.price}/${product.unit || '件'}\n颜色：${product.colors || '请确认'}\n尺码：${product.sizes || '请确认'}`));
  const wechat = element('button', 'button primary', '复制商家微信');
  wechat.addEventListener('click', () => copy(contact.wechat)); actions.append(copyProduct, wechat); box.append(actions);
  openDialog($('productDialog'));
}
function render() {
  const found = filterProducts(products, {query:$('search').value, category, sort:$('sort').value});
  $('products').replaceChildren(); $('resultCount').textContent = found.length + ' 款商品'; $('emptyState').hidden = found.length > 0;
  for (const product of found) {
    const card = element('button', 'product-card'); card.type = 'button';
    card.setAttribute('aria-label', `查看${product.name}详情，价格${product.price}元`);
    const photo = element('div', 'product-image');
    photo.append(product.images.length ? image(product.images[0], product.name) : element('span', '', '图片待补充'));
    card.append(photo, element('span', 'product-code', product.code), element('h3', '', product.name), element('p', '', product.colors || product.category), element('p', '', product.sizes || '尺码请向商家确认'));
    const price = element('span', 'product-price', '¥' + product.price); price.append(element('small', '', '/ ' + (product.unit || '件')));
    card.append(price); card.addEventListener('click', () => showDetails(product)); $('products').append(card);
  }
}
function selectCategory(button) {
  category = button.dataset.category;
  for (const item of $('categories').children) { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); }
  render();
}
$('categories').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (button) selectCategory(button); });
$('resetFilters').addEventListener('click', () => { $('search').value = ''; $('sort').value = 'default'; selectCategory($('categories').firstElementChild); });
$('search').addEventListener('input', render); $('sort').addEventListener('change', render);
$('copyWechat').addEventListener('click', () => copy(contact.wechat));
$('shareButton').addEventListener('click', async () => {
  const url = location.origin + location.pathname;
  try { if (navigator.share) await navigator.share({title:document.title, url}); else await copy(url); }
  catch (error) { if (error.name !== 'AbortError') await copy(url); }
});
try {
  const response = await fetch('catalog.json', {cache:'no-store'}); if (!response.ok) throw new Error('目录加载失败');
  const catalog = await response.json(); products = validateProducts(catalog.products); if (catalog.contact) contact = catalog.contact;
  $('wechatText').textContent = contact.wechat; $('totalCount').textContent = products.length + ' 款';
  const categoryNames = ['外套大衣','打底针织','牛仔裤','加绒针织裤','羽绒服'];
  for (const name of [...new Set([...categoryNames, ...products.map(p => p.category)])]) {
    if (!products.some(product => product.category === name)) continue;
    const count = products.filter(product => product.category === name).length;
    const button = element('button', 'category', `${name} ${count}`); button.dataset.category = name; button.setAttribute('aria-pressed', 'false'); $('categories').append(button);
  }
  render();
} catch {
  $('emptyState').hidden = false; $('emptyTitle').textContent = '目录暂时未能加载';
  $('emptyText').textContent = '请稍后刷新页面重试，或使用页面上方的联系方式向商家询款。';
}
