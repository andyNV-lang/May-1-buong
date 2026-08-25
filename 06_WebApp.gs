/**
 * ============================================================
 *  File: 06_WebApp.gs — Điểm vào của ứng dụng web
 * ============================================================
 */

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Index');
  t.tenMay = String(cfg('TEN_MAY'));

  var out = t.evaluate()
    .setTitle('Ghi chép ' + cfg('TEN_MAY'))
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  /*
   * addMetaTag() của Apps Script chỉ chấp nhận một số tên nhất định
   * (viewport, mobile-web-app-capable, apple-mobile-web-app-capable,
   *  google-site-verification) — và danh sách này Google có thể đổi.
   *
   * Gặp tên không hợp lệ, addMetaTag NÉM LỖI, doGet chết, công nhân mở link ra
   * chỉ thấy TRANG TRẮNG. Với app đặt tại máy sản xuất thì trang trắng = dừng việc.
   *
   * Vì vậy thêm từng thẻ một, thẻ nào bị từ chối thì BỎ QUA thẻ đó.
   * Thà mất một thẻ meta trang trí còn hơn mất cả ứng dụng.
   * Thẻ nào bị bỏ sẽ được ghi vào Execution log để còn biết đường lần.
   */
  [
    ['viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'],
    ['mobile-web-app-capable', 'yes'],
    ['apple-mobile-web-app-capable', 'yes']
  ].forEach(function (m) {
    try {
      out.addMetaTag(m[0], m[1]);
    } catch (err) {
      console.warn('Bỏ qua thẻ meta "' + m[0] + '": ' + err.message);
    }
  });

  return out;
}

/**
 * Hàm tự kiểm tra — chạy trong trình soạn thảo Apps Script để
 * xác nhận cấu trúc sheet và logic cơ bản chạy được.
 * Xem kết quả ở tab "Execution log".
 */
function tuKiemTra() {
  var kq = [];
  function ktra(ten, dieuKien, chiTiet) {
    kq.push((dieuKien ? '✅ ' : '❌ ') + ten + (chiTiet ? ' — ' + chiTiet : ''));
  }

  // 1. Sheet
  Object.keys(SHEETS).forEach(function (k) {
    var sh = SpreadsheetApp.getActive().getSheetByName(SHEETS[k]);
    ktra('Sheet ' + SHEETS[k], !!sh, sh ? '' : 'CHƯA TẠO — chạy menu Tạo cấu trúc sheet');
  });

  // 2. Ký hiệu suy từ mã lô
  ktra('T0748LA -> A', kyHieuTuMaLo_('T0748LA') === 'A', kyHieuTuMaLo_('T0748LA'));
  ktra('D0912MB -> B', kyHieuTuMaLo_('D0912MB') === 'B', kyHieuTuMaLo_('D0912MB'));
  ktra('X1234 -> rỗng (không hợp lệ)', kyHieuTuMaLo_('X1234') === '', '"' + kyHieuTuMaLo_('X1234') + '"');
  ktra('t0748la (chữ thường) -> A', kyHieuTuMaLo_('t0748la') === 'A', kyHieuTuMaLo_('t0748la'));

  // 3. Cấu hình
  ktra('KL_MIN đọc được', !isNaN(Number(cfg('KL_MIN'))), String(cfg('KL_MIN')));
  ktra('KL_MAX đọc được', !isNaN(Number(cfg('KL_MAX'))), String(cfg('KL_MAX')));

  // 4. Làm tròn
  ktra('Làm tròn 49.84 -> 49.8', lamTronKl_(49.84) === 49.8, String(lamTronKl_(49.84)));

  // 5. Chuẩn hoá mã lô
  ktra('Chuẩn hoá " t0748la " -> T0748LA',
       chuanHoaMaLo_(' t0748la ') === 'T0748LA', chuanHoaMaLo_(' t0748la '));

  // 6. Ký vé
  try {
    var ve = taoVe_('CN01');
    ktra('Tạo và giải mã vé', String(ve).indexOf('.') > 0, '');
  } catch (err) {
    ktra('Tạo vé', false, err.message);
  }

  // 7. Người dùng
  var dsNd = docBang_(SHEETS.NGUOI_DUNG);
  ktra('Có ít nhất 1 người dùng', dsNd.length > 0, dsNd.length + ' người');

  // 8. DÁN ĐỦ FILE CHƯA — chốt chặn khi nâng cấp phiên bản.
  // Nâng cấp thường chỉ phải dán lại vài file; sót một file thì app hỏng theo kiểu
  // khó đoán. Chỗ này chỉ ra ngay hàm nào thiếu, và nó nằm ở file nào.
  var HAM_CAN_CO = [
    ['apiDangNhap', '03_Auth'], ['apiDanhSachNguoiDung', '03_Auth'],
    ['apiKiemTraVe', '03_Auth'], ['vaiTroChuan_', '01_Util'],
    ['themNhieuDong_', '01_Util'], ['doiMaLoTrongBao_', '01_Util'],
    ['soLonTu_', '01_Util'], ['docKlVao_', '01_Util'],
    ['docChiSo_', '01_Util'], ['nangChiSo_', '01_Util'], ['dungLaiChiSo_', '01_Util'],
    ['chiSoNhom_', '01_Util'], ['congDonLo_', '01_Util'], ['dungLaiSoBaoLo_', '01_Util'],
    ['datTrangThaiBao_', '01_Util'], ['dungLaiBoDem', '02_Setup'],
    ['apiTrangChu', '04_Api'], ['apiMoLo', '04_Api'], ['apiTaoLo', '04_Api'],
    ['apiLuuBao', '04_Api'], ['apiLuuNhieuBao', '04_Api'], ['apiSuaBao', '04_Api'],
    ['apiXoaBao', '04_Api'], ['apiChotCa', '04_Api'], ['apiDongLo', '04_Api'],
    ['apiGhiBaoLoi', '04_Api'],
    ['apiTongHopLo', '04_Api'], ['apiCapNhatKlVao', '04_Api'],
    ['apiXemTruocKetQua', '04_Api'], ['ketQuaLo_', '04_Api'],
    ['apiSuaMaLo', '04_Api'], ['apiXoaLo', '04_Api'],
    ['tinhTiLe_', '05_Report'], ['canhBaoHaoHut_', '05_Report'],
    ['tinhTongHopLo_', '05_Report']
  ];
  var thieu = [];
  HAM_CAN_CO.forEach(function (h) {
    var co = false;
    try { co = (typeof this[h[0]] === 'function'); } catch (e) { co = false; }
    if (!co) { try { co = (eval('typeof ' + h[0]) === 'function'); } catch (e2) { co = false; } }
    if (!co) thieu.push(h[0] + ' (file ' + h[1] + ')');
  });
  ktra('Đã dán đủ code (' + HAM_CAN_CO.length + ' hàm)', thieu.length === 0,
       thieu.length ? 'THIẾU: ' + thieu.join(', ') : '');

  // 9. Cấu trúc cột sheet có khớp code không — bắt lỗi quên chạy "Tạo cấu trúc sheet"
  var lechCot = [];
  Object.keys(SHEETS).forEach(function (k) {
    var ten = SHEETS[k];
    var sh = SpreadsheetApp.getActive().getSheetByName(ten);
    if (!sh) return;
    var cols = COLS[ten];
    var hienTai = sh.getRange(1, 1, 1, cols.length).getValues()[0];
    for (var i = 0; i < cols.length; i++) {
      // So với NHÃN hiện trên sheet, không phải tên cột trong mã: 6 cột xem nhanh
      // của bản 1.6 mang tiêu đề tiếng Việt (xem NHAN_COT trong 00_Config.gs).
      var nhan = nhanCot_(ten, cols[i]);
      if (String(hienTai[i] === null || hienTai[i] === undefined ? '' : hienTai[i]).trim() !== nhan) {
        lechCot.push(ten + ' thiếu/sai cột "' + (nhan || cols[i]) + '"');
        break;
      }
    }
  });
  ktra('Cột trên sheet khớp với code', lechCot.length === 0,
       lechCot.length ? lechCot.join('; ') + ' → chạy menu "Tạo / kiểm tra cấu trúc sheet"' : '');

  // 10. MÚI GIỜ — chỗ sai âm thầm nguy hiểm nhất khi cài đặt.
  // bayGio_() ghi giờ theo MUI_GIO, còn quaHanSua_ dựng lại Date theo múi giờ của
  // PROJECT (appsscript.json). Hai chỗ lệch nhau thì logic tự khoá 12 giờ sai lệch
  // đúng bằng khoảng chênh, mà không có một thông báo nào.
  try {
    var tzProject = Session.getScriptTimeZone();
    ktra('Múi giờ project khớp MUI_GIO trong code', tzProject === MUI_GIO,
         'appsscript.json = "' + tzProject + '", code = "' + MUI_GIO + '"' +
         (tzProject === MUI_GIO ? '' : ' → sửa "timeZone" trong appsscript.json cho khớp'));
  } catch (e) {
    ktra('Đọc được múi giờ project', false, e.message);
  }

  // 11. Khoảng khối lượng có hợp lý không — bản 1.4 để KL_MAX = 100 kg trong khi
  // bao thật nặng tới 200 kg, công nhân bị chặn oan mà thông báo lại bảo họ gõ sai
  // dấu thập phân. Cấu hình vô lý phải lộ ra ở đây.
  var klMin = Number(cfg('KL_MIN')), klMax = Number(cfg('KL_MAX'));
  ktra('Khoảng khối lượng 1 bao hợp lệ (KL_MIN < KL_MAX)',
       !isNaN(klMin) && !isNaN(klMax) && klMin > 0 && klMax > klMin,
       klMin + '–' + klMax + ' kg');
  var klVaoMax = Number(cfg('KL_VAO_MAX'));
  ktra('KL_VAO_MAX đọc được và lớn hơn KL_MAX',
       !isNaN(klVaoMax) && klVaoMax > klMax, String(cfg('KL_VAO_MAX')));

  // 12. BẢNG CHỈ SỐ & BỘ ĐẾM có còn khớp dữ liệu gốc không (bản 1.5).
  //
  // Hai thứ này là số liệu đếm sẵn cho nhanh. Chỉ số sai thì đường nhanh có thể cho
  // lọt SỐ BAO TRÙNG — hỏng đúng lời hứa quan trọng nhất của hệ thống. Vì vậy chỗ này
  // chấp nhận quét cả sheet BAO một lượt để đối chiếu: tuKiemTra là việc chạy tay,
  // thỉnh thoảng mới chạy, đắt một chút cũng đáng.
  try {
    var maxThat = {}, demThat = {}, klThat = {};
    dsNhom_().forEach(function (n) { maxThat[n] = null; demThat[n] = 0; });
    docBang_(SHEETS.BAO, ['ma_lo', 'ky_hieu', 'loai', 'stt_bao', 'khoi_luong'])
      .forEach(function (b) {
        var n = String(b.ky_hieu || '').trim().toUpperCase() + String(b.loai || '').trim();
        if (maxThat[n] !== undefined) {
          demThat[n]++;
          var v = Number(b.stt_bao);
          if (!isNaN(v) && (maxThat[n] === null || v > maxThat[n])) maxThat[n] = v;
        }
        var k = chuanHoaMaLo_(b.ma_lo);
        if (k) {
          if (!klThat[k]) klThat[k] = { bao: 0, kl: 0 };
          klThat[k].bao++;
          klThat[k].kl += Number(b.khoi_luong) || 0;
        }
      });

    var cs = docChiSo_(), xauChiSo = [];
    dsNhom_().forEach(function (n) {
      if (maxThat[n] === null) return;
      var ghi = cs[n] ? cs[n].stt_max : null;
      // Chỉ số ĐƯỢC PHÉP cao hơn thực tế (sau khi xoá bao) — đó là chiều an toàn.
      // Thấp hơn thực tế mới là hỏng.
      if (ghi === null || ghi < maxThat[n]) {
        xauChiSo.push(n + ': chỉ số ' + ghi + ' < thật ' + maxThat[n]);
      }
    });
    ktra('Bảng chỉ số CHI_SO còn an toàn', xauChiSo.length === 0,
         xauChiSo.length ? xauChiSo.join('; ') + ' → chạy menu ⚙️ "Dựng lại bảng đếm & chỉ số"'
                         : 'stt_max ≥ số bao lớn nhất thật ở cả 6 nhóm');

    var xauDem = [];
    docBang_(SHEETS.LO).forEach(function (l) {
      if (!l.ma_lo) return;
      var k = chuanHoaMaLo_(l.ma_lo);
      var t = klThat[k] || { bao: 0, kl: 0 };
      if ((Number(l.so_bao_ra) || 0) !== t.bao) {
        xauDem.push(l.ma_lo + ': đếm ' + (l.so_bao_ra || 0) + ' ≠ thật ' + t.bao);
      }
    });
    ktra('Bộ đếm số bao của từng lô khớp sheet BAO', xauDem.length === 0,
         xauDem.length ? xauDem.slice(0, 5).join('; ') +
                         (xauDem.length > 5 ? ' …' : '') +
                         ' → chạy menu ⚙️ "Dựng lại bảng đếm & chỉ số"'
                       : '');
  } catch (e) {
    ktra('Đối chiếu được chỉ số với dữ liệu gốc', false, e.message);
  }

  /*
   * 13. Sáu cột xem nhanh P–U có còn khớp dữ liệu gốc không (bản 1.6 — đợt D).
   *
   * Chúng là BẢN SAO, mà bản sao thì lệch được. Lệch ở đây không làm hỏng nghiệp vụ —
   * app vẫn chạy đúng — nhưng số dán sang Excel sẽ sai mà không ai biết. Đó là kiểu
   * sai nguy hiểm nhất: im lặng và trông rất thật.
   *
   * Chỉ soi 200 dòng CUỐI: đủ để bắt "quên chạy menu điền" và "một đường ghi nào đó
   * quên cập nhật", mà không biến hàm tự kiểm tra thành một lượt quét cả sheet.
   */
  try {
    var shX = SpreadsheetApp.getActive().getSheetByName(SHEETS.BAO);
    var lastX = shX ? shX.getLastRow() : 0;
    if (lastX >= 2) {
      var soSoi = Math.min(200, lastX - 1);
      var dongDau = lastX - soSoi + 1;
      var goc = shX.getRange(dongDau, 1, soSoi, COLS.BAO.indexOf('tg_nhap') + 1).getValues();
      var xem = shX.getRange(dongDau, COLS.BAO.indexOf('v_ma_lo') + 1, soSoi, 6).getValues();

      var lechXem = [];
      for (var q = 0; q < soSoi; q++) {
        var oq = {};
        for (var w = 0; w < goc[q].length; w++) oq[COLS.BAO[w]] = goc[q][w];
        if (String(oq.id || '').trim() === '') continue;      // dòng trống
        var mong = coXemNhanh_(oq);
        var that = xem[q];
        if (String(that[0]).trim() !== String(mong.v_ma_lo) ||
            String(that[1]).trim() !== String(mong.v_loai) ||
            Number(that[2]) !== Number(mong.v_khoi_luong) ||
            String(that[3]).trim() !== String(mong.v_stt) ||
            String(that[5]).trim().toUpperCase() !== String(mong.v_tinh_trang)) {
          lechXem.push('dòng ' + (dongDau + q));
          if (lechXem.length >= 5) break;
        }
      }
      ktra('6 cột xem nhanh P–U khớp dữ liệu gốc (' + soSoi + ' dòng cuối)',
           lechXem.length === 0,
           lechXem.length ? lechXem.join(', ') +
                            ' → chạy menu ⚙️ "Điền 6 cột xem nhanh (P–U)"' : '');
    }
  } catch (e) {
    ktra('Đối chiếu được 6 cột xem nhanh', false, e.message);
  }

  console.log('\n===== KẾT QUẢ TỰ KIỂM TRA =====\n' + kq.join('\n'));
  try {
    SpreadsheetApp.getUi().alert('KẾT QUẢ TỰ KIỂM TRA\n\n' + kq.join('\n'));
  } catch (e) { /* chạy từ editor thì không có UI */ }
  return kq;
}
