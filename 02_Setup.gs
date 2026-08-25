/**
 * ============================================================
 *  File: 02_Setup.gs — Tự tạo toàn bộ cấu trúc sheet
 *  Chạy 1 lần duy nhất khi cài đặt: menu ⚙️ Máy 1 buồng
 * ============================================================
 */

/** Menu hiện ra khi mở file Google Sheets. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Máy 1 buồng')
    .addItem('1. Tạo / kiểm tra cấu trúc sheet', 'taoCauTrucSheet')
    .addItem('2. Tạo dữ liệu mẫu để chạy thử', 'taoDuLieuMau')
    .addSeparator()
    .addItem('🔄 Cập nhật bảng TỔNG HỢP THEO LÔ', 'capNhatTongHopLo')
    .addItem('🔧 Dựng lại bảng đếm & chỉ số', 'dungLaiBoDem')
    .addItem('🧾 Điền 6 cột xem nhanh (P–U) cho dữ liệu cũ', 'dienCotXemNhanh')
    .addItem('🔓 Mở lại 1 lô đã đóng', 'moLaiLo')
    .addSeparator()
    .addItem('🧹 XOÁ TOÀN BỘ DỮ LIỆU (giữ cấu trúc)', 'xoaToanBoDuLieu')
    .addToUi();
}

/**
 * Tạo đủ 6 sheet với hàng tiêu đề đúng. Chạy lại nhiều lần vẫn an toàn:
 * sheet nào đã có thì chỉ kiểm tra tiêu đề, không xoá dữ liệu.
 */
function taoCauTrucSheet() {
  var ss = SpreadsheetApp.getActive();
  var ketQua = [];

  Object.keys(SHEETS).forEach(function (key) {
    var ten = SHEETS[key];
    var cols = COLS[ten];
    var sh = ss.getSheetByName(ten);

    /*
     * Chữ ghi ở hàng 1 KHÔNG phải lúc nào cũng là tên cột trong mã: 6 cột xem nhanh
     * của bản 1.6 mang tiêu đề tiếng Việt có dấu ("mã lô", "Số thứ tự"…), còn hai cột
     * N, O thì để trống hẳn. nhanCot_ lo việc dịch đó — xem NHAN_COT trong 00_Config.gs.
     */
    var tieuDe = cols.map(function (c) { return nhanCot_(ten, c); });

    if (!sh) {
      sh = ss.insertSheet(ten);
      sh.getRange(1, 1, 1, cols.length).setValues([tieuDe]);
      ketQua.push('✅ Đã tạo mới: ' + ten);
    } else {
      var hienTai = sh.getRange(1, 1, 1, Math.max(cols.length, sh.getLastColumn() || 1)).getValues()[0];
      var khop = true;
      for (var i = 0; i < cols.length; i++) {
        if (String(hienTai[i] === null || hienTai[i] === undefined ? '' : hienTai[i]).trim()
            !== tieuDe[i]) { khop = false; break; }
      }
      if (!khop) {
        sh.getRange(1, 1, 1, cols.length).setValues([tieuDe]);
        ketQua.push('⚠️ Đã sửa lại tiêu đề: ' + ten);
      } else {
        ketQua.push('• Đã có, không đổi: ' + ten);
      }
    }

    // Định dạng hàng tiêu đề
    sh.getRange(1, 1, 1, cols.length)
      .setFontWeight('bold')
      .setBackground('#1f3864')
      .setFontColor('#ffffff')
      .setVerticalAlignment('middle');
    sh.setFrozenRows(1);
    sh.setRowHeight(1, 30);
  });

  // Nạp cấu hình mặc định nếu sheet CAU_HINH còn trống
  var shCf = ss.getSheetByName(SHEETS.CAU_HINH);
  if (shCf.getLastRow() < 2) {
    shCf.getRange(2, 1, CAU_HINH_MAC_DINH.length, 3).setValues(CAU_HINH_MAC_DINH);
    ketQua.push('✅ Đã nạp cấu hình mặc định');
  }

  // Bảo vệ sheet LOG: không cho sửa tay
  try {
    var shLog = ss.getSheetByName(SHEETS.LOG);
    var dsBaoVe = shLog.getProtections(SpreadsheetApp.ProtectionType.SHEET);
    if (!dsBaoVe.length) {
      shLog.protect()
        .setDescription('Nhật ký thao tác — không sửa tay')
        .setWarningOnly(true);
      ketQua.push('✅ Đã bật cảnh báo bảo vệ sheet LOG');
    }
  } catch (e) { /* bỏ qua nếu tài khoản không cho phép */ }

  // Cột rộng dễ nhìn
  try {
    ss.getSheetByName(SHEETS.BAO).setColumnWidth(1, 240);
    ss.getSheetByName(SHEETS.LOG).setColumnWidth(1, 150);
  } catch (e) { /* bỏ qua */ }

  // Ép các cột thời gian + mã PIN về dạng VĂN BẢN.
  // Nếu để mặc định, Google Sheets tự đổi "2026-08-19 07:24:15" thành ô ngày giờ
  // và cắt mất số 0 đứng đầu của mã PIN (0472 -> 472).
  try {
    var dinhDangText = [
      [SHEETS.LO,         ['tg_mo', 'tg_dong']],
      [SHEETS.BAO,        ['tg_nhap', 'tg_sua']],
      [SHEETS.LOG,        ['tg']],
      [SHEETS.NGUOI_DUNG, ['pin']]
    ];
    dinhDangText.forEach(function (mp) {
      var shx = ss.getSheetByName(mp[0]);
      mp[1].forEach(function (ten) {
        var idx = COLS[mp[0]].indexOf(ten);
        if (idx >= 0) shx.getRange(1, idx + 1, shx.getMaxRows(), 1).setNumberFormat('@');
      });
    });
    ketQua.push('✅ Đã đặt định dạng VĂN BẢN cho cột thời gian và mã PIN');

    /*
     * Cột "Thời gian" của 6 cột xem nhanh làm ĐÚNG NGƯỢC LẠI: phải là Ô NGÀY GIỜ THẬT
     * (Andy chốt 22/08/2026) để dán sang Excel còn lọc / sắp xếp được. Cột J bên cạnh
     * vẫn là VĂN BẢN — hai cột cùng nói một thời điểm nhưng phục vụ hai việc khác nhau.
     */
    var shBaoTg = ss.getSheetByName(SHEETS.BAO);
    var iTg = COLS.BAO.indexOf('v_thoi_gian');
    if (shBaoTg && iTg >= 0) {
      shBaoTg.getRange(1, iTg + 1, shBaoTg.getMaxRows(), 1)
             .setNumberFormat(DINH_DANG_NGAY_GIO);
      ketQua.push('✅ Đã đặt định dạng NGÀY GIỜ cho cột "Thời gian" (' +
                  DINH_DANG_NGAY_GIO + ')');
    }
  } catch (e) { /* bỏ qua */ }

  xoaCacheCauHinh();

  /*
   * Dựng lại bảng chỉ số CHI_SO và hai cột đếm sẵn trên sheet LO.
   *
   * Bắt buộc phải làm ở đây: nâng cấp từ 1.4 lên 1.5 thì CHI_SO còn trống và cột
   * so_bao_ra / kl_ra của các lô cũ cũng trống. Không dựng lại thì màn hình danh sách
   * lô hiện 0 bao cho mọi lô cũ. Việc này đọc sheet BAO đúng MỘT lượt, và chạy lại
   * bao nhiêu lần cũng cho ra cùng kết quả vì nó tính từ dữ liệu gốc.
   */
  try {
    dungLaiChiSo_();
    var soLo = dungLaiSoBaoLo_();
    ketQua.push('✅ Đã dựng lại chỉ số 6 nhóm và bộ đếm của ' + soLo + ' lô');
  } catch (e) {
    ketQua.push('⚠️ Chưa dựng được chỉ số: ' + e.message);
  }

  SpreadsheetApp.getUi().alert(
    'KẾT QUẢ TẠO CẤU TRÚC\n\n' + ketQua.join('\n') +
    '\n\nBƯỚC TIẾP THEO: mở sheet NGUOI_DUNG và nhập danh sách công nhân + mã PIN.'
  );
}

/** Tạo dữ liệu mẫu để chạy thử ngay, không phải gõ tay. */
function taoDuLieuMau() {
  var ui = SpreadsheetApp.getUi();
  var tra = ui.alert(
    'Tạo dữ liệu mẫu',
    'Sẽ thêm 3 người dùng mẫu và 2 mã lô mẫu.\nChỉ dùng để chạy thử. Tiếp tục?',
    ui.ButtonSet.YES_NO
  );
  if (tra !== ui.Button.YES) return;

  /*
   * Dựng từng dòng theo TÊN CỘT, không gõ cứng theo vị trí.
   * Bản 1.3 thêm cột kl_vao vào COLS.LO nhưng quên sửa mảng gõ cứng ở đây, nên
   * setValues lệch chiều và menu này NÉM LỖI suốt 2 phiên bản mà không ai biết.
   * Dựng theo tên cột thì sau này thêm bao nhiêu cột nữa cũng không hỏng.
   */
  function ghiMau_(tenSheet, dsObj) {
    var sh = sheet_(tenSheet);
    if (sh.getLastRow() >= 2) return 0;      // đã có dữ liệu -> không đụng vào
    var cols = COLS[tenSheet];
    var rows = dsObj.map(function (o) {
      return cols.map(function (c) { return (o[c] === undefined || o[c] === null) ? '' : o[c]; });
    });
    sh.getRange(2, 1, rows.length, cols.length).setValues(rows);
    return rows.length;
  }

  ghiMau_(SHEETS.NGUOI_DUNG, [
    { ma_nv: 'CN01', ten: 'Công nhân 1', pin: '1111', vai_tro: VAI_TRO.CONG_NHAN, dang_dung: 'CO' },
    { ma_nv: 'CN02', ten: 'Công nhân 2', pin: '2222', vai_tro: VAI_TRO.CONG_NHAN, dang_dung: 'CO' },
    { ma_nv: 'TK01', ten: 'Thống kê',    pin: '9999', vai_tro: VAI_TRO.THONG_KE,  dang_dung: 'CO' },
    { ma_nv: 'QL01', ten: 'Quản lý',     pin: '8888', vai_tro: VAI_TRO.QUAN_LY,   dang_dung: 'CO' }
  ]);

  // Lô mẫu để NGƯỜI TẠO là CN01 — có vậy mới thử được nút "Sửa mã lô" và "Xoá lô",
  // hai nút chỉ hiện với chính người đã tạo lô.
  ghiMau_(SHEETS.LO, [
    { ma_lo: 'T0748LA', ky_hieu: 'A', so_bao_vao: 163, kl_vao: 1000,
      trang_thai: LO_TRANG_THAI.DANG_CHAY, nguoi_mo: 'CN01', tg_mo: bayGio_() },
    { ma_lo: 'D0912MB', ky_hieu: 'B', so_bao_vao: 120, kl_vao: 800,
      trang_thai: LO_TRANG_THAI.DANG_CHAY, nguoi_mo: 'CN01', tg_mo: bayGio_() }
  ]);

  ui.alert('Đã tạo dữ liệu mẫu.\n\nPIN thử: 1111 (Công nhân 1), 2222 (Công nhân 2),\n9999 (Thống kê), 8888 (Quản lý).\n\n⚠️ NHỚ ĐỔI PIN trước khi dùng thật.');
}

/** Xoá sạch dữ liệu nghiệp vụ, giữ nguyên cấu trúc và người dùng. */
function xoaToanBoDuLieu() {
  var ui = SpreadsheetApp.getUi();
  var tra = ui.prompt(
    '⚠️ XOÁ TOÀN BỘ DỮ LIỆU',
    'Thao tác này xoá hết dữ liệu ở sheet LO, BAO, LOG, TONG_HOP_LO.\n' +
    'KHÔNG THỂ HOÀN TÁC.\n\nGõ chính xác:  XOA  rồi bấm OK.',
    ui.ButtonSet.OK_CANCEL
  );
  if (tra.getSelectedButton() !== ui.Button.OK) return;
  if (String(tra.getResponseText()).trim().toUpperCase() !== 'XOA') {
    ui.alert('Đã huỷ — bạn gõ không đúng từ xác nhận.');
    return;
  }

  // GIỮ LẠI sheet LOG. Đó là bằng chứng "ai sửa gì, lúc mấy giờ" — xoá nó đi là
  // mất đúng thứ mà cả hệ thống được dựng lên để có. Muốn dọn LOG thì làm tay,
  // có chủ đích, chứ không đi kèm nút xoá dữ liệu.
  var dem = {};
  [SHEETS.LO, SHEETS.BAO, SHEETS.TONG_HOP_LO].forEach(function (ten) {
    var sh = sheet_(ten);
    dem[ten] = Math.max(0, sh.getLastRow() - 1);
    if (sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
    }
  });

  ghiLog_({ ma_nv: 'ADMIN', ten: 'Quản lý (Sheets)' }, 'XOA_TOAN_BO', SHEETS.LO, '',
          'LO=' + dem[SHEETS.LO] + ' dòng; BAO=' + dem[SHEETS.BAO] +
          ' dòng; TONG_HOP_LO=' + dem[SHEETS.TONG_HOP_LO] + ' dòng',
          '', 'Xoá toàn bộ dữ liệu từ menu — nhật ký LOG được giữ lại');

  // Dữ liệu gốc đã sạch thì chỉ số cũng phải về 0, nếu không nó vẫn giữ số bao lớn
  // nhất của dữ liệu vừa xoá và gợi ý số bao sẽ nhảy vọt một cách khó hiểu.
  try { dungLaiChiSo_(); dungLaiSoBaoLo_(); } catch (e) { /* bỏ qua */ }

  ui.alert('Đã xoá xong dữ liệu: LO, BAO, TONG_HOP_LO.\n\n' +
           'Sheet LOG được GIỮ LẠI làm bằng chứng kiểm toán.');
}

/**
 * Dựng lại bảng chỉ số CHI_SO và hai cột đếm sẵn của sheet LO.
 *
 * Cả hai đều là số liệu ĐẾM SẴN cho nhanh, nguồn gốc vẫn là sheet BAO. Nếu có ai
 * sửa tay vào sheet, hoặc nghi số trên màn hình lệch với thực tế, chạy hàm này là
 * mọi thứ khớp lại. Đọc sheet BAO đúng một lượt.
 */
function dungLaiBoDem() {
  var ui = SpreadsheetApp.getUi();
  try {
    var cs = dungLaiChiSo_();
    var soLo = dungLaiSoBaoLo_();
    var dong = dsNhom_().map(function (n) {
      return '  ' + n + ': ' + (cs[n].so_bao) + ' bao, số lớn nhất = ' +
             (cs[n].stt_max === null ? '(chưa có)' : cs[n].stt_max);
    }).join('\n');
    ui.alert('ĐÃ DỰNG LẠI XONG\n\nChỉ số 6 nhóm:\n' + dong +
             '\n\nBộ đếm của ' + soLo + ' lô đã khớp lại với sheet BAO.');
  } catch (e) {
    ui.alert('Lỗi khi dựng lại: ' + e.message);
  }
}

/* ============================================================
 *  ĐIỀN 6 CỘT XEM NHANH P–U  (bản 1.6 — đợt D)
 * ============================================================ */

var KHOA_MOC_DIEN = 'DIEN_XEM_NHANH_TU_DONG';
var DIEN_MOI_LAN = 5000;          // số dòng mỗi lượt đọc/ghi
var DIEN_GIOI_HAN_MS = 4 * 60 * 1000;   // Apps Script cắt ở 6 phút — dừng sớm cho an toàn

/** Menu: điền lại 6 cột xem nhanh cho toàn bộ sheet BAO. Chạy lại bao nhiêu lần cũng được. */
function dienCotXemNhanh() {
  var ui = SpreadsheetApp.getUi();
  try {
    var kq = dienCotXemNhanh_();
    if (kq.con_lai) {
      ui.alert('CHƯA XONG — SHEET QUÁ DÀI\n\n' +
               'Đã điền tới dòng ' + kq.den_dong + ' (' + kq.so_dong + ' dòng lượt này).\n\n' +
               'Google cắt ngang hàm chạy quá lâu. CHẠY LẠI menu này để điền tiếp — ' +
               'nó tự nhớ chỗ đang dở.');
    } else {
      ui.alert('ĐÃ ĐIỀN XONG 6 CỘT XEM NHANH\n\n' +
               kq.so_dong + ' dòng ở sheet ' + SHEETS.BAO + '.\n\n' +
               'Bôi đen từ cột P đến cột U rồi dán thẳng sang Excel.');
    }
  } catch (e) {
    ui.alert('Lỗi khi điền 6 cột: ' + e.message);
  }
}

function xoaMocDien_() {
  try { PropertiesService.getScriptProperties().deleteProperty(KHOA_MOC_DIEN); }
  catch (e) { /* bỏ qua */ }
}

/**
 * Dựng lại 6 cột xem nhanh từ dữ liệu gốc.
 *
 * Chạy theo TỪNG MẺ và có mốc nhớ: ở nhịp 1000 bao/ngày, sau một năm sheet BAO là
 * 250.000 dòng — đọc một phát cả bảng rồi ghi lại là chắc chắn quá 6 phút và Google
 * cắt ngang GIỮA CHỪNG, để lại nửa bảng đã điền nửa chưa mà không ai biết tới đâu.
 * Nay hết giờ thì lưu mốc, người dùng chạy lại là đi tiếp từ đúng chỗ đó.
 *
 * Chạy lại từ đầu cũng cho ra ĐÚNG kết quả cũ (chỉ đọc dữ liệu gốc rồi ghi đè).
 *
 * @return {{so_dong: number, con_lai: boolean, den_dong: number}}
 */
function dienCotXemNhanh_() {
  var sh = sheet_(SHEETS.BAO);
  var last = sh.getLastRow();
  if (last < 2) { xoaMocDien_(); return { so_dong: 0, con_lai: false, den_dong: 1 }; }

  var props = PropertiesService.getScriptProperties();
  var tu = Number(props.getProperty(KHOA_MOC_DIEN)) || 2;
  if (!(tu >= 2) || tu > last) tu = 2;

  var iDau = COLS.BAO.indexOf('v_ma_lo') + 1;
  var soCotDoc = COLS.BAO.indexOf('tg_nhap') + 1;   // coXemNhanh_ chỉ cần tới cột J
  var batDau = new Date().getTime();
  var dong = tu, tongGhi = 0;

  while (dong <= last) {
    var n = Math.min(DIEN_MOI_LAN, last - dong + 1);
    var vals = sh.getRange(dong, 1, n, soCotDoc).getValues();
    var ghi = [];

    for (var i = 0; i < n; i++) {
      var trong = true;
      for (var k = 0; k < soCotDoc; k++) {
        if (vals[i][k] !== '' && vals[i][k] !== null) { trong = false; break; }
      }
      if (trong) { ghi.push(['', '', '', '', '', '']); continue; }

      var o = {};
      for (var j = 0; j < soCotDoc; j++) o[COLS.BAO[j]] = vals[i][j];
      var x = coXemNhanh_(o);
      ghi.push([x.v_ma_lo, x.v_loai, x.v_khoi_luong, x.v_stt, x.v_thoi_gian, x.v_tinh_trang]);
    }

    sh.getRange(dong, iDau, n, 6).setValues(ghi);
    tongGhi += n;
    dong += n;

    if (dong <= last && (new Date().getTime() - batDau) > DIEN_GIOI_HAN_MS) {
      props.setProperty(KHOA_MOC_DIEN, String(dong));
      return { so_dong: tongGhi, con_lai: true, den_dong: dong - 1 };
    }
  }

  xoaMocDien_();
  return { so_dong: tongGhi, con_lai: false, den_dong: last };
}

/** Mở lại 1 lô đã đóng (chỉ Andy / quản lý làm trực tiếp trên Sheets). */
function moLaiLo() {
  var ui = SpreadsheetApp.getUi();
  var tra = ui.prompt('Mở lại lô đã đóng', 'Nhập mã lô cần mở lại:', ui.ButtonSet.OK_CANCEL);
  if (tra.getSelectedButton() !== ui.Button.OK) return;

  var maLo = chuanHoaMaLo_(tra.getResponseText());
  var ds = docBang_(SHEETS.LO);
  for (var i = 0; i < ds.length; i++) {
    if (chuanHoaMaLo_(ds[i].ma_lo) === maLo) {
      suaDong_(SHEETS.LO, ds[i]._row, {
        trang_thai: LO_TRANG_THAI.DANG_CHAY,
        nguoi_dong: '',
        tg_dong: ''
      });
      ghiLog_({ ma_nv: 'ADMIN', ten: 'Quản lý (Sheets)' }, 'MO_LAI_LO', SHEETS.LO, maLo,
              LO_TRANG_THAI.DA_DONG, LO_TRANG_THAI.DANG_CHAY, 'Mở lại thủ công từ menu');
      ui.alert('Đã mở lại lô ' + maLo + '.\n\nLưu ý: các bao đã CHỐT CA vẫn khoá, không mở lại được.');
      return;
    }
  }
  ui.alert('Không tìm thấy mã lô: ' + maLo);
}
