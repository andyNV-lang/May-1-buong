/**
 * ============================================================
 *  File: 04_Api.gs — Toàn bộ nghiệp vụ gọi từ điện thoại
 * ============================================================
 *  Mọi hàm bắt đầu bằng "api" đều nhận tham số đầu tiên là "ve"
 *  (vé đăng nhập). Mọi hàm GHI đều chạy trong trongKhoa_().
 * ============================================================
 */

/* ============================================================
 *  1. MÀN HÌNH ĐẦU — cấu hình + danh sách lô đang chạy
 * ============================================================ */

function apiTrangChu(ve) {
  try {
    var nd = xacThuc_(ve);
    return ok_({
      nguoi_dung: { ma_nv: nd.ma_nv, ten: nd.ten, vai_tro: nd.vai_tro },
      cau_hinh: {
        KL_MIN: Number(cfg('KL_MIN')),
        KL_MAX: Number(cfg('KL_MAX')),
        SO_LE: Number(cfg('SO_LE')),
        CANH_BAO_NHAY_SO: Number(cfg('CANH_BAO_NHAY_SO')),
        HAO_HUT_MIN: Number(cfg('HAO_HUT_MIN')),
        HAO_HUT_MAX: Number(cfg('HAO_HUT_MAX')),
        SO_BAO_MOI_LAN: Number(cfg('SO_BAO_MOI_LAN')),
        TIEN_TO_A: String(cfg('TIEN_TO_A')),
        TIEN_TO_B: String(cfg('TIEN_TO_B')),
        TEN_MAY: String(cfg('TEN_MAY'))
      },
      ds_lo: layDanhSachLoDangChay_()
    });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/** Danh sách lô đang chạy, kèm số bao đã ra để công nhân nhận biết. */
/**
 * Danh sách lô đang chạy.
 *
 * Từ bản 1.5 hàm này KHÔNG đọc sheet BAO nữa. Số bao / khối lượng đã ra lấy từ hai
 * cột đếm sẵn trên chính sheet LO, cộng dồn ngay lúc lưu bao. Sheet LO chỉ vài trăm
 * dòng mỗi năm, trong khi sheet BAO là 250.000 dòng — mà đây lại là màn hình công
 * nhân mở nhiều nhất trong ca.
 */
function layDanhSachLoDangChay_() {
  var dsLo = docBang_(SHEETS.LO);

  var out = [];
  dsLo.forEach(function (l) {
    if (String(l.trang_thai).trim().toUpperCase() !== LO_TRANG_THAI.DANG_CHAY) return;
    if (!l.ma_lo) return;
    var k = chuanHoaMaLo_(l.ma_lo);
    out.push({
      ma_lo: String(l.ma_lo).trim(),
      ky_hieu: String(l.ky_hieu || kyHieuTuMaLo_(l.ma_lo)).trim(),
      so_bao_vao: l.so_bao_vao === '' ? null : Number(l.so_bao_vao),
      kl_vao: (l.kl_vao === '' || l.kl_vao === null || l.kl_vao === undefined)
                ? null : Number(l.kl_vao),
      ghi_chu: String(l.ghi_chu || ''),
      so_bao_ra: Number(l.so_bao_ra) || 0,
      tong_kl_ra: lamTronKl_(Number(l.kl_ra) || 0),
      tg_mo: tgChuoi_(l.tg_mo)
    });
  });

  // Lô mở gần nhất lên đầu
  out.sort(function (a, b) { return String(b.tg_mo).localeCompare(String(a.tg_mo)); });
  return out;
}

/**
 * Một mã nhân viên có nằm trong chuỗi "CN01,CN03" không.
 * @return {boolean}
 */
function coTrongDsNguoi_(chuoi, maNv) {
  var m = String(maNv || '').trim().toUpperCase();
  if (!m) return false;
  var ds = String(chuoi === null || chuoi === undefined ? '' : chuoi).split(',');
  for (var i = 0; i < ds.length; i++) {
    if (String(ds[i]).trim().toUpperCase() === m) return true;
  }
  return false;
}

/**
 * DANH SÁCH LÔ ĐÃ ĐÓNG — để xem lại, KHÔNG sửa (bản 1.6, yêu cầu 2 của Andy).
 *
 * Ai thấy gì (Andy chốt 22/08/2026):
 *   - CÔNG NHÂN: chỉ những lô CHÍNH HỌ có nhập bao. Lọc bằng cột ds_nguoi_nhap trên
 *     sheet LO — vài trăm dòng. Lọc từ sheet BAO thì phải đọc 2,25 triệu ô cho một
 *     màn hình, đúng thứ bản 1.5 đã bỏ công gỡ.
 *   - THỐNG KÊ / QUẢN LÝ: thấy tất cả.
 *
 * Chỉ trả về TOI_DA lô đóng gần nhất. Danh sách này tăng mãi mãi (khoảng 10 lô/ngày),
 * mà công nhân mở ra chỉ để tìm lại lô hôm qua hôm kia.
 */
var LO_DA_DONG_TOI_DA = 50;

function apiLoDaDong(ve, tuNgay, denNgay) {
  try {
    var nd = xacThuc_(ve);
    var xemHet = (nd.vai_tro === VAI_TRO.QUAN_LY || nd.vai_tro === VAI_TRO.THONG_KE);

    var out = [];
    docBang_(SHEETS.LO).forEach(function (l) {
      if (!l.ma_lo) return;
      if (String(l.trang_thai).trim().toUpperCase() !== LO_TRANG_THAI.DA_DONG) return;
      if (!xemHet && !coTrongDsNguoi_(l.ds_nguoi_nhap, nd.ma_nv)) return;

      var ngayDong = tgChuoi_(l.tg_dong).substring(0, 10);
      if (tuNgay && ngayDong && ngayDong < tuNgay) return;
      if (denNgay && ngayDong && ngayDong > denNgay) return;

      out.push({
        ma_lo: String(l.ma_lo).trim(),
        ky_hieu: String(l.ky_hieu || kyHieuTuMaLo_(l.ma_lo)).trim(),
        trang_thai: LO_TRANG_THAI.DA_DONG,
        so_bao_vao: l.so_bao_vao === '' ? null : Number(l.so_bao_vao),
        kl_vao: (l.kl_vao === '' || l.kl_vao === null || l.kl_vao === undefined)
                  ? null : Number(l.kl_vao),
        so_bao_ra: Number(l.so_bao_ra) || 0,
        tong_kl_ra: lamTronKl_(Number(l.kl_ra) || 0),
        ghi_chu: String(l.ghi_chu || ''),
        tg_mo: tgChuoi_(l.tg_mo),
        tg_dong: tgChuoi_(l.tg_dong),
        nguoi_dong: tenTheoMa_(String(l.nguoi_dong || '').trim())
      });
    });

    // Lô đóng gần nhất lên đầu
    out.sort(function (a, b) { return String(b.tg_dong).localeCompare(String(a.tg_dong)); });

    return ok_({
      ds: out.slice(0, LO_DA_DONG_TOI_DA),
      tong: out.length,
      con_nua: out.length > LO_DA_DONG_TOI_DA,
      xem_het: xemHet
    });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  2. TẠO LÔ MỚI
 * ============================================================ */

function apiTaoLo(ve, maLoRaw, soBaoVao, ghiChu, klVao) {
  try {
    var nd = xacThuc_(ve);
    var maLo = chuanHoaMaLo_(maLoRaw);

    if (!maLo) return loi_('Chưa nhập mã lô.');
    if (!MAU_MA_LO.test(maLo)) {
      return loi_('Mã lô "' + maLo + '" không hợp lệ.\n' +
                  'Chỉ được dùng chữ cái, chữ số và dấu gạch ngang, dài 3–20 ký tự.');
    }

    var kyHieu = kyHieuTuMaLo_(maLo);
    if (!kyHieu) {
      return loi_('Mã lô "' + maLo + '" không hợp lệ.\n' +
                  'Mã lô phải bắt đầu bằng "' + cfg('TIEN_TO_A') + '" (ký hiệu A) ' +
                  'hoặc "' + cfg('TIEN_TO_B') + '" (ký hiệu B).');
    }

    var soBao = '';
    if (soBaoVao !== '' && soBaoVao !== null && soBaoVao !== undefined) {
      var n = soTu_(soBaoVao);
      if (isNaN(n) || n < 0 || n !== Math.floor(n)) {
        return loi_('Số bao đầu vào phải là số nguyên ≥ 0 (hoặc để trống).');
      }
      soBao = n;
    }

    // Khối lượng đầu vào (kg) — công nhân tự nhập, được phép bỏ trống lúc tạo lô
    // rồi bổ sung sau ở màn hình "Xem trước kết quả".
    var doc = docKlVao_(klVao);
    if (doc.loi) return loi_(doc.loi);
    var klVaoSo = doc.gia_tri;

    return trongKhoa_(function () {
      var dsLo = docBang_(SHEETS.LO);
      for (var i = 0; i < dsLo.length; i++) {
        if (chuanHoaMaLo_(dsLo[i].ma_lo) === maLo) {
          if (String(dsLo[i].trang_thai).trim().toUpperCase() === LO_TRANG_THAI.DA_DONG) {
            return loi_('Mã lô ' + maLo + ' đã ĐÓNG trước đó. Báo bộ phận thống kê nếu cần mở lại.');
          }
          return loi_('Mã lô ' + maLo + ' đã tồn tại và đang chạy. Hãy chọn lô đó ở danh sách.');
        }
      }

      themDong_(SHEETS.LO, {
        ma_lo: maLo,
        ky_hieu: kyHieu,
        so_bao_vao: soBao,
        kl_vao: klVaoSo,
        trang_thai: LO_TRANG_THAI.DANG_CHAY,
        ghi_chu: String(ghiChu || '').trim(),
        nguoi_mo: nd.ma_nv,
        tg_mo: bayGio_(),
        nguoi_dong: '',
        tg_dong: '',
        so_bao_ra: 0,
        kl_ra: 0
      });

      ghiLog_(nd, 'TAO_LO', SHEETS.LO, maLo, '',
              'ky_hieu=' + kyHieu + '; so_bao_vao=' + soBao + '; kl_vao=' + klVaoSo,
              String(ghiChu || ''));

      return ok_({ ma_lo: maLo, ky_hieu: kyHieu, kl_vao: klVaoSo === '' ? null : klVaoSo });
    });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  3. MỞ 1 LÔ — lấy chi tiết + gợi ý số bao tiếp theo
 * ============================================================ */

function apiMoLo(ve, maLoRaw, phien) {
  try {
    var nd = xacThuc_(ve);
    var maLo = chuanHoaMaLo_(maLoRaw);

    var lo = timLo_(maLo);
    if (!lo) return loi_('Không tìm thấy mã lô ' + maLo);

    // Bản 1.6: quản lý sửa được cả lô đã đóng và bao đã chốt (Andy chốt 22/08/2026).
    // Giao diện dùng cờ này để hiện nút; máy chủ VẪN soát lại ở từng hàm api.
    var laQuanLy = (nd.vai_tro === VAI_TRO.QUAN_LY);

    // Chỉ đọc tới cột tg_nhap — 3 cột cuối (nguoi_sua, tg_sua, client_id) màn hình
    // này không dùng tới. Xem docBang_ trong 01_Util.gs.
    var dsBao = docBang_(SHEETS.BAO,
      ['id', 'ma_lo', 'ky_hieu', 'loai', 'stt_bao', 'khoi_luong',
       'phien', 'trang_thai', 'nguoi_nhap', 'tg_nhap']);
    var baoCuaLo = [];
    var goiY = { '1': null, '2': null, '3': null };

    // Gợi ý số bao lấy thẳng từ bảng CHI_SO (6 dòng), thay vì quét cả sheet BAO
    // để tìm số lớn nhất từng nhóm.
    var chiSo = docChiSo_();
    var maxTheoNhom = {};
    Object.keys(chiSo).forEach(function (n) {
      if (chiSo[n].stt_max !== null) maxTheoNhom[n] = chiSo[n].stt_max;
    });

    dsBao.forEach(function (b) {
      var kh = String(b.ky_hieu).trim().toUpperCase();
      var loai = String(b.loai).trim();
      var stt = Number(b.stt_bao);

      if (chuanHoaMaLo_(b.ma_lo) !== maLo) return;
      var tgN = tgChuoi_(b.tg_nhap);
      baoCuaLo.push({
        id: String(b.id),
        loai: loai,
        ky_hieu: kh,
        stt_bao: stt,
        khoi_luong: Number(b.khoi_luong),
        trang_thai: String(b.trang_thai).trim().toUpperCase(),
        nguoi_nhap: String(b.nguoi_nhap).trim(),
        ten_nguoi_nhap: tenTheoMa_(String(b.nguoi_nhap).trim()),
        tg_nhap: tgN,
        phien: String(b.phien),
        // Chỉ sửa được khi: chưa chốt + đúng người nhập + lô đang chạy + chưa quá hạn tự khoá.
        // Quản lý vượt được cả bốn điều đó, nhưng phải ghi lý do — xem kiemTraQuyenSua_.
        sua_duoc: (laQuanLy ||
                  (String(b.trang_thai).trim().toUpperCase() === BAO_TRANG_THAI.DANG_NHAP &&
                   String(b.nguoi_nhap).trim().toUpperCase() === nd.ma_nv.toUpperCase() &&
                   lo.trang_thai === LO_TRANG_THAI.DANG_CHAY &&
                   !quaHanSua_(tgN)))
      });
    });

    ['1', '2', '3'].forEach(function (l) {
      var nhom = lo.ky_hieu + l;
      goiY[l] = (maxTheoNhom[nhom] === undefined) ? null : maxTheoNhom[nhom] + 1;
    });

    // Mới nhất lên đầu
    baoCuaLo.sort(function (a, b) { return String(b.tg_nhap).localeCompare(String(a.tg_nhap)); });

    var chuaChotCuaToi = 0;
    baoCuaLo.forEach(function (b) {
      if (b.phien === String(phien || '') && b.trang_thai === BAO_TRANG_THAI.DANG_NHAP) {
        chuaChotCuaToi++;
      }
    });

    return ok_({
      lo: lo,
      ds_bao: baoCuaLo,
      goi_y_stt: goiY,
      so_bao_chua_chot_cua_toi: chuaChotCuaToi,
      /*
       * Bảng tỉ lệ đi kèm luôn (bản 1.6). Tính từ baoCuaLo vừa duyệt ở trên nên
       * KHÔNG tốn thêm ô đọc nào. Nhờ vậy màn hình nhập liệu hiện được tỉ lệ ngay,
       * và màn hình "Xem trước kết quả chạy máy" bị bỏ hẳn.
       */
      ket_qua: ketQuaTuBao_(lo, baoCuaLo),
      // Giao diện dùng để ẩn/hiện nút. Máy chủ VẪN kiểm tra lại khi thực sự gọi —
      // ẩn nút không bao giờ được coi là phân quyền.
      duoc_sua_lo: (kiemTraQuyenLo_(lo, nd) === null &&
                    (laQuanLy || lo.trang_thai === LO_TRANG_THAI.DANG_CHAY)),
      la_quan_ly: laQuanLy
    });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

function timLo_(maLo) {
  var ds = docBang_(SHEETS.LO);
  for (var i = 0; i < ds.length; i++) {
    if (chuanHoaMaLo_(ds[i].ma_lo) === chuanHoaMaLo_(maLo)) {
      return {
        _row: ds[i]._row,
        ma_lo: String(ds[i].ma_lo).trim(),
        ky_hieu: String(ds[i].ky_hieu || kyHieuTuMaLo_(ds[i].ma_lo)).trim().toUpperCase(),
        so_bao_vao: ds[i].so_bao_vao === '' ? null : Number(ds[i].so_bao_vao),
        kl_vao: (ds[i].kl_vao === '' || ds[i].kl_vao === null || ds[i].kl_vao === undefined)
                  ? null : Number(ds[i].kl_vao),
        trang_thai: String(ds[i].trang_thai).trim().toUpperCase(),
        ghi_chu: String(ds[i].ghi_chu || ''),
        nguoi_mo: String(ds[i].nguoi_mo || ''),
        tg_mo: tgChuoi_(ds[i].tg_mo),
        // Thêm ở bản 1.6 cho màn hình CHI TIẾT LÔ — lô đã đóng thì ai đóng, đóng lúc nào.
        nguoi_dong: String(ds[i].nguoi_dong || ''),
        tg_dong: tgChuoi_(ds[i].tg_dong)
      };
    }
  }
  return null;
}

var _cacheTen = null;
function tenTheoMa_(maNv) {
  if (_cacheTen === null) {
    _cacheTen = {};
    docBang_(SHEETS.NGUOI_DUNG).forEach(function (u) {
      _cacheTen[String(u.ma_nv).trim().toUpperCase()] = String(u.ten).trim();
    });
  }
  return _cacheTen[String(maNv).trim().toUpperCase()] || maNv;
}

/* ============================================================
 *  4. LƯU 1 BAO  (thao tác quan trọng nhất)
 * ============================================================ */

function apiLuuBao(ve, duLieu) {
  try {
    var nd = xacThuc_(ve);
    duLieu = duLieu || {};

    var maLo = chuanHoaMaLo_(duLieu.ma_lo);
    var loai = String(duLieu.loai || '').trim();
    var sttBao = duLieu.stt_bao;
    var kl = duLieu.khoi_luong;
    var phien = String(duLieu.phien || '').trim();
    var clientId = String(duLieu.client_id || '').trim();

    /* --- Kiểm tra đầu vào --- */
    if (['1', '2', '3'].indexOf(loai) < 0) return loi_('Chưa chọn Loại 1 / 2 / 3.');

    var sttNum = soTu_(sttBao);
    if (isNaN(sttNum) || sttNum <= 0 || sttNum !== Math.floor(sttNum)) {
      return loi_('Số thứ tự bao phải là số nguyên dương.');
    }

    var klNum = soTu_(kl);
    var klMin = Number(cfg('KL_MIN')), klMax = Number(cfg('KL_MAX'));
    if (isNaN(klNum)) return loi_('Chưa nhập khối lượng (hoặc gõ sai định dạng số).');
    if (klNum < klMin || klNum > klMax) {
      return loi_('Khối lượng ' + klNum + ' kg nằm ngoài khoảng cho phép ' +
                  klMin + '–' + klMax + ' kg. Kiểm tra lại dấu thập phân.');
    }
    klNum = lamTronKl_(klNum);

    return trongKhoa_(function () {
      var lo = timLo_(maLo);
      if (!lo) return loi_('Không tìm thấy mã lô ' + maLo);
      if (lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY) {
        return loi_('Lô ' + maLo + ' đã ĐÓNG, không thể thêm bao.', 'LO_DA_DONG');
      }
      if (!lo.ky_hieu) return loi_('Lô ' + maLo + ' chưa xác định được ký hiệu A/B.');

      var nhom = lo.ky_hieu + loai;
      var maxNhom = chiSoNhom_(nhom).stt_max;

      /* ------------------------------------------------------------------
       * ĐƯỜNG NHANH — số bao mới lớn hơn MỌI số đã dùng của nhóm.
       *
       * Theo bất biến của bảng CHI_SO (stt_max luôn ≥ mọi số bao đang có),
       * trường hợp này KHÔNG CẦN ĐỌC SHEET BAO LẤY MỘT DÒNG NÀO:
       *   - không thể trùng số bao, vì mọi số đang có đều ≤ stt_max < sttNum;
       *   - cũng không thể là bản gửi lại của một bao đã ghi, vì bao đã ghi thì
       *     số bao của nó ≤ stt_max, tức lời gọi này đã rơi vào đường quét.
       *
       * Đây là đường đi của gần như toàn bộ thao tác thật, do máy điền sẵn số bao
       * tăng dần. Với nhịp 1000 bao/ngày, đây là khác biệt giữa "bấm là xong" và
       * "đọc 3,25 triệu ô rồi hết giờ chạy".
       * ------------------------------------------------------------------ */
      var duongNhanh = (maxNhom === null || sttNum > maxNhom);

      if (!duongNhanh) {
        // Đường quét — chỉ đi khi công nhân tự gõ một số nhỏ hơn số lớn nhất đã có,
        // tức đúng tình huống gõ nhầm mà việc chống trùng sinh ra để bắt.
        var dsBao = docBang_(SHEETS.BAO, COT_GOC_BAO);

        /* --- Chống gửi trùng khi mạng chập chờn (hàng đợi offline gửi lại) --- */
        if (clientId) {
          for (var i = 0; i < dsBao.length; i++) {
            if (String(dsBao[i].client_id).trim() === clientId) {
              return ok_({
                trung_lap_bo_qua: true,
                id: String(dsBao[i].id),
                stt_bao: Number(dsBao[i].stt_bao),
                khoi_luong: Number(dsBao[i].khoi_luong),
                goi_y_stt_tiep: Number(dsBao[i].stt_bao) + 1
              });
            }
          }
        }

        /* --- Chống trùng số bao trong cùng (ký hiệu + loại) --- */
        for (var j = 0; j < dsBao.length; j++) {
          var b = dsBao[j];
          if (String(b.ky_hieu).trim().toUpperCase() !== lo.ky_hieu) continue;
          if (String(b.loai).trim() !== loai) continue;
          if (Number(b.stt_bao) === sttNum) {
            return loi_('Số bao ' + sttNum + ' của nhóm ' + lo.ky_hieu + loai +
                        ' ĐÃ NHẬP RỒI (lô ' + b.ma_lo + ', ' + b.tg_nhap + '). Kiểm tra lại.',
                        'TRUNG_SO_BAO');
          }
        }
      }

      /* --- Cảnh báo nhảy số bất thường (không chặn, chỉ báo) --- */
      var canhBao = '';
      var nguong = Number(cfg('CANH_BAO_NHAY_SO')) || 20;
      if (maxNhom !== null && sttNum > maxNhom + nguong) {
        canhBao = 'Số bao nhảy từ ' + maxNhom + ' lên ' + sttNum +
                  ' (cách ' + (sttNum - maxNhom) + '). Đã lưu — kiểm tra lại nếu gõ nhầm.';
      }

      var id = taoId_();
      var tgNhap = bayGio_();
      themDong_(SHEETS.BAO, themXemNhanh_({
        id: id,
        ma_lo: lo.ma_lo,
        ky_hieu: lo.ky_hieu,
        loai: loai,
        stt_bao: sttNum,
        khoi_luong: klNum,
        phien: phien,
        trang_thai: BAO_TRANG_THAI.DANG_NHAP,
        nguoi_nhap: nd.ma_nv,
        tg_nhap: tgNhap,
        nguoi_sua: '',
        tg_sua: '',
        client_id: clientId
      }));
      nangChiSo_(nhom, sttNum, 1);
      congDonLo_(lo._row, 1, klNum, nd.ma_nv);

      ghiLog_(nd, 'THEM_BAO', SHEETS.BAO, id, '',
              lo.ma_lo + ' | ' + lo.ky_hieu + loai + ' | STT ' + sttNum + ' | ' + klNum + ' kg',
              canhBao);

      return ok_({
        id: id,
        ma_lo: lo.ma_lo,
        ky_hieu: lo.ky_hieu,
        loai: loai,
        stt_bao: sttNum,
        khoi_luong: klNum,
        tg_nhap: tgNhap,
        ten_nguoi_nhap: nd.ten,
        goi_y_stt_tiep: sttNum + 1,
        canh_bao: canhBao
      });
    });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  4b. LƯU NHIỀU BAO CÙNG LÚC
 * ============================================================ */

/**
 * Lưu nhiều bao trong MỘT lượt gọi mạng (tối đa SO_BAO_MOI_LAN dòng).
 *
 * Quy tắc: ĐƯỢC ĂN CẢ, NGÃ VỀ KHÔNG. Bất kỳ dòng nào sai (trùng số bao, khối lượng
 * ngoài khoảng…) thì KHÔNG dòng nào được ghi, và báo rõ sai ở dòng thứ mấy.
 * Làm vậy để công nhân không bao giờ phải hỏi "bao số 5 đã lưu chưa?" —
 * chỉ có hai kết cục: lưu hết, hoặc chưa lưu gì cả.
 *
 * Ngoại lệ duy nhất: dòng nào đã có client_id trên sheet (mạng chập chờn gửi lại)
 * thì bỏ qua riêng dòng đó, không tính là lỗi.
 *
 * @param {Object} duLieu {ma_lo, loai, phien, danh_sach:[{stt_bao, khoi_luong, client_id}]}
 */
function apiLuuNhieuBao(ve, duLieu) {
  try {
    var nd = xacThuc_(ve);
    duLieu = duLieu || {};

    var maLo = chuanHoaMaLo_(duLieu.ma_lo);
    var loai = String(duLieu.loai || '').trim();
    var phien = String(duLieu.phien || '').trim();
    var ds = duLieu.danh_sach;

    if (['1', '2', '3'].indexOf(loai) < 0) return loi_('Chưa chọn Loại 1 / 2 / 3.');
    if (!ds || !ds.length) return loi_('Chưa nhập dòng nào.');

    var toiDa = Number(cfg('SO_BAO_MOI_LAN')) || 20;
    if (ds.length > toiDa) {
      return loi_('Mỗi lần chỉ lưu được tối đa ' + toiDa + ' bao. Đang có ' + ds.length + ' dòng.');
    }

    var klMin = Number(cfg('KL_MIN')), klMax = Number(cfg('KL_MAX'));

    /* --- Soát từng dòng + trùng nhau ngay trong danh sách vừa gõ --- */
    var sach = [], thayStt = {};
    for (var i = 0; i < ds.length; i++) {
      var d = ds[i] || {};
      var nhan = 'Dòng ' + (i + 1);

      var stt = soTu_(d.stt_bao);
      if (isNaN(stt) || stt <= 0 || stt !== Math.floor(stt)) {
        return loi_(nhan + ': số thứ tự bao phải là số nguyên dương.', 'LOI_DONG');
      }
      var kl = soTu_(d.khoi_luong);
      if (isNaN(kl)) {
        return loi_(nhan + ' (bao ' + stt + '): chưa nhập khối lượng.', 'LOI_DONG');
      }
      if (kl < klMin || kl > klMax) {
        return loi_(nhan + ' (bao ' + stt + '): khối lượng ' + kl + ' kg ngoài khoảng ' +
                    klMin + '–' + klMax + ' kg. Kiểm tra lại dấu thập phân.', 'LOI_DONG');
      }
      if (thayStt[stt] !== undefined) {
        return loi_('Số bao ' + stt + ' bị gõ 2 lần (dòng ' + thayStt[stt] +
                    ' và dòng ' + (i + 1) + ').', 'TRUNG_SO_BAO');
      }
      thayStt[stt] = i + 1;
      sach.push({ stt: stt, kl: lamTronKl_(kl), client_id: String(d.client_id || '').trim() });
    }

    return trongKhoa_(function () {
      var lo = timLo_(maLo);
      if (!lo) return loi_('Không tìm thấy mã lô ' + maLo);
      if (lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY) {
        return loi_('Lô ' + maLo + ' đã ĐÓNG, không thể thêm bao.', 'LO_DA_DONG');
      }
      if (!lo.ky_hieu) return loi_('Lô ' + maLo + ' chưa xác định được ký hiệu A/B.');

      var nhom = lo.ky_hieu + loai;
      var maxNhom = chiSoNhom_(nhom).stt_max;

      /* Đường nhanh chỉ áp dụng khi MỌI dòng trong mẻ đều lớn hơn số lớn nhất đã
       * dùng của nhóm. Chỉ cần một dòng rơi xuống dưới là cả mẻ phải đi đường quét —
       * "được ăn cả, ngã về không" thì việc soát cũng phải trọn vẹn như vậy.
       * Giải thích đầy đủ về bất biến: xem apiLuuBao ở trên. */
      var nhoNhatMe = null;
      sach.forEach(function (r) { if (nhoNhatMe === null || r.stt < nhoNhatMe) nhoNhatMe = r.stt; });
      var duongNhanh = (maxNhom === null || nhoNhatMe > maxNhom);

      var canGhi = [], boQua = 0;

      if (duongNhanh) {
        canGhi = sach.slice();
      } else {
        var dsBao = docBang_(SHEETS.BAO, COT_GOC_BAO);
        var daCoStt = {}, daCoClient = {};
        dsBao.forEach(function (b) {
          var cid = String(b.client_id).trim();
          if (cid) daCoClient[cid] = true;
          if (String(b.ky_hieu).trim().toUpperCase() !== lo.ky_hieu) return;
          if (String(b.loai).trim() !== loai) return;
          var s = Number(b.stt_bao);
          if (isNaN(s)) return;
          daCoStt[s] = String(b.ma_lo);
        });

        sach.forEach(function (r) {
          if (r.client_id && daCoClient[r.client_id]) { boQua++; return; }
          canGhi.push(r);
        });

        for (var j = 0; j < canGhi.length; j++) {
          if (daCoStt[canGhi[j].stt] !== undefined) {
            return loi_('Số bao ' + canGhi[j].stt + ' của nhóm ' + lo.ky_hieu + loai +
                        ' ĐÃ NHẬP RỒI (lô ' + daCoStt[canGhi[j].stt] + ').\n' +
                        'CHƯA LƯU dòng nào — sửa lại rồi bấm LƯU.', 'TRUNG_SO_BAO');
          }
        }
      }

      if (!canGhi.length) {
        return ok_({ da_luu: [], bo_qua_trung: boQua, tong_kl: 0, canh_bao: '',
                     goi_y_stt_tiep: (maxNhom === null ? 1 : maxNhom + 1),
                     ten_nguoi_nhap: nd.ten });
      }

      /* --- Qua hết vòng soát: ghi toàn bộ trong 1 lần --- */
      var tgNhap = bayGio_();
      var dong = [], daLuu = [], tongKl = 0, maxMoi = maxNhom;
      canGhi.forEach(function (r) {
        var id = taoId_();
        dong.push(themXemNhanh_({
          id: id, ma_lo: lo.ma_lo, ky_hieu: lo.ky_hieu, loai: loai,
          stt_bao: r.stt, khoi_luong: r.kl, phien: phien,
          trang_thai: BAO_TRANG_THAI.DANG_NHAP,
          nguoi_nhap: nd.ma_nv, tg_nhap: tgNhap,
          nguoi_sua: '', tg_sua: '', client_id: r.client_id
        }));
        daLuu.push({ id: id, loai: loai, ky_hieu: lo.ky_hieu, stt_bao: r.stt,
                     khoi_luong: r.kl, tg_nhap: tgNhap });
        tongKl += r.kl;
        if (maxMoi === null || r.stt > maxMoi) maxMoi = r.stt;
      });
      themNhieuDong_(SHEETS.BAO, dong);
      nangChiSo_(nhom, maxMoi, dong.length);
      congDonLo_(lo._row, dong.length, tongKl, nd.ma_nv);

      var canhBao = '';
      var nguong = Number(cfg('CANH_BAO_NHAY_SO')) || 20;
      var nhoNhat = canGhi[0].stt;
      canGhi.forEach(function (r) { if (r.stt < nhoNhat) nhoNhat = r.stt; });
      if (maxNhom !== null && nhoNhat > maxNhom + nguong) {
        canhBao = 'Số bao nhảy từ ' + maxNhom + ' lên ' + nhoNhat +
                  '. Đã lưu — kiểm tra lại nếu gõ nhầm.';
      }

      ghiLog_(nd, 'THEM_NHIEU_BAO', SHEETS.BAO,
              daLuu.map(function (x) { return x.id; }).join(','), '',
              lo.ma_lo + ' | ' + lo.ky_hieu + loai + ' | ' + daLuu.length + ' bao | ' +
              lamTronKl_(tongKl) + ' kg | STT ' +
              daLuu.map(function (x) { return x.stt_bao; }).join(', '),
              canhBao);

      return ok_({
        da_luu: daLuu,
        bo_qua_trung: boQua,
        tong_kl: lamTronKl_(tongKl),
        goi_y_stt_tiep: maxMoi + 1,
        canh_bao: canhBao,
        ten_nguoi_nhap: nd.ten
      });
    });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  4c. GHI NHẬT KÝ BAO KHÔNG GỬI LÊN ĐƯỢC
 * ============================================================ */

/**
 * Ghi vào nhật ký một bao mà máy chủ TỪ CHỐI khi hàng đợi offline gửi lên,
 * cùng với việc công nhân đã xử lý nó ra sao.
 *
 * Vì sao cần: trước bản 1.5, bao bị từ chối sẽ bị xoá khỏi hàng đợi và chỉ hiện
 * một dòng chữ chạy 2,8 giây rồi biến mất. Công nhân đang cầm bao, không nhìn màn
 * hình, là bao đó mất hẳn — không vào sheet BAO, không vào nhật ký, không ai biết.
 * Đó là đường mất số liệu duy nhất còn lại của hệ thống.
 *
 * @param {Object} duLieu  bao bị từ chối (như lúc gửi lên)
 * @param {string} lyDo    máy chủ đã từ chối vì lý do gì
 * @param {string} hanhDong 'TREO' = đưa vào khay chờ xử lý; 'BO' = công nhân bỏ hẳn
 */
function apiGhiBaoLoi(ve, duLieu, lyDo, hanhDong) {
  try {
    var nd = xacThuc_(ve);
    duLieu = duLieu || {};

    var mota = chuanHoaMaLo_(duLieu.ma_lo) + ' | ' +
               String(duLieu.ky_hieu || '') + String(duLieu.loai || '') +
               ' | STT ' + String(duLieu.stt_bao) +
               ' | ' + String(duLieu.khoi_luong) + ' kg';

    var bo = (String(hanhDong).toUpperCase() === 'BO');
    ghiLog_(nd, bo ? 'BAO_LOI_BO' : 'BAO_LOI_TREO', SHEETS.BAO,
            String(duLieu.client_id || ''),
            mota,
            bo ? '(công nhân bỏ hẳn, không nhập lại)' : '(đang treo ở khay chờ xử lý)',
            'Máy chủ từ chối: ' + String(lyDo || ''));

    return ok_({ da_ghi: true, bo: bo });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  5. SỬA / XOÁ 1 BAO (chỉ khi CHƯA CHỐT CA và đúng người nhập)
 * ============================================================ */

function timBaoTheoId_(dsBao, id) {
  for (var i = 0; i < dsBao.length; i++) {
    if (String(dsBao[i].id).trim() === String(id).trim()) return dsBao[i];
  }
  return null;
}

/**
 * Vì sao một bao KHÔNG sửa được theo luật thường. Trả chuỗi lỗi, hoặc null nếu sửa được.
 * KHÔNG xét vai trò — đây là luật chung, phần miễn trừ nằm ở kiemTraQuyenSua_.
 */
function lyDoKhongSuaDuoc_(bao, nd) {
  if (!bao) return 'Không tìm thấy bao này (có thể đã bị xoá).';
  if (String(bao.trang_thai).trim().toUpperCase() === BAO_TRANG_THAI.DA_CHOT) {
    return 'Bao này đã CHỐT CA, không sửa được nữa.';
  }
  if (String(bao.nguoi_nhap).trim().toUpperCase() !== nd.ma_nv.toUpperCase()) {
    return 'Bao này do ' + tenTheoMa_(bao.nguoi_nhap) + ' nhập. Bạn không sửa được số liệu của người khác.';
  }
  if (quaHanSua_(bao.tg_nhap)) {
    return 'Bao này đã nhập quá ' + cfg('TU_KHOA_SAU_GIO') +
           ' giờ nên tự động khoá. Báo quản lý nếu cần sửa.';
  }
  var lo = timLo_(bao.ma_lo);
  if (!lo || lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY) {
    return 'Lô ' + bao.ma_lo + ' đã đóng, không sửa được nữa.';
  }
  return null;
}

/**
 * Kiểm tra quyền sửa/xoá một bao. Trả về chuỗi lỗi, hoặc null nếu được phép.
 *
 * Bản 1.6 mở CỬA MIỄN TRỪ cho vai QUẢN LÝ (Andy chốt 22/08/2026): quản lý sửa/xoá được
 * cả bao đã CHỐT CA và bao thuộc lô đã ĐÓNG. Đây là việc tháo đúng lời hứa gốc
 * "chốt ca là khoá vĩnh viễn", nên nó đi kèm hai điều kiện KHÔNG được bỏ:
 *   1. mọi lần vượt quyền đều BẮT BUỘC gõ lý do (xem batLyDo_);
 *   2. nhật ký ghi bằng hành động riêng QL_* để soi lại được.
 */
function kiemTraQuyenSua_(bao, nd) {
  var loi = lyDoKhongSuaDuoc_(bao, nd);
  if (!loi) return null;
  // Không tìm thấy bao thì quản lý cũng chịu — không có gì để sửa.
  if (!bao) return loi;
  if (nd.vai_tro === VAI_TRO.QUAN_LY) return null;
  return loi;
}

/**
 * Soát lý do cho một thao tác VƯỢT QUYỀN của quản lý.
 * @param {boolean} vuotQuyen  thao tác này có phải là vượt quyền thường không
 * @param {*} lyDo             chuỗi người dùng gõ
 * @return {{loi: (Object|null), lyDo: string}}
 */
function batLyDo_(vuotQuyen, lyDo) {
  var s = String(lyDo === null || lyDo === undefined ? '' : lyDo).trim();
  if (!vuotQuyen) return { loi: null, lyDo: s };
  if (s.length < 3) {
    return {
      loi: loi_('Phải ghi lý do (ít nhất 3 ký tự) khi sửa số liệu đã khoá.\n' +
                'Lý do này vào nhật ký kèm tên bạn.', 'THIEU_LY_DO'),
      lyDo: s
    };
  }
  return { loi: null, lyDo: s };
}

/**
 * @param {*=} lyDo  bắt buộc khi quản lý sửa bao đã khoá — xem batLyDo_
 */
function apiSuaBao(ve, id, sttBaoMoi, klMoi, lyDo) {
  try {
    var nd = xacThuc_(ve);

    var sttNum = soTu_(sttBaoMoi);
    if (isNaN(sttNum) || sttNum <= 0 || sttNum !== Math.floor(sttNum)) {
      return loi_('Số thứ tự bao phải là số nguyên dương.');
    }
    var klNum = soTu_(klMoi);
    var klMin = Number(cfg('KL_MIN')), klMax = Number(cfg('KL_MAX'));
    if (isNaN(klNum) || klNum < klMin || klNum > klMax) {
      return loi_('Khối lượng phải trong khoảng ' + klMin + '–' + klMax + ' kg.');
    }
    klNum = lamTronKl_(klNum);

    var kq = trongKhoa_(function () {
      var dsBao = docBang_(SHEETS.BAO, COT_TOI_TG_NHAP);
      var bao = timBaoTheoId_(dsBao, id);

      var loiQuyen = kiemTraQuyenSua_(bao, nd);
      if (loiQuyen) return loi_(loiQuyen, 'KHONG_DUOC_SUA');

      // Quản lý đang vượt luật thường -> bắt lý do và ghi nhật ký bằng hành động riêng.
      var vuot = (lyDoKhongSuaDuoc_(bao, nd) !== null);
      var bl = batLyDo_(vuot, lyDo);
      if (bl.loi) return bl.loi;

      var lo = timLo_(bao.ma_lo);

      // Chống trùng với bao khác cùng nhóm
      for (var i = 0; i < dsBao.length; i++) {
        var b = dsBao[i];
        if (String(b.id).trim() === String(id).trim()) continue;
        if (String(b.ky_hieu).trim().toUpperCase() !== String(bao.ky_hieu).trim().toUpperCase()) continue;
        if (String(b.loai).trim() !== String(bao.loai).trim()) continue;
        if (Number(b.stt_bao) === sttNum) {
          return loi_('Số bao ' + sttNum + ' đã tồn tại ở nhóm này (lô ' + b.ma_lo + ').', 'TRUNG_SO_BAO');
        }
      }

      var cu = 'STT ' + bao.stt_bao + ' | ' + bao.khoi_luong + ' kg';
      var moi = 'STT ' + sttNum + ' | ' + klNum + ' kg';

      suaDong_(SHEETS.BAO, bao._row, {
        stt_bao: sttNum,
        khoi_luong: klNum,
        nguoi_sua: nd.ma_nv,
        tg_sua: bayGio_(),
        // Hai cột xem nhanh phụ thuộc số bao / khối lượng phải đi theo,
        // nếu không bảng "sạch" dán sang Excel sẽ nói dối lặng lẽ.
        v_khoi_luong: klNum,
        v_stt: String(bao.ky_hieu).trim().toUpperCase() + String(bao.loai).trim() + '-' + sttNum
      });

      // Sửa số bao lên cao hơn thì phải nâng chỉ số theo, nếu không bất biến
      // "stt_max ≥ mọi số bao đang có" bị phá và đường nhanh sẽ cho lọt số trùng.
      nangChiSo_(String(bao.ky_hieu).trim().toUpperCase() + String(bao.loai).trim(),
                 sttNum, 0);
      // Số bao không đổi, chỉ khối lượng đổi -> chỉnh phần chênh lệch vào cột đếm sẵn.
      congDonLo_(lo._row, 0, klNum - (Number(bao.khoi_luong) || 0), bao.nguoi_nhap);

      ghiLog_(nd, vuot ? 'QL_SUA_BAO' : 'SUA_BAO', SHEETS.BAO, id, cu, moi,
              vuot ? (bao.ma_lo + ' | QUẢN LÝ sửa số liệu ĐÃ KHOÁ | lý do: ' + bl.lyDo)
                   : (bao.ma_lo + (bl.lyDo ? ' | lý do: ' + bl.lyDo : '')));
      return ok_({ id: id, stt_bao: sttNum, khoi_luong: klNum, vuot_quyen: vuot });
    });

    // Quản lý sửa số liệu đã khoá thì bảng tổng hợp phải đúng NGAY, không đợi
    // nhịp 15 phút — chị thống kê có thể đang mở bảng đó.
    if (kq && kq.ok && kq.data && kq.data.vuot_quyen) capNhatTongHopLoNgam_();
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/**
 * @param {*=} lyDo  bắt buộc khi quản lý xoá bao đã khoá — xem batLyDo_
 */
function apiXoaBao(ve, id, lyDo) {
  try {
    var nd = xacThuc_(ve);

    var kq = trongKhoa_(function () {
      var dsBao = docBang_(SHEETS.BAO, COT_TOI_TG_NHAP);
      var bao = timBaoTheoId_(dsBao, id);

      var loiQuyen = kiemTraQuyenSua_(bao, nd);
      if (loiQuyen) return loi_(loiQuyen, 'KHONG_DUOC_XOA');

      var vuot = (lyDoKhongSuaDuoc_(bao, nd) !== null);
      var bl = batLyDo_(vuot, lyDo);
      if (bl.loi) return bl.loi;

      var loXoa = timLo_(bao.ma_lo);

      var mota = bao.ma_lo + ' | ' + bao.ky_hieu + bao.loai +
                 ' | STT ' + bao.stt_bao + ' | ' + bao.khoi_luong + ' kg';

      sheet_(SHEETS.BAO).deleteRow(bao._row);
      // Chỉ trừ số lượng. KHÔNG hạ stt_max — để cao hơn thực tế là an toàn
      // (cùng lắm đi đường quét thêm vài lần), hạ xuống mới là mở đường cho số trùng.
      nangChiSo_(String(bao.ky_hieu).trim().toUpperCase() + String(bao.loai).trim(), null, -1);
      congDonLo_(loXoa ? loXoa._row : 0, -1, -(Number(bao.khoi_luong) || 0));

      ghiLog_(nd, vuot ? 'QL_XOA_BAO' : 'XOA_BAO', SHEETS.BAO, id, mota, '',
              vuot ? ('QUẢN LÝ xoá bao ĐÃ KHOÁ | lý do: ' + bl.lyDo)
                   : ('Xoá khi chưa chốt ca' + (bl.lyDo ? ' | lý do: ' + bl.lyDo : '')));

      return ok_({ id: id, vuot_quyen: vuot });
    });

    if (kq && kq.ok && kq.data && kq.data.vuot_quyen) capNhatTongHopLoNgam_();
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  6. CHỐT CA — khoá toàn bộ bao mình vừa nhập trong phiên này
 * ============================================================ */

/**
 * Chốt ca cho ĐÚNG LÔ đang mở.
 *
 * Andy xác nhận (20/08/2026) công nhân có nhập nhiều lô SONG SONG, nên chốt ca ở
 * lô này tuyệt đối không được khoá mất phần đang nhập dở ở lô khác.
 *
 * - Trong lô đang chốt: khoá MỌI bao còn treo của người này, không phụ thuộc mã
 *   phiên — giữ nguyên tính chất "không còn bao mồ côi sót từ ca trước" của v1.1.
 * - Ở các lô khác: chỉ quét thêm những bao ĐÃ QUÁ HẠN TU_KHOA_SAU_GIO. Các bao đó
 *   dù sao cũng đã hết sửa được rồi; đánh dấu DA_CHOT chỉ để sổ sách phản ánh đúng
 *   thực tế. Bao ở lô khác còn trong hạn sửa thì ĐỂ NGUYÊN.
 *
 * @param {*=} xacNhan  bản 1.6 gửi true / 'XAC_NHAN' khi công nhân đã tích ô.
 *   Bản 1.5 KHÔNG gửi tham số này — thiếu hẳn thì vẫn cho qua, vì trước 1.6 việc
 *   xác nhận nằm hoàn toàn ở hộp confirm phía máy. Gửi lên mà sai thì mới chặn:
 *   đó là trường hợp app 1.6 gọi lúc ô tích chưa được tích.
 */
function apiChotCa(ve, phien, maLoRaw, xacNhan) {
  try {
    var nd = xacThuc_(ve);
    phien = String(phien || '').trim();

    var maLo = chuanHoaMaLo_(maLoRaw);
    if (!maLo) {
      return loi_('Chưa xác định được lô cần chốt ca.\n' +
                  'Hãy đóng app và mở lại (bản app trên máy đang cũ), rồi bấm lại.',
                  'THIEU_MA_LO');
    }

    if (xacNhan !== undefined && xacNhan !== null && !xacNhanDung_(xacNhan, maLo)) {
      return loi_('Chưa tích ô xác nhận chốt ca.', 'CHUA_XAC_NHAN');
    }

    var kq = trongKhoa_(function () {
      var dsBao = docBang_(SHEETS.BAO,
        ['ma_lo', 'khoi_luong', 'trang_thai', 'nguoi_nhap', 'tg_nhap']);
      var dem = 0, tongKl = 0;
      var demLoKhac = 0, dsLoKhac = {};
      var canKhoa = [];

      dsBao.forEach(function (b) {
        if (String(b.nguoi_nhap).trim().toUpperCase() !== nd.ma_nv.toUpperCase()) return;
        if (String(b.trang_thai).trim().toUpperCase() !== BAO_TRANG_THAI.DANG_NHAP) return;

        var cungLo = (chuanHoaMaLo_(b.ma_lo) === maLo);
        // Lô khác mà bao vẫn còn sửa được -> ĐỂ YÊN, đó là việc đang làm dở.
        if (!cungLo && !quaHanSua_(b.tg_nhap)) return;

        canKhoa.push(b._row);

        if (cungLo) {
          dem++;
          tongKl += Number(b.khoi_luong) || 0;
        } else {
          demLoKhac++;
          dsLoKhac[chuanHoaMaLo_(b.ma_lo)] = true;
        }
      });

      if (dem === 0 && demLoKhac === 0) {
        return loi_('Không có bao nào của bạn để chốt trong lô ' + maLo + '.', 'KHONG_CO_GI');
      }

      // Ghi cả loạt trong 2 lượt gọi Google thay vì 2 lượt cho mỗi bao.
      datTrangThaiBao_(canKhoa, BAO_TRANG_THAI.DA_CHOT);

      ghiLog_(nd, 'CHOT_CA', SHEETS.BAO, phien, '',
              dem + ' bao | ' + lamTronKl_(tongKl) + ' kg',
              'Lô ' + maLo +
              (demLoKhac ? '; quét thêm ' + demLoKhac + ' bao quá hạn ở lô: ' +
                           Object.keys(dsLoKhac).join(', ') : ''));

      return ok_({
        ma_lo: maLo,
        so_bao: dem,
        tong_kl: lamTronKl_(tongKl),
        so_bao_lo_khac: demLoKhac,
        ds_lo_khac: Object.keys(dsLoKhac)
      });
    });

    // Cập nhật bảng tổng hợp NGOÀI khoá ghi. Việc này đọc lại cả LO lẫn BAO rồi ghi
    // đè cả sheet tổng hợp — để trong khoá là bắt 2 công nhân kia đứng chờ suốt thời
    // gian đó, và chính là nguồn gốc thông báo "Hệ thống đang bận, bấm lại sau".
    if (kq && kq.ok) capNhatTongHopLoNgam_();
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  6b. KHỐI LƯỢNG ĐẦU VÀO + XEM TRƯỚC KẾT QUẢ CHẠY MÁY
 * ============================================================ */

/**
 * Đặt / sửa khối lượng đầu vào (kg) của lô. Công nhân tự nhập.
 * Cho sửa bất cứ lúc nào khi lô CÒN CHẠY, vì lúc tạo lô thường chưa cân xong.
 * Mọi lần sửa đều ghi nhật ký giá trị cũ → mới.
 */
function apiCapNhatKlVao(ve, maLoRaw, klVaoRaw) {
  try {
    var nd = xacThuc_(ve);
    var maLo = chuanHoaMaLo_(maLoRaw);

    var doc = docKlVao_(klVaoRaw);
    if (doc.loi) return loi_(doc.loi);
    var moi = doc.gia_tri;

    return trongKhoa_(function () {
      var lo = timLo_(maLo);
      if (!lo) return loi_('Không tìm thấy mã lô ' + maLo);
      if (lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY) {
        return loi_('Lô ' + maLo + ' đã ĐÓNG, không sửa được khối lượng đầu vào.', 'LO_DA_DONG');
      }

      var cu = (lo.kl_vao === null) ? '' : lo.kl_vao;
      suaDong_(SHEETS.LO, lo._row, { kl_vao: moi });
      ghiLog_(nd, 'SUA_KL_VAO', SHEETS.LO, maLo,
              cu === '' ? '(trống)' : cu + ' kg',
              moi === '' ? '(trống)' : moi + ' kg', '');

      // Trả về LUÔN kết quả đã tính lại: màn hình cập nhật ngay trong cùng một
      // lượt gọi mạng, không cần hỏi lại lần nữa.
      return ok_(ketQuaLo_(maLo));
    });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/**
 * XEM TRƯỚC KẾT QUẢ CHẠY MÁY — bước công nhân xem trước khi đóng lô.
 *
 * Chỉ ĐỌC, không thay đổi gì. Xem xong vẫn sửa số liệu bình thường rồi mới đóng lô.
 * Cảnh báo hao hụt CHỈ LÀ CẢNH BÁO, không bao giờ chặn đóng lô.
 */
/**
 * Dựng gói kết quả của 1 lô TỪ DANH SÁCH BAO ĐÃ ĐỌC SẴN.
 *
 * Tách riêng ở bản 1.6 để apiMoLo dùng lại được. apiMoLo vốn ĐÃ duyệt qua mọi bao của
 * lô để dựng danh sách hiển thị, nên cộng thêm bảng tỉ lệ ngay trong lượt đọc đó là
 * MIỄN PHÍ — không thêm một ô đọc nào. Trước 1.6, muốn có bảng tỉ lệ phải sang màn hình
 * riêng và gọi apiXemTruocKetQua, tức quét lại toàn bộ sheet BAO thêm một lượt nữa.
 *
 * @param {Object} lo  kết quả timLo_
 * @param {Array<Object>} dsBaoCuaLo  các bao CỦA CHÍNH LÔ NÀY (đã lọc sẵn)
 * @return {Object}
 */
function ketQuaTuBao_(lo, dsBaoCuaLo) {
    var soBao = { '1': 0, '2': 0, '3': 0 };
    var kl = { '1': 0, '2': 0, '3': 0 };
    var chuaChot = {};

    dsBaoCuaLo.forEach(function (b) {
      var l = String(b.loai).trim();
      if (['1', '2', '3'].indexOf(l) < 0) return;
      soBao[l]++;
      kl[l] += Number(b.khoi_luong) || 0;
      if (String(b.trang_thai).trim().toUpperCase() === BAO_TRANG_THAI.DANG_NHAP) {
        chuaChot[tenTheoMa_(String(b.nguoi_nhap).trim())] = true;
      }
    });

    var t = tinhTiLe_(lo.kl_vao, kl);
    var dsLoai = ['1', '2', '3'].map(function (l) {
      return {
        loai: l,
        nhom: lo.ky_hieu + l,
        so_bao: soBao[l],
        tong_kl: lamTronKl_(kl[l]),
        ti_le: t.ti_le[l]
      };
    });

    var tongThuHoi = null;
    if (t.co_kl_vao) {
      tongThuHoi = tron2_(t.ti_le['1'] + t.ti_le['2'] + t.ti_le['3']);
    }

    return {
      ma_lo: lo.ma_lo,
      ky_hieu: lo.ky_hieu,
      trang_thai: lo.trang_thai,
      so_bao_vao: lo.so_bao_vao,
      kl_vao: t.kl_vao,
      co_kl_vao: t.co_kl_vao,
      ds_loai: dsLoai,
      tong_so_bao_ra: soBao['1'] + soBao['2'] + soBao['3'],
      tong_kl_ra: lamTronKl_(kl['1'] + kl['2'] + kl['3']),
      tong_ti_le_thu_hoi: tongThuHoi,
      ti_le_hao_hut: t.ti_le_hao_hut,
      canh_bao: canhBaoHaoHut_(t.ti_le_hao_hut),
      hao_hut_min: Number(cfg('HAO_HUT_MIN')),
      hao_hut_max: Number(cfg('HAO_HUT_MAX')),
      nguoi_chua_chot: Object.keys(chuaChot)
    };
}

/**
 * Dựng gói kết quả của 1 lô, tự đọc sheet BAO. Dùng cho apiXemTruocKetQua và
 * apiCapNhatKlVao — sửa khối lượng đầu vào xong là có ngay số mới, KHÔNG phải gọi
 * mạng lượt hai. Một lượt gọi ít hơn cũng có nghĩa là không còn cảnh phản hồi về
 * sai thứ tự.
 *
 * Đọc CHỌN CỘT (tới nguoi_nhap, 9/13 cột) thay vì cả bảng như trước 1.6 — bảng tỉ lệ
 * chưa bao giờ cần tới nguoi_sua / tg_sua / client_id.
 *
 * @return {Object|null} null nếu không tìm thấy lô
 */
function ketQuaLo_(maLo) {
  var lo = timLo_(maLo);
  if (!lo) return null;

  var cuaLo = [];
  docBang_(SHEETS.BAO, ['ma_lo', 'loai', 'khoi_luong', 'trang_thai', 'nguoi_nhap'])
    .forEach(function (b) {
      if (chuanHoaMaLo_(b.ma_lo) === chuanHoaMaLo_(maLo)) cuaLo.push(b);
    });
  return ketQuaTuBao_(lo, cuaLo);
}

function apiXemTruocKetQua(ve, maLoRaw) {
  try {
    xacThuc_(ve);
    var maLo = chuanHoaMaLo_(maLoRaw);
    var kq = ketQuaLo_(maLo);
    if (!kq) return loi_('Không tìm thấy mã lô ' + maLo);
    return ok_(kq);
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  6c. SỬA MÃ LÔ / XOÁ LÔ  (chỉ người tạo lô hoặc QUẢN LÝ)
 * ============================================================ */

/**
 * Ai được đụng vào lô này. Trả về chuỗi lỗi, hoặc null nếu được phép.
 * Quy tắc Andy chốt 20/08/2026: QUẢN LÝ, hoặc chính người đã tạo lô.
 */
function kiemTraQuyenLo_(lo, nd) {
  if (!lo) return 'Không tìm thấy lô này.';
  if (nd.vai_tro === VAI_TRO.QUAN_LY) return null;
  if (String(lo.nguoi_mo).trim().toUpperCase() !== nd.ma_nv.toUpperCase()) {
    return 'Lô này do ' + tenTheoMa_(lo.nguoi_mo) + ' tạo. ' +
           'Chỉ người tạo lô hoặc quản lý mới sửa/xoá được.';
  }
  return null;
}

/**
 * SỬA MÃ LÔ — dùng khi người tạo gõ sai chính tả mã lô.
 *
 * Đổi mã ở sheet LO và ĐỔI KÈM mọi dòng trong sheet BAO trong cùng một khoá ghi.
 * Nếu chữ cái đầu đổi (T↔D) thì ký hiệu A/B đổi theo, kéo cả lô sang nhóm đánh số
 * khác — nên phải soát trước xem có đụng số bao đang tồn tại ở nhóm mới không.
 */
/**
 * @param {*=} lyDo  bắt buộc khi quản lý sửa mã của lô ĐÃ ĐÓNG
 */
function apiSuaMaLo(ve, maLoCuRaw, maLoMoiRaw, lyDo) {
  try {
    var nd = xacThuc_(ve);
    var maCu = chuanHoaMaLo_(maLoCuRaw);
    var maMoi = chuanHoaMaLo_(maLoMoiRaw);

    if (!maMoi) return loi_('Chưa nhập mã lô mới.');
    if (maMoi === maCu) return loi_('Mã lô mới trùng mã cũ, không có gì để sửa.');
    if (!MAU_MA_LO.test(maMoi)) {
      return loi_('Mã lô "' + maMoi + '" không hợp lệ.\n' +
                  'Chỉ được dùng chữ cái, chữ số và dấu gạch ngang, dài 3–20 ký tự.');
    }
    var kyHieuMoi = kyHieuTuMaLo_(maMoi);
    if (!kyHieuMoi) {
      return loi_('Mã lô "' + maMoi + '" không hợp lệ.\n' +
                  'Phải bắt đầu bằng "' + cfg('TIEN_TO_A') + '" (ký hiệu A) hoặc "' +
                  cfg('TIEN_TO_B') + '" (ký hiệu B).');
    }

    var kq = trongKhoa_(function () {
      var lo = timLo_(maCu);
      var loiQuyen = kiemTraQuyenLo_(lo, nd);
      if (loiQuyen) return loi_(loiQuyen, 'KHONG_CO_QUYEN');

      /*
       * Bản 1.6: quản lý sửa được mã lô ĐÃ ĐÓNG. Andy nêu tình huống thật —
       * công nhân gõ nhầm tên lô rồi đóng lô, sau này mới phát hiện ra.
       */
      var vuot = (lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY);
      if (vuot && nd.vai_tro === VAI_TRO.QUAN_LY) {
        var bl = batLyDo_(true, lyDo);
        if (bl.loi) return bl.loi;
        lyDo = bl.lyDo;
      } else if (lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY) {
        return loi_('Lô ' + maCu + ' đã ĐÓNG nên không sửa được mã.\n' +
                    'Nhờ quản lý mở lại lô trên Google Sheets rồi sửa.', 'LO_DA_DONG');
      }

      // Mã mới đã có ai dùng chưa
      var dsLo = docBang_(SHEETS.LO);
      for (var i = 0; i < dsLo.length; i++) {
        if (chuanHoaMaLo_(dsLo[i].ma_lo) === maMoi) {
          return loi_('Mã lô ' + maMoi + ' đã tồn tại. Chọn mã khác.', 'TRUNG_MA_LO');
        }
      }

      var dsBao = docBang_(SHEETS.BAO, COT_TOI_STT);

      /* --- Đổi ký hiệu A/B thì cả lô sang nhóm đánh số khác: soát đụng số bao --- */
      if (kyHieuMoi !== lo.ky_hieu) {
        var daCo = {};
        dsBao.forEach(function (b) {
          if (chuanHoaMaLo_(b.ma_lo) === maCu) return;                 // bao của chính lô này
          if (String(b.ky_hieu).trim().toUpperCase() !== kyHieuMoi) return;
          daCo[String(b.loai).trim() + '#' + Number(b.stt_bao)] = String(b.ma_lo);
        });
        var dung = [];
        dsBao.forEach(function (b) {
          if (chuanHoaMaLo_(b.ma_lo) !== maCu) return;
          var k = String(b.loai).trim() + '#' + Number(b.stt_bao);
          if (daCo[k]) {
            dung.push('bao ' + Number(b.stt_bao) + ' (nhóm ' + kyHieuMoi +
                      String(b.loai).trim() + ', đang thuộc lô ' + daCo[k] + ')');
          }
        });
        if (dung.length) {
          return loi_('Không đổi được sang ' + maMoi + ': ký hiệu chuyển ' +
                      lo.ky_hieu + ' → ' + kyHieuMoi + ' làm ' + dung.length +
                      ' bao bị TRÙNG SỐ với lô khác.\n' + dung.slice(0, 3).join('\n') +
                      (dung.length > 3 ? '\n…' : ''), 'TRUNG_SO_BAO');
        }
      }

      var soBaoDoi = doiMaLoTrongBao_(maCu, maMoi, kyHieuMoi);
      suaDong_(SHEETS.LO, lo._row, { ma_lo: maMoi, ky_hieu: kyHieuMoi });

      // Đổi ký hiệu A↔B là cả lô nhảy sang nhóm đánh số khác. Ghi sổ tăng/giảm từng
      // nhóm ở đây rất dễ sai, mà việc này hiếm — nên dựng lại bảng chỉ số từ đầu:
      // chậm hơn một chút nhưng chắc chắn đúng.
      if (kyHieuMoi !== lo.ky_hieu) dungLaiChiSo_();

      ghiLog_(nd, vuot ? 'QL_SUA_MA_LO' : 'SUA_MA_LO', SHEETS.LO, maMoi,
              maCu + ' (ký hiệu ' + lo.ky_hieu + ')',
              maMoi + ' (ký hiệu ' + kyHieuMoi + ')',
              'Đổi kèm ' + soBaoDoi + ' dòng ở sheet BAO' +
              (vuot ? ' | QUẢN LÝ sửa mã lô ĐÃ ĐÓNG | lý do: ' + lyDo : ''));

      return ok_({ ma_lo: maMoi, ky_hieu: kyHieuMoi, so_bao_doi: soBaoDoi });
    });

    if (kq && kq.ok) capNhatTongHopLoNgam_();   // ngoài khoá ghi — xem apiChotCa
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/**
 * XOÁ LÔ — dùng khi nhập sai hẳn, cần làm lại từ đầu.
 *
 * KHÔNG HOÀN TÁC ĐƯỢC. Xoá dòng lô và toàn bộ bao của lô đó.
 * Trước khi xoá, chụp lại toàn bộ số liệu vào sheet LOG: nhật ký phải trả lời được
 * "lô đó có gì trước khi bị xoá", nếu không thì xoá xong là mất dấu vĩnh viễn.
 *
 * @param {string} xacNhan phải bằng đúng mã lô — chốt chặn cuối chống bấm nhầm
 */
/**
 * @param {*=} lyDo  bắt buộc khi quản lý xoá lô ĐÃ ĐÓNG
 */
function apiXoaLo(ve, maLoRaw, xacNhan, lyDo) {
  try {
    var nd = xacThuc_(ve);
    var maLo = chuanHoaMaLo_(maLoRaw);

    if (chuanHoaMaLo_(xacNhan) !== maLo) {
      return loi_('Chưa xác nhận đúng mã lô cần xoá.', 'CHUA_XAC_NHAN');
    }

    var kq = trongKhoa_(function () {
      var lo = timLo_(maLo);
      var loiQuyen = kiemTraQuyenLo_(lo, nd);
      if (loiQuyen) return loi_(loiQuyen, 'KHONG_CO_QUYEN');

      /*
       * Bản 1.6: quản lý xoá được cả lô ĐÃ ĐÓNG. Vẫn giữ nguyên bước GÕ LẠI MÃ LÔ
       * (không đổi sang ô tích như đóng lô / chốt ca) vì đây là thao tác duy nhất
       * KHÔNG hoàn tác được — Andy chốt 22/08/2026.
       */
      var vuot = (lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY);
      if (vuot) {
        if (nd.vai_tro !== VAI_TRO.QUAN_LY) {
          return loi_('Lô ' + maLo + ' đã ĐÓNG nên không xoá được.\n' +
                      'Chỉ quản lý mới xoá được lô đã đóng.', 'LO_DA_DONG');
        }
        var blx = batLyDo_(true, lyDo);
        if (blx.loi) return blx.loi;
        lyDo = blx.lyDo;
      }

      var dsBao = docBang_(SHEETS.BAO, COT_TOI_NGUOI_NHAP);
      var cuaLo = [], nguoiKhac = {}, coDaChot = 0, tongKl = 0;
      dsBao.forEach(function (b) {
        if (chuanHoaMaLo_(b.ma_lo) !== maLo) return;
        cuaLo.push(b);
        tongKl += Number(b.khoi_luong) || 0;
        if (String(b.nguoi_nhap).trim().toUpperCase() !== nd.ma_nv.toUpperCase()) {
          nguoiKhac[String(b.nguoi_nhap).trim()] = true;
        }
        if (String(b.trang_thai).trim().toUpperCase() === BAO_TRANG_THAI.DA_CHOT) coDaChot++;
      });

      // Công nhân thường KHÔNG được xoá phần người khác đã nhập, cũng không được
      // xoá bao đã CHỐT CA — đó là hai lời hứa gốc của hệ thống. Quản lý thì được.
      if (nd.vai_tro !== VAI_TRO.QUAN_LY) {
        var dsTen = Object.keys(nguoiKhac).map(function (m) { return tenTheoMa_(m); });
        if (dsTen.length) {
          return loi_('Không xoá được: lô này có bao do ' + dsTen.join(', ') +
                      ' nhập.\nChỉ quản lý mới xoá được lô có số liệu của người khác.',
                      'CO_NGUOI_KHAC');
        }
        if (coDaChot) {
          return loi_('Không xoá được: lô này đã có ' + coDaChot +
                      ' bao CHỐT CA (đã khoá).\nNhờ quản lý xoá giúp.', 'DA_CHOT');
        }
      }

      /* --- Chụp lại số liệu vào nhật ký TRƯỚC khi xoá --- */
      var anh = cuaLo.map(function (b) {
        return String(b.ky_hieu) + String(b.loai) + ':' + Number(b.stt_bao) +
               '=' + Number(b.khoi_luong) + 'kg/' + String(b.nguoi_nhap);
      }).join('; ');
      ghiLog_(nd, 'XOA_LO', SHEETS.LO, maLo,
              maLo + ' | ký hiệu ' + lo.ky_hieu + ' | vào ' +
              (lo.so_bao_vao === null ? '?' : lo.so_bao_vao) + ' bao / ' +
              (lo.kl_vao === null ? '?' : lo.kl_vao) + ' kg | ra ' + cuaLo.length +
              ' bao / ' + lamTronKl_(tongKl) + ' kg || ' + anh,
              '(đã xoá)', 'Xoá lô và toàn bộ bao của lô — KHÔNG hoàn tác được' +
              (vuot ? ' | QUẢN LÝ xoá lô ĐÃ ĐÓNG | lý do: ' + lyDo : ''));

      /* --- Xoá từ DƯỚI LÊN, nếu không số dòng sẽ trượt sau mỗi lần xoá --- */
      var sh = sheet_(SHEETS.BAO);
      cuaLo.map(function (b) { return b._row; })
           .sort(function (a, b) { return b - a; })
           .forEach(function (r) { sh.deleteRow(r); });

      sheet_(SHEETS.LO).deleteRow(lo._row);

      // Xoá cả lô đụng tới nhiều nhóm cùng lúc -> dựng lại chỉ số cho chắc chắn.
      dungLaiChiSo_();

      return ok_({ ma_lo: maLo, so_bao_da_xoa: cuaLo.length, tong_kl: lamTronKl_(tongKl) });
    });

    if (kq && kq.ok) capNhatTongHopLoNgam_();   // ngoài khoá ghi — xem apiChotCa
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  6d. SỬA THÔNG TIN LÔ / MỞ LẠI LÔ  (bản 1.6 — đợt C)
 * ============================================================ */

/**
 * Sửa số bao đầu vào / khối lượng đầu vào / ghi chú của một lô.
 *
 * Gộp ba thứ vào MỘT lần gọi vì trên màn hình chúng nằm chung một hộp thoại: quản lý
 * mở phiếu giấy ra đối chiếu rồi sửa một lượt, chứ không sửa từng ô một.
 *
 * Ai được: người tạo lô hoặc quản lý (kiemTraQuyenLo_). Lô ĐÃ ĐÓNG thì chỉ quản lý,
 * và bắt buộc ghi lý do.
 *
 * @param {Object} thayDoi  chỉ những khoá CÓ MẶT mới bị sửa: {so_bao_vao, kl_vao, ghi_chu}
 * @param {*=} lyDo
 */
function apiSuaLo(ve, maLoRaw, thayDoi, lyDo) {
  try {
    var nd = xacThuc_(ve);
    var maLo = chuanHoaMaLo_(maLoRaw);
    thayDoi = thayDoi || {};

    var kq = trongKhoa_(function () {
      var lo = timLo_(maLo);
      var loiQuyen = kiemTraQuyenLo_(lo, nd);
      if (loiQuyen) return loi_(loiQuyen, 'KHONG_CO_QUYEN');

      var vuot = (lo.trang_thai !== LO_TRANG_THAI.DANG_CHAY);
      if (vuot) {
        if (nd.vai_tro !== VAI_TRO.QUAN_LY) {
          return loi_('Lô ' + maLo + ' đã ĐÓNG nên không sửa được.\n' +
                      'Chỉ quản lý mới sửa được lô đã đóng.', 'LO_DA_DONG');
        }
        var bl = batLyDo_(true, lyDo);
        if (bl.loi) return bl.loi;
        lyDo = bl.lyDo;
      }

      var moi = {}, cu = [], sau = [];

      if (thayDoi.hasOwnProperty('so_bao_vao')) {
        var sv = String(thayDoi.so_bao_vao === null || thayDoi.so_bao_vao === undefined
                          ? '' : thayDoi.so_bao_vao).trim();
        var vSo = '';
        if (sv !== '') {
          var n = soTu_(sv);
          if (isNaN(n) || n <= 0 || n !== Math.floor(n)) {
            return loi_('Tổng số bao đầu vào phải là số nguyên dương (hoặc để trống).');
          }
          vSo = n;
        }
        if (String(vSo) !== String(lo.so_bao_vao === null ? '' : lo.so_bao_vao)) {
          moi.so_bao_vao = vSo;
          cu.push('bao vào ' + (lo.so_bao_vao === null ? '(trống)' : lo.so_bao_vao));
          sau.push('bao vào ' + (vSo === '' ? '(trống)' : vSo));
        }
      }

      if (thayDoi.hasOwnProperty('kl_vao')) {
        var doc = docKlVao_(thayDoi.kl_vao);
        if (doc.loi) return loi_(doc.loi);
        if (String(doc.gia_tri) !== String(lo.kl_vao === null ? '' : lo.kl_vao)) {
          moi.kl_vao = doc.gia_tri;
          cu.push('KL vào ' + (lo.kl_vao === null ? '(trống)' : lo.kl_vao + ' kg'));
          sau.push('KL vào ' + (doc.gia_tri === '' ? '(trống)' : doc.gia_tri + ' kg'));
        }
      }

      if (thayDoi.hasOwnProperty('ghi_chu')) {
        var gc = String(thayDoi.ghi_chu === null || thayDoi.ghi_chu === undefined
                          ? '' : thayDoi.ghi_chu).trim();
        if (gc !== String(lo.ghi_chu || '')) {
          moi.ghi_chu = gc;
          cu.push('ghi chú "' + String(lo.ghi_chu || '') + '"');
          sau.push('ghi chú "' + gc + '"');
        }
      }

      if (!cu.length) return loi_('Không có gì thay đổi.', 'KHONG_DOI');

      suaDong_(SHEETS.LO, lo._row, moi);
      var ghiChuLog = String(lyDo === null || lyDo === undefined ? '' : lyDo).trim();
      ghiLog_(nd, vuot ? 'QL_SUA_LO' : 'SUA_LO', SHEETS.LO, maLo,
              cu.join(' | '), sau.join(' | '),
              vuot ? ('QUẢN LÝ sửa lô ĐÃ ĐÓNG | lý do: ' + ghiChuLog)
                   : (ghiChuLog ? 'lý do: ' + ghiChuLog : ''));

      // Trả luôn kết quả đã tính lại: đổi khối lượng đầu vào là mọi tỉ lệ đổi theo.
      return ok_(ketQuaLo_(maLo));
    });

    if (kq && kq.ok) capNhatTongHopLoNgam_();   // ngoài khoá ghi — xem apiChotCa
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/**
 * MỞ LẠI một lô đã đóng — chỉ QUẢN LÝ.
 *
 * Andy nêu hai tình huống thật (22/08/2026): công nhân lỡ tay bấm đóng lô, hoặc đóng
 * xong mới phát hiện lô chưa chạy hết bao đầu vào.
 *
 * CỐ Ý KHÔNG mở khoá các bao đã CHỐT CA: chúng vẫn giữ nguyên trạng thái DA_CHOT.
 * Mở lô chỉ để nhập TIẾP; muốn sửa một bao cũ thì quản lý sửa thẳng bao đó (apiSuaBao),
 * và lần đó sẽ có lý do riêng trong nhật ký. Mở toang cả lô để sửa một bao là đánh đổi
 * sai: nó bỏ khoá của tất cả những người khác nữa.
 */
function apiMoLaiLo(ve, maLoRaw, xacNhan, lyDo) {
  try {
    var nd = xacThuc_(ve);
    if (nd.vai_tro !== VAI_TRO.QUAN_LY) {
      return loi_('Chỉ quản lý mới mở lại được lô đã đóng.', 'KHONG_CO_QUYEN');
    }
    var maLo = chuanHoaMaLo_(maLoRaw);
    if (!xacNhanDung_(xacNhan, maLo)) {
      return loi_('Chưa tích ô xác nhận mở lại lô.', 'CHUA_XAC_NHAN');
    }
    var bl = batLyDo_(true, lyDo);
    if (bl.loi) return bl.loi;

    var kq = trongKhoa_(function () {
      var lo = timLo_(maLo);
      if (!lo) return loi_('Không tìm thấy mã lô ' + maLo);
      if (lo.trang_thai !== LO_TRANG_THAI.DA_DONG) {
        return loi_('Lô ' + maLo + ' đang chạy, không có gì để mở lại.', 'LO_DANG_CHAY');
      }

      suaDong_(SHEETS.LO, lo._row, {
        trang_thai: LO_TRANG_THAI.DANG_CHAY,
        nguoi_dong: '',
        tg_dong: ''
      });

      ghiLog_(nd, 'QL_MO_LAI_LO', SHEETS.LO, maLo,
              LO_TRANG_THAI.DA_DONG, LO_TRANG_THAI.DANG_CHAY,
              'QUẢN LÝ mở lại lô | lý do: ' + bl.lyDo +
              ' | bao đã CHỐT CA vẫn giữ nguyên khoá');

      return ok_({ ma_lo: maLo, trang_thai: LO_TRANG_THAI.DANG_CHAY });
    });

    if (kq && kq.ok) capNhatTongHopLoNgam_();
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  7. ĐÓNG LÔ — lô chạy xong hoàn toàn
 * ============================================================ */

/**
 * ĐÓNG LÔ — lô đã chạy xong hoàn toàn, khoá vĩnh viễn.
 *
 * Andy chốt 21/08/2026 — phương án (b): AI CŨNG đóng lô được (ca sau đóng lô do ca
 * trước tạo là chuyện bình thường ở xưởng), NHƯNG phải xác nhận một bước riêng.
 *
 * Bản 1.5 bắt GÕ LẠI MÃ LÔ. Bản 1.6 đổi thành TÍCH Ô XÁC NHẬN (Andy chốt 22/08/2026):
 * gõ lại mã trên điện thoại giữa xưởng là quá chậm. Ô tích yếu hơn gõ tay ở chỗ nó
 * không bắt được lỗi "đóng nhầm lô bên cạnh", nên màn hình bù lại bằng cách in to
 * mã lô + số bao + số kg ngay cạnh ô tích, và nút chỉ sáng sau khi đã tích.
 *
 * Máy chủ vẫn nhận mã lô gõ tay để app bản 1.5 còn đang mở KHÔNG bị kẹt — xem
 * xacNhanDung_ trong 01_Util.gs.
 *
 * @param {*} xacNhan true / 'XAC_NHAN' (app 1.6), hoặc đúng mã lô (app 1.5)
 */
function apiDongLo(ve, maLoRaw, xacNhan) {
  try {
    var nd = xacThuc_(ve);
    var maLo = chuanHoaMaLo_(maLoRaw);

    if (!xacNhanDung_(xacNhan, maLo)) {
      return loi_('Chưa tích ô xác nhận đóng lô.\n' +
                  'Nếu màn hình không hiện ô tích: đóng hẳn app rồi mở lại ' +
                  '(bản app trên máy đang cũ).', 'CHUA_XAC_NHAN');
    }

    var kq = trongKhoa_(function () {
      var lo = timLo_(maLo);
      if (!lo) return loi_('Không tìm thấy mã lô ' + maLo);
      if (lo.trang_thai === LO_TRANG_THAI.DA_DONG) {
        return loi_('Lô ' + maLo + ' đã đóng trước đó rồi.');
      }

      var dsBao = docBang_(SHEETS.BAO,
        ['ma_lo', 'khoi_luong', 'trang_thai', 'nguoi_nhap']);

      // Không cho đóng lô khi NGƯỜI KHÁC còn bao chưa chốt —
      // tránh khoá mất phần đang nhập dở của đồng nghiệp.
      var nguoiKhacConTreo = {};
      dsBao.forEach(function (b) {
        if (chuanHoaMaLo_(b.ma_lo) !== maLo) return;
        if (String(b.trang_thai).trim().toUpperCase() !== BAO_TRANG_THAI.DANG_NHAP) return;
        var ma = String(b.nguoi_nhap).trim();
        if (ma.toUpperCase() !== nd.ma_nv.toUpperCase()) nguoiKhacConTreo[ma] = true;
      });
      var dsTen = Object.keys(nguoiKhacConTreo).map(function (m) { return tenTheoMa_(m); });
      if (dsTen.length) {
        return loi_('Chưa đóng lô được: ' + dsTen.join(', ') +
                    ' còn bao chưa CHỐT CA.\nNhờ họ bấm CHỐT CA trước.', 'CON_NGUOI_KHAC');
      }

      // Chốt luôn mọi bao còn treo trong lô này (đến đây chỉ còn bao của chính mình)
      var tongKl = 0, soBao = 0, canKhoa = [];
      dsBao.forEach(function (b) {
        if (chuanHoaMaLo_(b.ma_lo) !== maLo) return;
        soBao++;
        tongKl += Number(b.khoi_luong) || 0;
        if (String(b.trang_thai).trim().toUpperCase() === BAO_TRANG_THAI.DANG_NHAP) {
          canKhoa.push(b._row);
        }
      });
      var demChot = datTrangThaiBao_(canKhoa, BAO_TRANG_THAI.DA_CHOT);

      suaDong_(SHEETS.LO, lo._row, {
        trang_thai: LO_TRANG_THAI.DA_DONG,
        nguoi_dong: nd.ma_nv,
        tg_dong: bayGio_()
      });

      ghiLog_(nd, 'DONG_LO', SHEETS.LO, maLo, LO_TRANG_THAI.DANG_CHAY, LO_TRANG_THAI.DA_DONG,
              soBao + ' bao | ' + lamTronKl_(tongKl) + ' kg | chốt thêm ' + demChot + ' bao');

      return ok_({ ma_lo: maLo, so_bao: soBao, tong_kl: lamTronKl_(tongKl) });
    });

    if (kq && kq.ok) capNhatTongHopLoNgam_();   // ngoài khoá ghi — xem apiChotCa
    return kq;
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}

/* ============================================================
 *  8. MÀN HÌNH THỐNG KÊ (chỉ vai trò THONG_KE / QUAN_LY)
 * ============================================================ */

function apiTongHopLo(ve, tuNgay, denNgay) {
  try {
    var nd = xacThuc_(ve);
    // DANH SÁCH TRẮNG: chỉ 2 vai trò này được vào. Trước đây code chỉ cấm đúng
    // giá trị CONG_NHAN, nên chỉ cần gõ sai cột vai_tro trong sheet (thiếu gạch
    // dưới, gõ có dấu) là công nhân xem được toàn bộ số liệu tổng hợp.
    if (nd.vai_tro !== VAI_TRO.THONG_KE && nd.vai_tro !== VAI_TRO.QUAN_LY) {
      return loi_('Bạn không có quyền xem màn hình này.', 'KHONG_CO_QUYEN');
    }
    return ok_({ ds: tinhTongHopLo_(tuNgay, denNgay) });
  } catch (e) {
    return loi_(e.message === 'PHIEN_HET_HAN'
      ? 'Phiên đã hết hạn, vui lòng đăng nhập lại.' : e.message,
      e.message === 'PHIEN_HET_HAN' ? 'PHIEN_HET_HAN' : 'LOI');
  }
}
