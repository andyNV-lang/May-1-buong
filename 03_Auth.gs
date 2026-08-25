/**
 * ============================================================
 *  File: 03_Auth.gs — Đăng nhập bằng mã PIN
 * ============================================================
 *  Cơ chế: công nhân nhập Mã NV + PIN -> máy chủ trả về 1 "vé"
 *  (token) có chữ ký, lưu trong điện thoại. Mỗi lần gọi máy chủ
 *  đều gửi kèm vé này. Vé hết hạn sau PHIEN_GIO giờ.
 *
 *  ⚠️ MỨC BẢO MẬT: đây là chốt chặn nhầm lẫn cho môi trường nhà máy
 *  nội bộ, KHÔNG phải bảo mật cấp ngân hàng. Ai có link + biết PIN
 *  là vào được. Vì vậy: KHÔNG chia sẻ file Google Sheets cho công nhân.
 * ============================================================
 */

var KHOA_BI_MAT_PROP = 'MAY1BUONG_SECRET';

/** Lấy (hoặc tạo mới) chuỗi bí mật dùng để ký vé. */
function layKhoaBiMat_() {
  var props = PropertiesService.getScriptProperties();
  var s = props.getProperty(KHOA_BI_MAT_PROP);
  if (!s) {
    s = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty(KHOA_BI_MAT_PROP, s);
  }
  return s;
}

/** Ký chuỗi bằng HMAC-SHA256, trả về hex. */
function ky_(chuoi) {
  var raw = Utilities.computeHmacSha256Signature(chuoi, layKhoaBiMat_());
  return raw.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

/** Tạo vé đăng nhập. */
function taoVe_(maNv) {
  var hanDung = Date.now() + (Number(cfg('PHIEN_GIO')) || 14) * 3600 * 1000;
  var than = maNv + '|' + hanDung;
  return Utilities.base64EncodeWebSafe(than) + '.' + ky_(than);
}

/**
 * Kiểm tra vé, trả về object người dùng. Ném lỗi nếu vé hỏng/hết hạn.
 * @param {string} ve
 * @return {Object} người dùng
 */
function xacThuc_(ve) {
  if (!ve || String(ve).indexOf('.') < 0) {
    throw new Error('PHIEN_HET_HAN');
  }
  var phan = String(ve).split('.');
  var than;
  try {
    than = Utilities.newBlob(Utilities.base64DecodeWebSafe(phan[0])).getDataAsString();
  } catch (e) {
    throw new Error('PHIEN_HET_HAN');
  }
  if (ky_(than) !== phan[1]) throw new Error('PHIEN_HET_HAN');

  var p = than.split('|');
  if (Number(p[1]) < Date.now()) throw new Error('PHIEN_HET_HAN');

  var nd = timNguoiDung_(p[0]);
  if (!nd) throw new Error('PHIEN_HET_HAN');
  return nd;
}

/** Tìm người dùng theo mã NV (không phân biệt hoa thường). */
function timNguoiDung_(maNv) {
  var ma = String(maNv || '').trim().toUpperCase();
  if (!ma) return null;
  var ds = docBang_(SHEETS.NGUOI_DUNG);
  for (var i = 0; i < ds.length; i++) {
    if (String(ds[i].ma_nv).trim().toUpperCase() === ma) {
      if (!dangDung_(ds[i].dang_dung)) return null;
      return {
        ma_nv: String(ds[i].ma_nv).trim(),
        ten: String(ds[i].ten).trim(),
        vai_tro: vaiTroChuan_(ds[i].vai_tro),
        _row: ds[i]._row,
        _pin: pinChuan_(ds[i].pin)
      };
    }
  }
  return null;
}

/* ---------- Chống dò PIN ---------- */

function khoaDemSai_(maNv) { return 'PIN_SAI_' + String(maNv).toUpperCase(); }

function demSaiHienTai_(maNv) {
  var c = CacheService.getScriptCache().get(khoaDemSai_(maNv));
  return c ? Number(c) : 0;
}

function tangDemSai_(maNv) {
  var n = demSaiHienTai_(maNv) + 1;
  var giay = (Number(cfg('PIN_KHOA_PHUT')) || 5) * 60;
  CacheService.getScriptCache().put(khoaDemSai_(maNv), String(n), giay);
  return n;
}

function xoaDemSai_(maNv) {
  CacheService.getScriptCache().remove(khoaDemSai_(maNv));
}

/**
 * API: đăng nhập.
 * @param {string} maNv
 * @param {string} pin
 */
function apiDangNhap(maNv, pin) {
  try {
    maNv = String(maNv || '').trim();
    pin = String(pin || '').trim();

    if (!maNv) return loi_('Chưa chọn tên.');
    if (!pin) return loi_('Chưa nhập mã PIN.');

    var toiDa = Number(cfg('PIN_SAI_TOI_DA')) || 5;
    if (demSaiHienTai_(maNv) >= toiDa) {
      return loi_('Nhập sai quá ' + toiDa + ' lần. Vui lòng chờ ' +
                  cfg('PIN_KHOA_PHUT') + ' phút rồi thử lại.', 'BI_KHOA');
    }

    // So sánh với PIN đã chuẩn hoá ở phía SHEET (bù số 0 bị Google cắt),
    // nhưng KHÔNG chuẩn hoá phía người gõ — nếu không thì gõ "472" cũng
    // mở được tài khoản có PIN "0472".
    var nd = timNguoiDung_(maNv);
    if (!nd || nd._pin !== String(pin).trim()) {
      var lan = tangDemSai_(maNv);
      ghiLog_({ ma_nv: maNv, ten: '' }, 'DANG_NHAP_SAI', SHEETS.NGUOI_DUNG, maNv, '', '',
              'Lần sai thứ ' + lan);
      return loi_('Mã PIN không đúng. (Còn ' + Math.max(0, toiDa - lan) + ' lần thử)');
    }

    xoaDemSai_(maNv);
    ghiLog_(nd, 'DANG_NHAP', SHEETS.NGUOI_DUNG, nd.ma_nv, '', '', '');

    return ok_({
      ve: taoVe_(nd.ma_nv),
      nguoi_dung: { ma_nv: nd.ma_nv, ten: nd.ten, vai_tro: nd.vai_tro },
      phien: nd.ma_nv + '_' + Utilities.formatDate(new Date(), MUI_GIO, 'yyyyMMdd_HHmmss')
    });
  } catch (e) {
    return loi_(e.message);
  }
}

/** API: lấy danh sách người dùng để hiện nút chọn tên (KHÔNG trả PIN). */
function apiDanhSachNguoiDung() {
  try {
    var ds = docBang_(SHEETS.NGUOI_DUNG);
    var out = [];
    for (var i = 0; i < ds.length; i++) {
      if (!dangDung_(ds[i].dang_dung)) continue;
      if (!ds[i].ma_nv) continue;
      out.push({
        ma_nv: String(ds[i].ma_nv).trim(),
        ten: String(ds[i].ten).trim(),
        vai_tro: vaiTroChuan_(ds[i].vai_tro)
      });
    }
    var doDai = Number(cfg('PIN_DO_DAI'));
    if (isNaN(doDai) || doDai < 1) doDai = 4;
    return ok_({ ds: out, pin_do_dai: doDai, ten_may: String(cfg('TEN_MAY')) });
  } catch (e) {
    return loi_(e.message);
  }
}

/** API: kiểm tra vé còn hiệu lực không (gọi khi mở lại app). */
function apiKiemTraVe(ve) {
  try {
    var nd = xacThuc_(ve);
    return ok_({ nguoi_dung: { ma_nv: nd.ma_nv, ten: nd.ten, vai_tro: nd.vai_tro } });
  } catch (e) {
    return loi_('Phiên đã hết hạn, vui lòng đăng nhập lại.', 'PHIEN_HET_HAN');
  }
}
