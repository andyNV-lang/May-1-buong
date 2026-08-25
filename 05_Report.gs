/**
 * ============================================================
 *  File: 05_Report.gs — Bảng TỔNG HỢP THEO LÔ cho bộ phận thống kê
 * ============================================================
 *  Bộ phận thống kê cần dữ liệu THEO LÔ (Andy xác nhận 19/08/2026).
 *  Sheet TONG_HOP_LO được ghi lại toàn bộ mỗi lần cập nhật —
 *  KHÔNG sửa tay vào sheet này, mọi thay đổi sẽ bị ghi đè.
 * ============================================================
 */

/** Làm tròn 2 chữ số thập phân — dùng cho mọi tỉ lệ phần trăm. */
function tron2_(x) {
  var n = Number(x);
  if (isNaN(n)) return null;
  return Math.round(n * 100) / 100;
}

/**
 * Tính tỉ lệ thu hồi từng loại và tỉ lệ hao hụt của một lô.
 *
 * Công thức Andy chốt 20/08/2026:
 *   ti_le_Lx = (tổng KL các bao loại x của lô) / (KL đầu vào của lô) × 100
 *   hao_hut  = 100 − (ti_le_L1 + ti_le_L2 + ti_le_L3)
 *
 * Cố ý trừ trên các số ĐÃ LÀM TRÒN 2 số lẻ, để 4 con số hiện trên màn hình
 * cộng lại đúng bằng 100% — công nhân nhẩm lại được, không thấy lệch vô lý.
 *
 * @param {*} klVao khối lượng đầu vào đọc từ sheet (có thể trống)
 * @param {Object} klTheoLoai { '1': kg, '2': kg, '3': kg }
 */
function tinhTiLe_(klVao, klTheoLoai) {
  var n = Number(klVao);
  var co = (klVao !== null && klVao !== '' && klVao !== undefined && !isNaN(n) && n > 0);
  var r = {
    co_kl_vao: co,
    kl_vao: co ? lamTronKl_(n) : null,
    ti_le: { '1': null, '2': null, '3': null },
    ti_le_hao_hut: null
  };
  if (!co) return r;

  var tong = 0;
  ['1', '2', '3'].forEach(function (l) {
    var v = tron2_((Number(klTheoLoai[l]) || 0) / n * 100);
    r.ti_le[l] = v;
    tong += v;
  });
  r.ti_le_hao_hut = tron2_(100 - tong);
  return r;
}

/**
 * Câu cảnh báo khi tỉ lệ BỤI + HAO HỤT nằm ngoài khoảng thường gặp.
 * CHỈ CẢNH BÁO — không bao giờ chặn công nhân đóng lô.
 *
 * Bản 1.6 đổi cách gọi "hao hụt" thành "Bụi + hao hụt" (Andy 22/08/2026): ra bụi
 * cũng là một nguyên nhân gây hao hụt, và công nhân gọi cả cụm như vậy. KHÔNG cân
 * bụi, công thức giữ nguyên 100% − tổng thu hồi. Tên trường ti_le_hao_hut cũng giữ
 * nguyên vì bảng TONG_HOP_LO đang dùng nó làm tiêu đề cột.
 */
function canhBaoHaoHut_(haoHut) {
  if (haoHut === null || haoHut === undefined) return '';
  var thap = Number(cfg('HAO_HUT_MIN'));
  var cao = Number(cfg('HAO_HUT_MAX'));
  var khoang = ' (mức thường gặp ' + thap + '–' + cao + '%)';

  // Hao hụt âm = khối lượng RA nhiều hơn khối lượng VÀO. Không phải "thấp bất thường"
  // mà là điều không thể xảy ra -> chắc chắn có số liệu sai, nói thẳng luôn.
  if (haoHut < 0) {
    return 'Bụi + hao hụt ' + haoHut + '%: khối lượng ra ĐANG NHIỀU HƠN khối lượng vào. ' +
           'Chắc chắn có số nhập sai — kiểm tra lại khối lượng đầu vào và các bao.';
  }
  if (!isNaN(thap) && haoHut < thap) {
    return 'Bụi + hao hụt ' + haoHut + '% — THẤP bất thường' + khoang +
           '. Kiểm tra lại khối lượng đầu vào và các bao đã nhập.';
  }
  if (!isNaN(cao) && haoHut > cao) {
    return 'Bụi + hao hụt ' + haoHut + '% — CAO bất thường' + khoang +
           '. Kiểm tra lại khối lượng đầu vào và các bao đã nhập.';
  }
  return '';
}

/**
 * Tính bảng tổng hợp theo lô.
 * @param {string=} tuNgay  'yyyy-MM-dd' — lọc theo ngày mở lô (tuỳ chọn)
 * @param {string=} denNgay 'yyyy-MM-dd'
 * @return {Array<Object>}
 */
function tinhTongHopLo_(tuNgay, denNgay) {
  var dsLo = docBang_(SHEETS.LO);
  // Bảng tổng hợp chỉ cần 4 cột của sheet BAO. Đọc tới cột nguoi_nhap là đủ,
  // bỏ được 4 cột cuối — xem docBang_ trong 01_Util.gs.
  var dsBao = docBang_(SHEETS.BAO, ['ma_lo', 'loai', 'khoi_luong', 'nguoi_nhap']);

  var gom = {};
  dsBao.forEach(function (b) {
    var k = chuanHoaMaLo_(b.ma_lo);
    if (!gom[k]) {
      gom[k] = {
        so_bao: { '1': 0, '2': 0, '3': 0 },
        kl:     { '1': 0, '2': 0, '3': 0 },
        nguoi:  {}
      };
    }
    var loai = String(b.loai).trim();
    if (['1', '2', '3'].indexOf(loai) < 0) return;
    gom[k].so_bao[loai]++;
    gom[k].kl[loai] += Number(b.khoi_luong) || 0;
    var ma = String(b.nguoi_nhap).trim();
    if (ma) gom[k].nguoi[ma] = true;
  });

  var out = [];
  dsLo.forEach(function (l) {
    if (!l.ma_lo) return;

    var ngayMo = tgChuoi_(l.tg_mo).substring(0, 10);

    /*
     * Lọc theo ngày mở — NHƯNG không bao giờ giấu lô ĐANG CHẠY.
     *
     * Quản lý mở bảng này để nhìn "cái gì đang chạy", mà lô chạy dài ngày lại chính
     * là lô dễ quên nhất. Lọc cả chúng thì bộ lọc ngày (thêm ở bản 1.6) hoá ra giấu
     * mất đúng thứ cần thấy.
     */
    var dangChay = String(l.trang_thai).trim().toUpperCase() === LO_TRANG_THAI.DANG_CHAY;
    if (!dangChay) {
      if (tuNgay && ngayMo && ngayMo < tuNgay) return;
      if (denNgay && ngayMo && ngayMo > denNgay) return;
    }

    var k = chuanHoaMaLo_(l.ma_lo);
    var g = gom[k] || { so_bao: { '1': 0, '2': 0, '3': 0 },
                        kl: { '1': 0, '2': 0, '3': 0 }, nguoi: {} };

    var tongBao = g.so_bao['1'] + g.so_bao['2'] + g.so_bao['3'];
    var tongKl  = g.kl['1'] + g.kl['2'] + g.kl['3'];
    var tl = tinhTiLe_(l.kl_vao, g.kl);

    var dsNguoi = Object.keys(g.nguoi).map(function (m) { return tenTheoMa_(m); });

    out.push({
      ma_lo: String(l.ma_lo).trim(),
      ky_hieu: String(l.ky_hieu || kyHieuTuMaLo_(l.ma_lo)).trim(),
      trang_thai: String(l.trang_thai).trim().toUpperCase() === LO_TRANG_THAI.DA_DONG
                    ? 'Đã đóng' : 'Đang chạy',
      ngay_mo: ngayMo,
      ngay_dong: tgChuoi_(l.tg_dong).substring(0, 10),
      // Cột này thống kê gõ tay được trên sheet -> gõ chữ vào là Number() ra NaN,
      // rồi "NaN" chình ình trong bảng chị ấy chép sang Excel. Không phải số thì để trống.
      so_bao_vao: (l.so_bao_vao === '' || isNaN(Number(l.so_bao_vao))) ? '' : Number(l.so_bao_vao),

      so_bao_L1: g.so_bao['1'], kl_L1: lamTronKl_(g.kl['1']),
      so_bao_L2: g.so_bao['2'], kl_L2: lamTronKl_(g.kl['2']),
      so_bao_L3: g.so_bao['3'], kl_L3: lamTronKl_(g.kl['3']),

      tong_so_bao_ra: tongBao,
      tong_kl_ra: lamTronKl_(tongKl),
      kl_trung_binh_bao: tongBao > 0 ? lamTronKl_(tongKl / tongBao) : '',

      nguoi_nhap: dsNguoi.join(', '),
      ghi_chu: String(l.ghi_chu || ''),
      cap_nhat_luc: bayGio_(),

      kl_vao: tl.co_kl_vao ? tl.kl_vao : '',
      ti_le_L1: tl.ti_le['1'] === null ? '' : tl.ti_le['1'],
      ti_le_L2: tl.ti_le['2'] === null ? '' : tl.ti_le['2'],
      ti_le_L3: tl.ti_le['3'] === null ? '' : tl.ti_le['3'],
      ti_le_hao_hut: tl.ti_le_hao_hut === null ? '' : tl.ti_le_hao_hut
    });
  });

  // Lô mới nhất lên đầu
  out.sort(function (a, b) { return String(b.ngay_mo).localeCompare(String(a.ngay_mo)); });
  return out;
}

/** Ghi bảng tổng hợp ra sheet TONG_HOP_LO. */
function capNhatTongHopLoNgam_() {
  try {
    var ds = tinhTongHopLo_();
    var sh = sheet_(SHEETS.TONG_HOP_LO);
    var cols = COLS.TONG_HOP_LO;

    if (sh.getLastRow() > 1) {
      sh.getRange(2, 1, sh.getLastRow() - 1, cols.length).clearContent();
    }
    if (!ds.length) return 0;

    var rows = ds.map(function (o) {
      return cols.map(function (c) {
        return (o[c] === undefined || o[c] === null) ? '' : o[c];
      });
    });
    sh.getRange(2, 1, rows.length, cols.length).setValues(rows);
    return rows.length;
  } catch (e) {
    console.error('Cập nhật tổng hợp lỗi: ' + e.message);
    return -1;
  }
}

/** Gọi từ menu trên Google Sheets. */
function capNhatTongHopLo() {
  var n = capNhatTongHopLoNgam_();
  var ui = SpreadsheetApp.getUi();
  if (n < 0) ui.alert('Có lỗi khi cập nhật. Xem Executions log trong Apps Script.');
  else ui.alert('Đã cập nhật bảng TỔNG HỢP THEO LÔ: ' + n + ' lô.');
}

/**
 * Hàm cho trigger gọi (tên KHÔNG có dấu _ ở cuối, vì hàm kết thúc bằng "_"
 * là hàm riêng tư, trigger không gọi được).
 */
function capNhatTongHopTuDong() {
  capNhatTongHopLoNgam_();
}

/**
 * Trigger tuỳ chọn: chạy định kỳ để bảng tổng hợp luôn mới.
 * Cài bằng cách chạy hàm caiTriggerTongHop() 1 lần. Nhịp đặt ở CAU_HINH/TONG_HOP_PHUT.
 */
function caiTriggerTongHop() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'capNhatTongHopTuDong') ScriptApp.deleteTrigger(t);
  });

  // Bản 1.5: rút từ 1 giờ xuống 15 phút. Ở nhịp 1000 bao/ngày, để bộ phận thống kê
  // nhìn số liệu cũ tới 1 tiếng là quá lâu. Google chỉ nhận 1, 5, 10, 15 hoặc 30 phút.
  var phut = Number(cfg('TONG_HOP_PHUT'));
  if ([1, 5, 10, 15, 30].indexOf(phut) < 0) phut = 15;
  ScriptApp.newTrigger('capNhatTongHopTuDong').timeBased().everyMinutes(phut).create();

  var tb = 'Đã cài lịch tự cập nhật bảng tổng hợp mỗi ' + phut + ' phút.';
  console.log(tb);
  // Hàm này được chạy từ TRÌNH SOẠN THẢO Apps Script (Bước 9 của hướng dẫn triển
  // khai), nơi thường không có giao diện -> getUi() ném lỗi. Lịch đã cài xong rồi,
  // đừng để cái alert làm người cài tưởng là thất bại rồi chạy lại nhiều lần.
  try {
    SpreadsheetApp.getUi().alert(tb);
  } catch (e) {
    /* Chạy từ editor: xem kết quả ở Execution log. */
  }
}
