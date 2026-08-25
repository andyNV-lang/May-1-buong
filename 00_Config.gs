/**
 * ============================================================
 *  MÁY 1 BUỒNG — HỆ THỐNG GHI CHÉP SẢN XUẤT
 *  File: 00_Config.gs  — Hằng số & cấu hình dùng chung
 *  Nam Vu Down & Feathers JSC
 * ============================================================
 *
 *  QUY TẮC NGHIỆP VỤ ĐÃ CHỐT (19/08/2026):
 *   - Mã lô ví dụ: T0748LA. Ký tự đầu quyết định ký hiệu:
 *        T -> A       D -> B      (ký tự khác -> KHÔNG HỢP LỆ)
 *   - Công nhân chỉ chọn Loại 1 / 2 / 3. Ký hiệu A/B máy tự suy ra.
 *   - Số thứ tự bao do công nhân tự đánh, chỉ chứa số, KHÔNG reset.
 *     Máy gợi ý = số lớn nhất đã có của cùng (Ký hiệu + Loại) + 1.
 *   - Khối lượng 1 bao: 1–100 kg.
 *   - 1 mã lô = 1 phiếu. 1 lô có thể chạy qua tối đa 3 ca.
 *   - Đầu vào ghi CẢ tổng số bao VÀ tổng khối lượng (kg), công nhân tự nhập.
 *     Khối lượng đầu vào là MẪU SỐ để tính tỉ lệ thu hồi — xem apiXemTruocKetQua.
 *   - Đăng nhập bằng mã PIN.
 *   - Sửa được cho tới khi bấm CHỐT CA, sau đó khoá vĩnh viễn.
 *   - 1 công nhân CÓ THỂ nhập nhiều lô SONG SONG (Andy xác nhận 20/08/2026),
 *     nên CHỐT CA chỉ khoá đúng lô đang mở — xem apiChotCa trong 04_Api.gs.
 *   - Không có bước ca trưởng duyệt.
 *   - Bộ phận thống kê xem dữ liệu tổng hợp THEO LÔ.
 * ============================================================
 */

/** Tên các sheet. Đổi ở đây thì đổi toàn hệ thống. */
var SHEETS = {
  NGUOI_DUNG:   'NGUOI_DUNG',
  LO:           'LO',
  BAO:          'BAO',
  LOG:          'LOG',
  CAU_HINH:     'CAU_HINH',
  TONG_HOP_LO:  'TONG_HOP_LO',
  CHI_SO:       'CHI_SO'
};

/** Thứ tự cột — PHẢI khớp đúng với hàng tiêu đề do Setup tạo ra. */
var COLS = {
  NGUOI_DUNG: ['ma_nv', 'ten', 'pin', 'vai_tro', 'dang_dung'],

  // ⚠️ Cột mới PHẢI thêm vào CUỐI mảng. Sheet khớp dữ liệu theo VỊ TRÍ cột,
  // chèn vào giữa sẽ làm lệch toàn bộ dòng đã có trên bảng tính đang chạy.
  LO: ['ma_lo', 'ky_hieu', 'so_bao_vao', 'trang_thai', 'ghi_chu',
       'nguoi_mo', 'tg_mo', 'nguoi_dong', 'tg_dong',
       'kl_vao',
       // Thêm ở bản 1.5. Hai cột đếm sẵn số bao / khối lượng ĐÃ RA của lô.
       // Trước 1.5, màn hình danh sách lô đọc TOÀN BỘ sheet BAO chỉ để đếm mấy con số
       // này — với 250.000 dòng thì đó là 3,25 triệu ô cho một màn hình mở liên tục.
       // Nay cộng dồn ngay lúc lưu bao (1 dòng ghi), màn hình chỉ đọc sheet LO.
       // Số liệu GỐC vẫn là sheet BAO; hai cột này chỉ là bản đếm sẵn, sai thì
       // dựng lại được bằng menu ⚙️ → "Dựng lại bảng đếm & chỉ số".
       'so_bao_ra', 'kl_ra',
       // Thêm ở bản 1.6. Mã nhân viên của MỌI người đã nhập bao vào lô này,
       // phân cách bằng dấu phẩy — ví dụ "CN01,CN03".
       //
       // Vì sao phải có: màn hình "Lô đã đóng" chỉ cho công nhân xem lại lô CHÍNH HỌ
       // có nhập bao (Andy chốt 22/08/2026). Lọc điều đó từ sheet BAO nghĩa là đọc
       // 2,25 triệu ô cho một màn hình — đúng thứ bản 1.5 bỏ công gỡ bỏ. Cột nguoi_mo
       // không thay được: ca sau nhập vào lô ca trước tạo là chuyện thường ở xưởng.
       //
       // Cũng là bản ghi sẵn như so_bao_ra/kl_ra: sai thì dựng lại bằng menu ⚙️.
       'ds_nguoi_nhap'],

  /*
   * 13 cột đầu (A–M) là DỮ LIỆU GỐC. Từ cột N trở đi là phần thêm ở bản 1.6.
   *
   * Cột N, O cố ý để TRỐNG — Andy muốn có khoảng cách nhìn cho dễ (22/08/2026).
   * Cột P–U là 6 cột "xem nhanh": bôi đen dán thẳng sang Excel, không phải xử lý gì.
   * Chúng là BẢN SAO ĐÃ DỌN của dữ liệu gốc, KHÔNG phải nguồn số liệu — sai thì dựng
   * lại bằng menu ⚙️ → "Điền 6 cột xem nhanh". Xem coXemNhanh_ trong 01_Util.gs.
   *
   * Vì sao ghi bằng mã chứ không dùng ARRAYFORMULA: công thức mở đầu cột làm
   * getLastRow() trả về đáy lưới, và themNhieuDong_ ghi bao mới vào getLastRow()+1 —
   * bao mới sẽ rơi xuống cách hàng nghìn dòng trắng. Xoá dòng 2 cũng mất ô neo công thức.
   */
  BAO: ['id', 'ma_lo', 'ky_hieu', 'loai', 'stt_bao', 'khoi_luong',
        'phien', 'trang_thai', 'nguoi_nhap', 'tg_nhap',
        'nguoi_sua', 'tg_sua', 'client_id',
        'x_trong_1', 'x_trong_2',
        'v_ma_lo', 'v_loai', 'v_khoi_luong', 'v_stt', 'v_thoi_gian', 'v_tinh_trang'],

  LOG: ['tg', 'ma_nv', 'ten', 'hanh_dong', 'bang', 'khoa',
        'gia_tri_cu', 'gia_tri_moi', 'ghi_chu'],

  CAU_HINH: ['khoa', 'gia_tri', 'mo_ta'],

  /*
   * CHI_SO — bảng chỉ số số bao theo nhóm (A1, A2, A3, B1, B2, B3). Đúng 6 dòng.
   *
   * Vì sao cần: mỗi lần lưu bao, máy chủ phải biết "số bao này đã ai dùng chưa".
   * Trước bản 1.5 nó trả lời bằng cách đọc TOÀN BỘ sheet BAO. Với nhịp 1000 bao/ngày
   * Andy xác nhận (21/08/2026), sheet BAO đạt 250.000 dòng sau 1 năm — tức 3,25 triệu
   * ô phải đọc cho MỘT thao tác mà công nhân đang đứng chờ. Không dùng được.
   *
   * BẤT BIẾN: stt_max LUÔN ≥ mọi số bao đang có thật của nhóm.
   *   - Chỉ được phép TĂNG, không bao giờ giảm.
   *   - Xoá bao thì KHÔNG hạ stt_max xuống. Để cao hơn thực tế là an toàn: cùng lắm
   *     máy đi đường quét chậm thêm vài lần, chứ không bao giờ cho lọt số bao trùng.
   * Nhờ bất biến này: số bao mới > stt_max thì CHẮC CHẮN chưa ai dùng — khỏi đọc gì cả.
   */
  CHI_SO: ['nhom', 'stt_max', 'so_bao', 'cap_nhat_luc'],

  TONG_HOP_LO: [
    'ma_lo', 'ky_hieu', 'trang_thai', 'ngay_mo', 'ngay_dong',
    'so_bao_vao',
    'so_bao_L1', 'kl_L1',
    'so_bao_L2', 'kl_L2',
    'so_bao_L3', 'kl_L3',
    'tong_so_bao_ra', 'tong_kl_ra', 'kl_trung_binh_bao',
    'nguoi_nhap', 'ghi_chu', 'cap_nhat_luc',
    // Thêm ở bản 1.3. Sheet này bị ghi đè TOÀN BỘ mỗi lần cập nhật nên thêm cột an toàn.
    'kl_vao', 'ti_le_L1', 'ti_le_L2', 'ti_le_L3', 'ti_le_hao_hut'
  ]
};

/*
 * NHÃN TIÊU ĐỀ hiện trên hàng 1 của sheet, khi khác với tên cột dùng trong mã.
 *
 * Tên trong COLS vừa là khoá đối tượng trong mã, vừa là chữ ghi ở hàng 1. Sáu cột
 * xem nhanh cần tiêu đề tiếng Việt có dấu và dấu cách — không dùng làm khoá được.
 * Bảng này tách hai việc đó ra. Cột nào không có ở đây thì tiêu đề = tên cột.
 */
var NHAN_COT = {
  BAO: {
    x_trong_1: '',
    x_trong_2: '',
    v_ma_lo: 'mã lô',
    v_loai: 'Loại',
    v_khoi_luong: 'khối lượng',
    v_stt: 'Số thứ tự',
    v_thoi_gian: 'Thời gian',
    v_tinh_trang: 'Tình trạng lô'
  }
};

/**
 * Tiêu đề hiện trên hàng 1 cho một cột.
 * @param {string} tenSheet
 * @param {string} tenCot
 * @return {string}
 */
function nhanCot_(tenSheet, tenCot) {
  var m = NHAN_COT[tenSheet];
  if (m && m.hasOwnProperty(tenCot)) return m[tenCot];
  return tenCot;
}

/**
 * Chữ ghi ở cột "Loại" của 6 cột xem nhanh. Andy chốt 22/08/2026: ghi NGUYÊN VĂN
 * "A1/B1", chỉ đọc cột loai (1/2/3), KHÔNG đổi theo ký hiệu A/B của lô — ký hiệu thật
 * đã nằm trong cột "Số thứ tự" (VD A1-1234) nên không mất thông tin.
 */
var NHAN_LOAI_XEM = { '1': 'A1/B1', '2': 'A2/B2', '3': 'A3/B3' };

/** Định dạng hiện của cột "Thời gian" — đổi ở đây là đổi toàn hệ thống. */
var DINH_DANG_NGAY_GIO = 'dd/MM/yyyy HH:mm';

/*
 * Ba bộ cột hay dùng cho docBang_(SHEETS.BAO, …).
 *
 * Từ bản 1.6 sheet BAO dài 21 cột thay vì 13. Đọc cả bảng nghĩa là kéo về thêm 60%
 * số ô CHỈ để lấy bản sao của những cột đã có — trên chính mấy đường vốn đã phải quét
 * cả sheet. Ba hằng số này để không ai phải nhớ danh sách cột mỗi lần gọi.
 *
 * docBang_ đọc từ cột 1 tới cột XA NHẤT trong danh sách, nên tên đặt theo cột cuối.
 */
var COT_GOC_BAO = ['id', 'ma_lo', 'ky_hieu', 'loai', 'stt_bao', 'khoi_luong',
                   'phien', 'trang_thai', 'nguoi_nhap', 'tg_nhap',
                   'nguoi_sua', 'tg_sua', 'client_id'];
var COT_TOI_TG_NHAP = ['id', 'ma_lo', 'ky_hieu', 'loai', 'stt_bao', 'khoi_luong',
                       'phien', 'trang_thai', 'nguoi_nhap', 'tg_nhap'];
var COT_TOI_NGUOI_NHAP = ['id', 'ma_lo', 'ky_hieu', 'loai', 'stt_bao', 'khoi_luong',
                          'phien', 'trang_thai', 'nguoi_nhap'];
var COT_TOI_STT = ['id', 'ma_lo', 'ky_hieu', 'loai', 'stt_bao'];

/** Trạng thái lô */
var LO_TRANG_THAI = { DANG_CHAY: 'DANG_CHAY', DA_DONG: 'DA_DONG' };

/** Trạng thái dòng bao */
var BAO_TRANG_THAI = { DANG_NHAP: 'DANG_NHAP', DA_CHOT: 'DA_CHOT' };

/** Vai trò người dùng */
var VAI_TRO = { CONG_NHAN: 'CONG_NHAN', THONG_KE: 'THONG_KE', QUAN_LY: 'QUAN_LY' };

/** Giá trị cấu hình mặc định — sửa được trong sheet CAU_HINH, không cần sửa code. */
var CAU_HINH_MAC_DINH = [
  ['KL_MIN',            1,     'Khối lượng tối thiểu 1 bao (kg)'],
  ['KL_MAX',            200,   'Khối lượng tối đa 1 bao (kg)'],
  ['KL_VAO_MAX',        100000, 'Khối lượng đầu vào tối đa 1 lô (kg) — chặn gõ thừa số 0'],
  ['SO_LE',             1,     'Số chữ số thập phân của khối lượng'],
  ['PIN_DO_DAI',        4,     'Số ký tự của mã PIN'],
  ['PIN_SAI_TOI_DA',    5,     'Số lần nhập sai PIN trước khi bị khoá tạm'],
  ['PIN_KHOA_PHUT',     5,     'Số phút bị khoá sau khi nhập sai quá số lần'],
  ['PHIEN_GIO',         14,    'Số giờ phiên đăng nhập còn hiệu lực'],
  ['TU_KHOA_SAU_GIO',   12,    'Tự khoá bao sau bao nhiêu giờ dù chưa bấm CHỐT CA (0 = tắt)'],
  ['CANH_BAO_NHAY_SO',  20,    'Cảnh báo nếu số bao mới cách số bao trước quá ngưỡng này'],
  ['HAO_HUT_MIN',       20,    'Cảnh báo nếu tỉ lệ hao hụt THẤP hơn mức này (%)'],
  ['HAO_HUT_MAX',       30,    'Cảnh báo nếu tỉ lệ hao hụt CAO hơn mức này (%)'],
  ['SO_BAO_MOI_LAN',    20,    'Số bao tối đa nhập được trong cùng một lần lưu'],
  ['TIEN_TO_A',         'T',   'Ký tự đầu mã lô ứng với ký hiệu A'],
  ['TIEN_TO_B',         'D',   'Ký tự đầu mã lô ứng với ký hiệu B'],
  ['MA_LO_HAU_TO',      'LA',  'Hai chữ cuối mã lô, tự điền khi người nhập bỏ trống'],
  ['TONG_HOP_PHUT',     15,    'Bao lâu tự cập nhật bảng tổng hợp 1 lần (phút: 1/5/10/15/30)'],
  ['TEN_MAY',           'MÁY 1 BUỒNG', 'Tên hiển thị trên đầu màn hình']
];

/*
 * ⚠️ MUI_GIO PHẢI trùng với "timeZone" trong appsscript.json.
 * Lệch nhau là toàn bộ logic tự khoá theo giờ (quaHanSua_) sai lệch đúng bằng
 * khoảng chênh múi giờ, mà KHÔNG có thông báo nào. Hàm tuKiemTra canh chỗ này.
 */
var MUI_GIO = 'Asia/Ho_Chi_Minh';

/** Bộ nhớ đệm cấu hình trong 1 lần chạy để không đọc sheet nhiều lần. */
var _cacheCauHinh = null;

/**
 * Đọc 1 giá trị cấu hình. Nếu sheet CAU_HINH thiếu khoá thì trả về mặc định.
 * @param {string} khoa
 * @return {*}
 */
function cfg(khoa) {
  if (_cacheCauHinh === null) {
    _cacheCauHinh = {};
    // Nạp mặc định trước
    CAU_HINH_MAC_DINH.forEach(function (r) { _cacheCauHinh[r[0]] = r[1]; });
    // Ghi đè bằng giá trị trong sheet nếu có
    try {
      var sh = SpreadsheetApp.getActive().getSheetByName(SHEETS.CAU_HINH);
      if (sh && sh.getLastRow() > 1) {
        var vals = sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues();
        vals.forEach(function (r) {
          if (r[0] !== '' && r[0] !== null) _cacheCauHinh[String(r[0]).trim()] = r[1];
        });
      }
    } catch (e) {
      // Bỏ qua: dùng mặc định
    }
  }
  return _cacheCauHinh[khoa];
}

/** Xoá cache cấu hình (dùng sau khi sửa sheet CAU_HINH). */
function xoaCacheCauHinh() { _cacheCauHinh = null; }
