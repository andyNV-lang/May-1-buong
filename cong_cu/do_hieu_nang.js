/*
 * ĐO HIỆU NĂNG — mỗi thao tác phải đọc/ghi bao nhiêu Ô của Google Sheets?
 *
 *     node cong_cu/do_hieu_nang.js [số-dòng-BAO]        (mặc định 250000)
 *
 * Vì sao đo bằng số Ô chứ không bằng giây: Google tính công theo lượng ô phải
 * chuyển qua lại, còn thời gian chạy trên máy này không nói lên điều gì về
 * thời gian chạy trên máy chủ Google.
 *
 * Kịch bản dùng lại chính bộ giả lập trong 9_KIEMTHU_LOGIC.js.txt, chỉ chèn thêm
 * bộ đếm vào getValues/setValues. Muốn so với bản cũ thì trỏ M1B_NGUON sang thư mục
 * chứa bản đó:
 *
 *     M1B_NGUON=/duong/dan/ban_1.4/ node cong_cu/do_hieu_nang.js 250000
 */
const fs = require('fs');
const path = require('path');

const NGUON = process.env.M1B_NGUON || path.join(__dirname, '..') + path.sep;
const SO_DONG = Number(process.argv[2] || 250000);
const TEN = process.env.M1B_TEN || path.basename(path.resolve(NGUON));

let h = fs.readFileSync(path.join(NGUON, '9_KIEMTHU_LOGIC.js.txt'), 'utf8');
h = h.split("console.log('\\n=== 1.")[0];
h = h.replace(/__dirname/g, JSON.stringify(path.resolve(NGUON)));

// Chèn bộ đếm vào lớp Range của bộ giả lập
h = h.replace('class Range {',
  'const D = { oDoc: 0, oGhi: 0, luotDoc: 0, luotGhi: 0 };\nclass Range {');
h = h.replace('  getValues() {\n',
  '  getValues() {\n    D.luotDoc++; D.oDoc += this.nr * this.nc;\n');
h = h.replace('  setValues(v) {\n',
  '  setValues(v) {\n    D.luotGhi++; D.oGhi += (v.length || 0) * ((v[0] && v[0].length) || 0);\n');

h += `
Object.keys(SHEETS).forEach(k => { if (!DB[SHEETS[k]]) mkSheet(SHEETS[k], COLS[SHEETS[k]]); });
CAU_HINH_MAC_DINH.forEach(r => DB[SHEETS.CAU_HINH].push(r.slice()));
DB[SHEETS.NGUOI_DUNG].push(['CN01', 'Cong nhan 1', '1111', 'CONG_NHAN', 'CO']);

const N = ${SO_DONG};
const NAY = '2026-08-21 08:00:00';
for (let i = 1; i <= N; i++) {
  const o = { id: 'seed-' + i, ma_lo: 'T0001AA', ky_hieu: 'A', loai: '1', stt_bao: i,
              khoi_luong: 50, phien: 'P', trang_thai: 'DA_CHOT', nguoi_nhap: 'CN01',
              tg_nhap: NAY, nguoi_sua: '', tg_sua: '', client_id: 'seed' + i };
  DB[SHEETS.BAO].push(COLS.BAO.map(c => (o[c] === undefined ? '' : o[c])));
}
const oLo = { ma_lo: 'T0001AA', ky_hieu: 'A', so_bao_vao: N, trang_thai: 'DANG_CHAY',
              ghi_chu: '', nguoi_mo: 'CN01', tg_mo: NAY, nguoi_dong: '', tg_dong: '',
              kl_vao: 999999, so_bao_ra: N, kl_ra: N * 50 };
DB[SHEETS.LO].push(COLS.LO.map(c => (oLo[c] === undefined ? '' : oLo[c])));
if (typeof dungLaiChiSo_ === 'function') dungLaiChiSo_();

const VE = apiDangNhap('CN01', '1111').data.ve;
function so(n) { return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.'); }

console.log('');
console.log('Bản: ' + ${JSON.stringify(TEN)} + '   ·   sheet BAO: ' + so(N) + ' dòng');
console.log('─'.repeat(72));
console.log('thao tác'.padEnd(24) + 'ô ĐỌC'.padStart(14) + 'ô GHI'.padStart(10) +
            'lượt gọi'.padStart(11) + '  kết quả');
console.log('─'.repeat(72));

function do_(ten, fn) {
  D.oDoc = 0; D.oGhi = 0; D.luotDoc = 0; D.luotGhi = 0;
  const kq = fn();
  const ok = kq && kq.ok !== false;
  console.log(ten.padEnd(24) + so(D.oDoc).padStart(14) + so(D.oGhi).padStart(10) +
              String(D.luotDoc + D.luotGhi).padStart(11) +
              '  ' + (ok ? 'ok' : 'LỖI: ' + (kq && kq.error)));
}

let n = N;
do_('mở màn hình đầu', () => apiTrangChu(VE));
do_('lưu 1 bao', () => apiLuuBao(VE, { ma_lo: 'T0001AA', loai: '1', stt_bao: ++n,
      khoi_luong: 50, phien: 'P2', client_id: 'b' + n }));
do_('lưu mẻ 20 bao', () => { const ds = []; for (let k = 0; k < 20; k++) {
      n++; ds.push({ stt_bao: n, khoi_luong: 50, client_id: 'm' + n }); }
      return apiLuuNhieuBao(VE, { ma_lo: 'T0001AA', loai: '1', phien: 'P2', danh_sach: ds }); });
do_('mở 1 lô', () => apiMoLo(VE, 'T0001AA', 'P2'));
do_('chốt ca', () => apiChotCa(VE, 'P2', 'T0001AA'));
console.log('─'.repeat(72));
console.log('');
`;

const tam = path.join(require('os').tmpdir(), 'm1b_do_' + process.pid + '.js');
fs.writeFileSync(tam, h);
try { require(tam); } finally { try { fs.unlinkSync(tam); } catch (e) {} }
