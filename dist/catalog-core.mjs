export function filterProducts(products, { query = '', category = '全部', sort = 'default' } = {}) {
  const needle = query.trim().toLocaleLowerCase();
  const found = products.filter(p => (category === '全部' || p.category === category) &&
    (!needle || [p.code,p.name,p.category,p.colors,p.sizes].join(' ').toLocaleLowerCase().includes(needle)));
  if (sort === 'price-asc') found.sort((a,b)=>a.price-b.price);
  if (sort === 'price-desc') found.sort((a,b)=>b.price-a.price);
  return found;
}

export function validateProducts(products) {
  if (!Array.isArray(products)) throw new Error('商品必须为数组');
  const codes = new Set();
  return products.map(p => {
    for (const key of ['code','name','category']) if (typeof p[key] !== 'string' || !p[key].trim()) throw new Error('缺少款号、名称或分类');
    const code = p.code.trim();
    if (codes.has(code)) throw new Error('款号重复：'+code);
    codes.add(code);
    if (p.price === '' || p.price == null || !Number.isFinite(Number(p.price)) || Number(p.price) < 0) throw new Error('价格无效：'+code);
    if (!Array.isArray(p.images)) throw new Error('图片必须为数组：'+code);
    for (const image of p.images) {
      if (typeof image === 'string' && /^assets\/real\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/i.test(image)) continue;
      if (typeof image !== 'string' || !/^https:\/\//i.test(image)) throw new Error('图片须为 HTTPS 链接或本地商品图片：'+code);
      try { const u=new URL(image); if(u.username || u.password) throw new Error(); } catch { throw new Error('图片链接无效：'+code); }
    }
    return {...p,code,name:p.name.trim(),category:p.category.trim(),price:Number(p.price)};
  });
}

export function parseCsv(source) {
  const s = source.replace(/^\uFEFF/,'');
  const rows=[]; let row=[],field='',quoted=false;
  for(let i=0;i<s.length;i++) {
    const c=s[i];
    if(c==='"') { if(quoted && s[i+1]==='"'){field+='"';i++;} else quoted=!quoted; }
    else if(c===',' && !quoted){row.push(field);field='';}
    else if((c==='\n'||c==='\r') && !quoted){if(c==='\r'&&s[i+1]==='\n')i++;row.push(field);if(row.some(x=>x!==''))rows.push(row);row=[];field='';}
    else field+=c;
  }
  if(quoted) throw new Error('CSV 引号未闭合');
  if(field || row.length){row.push(field);rows.push(row);}
  return rows;
}
