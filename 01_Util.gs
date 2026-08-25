/**
 * ============================================================
 *  File: 01_Util.gs — Tiện ích dùng chung, truy cập sheet
 * ============================================================
 */

/** Lấy sheet theo tên, báo lỗi rõ ràng nếu chưa tạo. */
function sheet_(ten) {
  var sh = SpreadsheetApp.getActive().getSheetByName(ten);
  if (!sh) {
    throw new Error('Chưa có sheet "' + ten + '". Hãy chạy menu ⚙️ Máy 1 buồng → Tạo/kiểm tra cấu trúc sheet.');
  }
  return sh;
}

/**
 * Đọc 1 sheet thành mảng object theo tên cột.
 *
 * @param {string} tenSheet
 * @param {Array<string>=} chiCot  chỉ đọc những cột này. Bỏ trống = đọc hết.
 *
 *   Đọc chọn cột là một trong những cách rẻ nhất để hệ thống chịu được nhịp
 *   1000 bao/ngày: sheet BAO có 13 cột, nhưng việc chống trùng số bao chỉ cần 3.
 *   Google tính tiền theo Ô, nên bớt 10 cột là bớt 10/13 khối lượng phải tải.
 *   Hàm đọc từ cột 1 tới cột XA NHẤT trong danh sách (Google chỉ đọc được vùng liền
 *   nhau), nên hãy chọn các cột nằm đầu bảng thì lợi nhất.
 *
 * @return {Array<Object>} mỗi phần tử có thêm _row = số dòng thật trên sheet
 */
function docBang_(tenSheet, chiCot) {
  var sh = sheet_(tenSheet);
  var lastRow = sh.getLastRow();
  var cols = COLS[tenSheet];
  if (lastRow < 2) return [];

  var soCot = cols.length;
  if (chiCot && chiCot.length) {
    var xa = 0;
    for (var m = 0; m < chiCot.length; m++) {
      var vt = cols.indexOf(chiCot[m]);
      if (vt < 0) throw new Error('Sheet ' + tenSheet + ' không có cột "' + chiCot[m] + '".');
      if (vt + 1 > xa) xa = vt + 1;
    }
    soCot = xa;
  }

  var vals = sh.getRange(2, 1, lastRow - 1, soCot).getValues();
  var out = [];
  for (var i = 0; i < vals.length; i++) {
    // Bỏ qua dòng trống hoàn toàn
    var trong = true;
    for (var k = 0; k < vals[i].length; k++) {
      if (vals[i][k] !== '' && vals[i][k] !== null) { trong = false; break; }
    }
    if (trong) continue;

    var o = { _row: i + 2 };
    for (var j = 0; j < soCot; j++) o[cols[j]] = vals[i][j];
    out.push(o);
  }
  return out;
}

/* ============================================================
 *  CHỈ SỐ SỐ BAO THEO NHÓM  (sheet CHI_SO — bản 1.5)
 * ============================================================
 *  Xem phần giải thích BẤT BIẾN ở COLS.CHI_SO trong 00_Config.gs.
 * ============================================================ */

/** Sáu nhóm đánh số bao của hệ thống: A1 A2 A3 B1 B2 B3. */
function dsNhom_() {
  var ra = [];
  ['A', 'B'].forEach(function (kh) {
    ['1', '2', '3'].forEach(function (l) { ra.push(kh + l); });
  });
  return ra;
}

/**
 * Đọc cả bảng chỉ số (6 dòng).
 * @return {Object} { 'A1': {stt_max, so_bao, _row}, ... }
 */
function docChiSo_() {
  var ra = {};
  docBang_(SHEETS.CHI_SO).forEach(function (r) {
    var n = String(r.nhom || '').trim().toUpperCase();
    if (!n) return;
    ra[n] = {
      stt_max: (r.stt_max === '' || r.stt_max === null || isNaN(Number(r.stt_max)))
                 ? null : Number(r.stt_max),
      so_bao: Number(r.so_bao) || 0,
      _row: r._row
    };
  });
  return ra;
}

/**
 * Nâng chỉ số của một nhóm sau khi ghi thêm bao.
 * CHỈ NÂNG LÊN, không bao giờ hạ xuống — đó là điều làm cho đường nhanh an toàn.
 *
 * @param {string} nhom     'A1'…'B3'
 * @param {number} sttMoiNhat số bao lớn nhất vừa ghi
 * @param {number} themBao  số bao vừa thêm (âm nếu vừa xoá)
 */
function nangChiSo_(nhom, sttMoiNhat, themBao) {
  nhom = String(nhom || '').trim().toUpperCase();
  if (!nhom) return;
  var sh = sheet_(SHEETS.CHI_SO);
  var hienTai = docChiSo_()[nhom];

  if (!hienTai) {
    themDong_(SHEETS.CHI_SO, {
      nhom: nhom,
      stt_max: (sttMoiNhat === null || sttMoiNhat === undefined) ? '' : sttMoiNhat,
      so_bao: Math.max(0, Number(themBao) || 0),
      cap_nhat_luc: bayGio_()
    });
    return;
  }

  var max = hienTai.stt_max;
  if (sttMoiNhat !== null && sttMoiNhat !== undefined &&
      (max === null || sttMoiNhat > max)) {
    max = sttMoiNhat;
  }
  suaDong_(SHEETS.CHI_SO, hienTai._row, {
    stt_max: (max === null) ? '' : max,
    so_bao: Math.max(0, hienTai.so_bao + (Number(themBao) || 0)),
    cap_nhat_luc: bayGio_()
  });
}

/**
 * Dựng lại toàn bộ bảng chỉ số bằng cách quét sheet BAO một lượt.
 *
 * Dùng khi: nâng cấp lên 1.5 lần đầu (bảng còn trống), hoặc nghi chỉ số sai.
 * Chạy được bất cứ lúc nào — kết quả luôn đúng vì nó tính lại từ dữ liệu gốc.
 * @return {Object} chỉ số vừa dựng
 */
function dungLaiChiSo_() {
  var gom = {};
  dsNhom_().forEach(function (n) { gom[n] = { stt_max: null, so_bao: 0 }; });

  docBang_(SHEETS.BAO, ['ma_lo', 'ky_hieu', 'loai', 'stt_bao']).forEach(function (b) {
    var n = String(b.ky_hieu || '').trim().toUpperCase() + String(b.loai || '').trim();
    if (!gom[n]) return;
    gom[n].so_bao++;
    var s = Number(b.stt_bao);
    if (!isNaN(s) && (gom[n].stt_max === null || s > gom[n].stt_max)) gom[n].stt_max = s;
  });

  var sh = sheet_(SHEETS.CHI_SO);
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, COLS.CHI_SO.length).clearContent();
  }
  var luc = bayGio_();
  var rows = dsNhom_().map(function (n) {
    return [n, gom[n].stt_max === null ? '' : gom[n].stt_max, gom[n].so_bao, luc];
  });
  sh.getRange(2, 1, rows.length, COLS.CHI_SO.length).setValues(rows);
  return gom;
}

/**
 * Cộng dồn số bao / khối lượng ĐÃ RA vào dòng lô, và ghi nhận người vừa nhập.
 * Gọi mỗi khi thêm hoặc bớt bao.
 *
 * Ba cột so_bao_ra / kl_ra / ds_nguoi_nhap nằm LIỀN NHAU ở cuối sheet LO nên vẫn chỉ
 * tốn đúng 1 lượt đọc + 1 lượt ghi, y như bản 1.5 — thêm cột thứ ba không tốn thêm
 * lượt gọi Google nào.
 *
 * @param {number} soDongLo  số dòng của lô trên sheet LO
 * @param {number} themBao   số bao thêm (âm nếu bớt)
 * @param {number} themKl    khối lượng thêm (âm nếu bớt)
 * @param {string=} maNv     mã người vừa nhập — thêm vào ds_nguoi_nhap nếu chưa có
 */
function congDonLo_(soDongLo, themBao, themKl, maNv) {
  if (!soDongLo) return;
  var sh = sheet_(SHEETS.LO);
  var iB = COLS.LO.indexOf('so_bao_ra') + 1;
  var v = sh.getRange(soDongLo, iB, 1, 3).getValues()[0];
  var bao = Math.max(0, (Number(v[0]) || 0) + (Number(themBao) || 0));
  var kl = lamTronKl_(Math.max(0, (Number(v[1]) || 0) + (Number(themKl) || 0)));
  var ds = themVaoDsNguoi_(v[2], maNv);
  sh.getRange(soDongLo, iB, 1, 3).setValues([[bao, kl, ds]]);
}

/**
 * Thêm một mã nhân viên vào chuỗi "CN01,CN03" nếu chưa có sẵn.
 * Trả lại nguyên chuỗi cũ khi không có gì để thêm — không bao giờ XOÁ tên ai đã có,
 * kể cả khi bao của họ vừa bị xoá hết: để thừa một cái tên chỉ làm màn hình "lô đã
 * đóng" hiện thêm một lô không phải của mình, còn xoá nhầm là giấu mất lô của người ta.
 * @return {string}
 */
function themVaoDsNguoi_(cu, maNv) {
  var s = String(cu === null || cu === undefined ? '' : cu).trim();
  var m = String(maNv || '').trim().toUpperCase();
  if (!m) return s;
  var ds = s ? s.split(',') : [];
  for (var i = 0; i < ds.length; i++) {
    if (String(ds[i]).trim().toUpperCase() === m) return s;
  }
  ds.push(m);
  return ds.join(',');
}

/**
 * Dựng lại hai cột đếm sẵn của MỌI lô bằng cách quét sheet BAO một lượt.
 * Dùng khi nâng cấp lên 1.5 lần đầu, hoặc khi nghi số đếm bị lệch.
 * @return {number} số lô đã cập nhật
 */
function dungLaiSoBaoLo_() {
  var gom = {};
  docBang_(SHEETS.BAO, ['ma_lo', 'ky_hieu', 'loai', 'stt_bao', 'khoi_luong',
                        'phien', 'trang_thai', 'nguoi_nhap'])
    .forEach(function (b) {
      var k = chuanHoaMaLo_(b.ma_lo);
      if (!k) return;
      if (!gom[k]) gom[k] = { bao: 0, kl: 0, nguoi: '' };
      gom[k].bao++;
      gom[k].kl += Number(b.khoi_luong) || 0;
      gom[k].nguoi = themVaoDsNguoi_(gom[k].nguoi, b.nguoi_nhap);
    });

  var sh = sheet_(SHEETS.LO);
  var last = sh.getLastRow();
  if (last < 2) return 0;

  var iMa = COLS.LO.indexOf('ma_lo') + 1;
  var iB = COLS.LO.indexOf('so_bao_ra') + 1;
  var cotMa = sh.getRange(2, iMa, last - 1, 1).getValues();
  var cotDem = sh.getRange(2, iB, last - 1, 3).getValues();

  var dem = 0;
  for (var i = 0; i < cotMa.length; i++) {
    var k = chuanHoaMaLo_(cotMa[i][0]);
    if (!k) { cotDem[i] = ['', '', '']; continue; }
    var g = gom[k] || { bao: 0, kl: 0, nguoi: '' };
    cotDem[i] = [g.bao, lamTronKl_(g.kl), g.nguoi];
    dem++;
  }
  sh.getRange(2, iB, last - 1, 3).setValues(cotDem);
  return dem;
}

/**
 * Lấy chỉ số của 1 nhóm, tự dựng lại nếu bảng chưa có.
 * @return {{stt_max: (number|null), so_bao: number}}
 */
function chiSoNhom_(nhom) {
  nhom = String(nhom || '').trim().toUpperCase();
  var cs = docChiSo_();
  if (!cs[nhom]) {
    dungLaiChiSo_();          // lần đầu sau khi nâng cấp lên 1.5
    cs = docChiSo_();
  }
  return cs[nhom] || { stt_max: null, so_bao: 0 };
}

/* ============================================================
 *  6 CỘT XEM NHANH P–U TRÊN SHEET BAO  (bản 1.6 — đợt D)
 * ============================================================
 *  Bản sao ĐÃ DỌN của dữ liệu gốc, để bôi đen dán thẳng sang Excel.
 *  KHÔNG phải nguồn số liệu — xem chú thích ở COLS.BAO trong 00_Config.gs.
 * ============================================================ */

/**
 * Đổi chuỗi thời gian 'yyyy-MM-dd HH:mm:ss' thành Ô NGÀY GIỜ THẬT, CẮT GIÂY.
 *
 * Dựng Date bằng từng thành phần chứ KHÔNG dùng Date.parse: chuỗi này không đúng
 * chuẩn ISO nên mỗi nơi hiểu một kiểu, và sai kiểu đó lệch đúng bằng múi giờ —
 * âm thầm 7 tiếng, không có thông báo nào. Đây là lỗi tuKiemTra đã phải canh riêng
 * cho múi giờ project; đừng mở lại cửa đó.
 *
 * @param {*} v  giá trị cột tg_nhap (chuỗi, hoặc đã là Date)
 * @return {Date|string} '' nếu không đọc được
 */
function ngayGioTu_(v) {
  var s = tgChuoi_(v);
  var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(s);
  if (!m) return '';
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]),
                  Number(m[4]), Number(m[5]), 0, 0);
}

/**
 * Dựng 6 giá trị xem nhanh từ một dòng bao.
 * @param {Object} bao  cần có ma_lo, ky_hieu, loai, stt_bao, khoi_luong, tg_nhap, trang_thai
 * @return {Object}
 */
function coXemNhanh_(bao) {
  var loai = String(bao.loai === null || bao.loai === undefined ? '' : bao.loai).trim();
  var kh = String(bao.ky_hieu === null || bao.ky_hieu === undefined ? '' : bao.ky_hieu)
             .trim().toUpperCase();
  var stt = bao.stt_bao;
  var kl = Number(bao.khoi_luong);

  return {
    v_ma_lo: String(bao.ma_lo === null || bao.ma_lo === undefined ? '' : bao.ma_lo).trim(),
    v_loai: NHAN_LOAI_XEM.hasOwnProperty(loai) ? NHAN_LOAI_XEM[loai] : '',
    v_khoi_luong: isNaN(kl) ? '' : kl,
    v_stt: (kh || loai || stt !== '') ? (kh + loai + '-' + (stt === '' || stt === null || stt === undefined ? '' : Number(stt))) : '',
    v_thoi_gian: ngayGioTu_(bao.tg_nhap),
    v_tinh_trang: String(bao.trang_thai === null || bao.trang_thai === undefined
                           ? '' : bao.trang_thai).trim().toUpperCase()
  };
}

/**
 * Gộp 6 cột xem nhanh vào một object bao trước khi ghi xuống sheet.
 * @return {Object} chính object đã được bổ sung
 */
function themXemNhanh_(bao) {
  var x = coXemNhanh_(bao);
  Object.keys(x).forEach(function (k) { bao[k] = x[k]; });
  return bao;
}

/** Thêm 1 dòng vào cuối sheet từ object. */
function themDong_(tenSheet, obj) {
  var sh = sheet_(tenSheet);
  var cols = COLS[tenSheet];
  var row = cols.map(function (c) {
    return (obj[c] === undefined || obj[c] === null) ? '' : obj[c];
  });
  sh.appendRow(row);
  return sh.getLastRow();
}

/**
 * Thêm NHIỀU dòng vào cuối sheet trong MỘT lần ghi.
 * appendRow từng dòng tốn 1 lượt gọi Google mỗi dòng — 20 bao là 20 lượt, chờ rất lâu.
 * Hàm này gộp thành đúng 1 lượt, đó mới là điểm lợi của việc nhập nhiều bao cùng lúc.
 */
function themNhieuDong_(tenSheet, dsObj) {
  if (!dsObj || !dsObj.length) return 0;
  var sh = sheet_(tenSheet);
  var cols = COLS[tenSheet];
  var rows = dsObj.map(function (obj) {
    return cols.map(function (c) {
      return (obj[c] === undefined || obj[c] === null) ? '' : obj[c];
    });
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, cols.length).setValues(rows);
  return rows.length;
}

/**
 * Đổi ma_lo + ky_hieu cho MỌI dòng của một lô trong sheet BAO.
 *
 * ma_lo là khoá nối BAO với LO. Đổi mã ở sheet LO mà quên đổi ở BAO thì toàn bộ
 * bao đã nhập thành dòng mồ côi — coi như mất trắng. Vì vậy hai việc này phải
 * luôn đi cùng nhau, trong cùng một khoá ghi.
 *
 * Ghi theo CỘT (2 lượt) thay vì theo dòng (2 lượt mỗi dòng) để lô lớn không bị chậm.
 * @return {number} số dòng đã đổi
 */
function doiMaLoTrongBao_(maCu, maMoi, kyHieuMoi) {
  var sh = sheet_(SHEETS.BAO);
  var last = sh.getLastRow();
  if (last < 2) return 0;

  var iMa = COLS.BAO.indexOf('ma_lo') + 1;
  var iKh = COLS.BAO.indexOf('ky_hieu') + 1;
  var iVMa = COLS.BAO.indexOf('v_ma_lo') + 1;
  var iVStt = COLS.BAO.indexOf('v_stt') + 1;
  var iLoai = COLS.BAO.indexOf('loai') + 1;
  var iStt = COLS.BAO.indexOf('stt_bao') + 1;

  var cotMa = sh.getRange(2, iMa, last - 1, 1).getValues();
  var cotKh = sh.getRange(2, iKh, last - 1, 1).getValues();
  var cotLoai = sh.getRange(2, iLoai, last - 1, 1).getValues();
  var cotStt = sh.getRange(2, iStt, last - 1, 1).getValues();
  var cotVMa = sh.getRange(2, iVMa, last - 1, 1).getValues();
  var cotVStt = sh.getRange(2, iVStt, last - 1, 1).getValues();

  var dem = 0;
  for (var i = 0; i < cotMa.length; i++) {
    if (chuanHoaMaLo_(cotMa[i][0]) === maCu) {
      cotMa[i][0] = maMoi;
      cotKh[i][0] = kyHieuMoi;
      // Hai cột xem nhanh phụ thuộc mã lô / ký hiệu phải đi theo, nếu không bảng
      // "sạch" sẽ nói dối lặng lẽ. Cột Loại KHÔNG đổi vì nó chỉ đọc cột loai.
      cotVMa[i][0] = maMoi;
      cotVStt[i][0] = kyHieuMoi + String(cotLoai[i][0]).trim() + '-' + Number(cotStt[i][0]);
      dem++;
    }
  }
  if (dem) {
    sh.getRange(2, iMa, last - 1, 1).setValues(cotMa);
    sh.getRange(2, iKh, last - 1, 1).setValues(cotKh);
    sh.getRange(2, iVMa, last - 1, 1).setValues(cotVMa);
    sh.getRange(2, iVStt, last - 1, 1).setValues(cotVStt);
  }
  return dem;
}

/**
 * Đặt trạng thái cho NHIỀU dòng bao trong ĐÚNG 2 lượt gọi Google (1 đọc, 1 ghi).
 *
 * suaDong_ tốn 2 lượt cho MỖI dòng, nên chốt ca 50 bao trước bản 1.5 tốn 100 lượt
 * gọi Google — tất cả nằm TRONG khoá ghi, tức 2 công nhân kia phải đứng chờ.
 * Ghi theo cột như doiMaLoTrongBao_ đã làm ở bản 1.4 thì còn đúng 2 lượt.
 *
 * @param {Array<number>} dsRow   số dòng thật trên sheet
 * @param {string} trangThai
 * @return {number} số dòng đã đổi
 */
function datTrangThaiBao_(dsRow, trangThai) {
  if (!dsRow || !dsRow.length) return 0;
  var sh = sheet_(SHEETS.BAO);
  var iTt = COLS.BAO.indexOf('trang_thai') + 1;

  /*
   * Gom các dòng LIỀN NHAU thành từng dải rồi ghi mỗi dải một lượt.
   *
   * Cách hiển nhiên hơn — đọc cả cột trạng thái, sửa trong bộ nhớ, ghi cả cột trở lại —
   * chạy đúng nhưng phải GHI 250.000 ô cho một lần chốt ca 50 bao. Đo thử trên sheet
   * 50.000 dòng: 296 ô ghi (bản 1.4) vọt lên 50.044 ô. Đó là đổi một cái đắt lấy một
   * cái đắt hơn.
   *
   * Bao vừa nhập nằm liền nhau ở cuối sheet, nên cách này thường chỉ ra 1–2 dải:
   * vừa ít lượt gọi, vừa chỉ ghi đúng số ô cần ghi.
   */
  var iVTt = COLS.BAO.indexOf('v_tinh_trang') + 1;

  var ds = dsRow.slice().sort(function (a, b) { return a - b; });
  var dem = 0, i = 0;
  while (i < ds.length) {
    var dau = ds[i], cuoi = dau;
    while (i + 1 < ds.length && ds[i + 1] === cuoi + 1) { i++; cuoi = ds[i]; }
    var n = cuoi - dau + 1;
    var oGhi = [];
    for (var k = 0; k < n; k++) oGhi.push([trangThai]);
    sh.getRange(dau, iTt, n, 1).setValues(oGhi);
    // Cột xem nhanh "Tình trạng lô" là bản sao của chính cột này -> ghi kèm luôn.
    // Tốn thêm 1 lượt gọi cho mỗi dải, nhưng dải thường chỉ 1–2 nên vẫn rẻ.
    sh.getRange(dau, iVTt, n, 1).setValues(oGhi);
    dem += n;
    i++;
  }
  return dem;
}

/** Cập nhật 1 dòng đã biết số dòng. */
function suaDong_(tenSheet, soDong, obj) {
  var sh = sheet_(tenSheet);
  var cols = COLS[tenSheet];
  var hienTai = sh.getRange(soDong, 1, 1, cols.length).getValues()[0];
  for (var j = 0; j < cols.length; j++) {
    if (obj.hasOwnProperty(cols[j])) {
      hienTai[j] = (obj[cols[j]] === undefined || obj[cols[j]] === null) ? '' : obj[cols[j]];
    }
  }
  sh.getRange(soDong, 1, 1, cols.length).setValues([hienTai]);
}

/** Thời điểm hiện tại dạng chuỗi dễ đọc, đúng múi giờ VN. */
function bayGio_() {
  return Utilities.formatDate(new Date(), MUI_GIO, 'yyyy-MM-dd HH:mm:ss');
}

/** Ngày hôm nay dạng yyyy-MM-dd. */
function homNay_() {
  return Utilities.formatDate(new Date(), MUI_GIO, 'yyyy-MM-dd');
}

/** Sinh ID duy nhất cho dòng bao. */
function taoId_() {
  return Utilities.getUuid();
}

/**
 * Suy ra ký hiệu A/B từ ký tự đầu của mã lô.
 * @param {string} maLo
 * @return {string} 'A' | 'B' | '' (rỗng nghĩa là không hợp lệ)
 */
function kyHieuTuMaLo_(maLo) {
  if (!maLo) return '';
  var c = String(maLo).trim().charAt(0).toUpperCase();
  if (c === String(cfg('TIEN_TO_A')).toUpperCase()) return 'A';
  if (c === String(cfg('TIEN_TO_B')).toUpperCase()) return 'B';
  return '';
}

/** Chuẩn hoá mã lô: bỏ khoảng trắng thừa, viết hoa. */
function chuanHoaMaLo_(maLo) {
  return String(maLo || '').trim().toUpperCase().replace(/\s+/g, '');
}

/** Mã lô hợp lệ: chỉ chữ HOA, số và dấu gạch ngang. Chặn ký tự lạ phá giao diện. */
var MAU_MA_LO = /^[A-Z0-9-]{3,20}$/;

/*
 * Cờ xác nhận app gửi lên khi công nhân đã TÍCH ô xác nhận (bản 1.6).
 * Không bao giờ trùng một mã lô thật vì MAU_MA_LO cấm dấu gạch dưới.
 */
var CO_XAC_NHAN = 'XAC_NHAN';

/**
 * Công nhân đã xác nhận thao tác khoá sổ chưa (chốt ca / đóng lô)?
 *
 * Bản 1.6 đổi từ "gõ lại mã lô" sang "tích ô xác nhận" (Andy chốt 22/08/2026).
 * Hàm này CỐ Ý nhận cả hai kiểu:
 *   - true hoặc 'XAC_NHAN'  -> app bản 1.6 gửi khi ô tích đã được tích;
 *   - đúng mã lô            -> app bản 1.5 CÒN ĐANG MỞ trên máy công nhân gửi.
 *
 * Bỏ kiểu thứ hai đi thì cả ca đó không đóng được lô cho tới khi từng người đóng hẳn
 * app rồi mở lại — bản 1.5 đã gây ra đúng sự cố này một lần, xem TIEN_DO.md.
 *
 * @param {*} xacNhan   thứ app gửi lên
 * @param {string} maLo mã lô đang thao tác
 * @return {boolean}
 */
function xacNhanDung_(xacNhan, maLo) {
  if (xacNhan === true) return true;
  var s = String(xacNhan === null || xacNhan === undefined ? '' : xacNhan).trim().toUpperCase();
  if (s === '') return false;
  if (s === CO_XAC_NHAN) return true;
  var m = chuanHoaMaLo_(maLo);
  return !!m && chuanHoaMaLo_(s) === m;
}

/**
 * Đổi chuỗi người dùng gõ thành số.
 * Chấp nhận cả dấu phẩy thập phân (bàn phím tiếng Việt gõ "49,8").
 * Trả về NaN nếu không phải số.
 */
function soTu_(v) {
  if (typeof v === 'number') return v;
  var s = String(v === null || v === undefined ? '' : v).trim().replace(/\s/g, '');
  if (s === '') return NaN;
  s = s.replace(',', '.');
  if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
  return Number(s);
}

/**
 * Đổi chuỗi thành SỐ LỚN — dùng RIÊNG cho khối lượng đầu vào của cả lô.
 *
 * Khác soTu_ ở đúng một chỗ: hàm này HIỂU DẤU PHÂN CÁCH NGHÌN.
 *
 * Vì sao phải tách riêng thay vì sửa thẳng soTu_:
 *   - Khối lượng 1 BAO nằm trong khoảng KL_MIN–KL_MAX (1–200 kg), không bao giờ cần
 *     dấu phân cách nghìn. Ở đó dấu phẩy LUÔN là dấu thập phân ("49,8" = 49.8 kg) —
 *     đó là lỗi số 1 của bản v1.1, đã có kiểm thử canh, không được phép đổi.
 *   - Khối lượng ĐẦU VÀO CẢ LÔ là ô duy nhất người ta gõ số hàng nghìn, và nó là
 *     MẪU SỐ của mọi tỉ lệ thu hồi. Gõ "1.000" mà máy hiểu 1 kg thì cả báo cáo của
 *     lô sai 1000 lần.
 *
 * Quy tắc:
 *   - Có cả "." lẫn "," : dấu xuất hiện SAU CÙNG là thập phân, dấu kia là nghìn.
 *   - Chỉ một loại dấu, lặp từ 2 lần trở lên : là dấu nghìn.
 *   - Chỉ một loại dấu, đúng 1 lần : theo sau đúng 3 chữ số thì là NGHÌN
 *     (hệ thống dùng 1 số lẻ, không ai ghi khối lượng 3 số lẻ), còn lại là thập phân.
 *   - Nhóm chữ số không đúng 3 (VD "12.34.56") thì trả NaN — THÀ BÁO LỖI CÒN HƠN
 *     ĐOÁN BỪA, vì đoán sai ở ô này là hỏng cả lô.
 *
 * @return {number} NaN nếu không đọc được chắc chắn
 */
function soLonTu_(v) {
  if (typeof v === 'number') return v;
  var s = String(v === null || v === undefined ? '' : v).trim().replace(/\s/g, '');
  if (s === '') return NaN;
  if (!/^[0-9.,]+$/.test(s)) return NaN;

  var coCham = s.indexOf('.') >= 0;
  var coPhay = s.indexOf(',') >= 0;
  var dauNghin = '', dauLe = '';

  if (coCham && coPhay) {
    dauLe = (s.lastIndexOf('.') > s.lastIndexOf(',')) ? '.' : ',';
    dauNghin = (dauLe === '.') ? ',' : '.';
  } else if (coCham || coPhay) {
    var d = coCham ? '.' : ',';
    var soLan = s.split(d).length - 1;
    if (soLan >= 2) {
      dauNghin = d;
    } else {
      // Đúng 1 dấu: theo sau đúng 3 chữ số -> hiểu là dấu phân cách nghìn.
      var sau = s.substring(s.indexOf(d) + 1);
      if (/^\d{3}$/.test(sau) && s.indexOf(d) > 0) dauNghin = d;
      else dauLe = d;
    }
  }

  var phanNguyen = s, phanLe = '';
  if (dauLe) {
    var vt = s.lastIndexOf(dauLe);
    phanNguyen = s.substring(0, vt);
    phanLe = s.substring(vt + 1);
    if (!/^\d+$/.test(phanLe)) return NaN;
  }

  if (dauNghin) {
    var nhom = phanNguyen.split(dauNghin);
    if (nhom.length < 2) return NaN;
    if (!/^\d{1,3}$/.test(nhom[0])) return NaN;
    for (var i = 1; i < nhom.length; i++) {
      if (!/^\d{3}$/.test(nhom[i])) return NaN;   // nhóm không đủ 3 số -> không chắc, từ chối
    }
    phanNguyen = nhom.join('');
  }

  if (!/^\d+$/.test(phanNguyen)) return NaN;
  var kq = Number(phanNguyen + (phanLe ? '.' + phanLe : ''));
  return isNaN(kq) ? NaN : kq;
}

/**
 * Đọc + soát khối lượng đầu vào của lô.
 * Dùng CHUNG cho apiTaoLo và apiCapNhatKlVao, để hai đường vào không bao giờ
 * soát khác nhau — trước bản 1.5 mỗi nơi tự soát một kiểu.
 * @return {{loi: string, gia_tri: (number|string)}} gia_tri === '' nghĩa là để trống
 */
function docKlVao_(raw) {
  if (raw === '' || raw === null || raw === undefined) return { loi: '', gia_tri: '' };
  var n = soLonTu_(raw);
  if (isNaN(n)) {
    return { loi: 'Không đọc chắc chắn được khối lượng đầu vào "' + String(raw) + '".\n' +
                  'Gõ số thường (VD 1000), hoặc dùng dấu phân cách nghìn (VD 1.000).',
             gia_tri: '' };
  }
  if (n <= 0) {
    return { loi: 'Khối lượng đầu vào phải là số lớn hơn 0 (hoặc để trống).', gia_tri: '' };
  }
  var max = Number(cfg('KL_VAO_MAX'));
  if (!isNaN(max) && max > 0 && n > max) {
    return { loi: 'Khối lượng đầu vào ' + n + ' kg vượt mức tối đa ' + max + ' kg.\n' +
                  'Kiểm tra lại xem có gõ thừa số 0 không.', gia_tri: '' };
  }
  return { loi: '', gia_tri: lamTronKl_(n) };
}

/** Làm tròn khối lượng theo số lẻ cấu hình. */
function lamTronKl_(kl) {
  var soLe = Number(cfg('SO_LE'));
  if (isNaN(soLe) || soLe < 0) soLe = 1;
  var he = Math.pow(10, soLe);
  return Math.round(Number(kl) * he) / he;
}

/**
 * Đổi giá trị thời gian đọc từ sheet về chuỗi 'yyyy-MM-dd HH:mm:ss'.
 * Google Sheets có thể tự đổi chuỗi ngày giờ thành ô kiểu Date —
 * hàm này đảm bảo phần còn lại của hệ thống luôn làm việc với chuỗi.
 */
function tgChuoi_(v) {
  if (v === null || v === undefined || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    return Utilities.formatDate(v, MUI_GIO, 'yyyy-MM-dd HH:mm:ss');
  }
  return String(v).trim();
}

/**
 * Đọc cột "dang_dung". Chấp nhận nhiều cách viết của người dùng.
 * Coi là NGỪNG dùng khi giá trị bắt đầu bằng K (KHONG/Không), N (No), F (False) hoặc là 0.
 */
function dangDung_(v) {
  var s = String(v === null || v === undefined ? '' : v).trim().toUpperCase();
  if (s === '') return true;               // để trống = đang dùng
  var c = s.charAt(0);
  if (c === 'K' || c === 'N' || c === 'F' || s === '0') return false;
  return true;
}

/**
 * Chuẩn hoá vai trò đọc từ sheet.
 * CHỈ chấp nhận đúng 3 giá trị đã định nghĩa. Mọi cách gõ khác — thiếu gạch dưới
 * ("CONGNHAN"), gõ có dấu ("Công nhân"), để trống — đều quy về CONG_NHAN,
 * tức QUYỀN THẤP NHẤT. Cột này Andy gõ tay vào sheet, nên một lỗi chính tả
 * KHÔNG được phép mở toang màn hình thống kê cho công nhân.
 */
function vaiTroChuan_(v) {
  var s = String(v === null || v === undefined ? '' : v).trim().toUpperCase();
  if (s === VAI_TRO.THONG_KE) return VAI_TRO.THONG_KE;
  if (s === VAI_TRO.QUAN_LY) return VAI_TRO.QUAN_LY;
  return VAI_TRO.CONG_NHAN;
}

/**
 * Chuẩn hoá mã PIN đọc từ sheet.
 * Google Sheets cắt mất số 0 đứng đầu nếu ô để dạng Số (PIN 0472 -> 472),
 * nên ở đây bù lại số 0 cho đủ độ dài cấu hình.
 */
function pinChuan_(v) {
  var s = String(v === null || v === undefined ? '' : v).trim();
  var doDai = Number(cfg('PIN_DO_DAI'));
  if (isNaN(doDai) || doDai < 1) doDai = 4;
  if (/^\d+$/.test(s)) while (s.length < doDai) s = '0' + s;
  return s;
}

/**
 * Bao đã quá hạn sửa chưa (tự khoá sau TU_KHOA_SAU_GIO giờ dù chưa bấm CHỐT CA).
 * Chốt chặn này bảo đảm "không sửa được số liệu cũ" kể cả khi công nhân quên chốt ca.
 */
function quaHanSua_(tgNhap) {
  var gio = Number(cfg('TU_KHOA_SAU_GIO'));
  if (isNaN(gio) || gio <= 0) return false;
  var s = tgChuoi_(tgNhap);
  var m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return false;
  var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]),
                   Number(m[4]), Number(m[5]), Number(m[6]));
  return (new Date().getTime() - d.getTime()) > gio * 3600 * 1000;
}

/**
 * Ghi 1 dòng vào sheet LOG. Không bao giờ ném lỗi ra ngoài
 * để việc ghi log hỏng không làm hỏng nghiệp vụ chính.
 */
function ghiLog_(nguoiDung, hanhDong, bang, khoa, giaTriCu, giaTriMoi, ghiChu) {
  try {
    themDong_(SHEETS.LOG, {
      tg: bayGio_(),
      ma_nv: nguoiDung ? nguoiDung.ma_nv : '',
      ten: nguoiDung ? nguoiDung.ten : '',
      hanh_dong: hanhDong,
      bang: bang || '',
      khoa: khoa || '',
      gia_tri_cu: giaTriCu === undefined || giaTriCu === null ? '' : String(giaTriCu),
      gia_tri_moi: giaTriMoi === undefined || giaTriMoi === null ? '' : String(giaTriMoi),
      ghi_chu: ghiChu || ''
    });
  } catch (e) {
    console.error('Ghi log thất bại: ' + e.message);
  }
}

/**
 * Chạy 1 hàm bên trong khoá toàn script.
 * BẮT BUỘC dùng cho mọi thao tác GHI, tránh 2 công nhân ghi đè nhau.
 */
function trongKhoa_(fn) {
  var lock = LockService.getScriptLock();
  var duocKhoa = lock.tryLock(20000); // chờ tối đa 20 giây
  if (!duocKhoa) {
    throw new Error('Hệ thống đang bận, vui lòng bấm lại sau vài giây.');
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/** Bọc kết quả trả về cho client theo một khuôn thống nhất. */
function ok_(duLieu) { return { ok: true, data: duLieu === undefined ? null : duLieu }; }
function loi_(thongBao, ma) { return { ok: false, error: String(thongBao), code: ma || 'LOI' }; }

/** Include file HTML con vào template. */
function include(tenFile) {
  return HtmlService.createHtmlOutputFromFile(tenFile).getContent();
}
