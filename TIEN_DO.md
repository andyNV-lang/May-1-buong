# TIẾN ĐỘ & BÀN GIAO — Máy 1 buồng

**Cập nhật: 25/08/2026 · bản 1.7 — GÓI 1 + GÓI 2 đã xong · bản 1.6 ĐANG CHẠY THẬT**

File này dành cho việc **tiếp tục công việc ở một phiên trò chuyện mới**.
Nó KHÔNG lặp lại nội dung đã có ở `0_DOC_TRUOC.md` (lịch sử phiên bản, danh sách lỗi đã sửa,
mô tả tính năng) — đọc file đó trước, rồi đọc file này để biết *đang dở ở đâu*.

**Ba file tài liệu, ba mục đích khác nhau:**

| File | Trả lời câu hỏi | Nằm ở |
|---|---|---|
| `0_DOC_TRUOC.md` | Hệ thống này là gì, đã sửa những lỗi nào | cùng thư mục |
| `TIEN_DO.md` *(file này)* | Đang dở ở đâu, chờ quyết gì, rủi ro gì | cùng thư mục |
| `KIEN_TRUC_MO_RONG.md` | Mở rộng sang 4 công đoạn kia thế nào | **thư mục cha** |

⚠️ **Thư mục làm việc là `may1buong_appscript/`.** Thư mục `may1buong_appscript v1.5`
ở cạnh nó là bản giải nén cũ để xem, nội dung giống hệt — **đừng sửa vào đó**.

---

## 1. Trạng thái hiện tại

| Hạng mục | Tình trạng |
|---|---|
| Phiên bản | **1.7 — Gói 1 (giao diện) + Gói 2 (luật nhập liệu) xong**, xây trên nền 1.6 đủ 6/6 yêu cầu. Không còn đóng gói zip; mốc phiên bản nằm trong git |
| Đã deploy lên Google chưa | **Bản 1.6 ĐANG CHẠY THẬT.** Andy xác nhận 25/08/2026: chính Andy, người vận hành và quản lý đã chạy thử nhiều lô, **chưa phát hiện lỗi nào**. Bản 1.7 (Gói 1 + Gói 2) **CHƯA dán** |
| PIN của `QL01` | ✅ **Andy đã đổi** (xác nhận 25/08/2026) |
| Kiểm thử logic | **482 đạt / 0 lỗi** — chạy `bash cong_cu/chay_kiemthu.sh` (thêm 51 ca ở mục 30 cho Gói 2) |
| Kiểm thử giao diện (Playwright) | ❌ **Chưa chạy lại được** từ bản 1.1. File `9_KIEMTHU_GIAODIEN.js.txt` ghi cứng đường dẫn Chromium của máy Linux (`/opt/pw-browsers/…`) |
| Thử tay giao diện | ✅ **Đã bấm tay qua trình duyệt** — 12 luồng bản 1.5 (mục 1d), các luồng của từng đợt 1.6 (mục 1e–1h), và 8 luồng của Gói 1 bản 1.7 (mục 1j) |
| Số file đã đổi ở bản 1.6 | **9/11** — chỉ `03_Auth.gs` và `appsscript.json` giữ nguyên |
| Nhịp sản xuất thật | Andy xác nhận 21/08/2026: **200–500 bao/ngày, thiết kế an toàn cho 1000 bao/ngày**. Bao nặng **1–200 kg** |
| Git / GitHub | ✅ **Có từ 25/08/2026** — `github.com/andyNV-lang/May-1-buong`, nhánh `main` + `dev`, mốc `v1.6.0` → `v1.6.3`. Xem mục **4b** |

### 🔴 VIỆC TIẾP THEO — dán BẢN 1.7 (Gói 1 + Gói 2) lên Google

Bản 1.6 đã chạy thật và ổn định. Bản 1.7 gồm 5 ý tưởng Andy đưa ngày 25/08/2026,
**482 kiểm thử xanh**, đã bấm tay trên bản mô phỏng.

**Bản 1.7 KHÔNG đụng cấu trúc dữ liệu** — không thêm cột, không thêm sheet.
**Không phải chạy menu tạo cấu trúc sheet.**

Dán lại **6 file**:

| Dán lại | Giữ nguyên |
|---|---|
| `00_Config.gs` · `01_Util.gs` · `02_Setup.gs` · `04_Api.gs` | `03_Auth.gs` · `05_Report.gs` · `06_WebApp.gs` |
| `Index.html` · `Script.html` · `Style.html` | `appsscript.json` |

1. Dán 6 file → 💾 Save.
2. Chạy `tuKiemTra` → phải thấy tất cả ✅.
3. **Deploy → Manage deployments → ✏️ → Version: New version → Deploy.** *Bắt buộc.*
4. Người vận hành **đóng hẳn app rồi mở lại**.
5. **In lại `3_HUONG_DAN_CONG_NHAN.md` dán tại máy** — tờ này nay có 2 mục mới về
   cách gõ tắt mã lô và luật gõ khối lượng. **Đây là bước quan trọng nhất của Gói 2:**
   bao từ 100 kg trở lên mà gõ thiếu dấu phẩy sẽ bị ghi nhỏ đi 10 lần.

Chi tiết: bản 1.7 — Gói 1 ở mục **1j**, Gói 2 ở mục **1k**. Bản 1.6: mục **1e** (đợt A) · **1f** (B) · **1g** (C) · **1h** (D) · **1i** (lỗi vá 25/08).

---

## 1a. NỢ KỸ THUẬT ĐÃ BIẾT — đọc trước khi sửa gì tiếp

Bảy điểm dưới đây là chỗ hệ thống **đang yếu thật**, không phải lo xa. Ghi ra để phiên sau
không phải tự phát hiện lại, và để Andy biết mình đang chấp nhận cái gì.

| # | Nợ | Mức |
|---|---|---|
| 1 | **Phần chạy trên điện thoại KHÔNG có kiểm thử tự động.** 431 ca đều là phía máy chủ. Bộ kiểm thử giao diện Playwright hỏng từ bản 1.1. Mọi màn hình chỉ được chứng minh bằng tay trên `mo_phong.html` | 🔴 cao — bản 1.6 thêm 2 màn hình, 4 hộp thoại, và một nút XOÁ |
| 2 | **Công thức tỉ lệ tồn tại ở HAI nơi, hai ngôn ngữ**: `tinhTiLe_`/`canhBaoHaoHut_` (`05_Report.gs`) và `capNhatKetQuaTaiCho`/`canhBaoBuiHaoHut` (`Script.html`). Sửa một bên quên bên kia thì hai màn hình nói hai con số khác nhau — công nhân sẽ không báo | 🔴 cao |
| 3 | **Bốn bảng đếm sẵn có thể lệch dữ liệu gốc**: `so_bao_ra`, `kl_ra`, `CHI_SO`, `ds_nguoi_nhap`, cộng 6 cột xem nhanh P–U. `tuKiemTra` canh được 3 cái đầu và 200 dòng cuối của P–U; **`ds_nguoi_nhap` chưa được canh** | 🟠 vừa |
| 4 | **Quyền `QUAN_LY` gần như không còn giới hạn kỹ thuật** — xoá được lô đã đóng của bất kỳ ai, sửa được mọi bao đã chốt. Chốt chặn còn lại chỉ là **nhật ký**, mà nhật ký chỉ ghi lại chứ không ngăn. Cửa vào là **một mã PIN 4 số** | 🟠 vừa — Andy đã biết và chấp nhận |
| 5 | **Menu "Điền 6 cột xem nhanh" chưa thử ở quy mô thật.** Đường chia mẻ + mốc nhớ viết cho 250.000 dòng nhưng chỉ chạy trên vài chục dòng — nhánh "hết giờ, lưu mốc, chạy lại" **chưa từng thực sự xảy ra** | 🟡 thấp |
| 6 | **Bảng tổng hợp 19 cột trên điện thoại: cuộn sang phải là mất cột "Mã lô"** (tiêu đề dính, cột đầu chưa dính). Ghim cột đầu là ~10 dòng CSS | 🟡 thấp |
| 7 | ~~**Nút CHỐT CA bị đẩy xuống sâu hơn** ở bản 1.6~~ → **đỡ một phần ở bản 1.7**: bảng tỉ lệ với người vận hành rút từ 6 dòng còn 3, nút CHỐT CA lên cao hơn. Với Thống kê / Quản lý thì vẫn như cũ (họ cần bảng đầy đủ) | 🟢 đã đỡ — Andy bấm thử rồi nói tiếp |
| 10 | **Luật đọc khối lượng và luật mã lô nay tồn tại ở HAI NƠI, hai ngôn ngữ**: `klBaoTu_`/`chuanMaLo7_` (`01_Util.gs`) và `klBaoTu`/`chuanMaLo7` (`Script.html`). Cùng loại nợ với số 2 — sửa một bên quên bên kia thì màn hình nói một đằng, sheet ghi một nẻo | 🟠 vừa |
| 9 | **Gom bao theo ca dựa vào cặp (`phien`, `trang_thai`), không có mã ca thật.** Chốt ca HAI LẦN trong cùng một lần đăng nhập, cùng một lô → hai khối gộp làm một. Chữa gốc là ghi mốc thời gian chốt lên từng bao, tức thêm cột ở sheet `BAO`. Xem mục **1j** | 🟡 thấp |
| 8 | **Lỗi `apiSuaBao` sửa ngày 25/08 KHÔNG có ca kiểm thử nào canh.** Sửa đúng 1 dòng mã, không ca nào tái hiện được lỗi cũ — ai viết lại chỗ đó là lỗi quay về lặng lẽ, mà đường lỗi này **không để lại dấu vết trong nhật ký**. Xem mục **1i** | 🟠 vừa |

**Chưa đo lại hiệu năng cho kịch bản mới của đợt C** (quản lý mở nhiều lô liên tiếp,
mỗi lần `apiMoLo` quét cả sheet `BAO`).

---

## 1b. Bản 1.5 đã làm gì (13 mục Andy duyệt ngày 21/08/2026)

**Nhóm sửa lỗi (1.5a)**

| # | Việc | Ghi chú |
|---|---|---|
| 20 | Siết bộ giả lập kiểm thử | `setValues` giờ ném lỗi khi lệch chiều, đúng như Google thật. Chính nó lộ ra lỗi #1 |
| 1 | Menu "Tạo dữ liệu mẫu" hỏng từ bản 1.3 | Mảng gõ cứng 9 giá trị ghi vào vùng 10 cột. Nay dựng dòng theo TÊN CỘT nên thêm cột nữa cũng không hỏng |
| 2 | **Bao offline bị từ chối không còn biến mất** | Trước đây bị xoá thẳng, chỉ báo bằng dòng chữ chạy 2,8 giây. Nay vào **khay bao lỗi** có dải đỏ thường trực, sửa lại gửi lại được, và mọi lần bỏ hẳn đều ghi nhật ký kèm tên người |
| 3 | Đóng lô phải gõ lại mã lô | Trước 1.5 `apiDongLo` **không kiểm tra quyền gì cả**, trong khi sửa/xoá lô đều có. Andy chọn phương án (b): ai cũng đóng được, nhưng phải gõ lại mã |
| 4 | Gõ `1.000` kg không còn thành `1` kg | Ô khối lượng ĐẦU VÀO dùng bộ đọc riêng `soLonTu_` hiểu dấu phân cách nghìn; ô khối lượng từng BAO giữ nguyên (dấu phẩy = thập phân). Màn hình **hiện lại số máy hiểu** trước khi lưu. Thêm chặn trên `KL_VAO_MAX` |
| 5 | Lọc nốt các chỗ ghép chuỗi vào HTML | 6 chỗ còn sót từ bản 1.2 |
| 19 | `tuKiemTra` canh thêm lỗi cài đặt | Múi giờ `appsscript.json` lệch `MUI_GIO` (sai âm thầm 7 tiếng), khoảng khối lượng vô lý, chỉ số lệch dữ liệu gốc |
| — | `KL_MAX` 100 → **200 kg** | Theo số thật Andy cho |

**Nhóm hiệu năng (1.5b) — cho nhịp 1000 bao/ngày**

| # | Việc |
|---|---|
| — | **Sheet `CHI_SO` mới** — giữ số bao lớn nhất của 6 nhóm (A1…B3). Số bao mới lớn hơn số lớn nhất đã có thì **chắc chắn không trùng, khỏi đọc sheet BAO** |
| — | **2 cột đếm sẵn `so_bao_ra` / `kl_ra` trên sheet LO** — cộng dồn lúc lưu bao |
| 6 | Màn hình danh sách lô chỉ đọc sheet `LO`, không quét sheet `BAO` nữa |
| 7 | `docBang_` đọc **chọn cột** — chống trùng chỉ cần 3/13 cột |
| 8 | Cập nhật bảng tổng hợp chuyển ra **ngoài khoá ghi** ở cả 4 chỗ |
| 9 | Chốt ca / đóng lô ghi **theo dải dòng liền nhau**, không còn 2 lượt gọi mỗi bao |
| 18 | Lịch cập nhật tổng hợp 1 giờ → **15 phút** (`CAU_HINH/TONG_HOP_PHUT`) |

**Đo trên sheet BAO 250.000 dòng (≈1 năm ở nhịp 1000 bao/ngày).**
Chạy lại bằng `node cong_cu/do_hieu_nang.js 250000`:

| Thao tác | Bao lần/ngày | 1.4 đọc | 1.5 đọc | |
|---|---|---|---|---|
| Mở màn hình đầu | rất nhiều | 3.250.030 ô | **32 ô** | giảm 99,999% |
| Lưu 1 bao | ~1000 | 3.250.030 ô | **86 ô** | giảm 99,997% |
| Lưu mẻ 20 bao | ~50 | 3.250.043 ô | **86 ô** | giảm 99,997% |
| Mở 1 lô | ~10 | 3.250.323 ô | 2.500.286 ô | giảm 23% |
| Chốt ca | ~3 | 6.500.849 ô | 4.750.431 ô | giảm 27% · lượt gọi 47 → 6 |

Đo bằng **số ô** chứ không bằng giây, vì Google tính công theo lượng ô phải chuyển
qua lại — thời gian chạy trên máy Andy không nói lên gì về thời gian trên máy chủ Google.

**Ba đường nóng nhất giờ gần như không phụ thuộc kích thước sheet nữa.** Nhưng
**mở 1 lô / chốt ca / đóng lô / bảng tổng hợp VẪN quét cả sheet** — chúng phải tìm
"bao của lô này" hoặc "bao chưa chốt của tôi" trên toàn bộ dữ liệu, không chỉ số nào
giúp được. Chúng chạy vài lần một ngày nên chịu được, nhưng **đây là giới hạn còn lại
của bản 1.5**. Cách chữa gốc là **lưu trữ lô đã đóng sang sheet theo năm** để sheet
`BAO` không lớn vô hạn — chưa làm, xem mục 2 việc số 6.

---

## 1e. BẢN 1.6 — ĐỢT A (làm ngày 22/08/2026)

Đợt A gồm 2 trong 6 yêu cầu Andy đưa ngày 22/08: **ô tích xác nhận** (yêu cầu 3) và
**bảng theo dõi của quản lý** (yêu cầu 5). Chọn làm trước vì **không đụng vào cấu trúc
dữ liệu** — không thêm cột, không thêm sheet, dán lên là chạy.

### Đã làm gì

| # | Việc | File |
|---|---|---|
| A1 | **Chốt ca**: bỏ `confirm()` của trình duyệt, thay bằng hộp thoại có **ô tích**, in rõ *lô nào · bao nhiêu bao · bao nhiêu kg* trước khi tích | `Index`, `Script` |
| A2 | **Đóng lô**: bỏ bước gõ lại mã lô, thay bằng **ô tích**; mã lô in TO ngay trên ô tích, nút chỉ sáng sau khi tích | `Index`, `Script`, `04_Api` |
| A3 | Máy chủ nhận **cả hai kiểu xác nhận** — cờ `XAC_NHAN` (app 1.6) và mã lô gõ tay (app 1.5 còn đang mở) | `01_Util` (`xacNhanDung_`), `04_Api` |
| A4 | Bảng tổng hợp thêm **5 cột**: `KL vào`, `% L1`, `% L2`, `% L3`, `% Bụi + hao hụt` | `Script`, `Style` |
| A5 | **Tô xanh lá** dòng lô đang chạy (nền nhạt + vạch đậm cột đầu, để chữ đen còn đọc được ngoài xưởng) | `Script`, `Style` |
| A6 | **Bộ lọc ngày** 7 / 30 / 90 / Tất cả, mặc định 30 | `Index`, `Script`, `Style` |
| A7 | Đổi cách gọi **"hao hụt" → "Bụi + hao hụt"** trên toàn bộ nhãn màn hình và câu cảnh báo máy chủ | `05_Report`, `Index`, `Script` |

### Ba quyết định cần biết trước khi đọc mã

1. **Ô tích YẾU HƠN gõ lại mã lô** — nó chống được bấm nhầm một nhịp, nhưng không chống
   được *đóng nhầm đúng lô bên cạnh*. Bù lại bằng: mã lô in to, số bao/số kg hiện sẵn,
   nút chỉ sáng sau khi tích. Andy biết và chấp nhận đánh đổi này (22/08/2026).
2. **`xacNhanDung_` cố ý nhận cả mã lô gõ tay.** Bỏ đi thì công nhân chưa kịp đóng-mở lại
   app sẽ không đóng được lô — bản 1.5 đã gây ra đúng sự cố này một lần.
   `apiChotCa` còn nhân nhượng thêm một bước: **thiếu hẳn tham số** thì vẫn cho qua, vì
   app 1.5 không hề gửi. Gửi lên mà sai mới chặn.
3. **Bộ lọc ngày KHÔNG bao giờ giấu lô đang chạy** (`tinhTongHopLo_`). Lô chạy dài ngày
   chính là lô dễ quên nhất; lọc cả chúng thì bộ lọc hoá ra giấu mất đúng thứ cần thấy.

### Tên trường GIỮ NGUYÊN

`ti_le_hao_hut` trong mã và tiêu đề cột trên sheet `TONG_HOP_LO` **không đổi** — chỉ đổi
chữ hiện trên màn hình. Đổi tiêu đề sheet sẽ làm hỏng mọi công thức Excel đang trỏ vào nó.

### Kiểm thử

**314 đạt / 0 lỗi** (thêm 25 ca ở mục 26 của `9_KIEMTHU_LOGIC.js.txt`). Viết kiểm thử
TRƯỚC, chạy thấy 11 ca đỏ rồi mới sửa mã.

Ca được canh kỹ nhất không phải đường mới mà là **đường cũ**: *"app bản 1.5 gõ mã lô vẫn
đóng được"* và *"app bản 1.5 không gửi cờ vẫn chốt ca được"*.

### Thử tay trên bản mô phỏng — đã làm

`python3 cong_cu/tao_mo_phong.py` rồi mở qua `http://`. Dữ liệu mẫu nay có thêm
**tài khoản quản lý (PIN 1234)** và **2 lô cũ từ tháng 6** để bộ lọc ngày có gì mà lọc.

| Thử gì | Kết quả |
|---|---|
| Bảng quản lý đủ 19 cột, 4 tỉ lệ cộng lại đúng 100% | ✅ |
| Lọc "30 ngày": lô cũ **đã đóng** biến mất, lô cũ **đang chạy** còn nguyên | ✅ |
| Lô đang chạy tô xanh lá, lô đã đóng nền trắng | ✅ |
| Bấm CHỐT CA khi **chưa tích** → không có gì xảy ra | ✅ |
| Tích rồi chốt → khoá đúng 3 bao, 70 kg | ✅ |
| Hộp đóng lô hiện *"bụi + hao hụt 93.00%"* | ✅ |
| Tích rồi đóng lô → lô rời khỏi danh sách đang chạy | ✅ |
| Câu cảnh báo: *"Bụi + hao hụt 52.5% — CAO bất thường"* | ✅ |

### Dán lên Google

Dán lại **6 file**: `01_Util.gs`, `04_Api.gs`, `05_Report.gs`, `Index.html`, `Script.html`,
`Style.html`. Giữ nguyên: `00_Config`, `02_Setup`, `03_Auth`, `06_WebApp`, `appsscript.json`.

**KHÔNG cần chạy lại menu tạo cấu trúc sheet** — đợt A không thêm cột nào.
Vẫn phải **Deploy → New version**, và công nhân **đóng hẳn app rồi mở lại**
(app cũ vẫn chạy được nhờ mục A3, nhưng sẽ còn hiện ô gõ mã lô kiểu cũ).

---

## 1f. BẢN 1.6 — ĐỢT B (làm ngày 22/08/2026)

Yêu cầu 4 của Andy: bỏ hẳn màn hình *"Xem trước kết quả chạy máy"*, đưa bảng tỉ lệ và
nút **ĐÓNG LÔ** về ngay màn hình nhập liệu, thêm dòng **"Bụi + hao hụt"** dưới ba loại.

### Đã làm gì

| # | Việc | File |
|---|---|---|
| B1 | `apiMoLo` trả kèm gói `ket_qua` — **0 ô đọc thêm** (xem giải thích bên dưới) | `04_Api` |
| B2 | Tách `ketQuaTuBao_()` khỏi `ketQuaLo_()` để hai đường dùng chung một phép tính | `04_Api` |
| B3 | `ketQuaLo_` đọc **chọn cột** (5/13 cột) thay vì cả bảng | `04_Api` |
| B4 | Màn hình nhập liệu nhận thêm: ô khối lượng đầu vào, bảng tỉ lệ, dòng *Bụi + hao hụt*, nút **ĐÓNG LÔ** | `Index`, `Script`, `Style` |
| B5 | **Xoá hẳn** màn hình `mhKetQua` và 3 hàm `moKetQua` / `veNhapBao` / `taiKetQua` | `Index`, `Script` |
| B6 | `capNhatKetQuaTaiCho()` — tính lại tỉ lệ **ngay trên máy** sau khi lưu một mẻ bao | `Script` |
| B7 | Khay lỗi / hàng đợi: từ **chặn không cho xem** → **dải cảnh báo trên bảng** | `Script` |

### Vì sao `ket_qua` đi kèm `apiMoLo` là miễn phí

`apiMoLo` **vốn đã** duyệt qua mọi bao của lô để dựng danh sách hiển thị. Cộng dồn số
bao / khối lượng theo loại ngay trong vòng lặp đó không tốn thêm ô đọc nào. Trước 1.6,
muốn xem tỉ lệ phải sang màn hình riêng và gọi `apiXemTruocKetQua` — tức **quét lại
toàn bộ sheet BAO thêm một lượt**. Đợt B vừa gộp màn hình vừa bỏ được lượt quét đó.

### Chỗ nguy hiểm nhất của đợt này

Lưu một mẻ bao **cố ý chỉ tốn đúng 1 lượt mạng**: máy tự chèn bao vừa lưu vào danh sách
thay vì tải lại cả lô. Bảng tỉ lệ nằm ngay trên màn hình đó, nên nếu hỏi máy chủ để cập
nhật tỉ lệ là ném đi chính cái lợi ấy — mà đường lấy tỉ lệ lại là đường quét cả sheet.

→ `capNhatKetQuaTaiCho()` **tính lại ngay trên máy** từ `S.dsBao`.

**Cái giá:** công thức tỉ lệ và câu cảnh báo giờ tồn tại ở **hai nơi, hai ngôn ngữ** —
`tinhTiLe_` / `canhBaoHaoHut_` trong `05_Report.gs`, và `capNhatKetQuaTaiCho` /
`canhBaoBuiHaoHut` trong `Script.html`. **Sửa một bên phải sửa cả bên kia**, nếu không
hai chỗ sẽ nói hai con số khác nhau — loại lỗi công nhân không bao giờ báo.
Đã đối chiếu tay: số máy tính ra **khớp từng trường** với số máy chủ tính (xem bảng thử).

### Kiểm thử

**328 đạt / 0 lỗi** (thêm 14 ca ở mục 27). Ca quan trọng nhất:
*"ket_qua của apiMoLo GIỐNG HỆT apiXemTruocKetQua"* — hai đường tính ra hai con số khác
nhau là kiểu lỗi làm công nhân mất tin vào cả hai màn hình.

### Thử tay trên bản mô phỏng — đã làm

| Thử gì | Kết quả |
|---|---|
| Mở lô: bảng tỉ lệ hiện ngay, 4 con số cộng lại đúng 100% | ✅ |
| Lưu 1 bao 150 kg → A1 nhảy 20→170 kg, 2%→17%, bụi+hao hụt 93%→78% **không gọi mạng thêm** | ✅ |
| Tải lại lô từ máy chủ → **không lệch một trường nào** so với số máy vừa tự tính | ✅ |
| Lô chưa cân đầu vào: tỉ lệ hiện `—`, không hiện `0.00%`, không có cảnh báo giả | ✅ |
| Có bao trong hàng đợi → dải vàng *"Còn 1 bao chưa gửi lên máy chủ — tỉ lệ bên dưới CHƯA tính phần này"* | ✅ |
| Dòng *Bụi + hao hụt* đổi màu cam khi lệch khoảng thường gặp | ✅ |

### Dán lên Google

Cộng dồn cả đợt A + B, dán lại **6 file**: `01_Util.gs`, `04_Api.gs`, `05_Report.gs`,
`Index.html`, `Script.html`, `Style.html`. Vẫn **không cần** chạy lại menu tạo cấu trúc
sheet (chưa thêm cột nào — cột mới bắt đầu từ đợt C và D).

⚠️ Đợt B **đổi dữ liệu `apiMoLo` trả về**, nên công nhân **bắt buộc đóng hẳn app rồi mở
lại**. App cũ vẫn chạy được (nó chỉ không thấy bảng tỉ lệ ở màn hình nhập).

---

## 1g. BẢN 1.6 — ĐỢT C (làm ngày 22/08/2026)

Yêu cầu 2 (công nhân xem lại lô đã đóng **của mình**) và yêu cầu 6 (quản lý sửa/xoá lô
đã chốt ca, đã đóng). Đây là đợt **rủi ro nhất** của bản 1.6: nó tháo đúng lời hứa gốc
*"chốt ca là khoá vĩnh viễn"*.

### Cấu trúc dữ liệu đổi — BẮT BUỘC chạy lại menu tạo cấu trúc sheet

Sheet `LO` có **cột thứ 13 mới: `ds_nguoi_nhap`** — mã nhân viên của mọi người đã nhập
bao vào lô, dạng `CN01,CN03`.

Vì sao phải có: công nhân chỉ được xem lô **chính mình có nhập bao**. Lọc điều đó từ
sheet `BAO` là đọc **2,25 triệu ô cho một màn hình** — đúng thứ bản 1.5 bỏ công gỡ.
Cột `nguoi_mo` không thay được: ca sau nhập vào lô ca trước tạo là chuyện thường.

Ba cột `so_bao_ra` / `kl_ra` / `ds_nguoi_nhap` nằm **liền nhau**, nên `congDonLo_` vẫn
chỉ tốn 1 lượt đọc + 1 lượt ghi như bản 1.5 — thêm cột thứ ba **không tốn thêm lượt gọi
Google nào**. Dữ liệu cũ điền lại bằng menu ⚙️ → *"Dựng lại bảng đếm & chỉ số"*.

### Máy chủ

| # | Việc | Hàm |
|---|---|---|
| C1 | Cột `ds_nguoi_nhap` + ghi lúc lưu bao + dựng lại được | `congDonLo_`, `themVaoDsNguoi_`, `dungLaiSoBaoLo_` |
| C2 | Danh sách lô đã đóng, lọc theo vai | `apiLoDaDong` (mới) |
| C3 | Tách luật thường khỏi cửa miễn trừ của quản lý | `lyDoKhongSuaDuoc_` + `kiemTraQuyenSua_` |
| C4 | Bắt lý do cho mọi thao tác vượt quyền | `batLyDo_` (mới) |
| C5 | Quản lý sửa / xoá **bao đã chốt** | `apiSuaBao`, `apiXoaBao` (thêm tham số `lyDo`) |
| C6 | Sửa **số bao vào / khối lượng vào / ghi chú** | `apiSuaLo` (mới) |
| C7 | Sửa **mã lô đã đóng** | `apiSuaMaLo` (thêm `lyDo`) |
| C8 | **Mở lại lô** | `apiMoLaiLo` (mới) |
| C9 | **Xoá lô đã đóng** — vẫn giữ bước gõ lại mã lô | `apiXoaLo` (thêm `lyDo`) |
| C10 | `apiMoLo` trả `la_quan_ly`, và `sua_duoc = true` cho mọi bao khi là quản lý | `apiMoLo` |
| C11 | Bảng tổng hợp cập nhật NGAY sau mỗi lần quản lý sửa, không đợi nhịp 15 phút | 5 hàm |

### Bốn quyết định cần biết trước khi đọc mã

1. **Lý do là bắt buộc, tối thiểu 3 ký tự, và chỉ bắt khi VƯỢT QUYỀN.** Quản lý sửa lô
   đang chạy của chính mình thì không phải gõ — đó là thao tác thường. Máy chủ tự phân
   biệt bằng `lyDoKhongSuaDuoc_`, giao diện không quyết định việc này.
2. **Nhật ký tách hành động riêng `QL_*`** (`QL_SUA_BAO`, `QL_XOA_BAO`, `QL_SUA_LO`,
   `QL_SUA_MA_LO`, `QL_MO_LAI_LO`) kèm nguyên văn lý do. Đây là **chốt chặn duy nhất
   còn lại** sau khi tháo khoá — đừng gộp lại với hành động thường.
3. **Mở lại lô KHÔNG mở khoá các bao đã chốt.** Mở lô chỉ để nhập tiếp. Muốn sửa một bao
   cũ thì sửa thẳng bao đó, và lần đó có lý do riêng trong nhật ký. Mở toang cả lô để
   sửa một bao là bỏ khoá của tất cả những người khác nữa.
4. **Xoá lô vẫn phải GÕ LẠI MÃ LÔ**, không đổi sang ô tích như đóng lô / chốt ca —
   đây là thao tác duy nhất không hoàn tác được.

### Giao diện

Hai màn hình mới: **`mhLoDaDong`** (danh sách) và **`mhChiTietLo`** (chi tiết lô).

`mhChiTietLo` **cố ý tách khỏi màn hình nhập liệu** dù cả hai đọc cùng một gói dữ liệu
`apiMoLo`: màn hình nhập có LƯU BAO / CHỐT CA / ĐÓNG LÔ, chỉ cần một lỗi ẩn nút là công
nhân bấm nhầm vào lô đã khoá. Nhờ dùng chung `S.lo` / `S.dsBao`, **mọi hộp thoại cũ
(sửa bao, sửa mã lô, xoá lô) chạy được ở cả hai màn hình mà không phải viết lại**.

Hai đường vào: nút **📁 Lô đã đóng** ở màn hình chọn lô, và **bấm thẳng vào một dòng của
bảng Tổng hợp theo lô** — đường Andy chốt cho quyền quản lý.

Ô lý do (viền cam) **chỉ hiện với quản lý**; công nhân không bao giờ thấy.

### Kiểm thử

**385 đạt / 0 lỗi** (thêm 57 ca ở mục 28). Mỗi cửa miễn trừ đều có **một ca ĐỐI CHỨNG**
khẳng định công nhân thường vẫn bị chặn.

⚠️ **Một ca kiểm thử CŨ đã bị viết lại, không phải bị bỏ:** mục 16.7 trước đây khẳng
định *"quản lý cũng KHÔNG xoá được lô đã đóng"* — đó là luật của bản 1.4/1.5, và đợt C
đổi luật đó theo yêu cầu Andy. Ca mới khẳng định luật mới, kèm chú thích ngay tại chỗ.

### Thử tay trên bản mô phỏng — đã làm

| Thử gì | Kết quả |
|---|---|
| Quản lý mở lô đã đóng: mọi bao có nút ✎, khu quyền quản lý hiện ra | ✅ |
| Sửa bao đã chốt **không ghi lý do** → máy chủ chặn, hộp thoại vẫn mở | ✅ |
| Sửa bao đã chốt **có lý do** → 150→160 kg, bụi+hao hụt 30%→29%, nhật ký `QL_SUA_BAO` kèm nguyên văn lý do | ✅ |
| Sửa thông tin lô: 50→55 bao vào, `1.500` → 1500 kg, ghi chú đổi, tỉ lệ tính lại | ✅ |
| Mở lại lô: nút tắt cho tới khi tích ô; thiếu lý do bị chặn; xong thì lô về ĐANG CHẠY, **bao vẫn 🔒** | ✅ |
| Xoá lô đã đóng: bắt gõ đúng mã **và** lý do; xoá xong lô + 3 bao biến mất, nhật ký chụp lại số liệu | ✅ |
| **Công nhân** mở lô đã đóng: dải *"🔒 chỉ xem lại, không sửa được"*, 0 nút ✎, không có khu quản lý | ✅ |
| **Công nhân** chỉ thấy lô mình có nhập bao (*"Chỉ hiện những lô bạn có nhập bao"*) | ✅ |
| Bấm dòng bảng Tổng hợp → mở đúng chi tiết lô, Quay lại về đúng bảng | ✅ |

### Dán lên Google (cộng dồn A + B + C)

Dán lại đúng **7 file**:

| Dán lại | Giữ nguyên |
|---|---|
| `00_Config.gs` · `01_Util.gs` · `04_Api.gs` · `05_Report.gs` | `02_Setup.gs` · `03_Auth.gs` · `06_WebApp.gs` |
| `Index.html` · `Script.html` · `Style.html` | `appsscript.json` |

1. Dán 7 file → 💾 Save.
2. **BẮT BUỘC chạy menu ⚙️ → "1. Tạo / kiểm tra cấu trúc sheet"** — đợt C thêm cột
   `ds_nguoi_nhap`. Bỏ qua bước này thì màn hình "Lô đã đóng" của công nhân **trống trơn**
   (không lô nào có tên họ), trông y như lỗi sản phẩm.
3. `tuKiemTra` → phải thấy tất cả ✅.
4. **Deploy → New version.**
5. Công nhân **đóng hẳn app rồi mở lại**.

⚠️ **Trước khi dán:** đổi mã PIN của `QL01` — từ đợt này, vai `QUAN_LY` xoá được số liệu
đã chốt, mà PIN 4 số hiện tại đã lộ trong một ảnh chụp gửi qua mạng.

---

## 1h. BẢN 1.6 — ĐỢT D (làm ngày 22/08/2026)

Yêu cầu 1: sheet `BAO` có thêm **6 cột "xem nhanh" P–U** để bôi đen dán thẳng sang Excel.

### Sáu cột đó là gì

| Cột | Tiêu đề hàng 1 | Lấy từ | Ví dụ |
|---|---|---|---|
| N, O | *(trống)* | — | khoảng cách nhìn cho dễ |
| P | `mã lô` | cột B | `T0748LA` |
| Q | `Loại` | cột D | `A1/B1` · `A2/B2` · `A3/B3` |
| R | `khối lượng` | cột F | `88` |
| S | `Số thứ tự` | ghép C + D + `-` + E | `A2-7777` |
| T | `Thời gian` | cột J, **cắt giây** | **ô ngày giờ thật**, hiện `dd/MM/yyyy HH:mm` |
| U | `Tình trạng lô` | cột H | `DANG_NHAP` / `DA_CHOT` |

**Cột Q chỉ đọc cột D**, không đổi theo ký hiệu A/B của lô — đúng như Andy chốt. Không
mất thông tin vì ký hiệu thật đã nằm trong cột S. Đã kiểm chứng: sửa mã lô `T…`→`D…`
thì P và S đổi theo (`A1-1990` → `B1-1990`) còn **Q giữ nguyên `A1/B1`**.

**Cột U mang tiêu đề "Tình trạng lô" nhưng giá trị là trạng thái của BAO** — lệch tên là
cố ý theo yêu cầu, đã báo Andy ngày 22/08. Muốn trạng thái LÔ thì đó là cột khác.

### Ba việc kỹ thuật đáng chú ý

1. **Ghi bằng mã, KHÔNG dùng `ARRAYFORMULA`.** Công thức mở đầu cột làm `getLastRow()`
   trả về đáy lưới, mà `themNhieuDong_` ghi bao mới vào `getLastRow() + 1` — bao mới sẽ
   rơi xuống cách hàng nghìn dòng trắng. Xoá dòng 2 cũng mất luôn ô neo công thức.
2. **Tiêu đề tiếng Việt tách khỏi tên cột trong mã.** `COLS` vừa là khoá đối tượng vừa là
   chữ hàng 1, mà "mã lô" thì không làm khoá được. Thêm bảng `NHAN_COT` + hàm `nhanCot_`;
   `taoCauTrucSheet` và `tuKiemTra` đều so theo NHÃN.
3. **Cột T làm ngược với cột J.** J bị ép về VĂN BẢN (để Google khỏi cắt số 0); T phải là
   ô ngày giờ thật để Excel lọc/sắp xếp được. Date dựng bằng **từng thành phần**, không
   dùng `Date.parse` — chuỗi không chuẩn ISO thì mỗi nơi hiểu một kiểu và sai đúng bằng
   múi giờ, âm thầm 7 tiếng. Kiểm thử so **từng thành phần** năm/tháng/ngày/giờ/phút.

### Sáu cột luôn đổi theo dữ liệu gốc

Bảng "sạch" mà nói dối lặng lẽ còn nguy hiểm hơn không có bảng nào. Bốn đường ghi đều
được nối vào:

| Khi nào | Cột đổi theo | Hàm |
|---|---|---|
| Lưu 1 bao / lưu cả mẻ | cả 6 | `themXemNhanh_` trong `apiLuuBao`, `apiLuuNhieuBao` |
| Sửa số bao / khối lượng | R, S | `apiSuaBao` |
| Chốt ca / đóng lô | U | `datTrangThaiBao_` |
| Sửa mã lô | P, S | `doiMaLoTrongBao_` |

### Menu mới: điền cho dữ liệu cũ

⚙️ → **"🧾 Điền 6 cột xem nhanh (P–U) cho dữ liệu cũ"**.

Chạy **theo từng mẻ 5.000 dòng và có mốc nhớ**: ở nhịp 1000 bao/ngày, sau một năm sheet
`BAO` là 250.000 dòng — đọc một phát cả bảng rồi ghi lại thì chắc chắn quá 6 phút và
Google **cắt ngang giữa chừng**, để lại nửa bảng đã điền nửa chưa mà không ai biết tới
đâu. Nay hết giờ thì lưu mốc và báo *"chạy lại menu này để điền tiếp"*. Chạy lại từ đầu
cũng cho ra đúng kết quả cũ.

`tuKiemTra` soi **200 dòng cuối** và báo đỏ nếu 6 cột lệch dữ liệu gốc, kèm đúng cách chữa.

### Hiệu năng — đo lại trên sheet 250.000 dòng

`node cong_cu/do_hieu_nang.js 250000`

| Thao tác | 1.5 (ô đọc) | 1.6 (ô đọc) | ô ghi 1.6 |
|---|---|---|---|
| Mở màn hình đầu | 32 | **33** | 0 |
| Lưu 1 bao | 86 | **88** | 7 |
| Lưu mẻ 20 bao | 86 | **88** | 427 |
| Mở 1 lô | 2.500.286 | **2.500.287** | 0 |
| Chốt ca | 4.750.431 | **4.750.432** | 65 |

**Đọc gần như không đổi** dù sheet dài thêm 8 cột — nhờ bổ sung `chiCot` cho cả 6 đường
quét cả sheet (`COT_GOC_BAO`, `COT_TOI_TG_NHAP`, `COT_TOI_NGUOI_NHAP`, `COT_TOI_STT`
trong `00_Config.gs`). Bỏ bước này thì 5 con số trên **tăng 60%**.

Ghi tăng đúng như thiết kế: mỗi dòng bao rộng 21 cột thay vì 13, và chốt ca ghi thêm
cột U. Cột "ô ghi" của bản 1.5 chưa từng được đo nên bảng trên **không so được** —
tính ra thì mẻ 20 bao là 267 ô (20×13+7) lên 427 ô (20×21+7). Đều là số nhỏ.

### Kiểm thử

**431 đạt / 0 lỗi** (thêm 46 ca ở mục 29).

**Bộ giả lập cũng phải siết theo** — trước đợt D nó thiếu `setNumberFormat` và
`getMaxRows`, nên cả khối định dạng cột trong `02_Setup.gs` (nằm trong `try/catch`) ném
lỗi rồi **bị nuốt: kiểm thử chưa từng chạy qua nó lấy một lần**. Nay có cả hai, cộng
`deleteProperty`. Hàng tiêu đề trong bộ giả lập và trong bản mô phỏng cũng dựng bằng
`nhanCot_` cho giống hệt Google.

### Dán lên Google — CẢ BẢN 1.6 (A + B + C + D)

Dán lại **9 file**:

| Dán lại | Giữ nguyên |
|---|---|
| `00_Config.gs` · `01_Util.gs` · `02_Setup.gs` · `04_Api.gs` · `05_Report.gs` · `06_WebApp.gs` | `03_Auth.gs` |
| `Index.html` · `Script.html` · `Style.html` | `appsscript.json` |

1. Dán 9 file → 💾 Save.
2. **BẮT BUỘC chạy menu ⚙️ → "1. Tạo / kiểm tra cấu trúc sheet"**
   (thêm cột `ds_nguoi_nhap` ở sheet LO và 8 cột ở sheet BAO, đặt định dạng cột Thời gian).
3. **Chạy menu ⚙️ → "🧾 Điền 6 cột xem nhanh (P–U) cho dữ liệu cũ"** — bao đã nhập trước
   khi nâng cấp sẽ trống 6 cột này cho tới khi chạy.
4. Chạy `tuKiemTra` → phải thấy **tất cả ✅**.
5. **Deploy → New version.**
6. Công nhân **đóng hẳn app rồi mở lại**.
7. *(Nên làm)* Trên sheet `BAO`, **xoá các cột thừa từ V trở đi**. Google giới hạn ~10
   triệu ô mỗi bảng tính; 250.000 dòng × 26 cột ≈ 6,5 triệu ô, cắt về 21 cột còn ≈ 5,25 triệu.

⚠️ **Trước khi dán: đổi mã PIN của `QL01`** — bản 1.6 cho vai `QUAN_LY` xoá được số liệu
đã chốt, mà PIN 4 số hiện tại đã lộ trong một ảnh chụp gửi qua mạng.

---

## 1k. BẢN 1.7 — GÓI 2: LUẬT NHẬP LIỆU (làm ngày 25/08/2026)

Hai ý tưởng 4.1 và 4.2 của Andy. Khác Gói 1 ở chỗ đây là **luật ở máy chủ**, nên làm
theo đúng lối cũ: **viết kiểm thử trước, chạy thấy đỏ, rồi mới sửa mã**.

### 4.1 — Mã lô luôn 7 ký tự

`[T hoặc D] + 4 chữ số + 2 chữ cái`. Người nhập được gõ tắt, máy điền nốt:

| Gõ | Máy ghi | |
|---|---|---|
| `T0753LA` | `T0753LA` | đủ thì giữ nguyên |
| `T753` | `T0753LA` | thiếu số → thêm `0` ở đầu · thiếu 2 chữ → thêm `LA` |
| `T753HC` | `T0753HC` | **có gõ 2 chữ cuối thì GIỮ NGUYÊN chữ đó** |
| `T77`, `X0753LA`, `T0753L2` | ✕ | sai khuôn → từ chối, bắt sửa. **Không đoán** |

Hậu tố `LA` nằm ở `CAU_HINH` → **`MA_LO_HAU_TO`**, đổi được không cần dán code.
`cfg()` nạp mặc định từ `CAU_HINH_MAC_DINH` trước rồi mới ghi đè bằng sheet, nên
**sheet cũ thiếu dòng này vẫn chạy đúng** — không phải chạy menu tạo cấu trúc.

⚠️ **`chuanMaLo7_` CHỈ dùng ở đường GHI** (`apiTaoLo`, `apiSuaMaLo`). Tuyệt đối không
dùng để TRA CỨU lô: dữ liệu cũ có thể mang mã không đúng khuôn này, chuẩn hoá lúc tra
cứu là tra trượt. Lô cũ vẫn mở/nhập/đóng bình thường; chỉ khi quản lý **sửa** mã lô
thì mã mới mới phải theo khuôn.

Áp cho **cả hai** đường ghi là cố ý — chỉ áp một bên thì cùng một sheet sẽ có hai kiểu mã.

### 4.2 — Số cuối thành thập phân

| Người gõ | Máy ghi | |
|---|---|---|
| `49,8` · `49.8` | 49.8 | có dấu → giữ nguyên |
| `498` | 49.8 | không dấu, ≥ 100 → số cuối thành thập phân |
| `1508` | 150.8 | |
| `99` | 99 | < 100 → giữ nguyên |
| **`150`** | **15** | ← xem cảnh báo bên dưới |

🔴 **CẢNH BÁO ĐÃ NÊU, ANDY ĐÃ QUYẾT — đừng tự sửa lại ở phiên sau.**
Bao thật nặng tới 200 kg (chính Andy xác nhận 21/08). Với luật này, bao 150 kg gõ
`150` sẽ được ghi **15 kg** — mà 15 là con số hợp lý nên **không lưới an toàn nào bắt
được**, và nó sai đúng 10 lần ở tử số của tỉ lệ thu hồi. Tôi đã nêu rủi ro này **hai
lần** và đề xuất phương án chỉ tự sửa số vượt ngoài khoảng 1–200. **Andy tái khẳng
định ngày 25/08/2026: làm đúng nguyên văn, ngưỡng 100.** Hàng rào duy nhất là **hướng
dẫn người vận hành gõ `150,0`** cho bao từ 100 kg trở lên.

**Ba việc đã làm để giảm rủi ro** (Andy không yêu cầu, tôi thêm):
1. Dòng **"✓ Máy hiểu: … kg"** màu xanh hiện ngay dưới ô kg, **chỉ khi máy ĐỔI số vừa
   gõ**. Gõ `49,8` thì im lặng; gõ `150` thì nói ra. Im lặng khi không có gì đổi là cố
   ý — cảnh báo hiện suốt thì người ta thôi nhìn nó.
2. Tờ `3_HUONG_DAN_CONG_NHAN.md` có mục mới in đậm: *"bao từ 100 kg trở lên phải gõ có
   dấu phẩy"*.
3. Luật **không nới khoảng cho phép**: đọc xong vẫn phải nằm trong `KL_MIN`–`KL_MAX`.
   `2005` đọc ra 200.5 kg và **vẫn bị chặn** vì vượt 200.

### Chỗ nguy hiểm nhất của gói này

**Luật chỉ được áp ĐÚNG MỘT LẦN.** Điện thoại đọc chuỗi rồi gửi lên **một con số**;
nếu máy chủ đọc lại lần nữa thì 150 kg thành 1,5 kg. Vì vậy `klBaoTu_` **nhận số thì
trả nguyên số đó**, chỉ áp luật cho chuỗi — đúng lối `soTu_` vẫn làm. Có ca kiểm thử
riêng canh đúng chuyện này.

Và `soTu_` **không được đụng tới**: nó còn dùng cho **số bao**, mà bao số 150 thì phải
là 150. Có ca kiểm thử canh cả điều đó.

### Kiểm thử

**482 đạt / 0 lỗi** (thêm 51 ca ở mục 30). Viết kiểm thử TRƯỚC — lần chạy đầu đỏ vì
`chuanMaLo7_` chưa tồn tại.

Một ca đỏ trong lúc làm là **kiểm thử của tôi sai, không phải mã sai**: tôi viết
`"2005" → 200.5 kg` qua `apiSuaBao`, quên rằng 200.5 vượt `KL_MAX = 200`. Đã đổi ca đó
sang `1508 → 150.8` và **thêm một ca mới** khẳng định `2005` vẫn bị chặn.

### Thử tay trên bản mô phỏng — đã làm

| Thử gì | Kết quả |
|---|---|
| Xem trước mã lô: `T753`, `T0753`, `T753HC`, `t753hc`, `D753` → hiện mã đầy đủ đúng | ✅ |
| `T77` → chữ đỏ *"phải là 7 ký tự…"* kèm ví dụ | ✅ |
| Tạo lô bằng cách gõ `T753` → lô lưu thành **T0753LA**, ký hiệu A | ✅ |
| Xem trước khi **sửa** mã lô, `D760` vẫn kèm cảnh báo *"ĐỔI từ A sang B"* | ✅ |
| Gõ `498` → dòng xanh *"✓ Máy hiểu: 49.8 kg"*; lưu ra đúng 49.8 kg | ✅ |
| Gõ `49,8` / `49.8` / `99` → **không hiện dòng nào** (máy không đổi gì) | ✅ |
| Gõ `150` → *"✓ Máy hiểu: 15 kg"* — đúng luật Andy chốt | ✅ |
| Sửa bao: `1508` → 150.8 kg | ✅ |

### Dán lên Google

Cộng cả Gói 1 + Gói 2, dán lại **6 file**: `00_Config.gs`, `01_Util.gs`, `02_Setup.gs`,
`04_Api.gs`, `Index.html`, `Script.html`, `Style.html`.
**Không cần** chạy menu tạo cấu trúc sheet. Vẫn phải **Deploy → New version**.

**Và in lại tờ hướng dẫn dán tại máy** — đây là hàng rào duy nhất cho luật 4.2.

---

## 1j. BẢN 1.7 — GÓI 1: GIAO DIỆN (làm ngày 25/08/2026)

Ba ý tưởng Andy đưa ngày 25/08 sau khi bản 1.6 đã chạy thật ổn định. Gộp một gói vì
cả ba **chỉ đụng giao diện** — không thêm cột, không thêm sheet, không đổi luật máy chủ.

### Đã làm gì

| # | Việc | File |
|---|---|---|
| G1 | **"Công nhân" → "Vận hành máy"** trên mọi chữ hiện ra màn hình + 4 file tài liệu | `Script`, `Index`, `02_Setup`, `04_Api`, 4 file `.md` |
| G2 | **Ẩn chi tiết từng loại** với người vận hành: chỉ còn *Tổng bao ra · Tổng khối lượng ra · Bụi + hao hụt*. Thống kê / Quản lý vẫn thấy bảng đầy đủ | `Script`, `Style` |
| G3 | **Danh sách bao gom theo CA**, trong mỗi ca thì bao cùng loại nằm liền nhau | `Script`, `Style` |
| G4 | **Tô sáng mẻ bao vừa lưu** — bù cho việc bao mới không còn nằm ở đầu danh sách | `Script`, `Style` |

### Ba quyết định cần biết trước khi đọc mã

1. **Mã vai trò `CONG_NHAN` trong sheet `NGUOI_DUNG` GIỮ NGUYÊN.** Chỉ đổi chữ hiển thị
   (Andy chọn phương án 1A). Đó là *giá trị dữ liệu*, không phải chữ cho người đọc; đổi nó
   phải sửa mọi dòng trong sheet, mà `chuanVaiTro_` lại âm thầm hạ mọi giá trị lạ về quyền
   thấp nhất — đổi nửa vời sẽ không báo lỗi gì cả. Đổi được cũng chẳng lợi: không ai nhìn
   thấy chữ đó. **Đừng "dọn nốt" chỗ này ở phiên sau.**

2. **`xemChiTietLoai()` KHÔNG phải một chốt chặn quyền.** Nó chỉ bớt phân tâm. Mỗi dòng bao
   trên màn hình vẫn ghi rõ loại của nó, ai cộng lại cũng ra. Muốn giấu thật thì phải cắt
   ở máy chủ — mà chính máy chủ đang cần số liệu đó để tính tổng, nên cắt cũng vô nghĩa.
   Hàm dùng **danh sách trắng** giống nút "Xem tổng hợp": gõ sai cột `vai_tro` thì rơi về
   mức thấy **ít** hơn, không phải nhiều hơn.

3. **Khoá gom ca là cặp (`phien`, `trang_thai`) — KHÔNG có mã ca thật.** Hệ thống không hề
   ghi "lần chốt ca thứ mấy" lên từng bao: `apiChotCa` chỉ đặt `trang_thai = DA_CHOT`
   (xem `datTrangThaiBao_`). Cặp này tách đúng trong mọi tình huống thật — người khác nhập,
   lần đăng nhập khác, và **chốt ca xong nhập tiếp trong cùng lần đăng nhập** (đã bấm tay
   xác nhận). Chỗ duy nhất gộp nhầm: **chốt ca hai lần trong cùng một lần đăng nhập, cùng
   một lô**. Xem nợ số 9 ở mục 1a.

### ⚠️ Chỗ nguy hiểm nhất của gói này

`htmlDongBao(b, i)` nhận **vị trí trong `S.dsBao`**, và nút ✎ dùng đúng số đó để biết sửa
bao nào. Gom nhóm rồi **đánh số lại theo thứ tự hiển thị là sửa nhầm bao** — mà nhầm ở đây
thì không có gì báo cho biết. Nên `htmlDsBaoTheoCa` gánh theo cặp `{b, i}` với `i` là vị trí
GỐC. Đã bấm tay kiểm chứng cả 4 chỉ số (xem bảng thử bên dưới).

### Kiểm thử

**431 đạt / 0 lỗi — KHÔNG THÊM CA NÀO.** Nói thẳng: bộ kiểm thử **không canh được gì**
cho gói này, vì cả 431 ca đều là phía máy chủ còn gói này thuần giao diện. Đây đúng là
**nợ kỹ thuật số 1**. Bằng chứng duy nhất là bấm tay ở bảng dưới.

Ca duy nhất chạm tới máy chủ là chữ trong nhật ký `BAO_LOI_BO` (`04_Api.gs`) — không ca
kiểm thử nào so chuỗi đó nên vẫn xanh.

### Thử tay trên bản mô phỏng — đã làm

| Thử gì | Kết quả |
|---|---|
| Màn hình chọn tên hiện *"CN01 · Vận hành máy"* | ✅ |
| Người vận hành: bảng kết quả chỉ còn 3 dòng (bao ra · kg ra · bụi + hao hụt) | ✅ |
| **Quản lý** mở cùng lô đó: bảng đầy đủ 4 loại + tỉ lệ thu hồi | ✅ đối chứng |
| **Thống kê** mở cùng lô đó: bảng đầy đủ | ✅ đối chứng |
| Nhập đan xen loại 1 → 2 → 1 → 3, hiển thị gom thành A1, A1, A2, A3 | ✅ |
| **Nút ✎ mở đúng bao** dù chỉ số hiển thị là 3, 1, 2, 0 | ✅ kiểm cả 4 |
| Chốt ca rồi nhập tiếp **trong cùng lần đăng nhập** → tách thành 2 khối | ✅ |
| Khối cũ (lần đăng nhập khác) vẫn là khối riêng thứ 3 | ✅ |
| Bao vừa lưu được tô nền xanh nhạt, tìm thấy ngay trong danh sách đã xếp lại | ✅ |
| Màn hình **chi tiết lô** cũng gom theo ca (dùng chung hàm) | ✅ |

Một lỗi hiển thị nhỏ đã sửa trong lúc thử: dấu cách sau 🔒 / ▶ bị **flex nuốt mất**
(khoảng trắng đầu/cuối của text node trong flex container bị cắt) → đổi sang `&nbsp;`.

### Dán lên Google

Dán lại **5 file**: `02_Setup.gs`, `04_Api.gs`, `Index.html`, `Script.html`, `Style.html`.
**Không cần** chạy menu tạo cấu trúc sheet. Vẫn phải **Deploy → New version**, và người
vận hành **đóng hẳn app rồi mở lại**.

---

## 1i. BẢN 1.6.1 — lỗi `apiSuaBao` làm hỏng số liệu (sửa ngày 25/08/2026)

Lỗi này **do chính đợt C sinh ra**, chỉ lộ ra sau khi bản 1.6 đã coi như xong.
Ghi lại đây vì hai phiên làm việc ngày 25/08 sửa mã mà **không cập nhật file này** —
đọc `TIEN_DO.md` thôi thì không ai biết lỗi từng tồn tại.

### Lỗi là gì

Trước bản 1.6, hàm `lyDoKhongSuaDuoc_` có chốt chặn `!lo` chặn **tất cả mọi người**, nên
chỗ hỏng không ai với tới được. Đợt C mở cửa miễn trừ: `kiemTraQuyenSua_` trả về `null`
(cho qua) với **mọi** `QUAN_LY`. Khi bao đó là **bao mồ côi** — `ma_lo` không còn dòng nào
bên sheet `LO` — thì `lo === null`, và `congDonLo_(lo._row, …)` ném lỗi.

**Hậu quả nặng hơn vẻ ngoài:** `suaDong_` đã ghi bao xong **trước đó**. Lỗi ném ra ở giữa
chừng để lại một sửa đổi **nửa vời**:

- khối lượng / số thứ tự của bao **đã đổi**, `nangChiSo_` **đã tăng**;
- `kl_ra` / `so_bao_ra` của lô **không được chỉnh**;
- `ghiLog_` **không bao giờ chạy** → **không có một dòng nhật ký nào**.

Quản lý chỉ thấy chữ "LỖI" chung chung, tưởng là chưa sửa được gì.

### Cách sửa

`congDonLo_(lo ? lo._row : 0, …)` — đúng khuôn `apiXoaBao` vẫn dùng, vì bản thân
`congDonLo_` đã có sẵn `if (!soDongLo) return`. Không có lô thì không có cột đếm nào để
cộng, nhưng bao thì đã ghi xong — bỏ qua im lặng đúng hơn là ném lỗi.

Đã soát thêm: `kiemTraQuyenLo_` chặn `!lo` **trước** cửa miễn trừ, nên các API mức lô
(`apiSuaLo`, `apiMoLaiLo`, `apiXoaLo`…) **không dính lỗi cùng kiểu**.

### ⚠️ Chưa có kiểm thử canh — nợ số 8 ở mục 1a

Trái hẳn lối làm của cả bản 1.6 (viết kiểm thử trước, thấy đỏ rồi mới sửa mã). Ca cần
viết: dựng một bao có `ma_lo` không tồn tại bên `LO`, cho `QUAN_LY` sửa khối lượng, rồi
khẳng định (a) **không ném lỗi**, (b) nhật ký `QL_SUA_BAO` **có chạy**, (c) bảng `CHI_SO`
và cột đếm của lô không bị bỏ lại nửa vời.

**File đã đổi:** `04_Api.gs` — 1 dòng, quanh dòng 851. **Mốc git:** `v1.6.1` (`6463173`).

---

## 1d. Thử tay giao diện bản 1.5 — đã làm ngày 22/08/2026

Chạy trên `mo_phong.html` (giao diện thật + logic máy chủ thật), khổ màn hình điện thoại.
**12 luồng, không luồng nào lỗi.** Đây là việc bản 1.5 còn thiếu trước ngày 22/08.

| # | Thử gì | Kết quả |
|---|---|---|
| 1 | Đăng nhập PIN, vé giữ qua lần đóng/mở app | ✅ |
| 2 | Gõ khối lượng đầu vào `1.000` (mục #4) | ✅ hiện *"✓ Máy hiểu: 1.000 kg"*, lưu đúng 1000 kg |
| 3 | Ký hiệu tự suy từ mã lô (`T…` → A) | ✅ |
| 4 | Lưu bao **150 kg** | ✅ lưu được — `KL_MAX = 200` đã ăn |
| 5 | Lưu bao **250 kg** | ✅ chặn: *"250 kg ngoài khoảng 1–200 kg"* |
| 6 | Khối lượng từng bao gõ `48,5` (dấu phẩy = thập phân) | ✅ ra 48.5 kg |
| 7 | Màn hình kết quả + cảnh báo hao hụt bất thường | ✅ |
| 8 | **Đóng lô phải gõ lại mã lô** (mục #3) | ✅ gõ sai → chặn kèm mã đúng; gõ thường + thừa dấu cách → vẫn nhận |
| 9 | **Khay bao lỗi** (mục #2) — dải đỏ thường trực, sửa & Gửi lại | ✅ gửi lại thành công thì bao rời khay |
| 10 | **Khay lỗi chặn CHỐT CA** | ✅ chặn và tự mở khay |
| 11 | **Bỏ hẳn bao lỗi có ghi nhật ký** | ✅ ghi `BAO_LOI_BO` kèm tên người, lô, nhóm, STT, kg, lý do |
| 12 | Chốt ca khoá bao (✎ → 🔒) · phân vai THONG_KE thấy nút tổng hợp | ✅ |

**Thử luôn cả bước nâng cấp:** để lô có 3 bao mà hai cột đếm `so_bao_ra`/`kl_ra` còn trống
(đúng trạng thái dữ liệu 1.3/1.4 ngay sau khi dán code), danh sách lô hiện **"0 bao ra"**.
Chạy dựng lại bộ đếm → thành **"3 bao ra · 70 kg"**, khớp dữ liệu gốc.
→ **BƯỚC 4 của bản nâng cấp là bắt buộc thật, không phải khuyến nghị.**

### Hai lỗ hổng của BỘ CÔNG CỤ đã sửa trong phiên này

Cả hai nằm ở `cong_cu/_du_lieu_mau.html`, **không đụng vào mã dán lên Apps Script**.

1. **`apiGhiBaoLoi` không được nối vào bản mô phỏng.** Danh sách cầu nối `google.script.run`
   còn ở thời 1.4. Hậu quả: nút **"🗑 Bỏ bao này"** của khay lỗi luôn báo *"Mất mạng"* trên
   bản mô phỏng, dù mã thật chạy đúng — đúng loại bẫy làm phiên sau đi tìm lỗi không có thật.
   Đường ghi nhật ký `BAO_LOI_BO` vì vậy **chưa từng được thử** cho tới 22/08.
2. **Dữ liệu mẫu đẩy thẳng dòng vào sheet BAO**, không qua đường ghi thật, nên `so_bao_ra`,
   `kl_ra` và bảng `CHI_SO` đều đứng ở 0. Hai hậu quả: danh sách lô hiện "0 bao ra" trông
   như lỗi sản phẩm, và **đường nhanh chống trùng STT của bản 1.5 không được chạy thật**
   — tức là bộ mô phỏng đang DỄ hơn Google, đúng cái bẫy mục 5 đã cảnh báo.
   Nay seed gọi `dungLaiChiSo_()` + `dungLaiSoBaoLo_()` ngay sau khi nạp.

Sau khi sửa: `python3 cong_cu/tao_mo_phong.py` → danh sách lô hiện đúng **3 bao ra · 70 kg**,
`apiGhiBaoLoi` nối được, kiểm thử vẫn **289 đạt / 0 lỗi**.

### Đã đối chiếu trước khi thử

- Thư mục làm việc và `may1buong_appscript v1.5` **giống hệt nhau về mã nguồn**
  (chỉ khác `TIEN_DO.md` và 2 file PDF) → chưa ai sửa nhầm vào bản giải nén.
- `MAY1BUONG_AppsScript_v1.5.zip` **khớp từng byte** với thư mục làm việc → gói bàn giao dán lên được.
- 7 file `.gs` qua `node --check` sạch.
- `appsscript.json` để `Asia/Ho_Chi_Minh`, khớp `MUI_GIO` trong `00_Config.gs` → không dính lỗi lệch 7 tiếng.
- `00_Config.gs`: `KL_MAX = 200`, `KL_MIN = 1`, `TONG_HOP_PHUT = 15`.

---

## 1c. Nhật ký các phiên làm việc

Ghi để phiên sau biết **thứ tự nhân quả**, không phải để khoe việc đã làm.

| Ngày | Phiên làm gì | Kết quả để lại |
|---|---|---|
| 19/08 | Dựng hệ thống, chốt quy tắc nghiệp vụ | bản 1.1 · 9 lỗi đã sửa |
| 20/08 sáng | Rà soát độc lập | bản 1.2 · thêm 5 lỗi; 1.2.1 + 1.2.2 vá lỗi trang trắng |
| 20/08 trưa | 4 tính năng Andy yêu cầu | bản 1.3 · **đây là bản đang chạy thật** |
| 20/08 chiều | Sửa mã lô / xoá lô | bản 1.4 · 176 kiểm thử |
| **21/08 sáng** | **Rà soát toàn diện.** Andy duyệt 13/20 mục đề xuất (phạm vi B), chọn phương án (b) cho đóng lô, cho biết bao thật nặng **1–200 kg** và nhịp **200–500 bao/ngày, tính an toàn 1000** | bản **1.5** · **289 kiểm thử** · phát hiện `KL_MAX` đang chặn oan bao thật |
| **21/08 chiều** | **Thiết kế nền móng mở rộng.** Andy cho biết: các công đoạn **không cần nối số liệu**, tài khoản **Gmail cá nhân**, **10–30 người đồng thời**, ngân sách **dưới 10 USD/tháng**; ban lãnh đạo quyết theo **giờ công + sai sót** | `KIEN_TRUC_MO_RONG.md` ở thư mục cha · **chưa viết dòng mã nào** cho các máy khác |
| **22/08 chiều** | **Andy đưa 6 yêu cầu nâng cấp** (bản 1.6) và xác nhận bản 1.5 đã chạy thật OK. Trả lời 12 câu hỏi làm rõ. Làm **đủ bốn đợt A → D**, tức **6/6 yêu cầu** | **431 kiểm thử** · mục 1e–1h · **bản 1.6 xong, chưa dán lên Google** |
| **22/08** | **Kiểm tra trước khi dán 1.5 lên Google.** Đối chiếu thư mục/zip, kiểm cú pháp, bấm tay 12 luồng giao diện, diễn thử bước dựng lại bộ đếm | **Không tìm thấy lỗi nào trong mã sẽ dán.** Sửa 2 lỗ hổng của bộ mô phỏng (mục 1d). **Bản 1.5 sẵn sàng dán** — vẫn chưa dán, vì cần tài khoản Google của Andy |
| **25/08 sáng** | **Sửa lỗi `apiSuaBao` làm hỏng số liệu khi quản lý sửa bao mồ côi** — lỗi do đợt C sinh ra | mốc `v1.6.1` · mục **1i** · ⚠️ **không viết ca kiểm thử nào**, cũng **không cập nhật file này** — nợ số 8 |
| **25/08 trưa** | Viết `4_CACH_LAM_VIEC.md` — sổ tay quy trình sửa/nâng cấp cho người không phải lập trình viên | mốc `v1.6.2` |
| **25/08 chiều** | **Đưa dự án vào git, đẩy lên GitHub.** Thêm `README.md`, `claude.md` (luật làm việc cho AI), nâng cấp `.gitignore` — chặn luôn `*.zip` | mốc `v1.6.3` · `github.com/andyNV-lang/May-1-buong` |
| **25/08 chiều** | **Andy xác nhận bản 1.6 đã chạy thật, ổn định** — Andy, người vận hành và quản lý đã nhập thử nhiều lô, chưa thấy lỗi. Andy đưa **4 ý tưởng cải tiến**, tôi phân tích ưu/nhược từng cái | Andy chốt: 1A · 2B · 3C · 4.1 giữ 2 ký tự cuối nếu có · 4.2B |
| **25/08 chiều** | **Làm GÓI 2 (luật nhập liệu)**: mã lô 7 ký tự tự điền, luật số cuối thành thập phân. Viết kiểm thử trước, thấy đỏ rồi mới sửa mã. Andy xác nhận **đã đổi PIN của QL01** | **482 kiểm thử** · mục **1k** · nợ số 10 |
| **25/08 chiều** | **Làm GÓI 1 (giao diện)**: đổi cách gọi vai trò, ẩn chi tiết loại theo vai, gom bao theo ca | **bản 1.7 Gói 1** · mục **1j** · 431 kiểm thử vẫn xanh (không ca nào canh được gói này) |
| **25/08 chiều** | **Rà lại git + vá tài liệu.** Chạy lại kiểm thử để lấy bằng chứng cho mốc, gắn `v1.6.3` kèm ghi chú xác minh, đẩy mốc lên GitHub | **431 đạt / 0 lỗi** · vá lại chính file này cho khớp mã nguồn (mục 1i, 4b, nợ số 8) |

### Ba việc phiên 21/08 cố tình KHÔNG làm — đừng tưởng là bỏ sót

1. **Không phác thảo màn hình / cấu trúc sheet cho 4 công đoạn kia.** Chưa biết nghiệp
   vụ thật của chúng; vẽ ra là bịa. Bảy câu hỏi cần trả lời trước nằm ở mục B8 của
   `KIEN_TRUC_MO_RONG.md`.
2. **Không điền số ROI vào phần thuyết trình.** Con số 3–4 giờ/ngày là cho *toàn bộ*
   công đoạn, chưa ai bấm giờ riêng máy 1 buồng. Để **ô trống có chủ đích** kèm cách đo.
3. **Không tách "phần lõi dùng chung" ra khỏi mã nguồn.** Tách lõi dựa trên *một* ví dụ
   gần như chắc chắn tách sai chỗ. Chờ máy thứ hai chỉ đường.

---

## 2b. Bản 1.6 — bốn đợt, đang ở đâu

Sáu yêu cầu Andy đưa ngày 22/08/2026, chia 4 đợt theo rủi ro tăng dần:

| Đợt | Yêu cầu | Tình trạng |
|---|---|---|
| **A** | 3 (ô tích xác nhận) · 5 (bảng quản lý: tỉ lệ + tô xanh + lọc ngày) | ✅ **XONG** — xem mục 1e |
| **B** | 4 (gộp trang "xem trước kết quả" vào trang nhập liệu, thêm dòng *Bụi + hao hụt*) | ✅ **XONG** — xem mục 1f |
| **C** | 2 (công nhân xem lại lô đã đóng **của mình**) · 6 (quản lý sửa/xoá lô đã chốt, **sửa thẳng trên bảng Tổng hợp theo lô**) | ✅ **XONG** — xem mục 1g |
| **D** | 1 (6 cột P–U trên sheet `BAO` để dán sang Excel) | ✅ **XONG** — xem mục 1h |

**Phạm vi ĐỢT C — Andy duyệt 7/7 ngày 22/08/2026:**

Quản lý (`QUAN_LY`) mở chi tiết lô **từ chính màn hình "Tổng hợp theo lô"**, làm được:

| # | Thao tác trên lô đã chốt ca / đã đóng |
|---|---|
| 1 | Sửa **khối lượng đầu vào** — kéo theo mọi tỉ lệ tính lại |
| 2 | Sửa **số bao đầu vào** và **ghi chú** |
| 3 | Sửa **số thứ tự / khối lượng** của từng bao đã chốt |
| 4 | **Xoá một bao** đã chốt |
| 5 | **Xoá cả lô** kèm toàn bộ bao — giữ bước gõ lại mã lô, đây là thao tác duy nhất không hoàn tác được |
| 6 | **Sửa mã lô đã đóng** — *lý do Andy nêu:* công nhân nhập sai tên lô rồi đóng lô, sau này mới phát hiện |
| 7 | **Mở lại lô** về trạng thái đang chạy — *lý do Andy nêu:* lỡ tay bấm đóng lô, hoặc đóng rồi mới thấy chưa chạy hết bao đầu vào |

Mọi thao tác trong bảng trên **bắt buộc gõ lý do**, ghi nhật ký riêng kèm tên người làm.

**Ràng buộc kỹ thuật đã chốt cho các đợt sau** (đừng suy đoán lại):

- Cột `Q` ghi **nguyên văn** `A1/B1` · `A2/B2` · `A3/B3`, chỉ đọc cột D → **không** phải
  cập nhật theo khi sửa mã lô đổi ký hiệu A↔B.
- Cột `T` là **ô ngày giờ thật**, không phải chữ → phải dựng `Date` từ chuỗi cột J và đặt
  định dạng riêng cho cột T (ngược với cột J vốn bị ép về dạng văn bản trong `02_Setup`).
  Hiển thị `dd/MM/yyyy HH:mm` — Andy chưa nói rõ, đây là mặc định tôi chọn, đổi 1 dòng.
- Cột `U` tiêu đề **"Tình trạng lô"** nhưng giá trị lấy từ cột H, tức là **trạng thái của
  BAO** (`DANG_NHAP`/`DA_CHOT`), ghi bằng mã máy. Lệch tên là **cố ý theo yêu cầu**, đã báo Andy.
- `N`, `O` bỏ trống thuần để nhìn cho dễ.
- Đợt C: công nhân chỉ thấy lô **mình có nhập bao** → cần thêm cột `ds_nguoi_nhap` vào
  cuối sheet `LO` (quét sheet `BAO` để lọc là 2,25 triệu ô cho một màn hình — không dùng được).
- Đợt C: mọi lần quản lý sửa/xoá số liệu đã chốt đều **bắt buộc gõ lý do**, ghi nhật ký riêng.

---

## 2. Đang chờ Andy quyết

| # | Việc | Vì sao quan trọng |
|---|---|---|
| 1 | **Gửi file Excel của bộ phận thống kê** | Thứ tự cột `TONG_HOP_LO` đang do suy đoán. Đây là mắt xích quyết định dự án có thật sự tiết kiệm 3–4 giờ/ngày hay không. Có file thì sửa `COLS.TONG_HOP_LO` (`00_Config.gs`) + `tinhTongHopLo_()` (`05_Report.gs`) cho khớp. **Mục #17 của bản rà soát 21/08 đã hoãn hẳn vì thiếu file này** |
| 2 | **Xác nhận con số `(163)` trên phiếu giấy** | Đang hiểu là *tổng số bao đầu vào*, để ở cột `so_bao_vao`. Chặn mục #11 (đối chiếu bao vào ↔ bao ra) — chưa xác nhận thì không làm |
| 3 | ~~**Có ai mang vai `QUAN_LY` chưa?**~~ **ĐÃ RÕ 22/08/2026:** có — `QL01 · Bùi Thế Hiếu`. Đợt C của bản 1.6 đã làm xong dựa trên điều này | 🔴 **CÒN CHỜ ANDY LÀM:** đổi PIN của `QL01` (4 số, đã lộ trong ảnh chụp gửi qua mạng) và xem lại `CN02`, `CN03`, `TK01` đang để PIN `0000`. **Phải làm TRƯỚC khi dán bản 1.6** |
| 4 | **Duyệt 5 cột thêm vào `TONG_HOP_LO`** | `kl_vao`, `ti_le_L1/L2/L3`, `ti_le_hao_hut` — tôi thêm ở bản 1.3, Andy chưa yêu cầu |
| 5 | **Đo hiệu quả thật** | Bấm giờ 3 ngày xem riêng máy 1 buồng chiếm bao nhiêu phút trong 3–4 giờ nhập liệu/ngày |
| 6 | **Có nên làm lưu trữ theo năm không?** | Ở nhịp 1000 bao/ngày, sheet `BAO` tăng 250.000 dòng/năm. Bản 1.5 đã gỡ được 3 đường nóng nhất, nhưng **chốt ca / đóng lô / bảng tổng hợp vẫn quét cả sheet**. Chuyển lô ĐÃ ĐÓNG sang `BAO_LUU_<năm>` là cách chữa gốc. Việc này đụng vào dữ liệu thật nên tôi không tự làm |

### Bốn mục đã đề xuất nhưng CHƯA làm (nằm ngoài phạm vi Andy duyệt)

| # | Việc | Vì sao chưa |
|---|---|---|
| 10 | Hàng đợi offline gửi gộp thay vì từng bao | Rủi ro cao nhất nhóm B: `apiLuuNhieuBao` theo luật "được ăn cả, ngã về không" — với hàng đợi thì luật đó SAI, phải cho gửi phần đúng và giữ phần lỗi lại. Cần làm cùng lúc với khay bao lỗi |
| 11 | Đối chiếu bao vào ↔ bao ra | Chờ xác nhận con số `(163)` |
| 13 | Cảnh báo khối lượng lệch bất thường trong cùng lô | Andy đã cho khoảng thật 1–200 kg, nhưng khoảng đó quá rộng để bắt lỗi gõ. Nên tính ngưỡng từ dữ liệu thật sau 2 tuần chạy, thay vì đặt bừa rồi sinh cảnh báo giả |
| 17 | Thêm cột "soi bất thường" cho bảng tổng hợp | Chờ file Excel của thống kê |

Ba mục 1.5c Andy chưa duyệt: **#12** (nhắc khối lượng đầu vào trước khi đóng lô — *đã làm một phần*: hộp thoại đóng lô hiện dòng "CHƯA có khối lượng đầu vào"), **#14** (màn hình "Ca của tôi hôm nay"), ~~**#16** (lọc ngày ở màn hình thống kê)~~ — **#16 đã làm ở đợt A bản 1.6**.

**Mục #15 (nút "Mở lại lô" trong app) đã làm xong ở đợt C** — không còn phải vào Google Sheets.

---

## 3. Rủi ro đã biết, chưa xử lý

- **`localStorage` trong khung sandbox của Apps Script.** Vé đăng nhập 14 giờ, hàng đợi
  offline **và khay bao lỗi** đều nằm ở đó; tên miền `googleusercontent.com` do Google cấp
  **có thể đổi**. Đổi là công nhân phải đăng nhập lại và **phần chưa gửi biến mất**.
  Từ bản 1.5, bao vào khay lỗi có ghi nhật ký `BAO_LOI_TREO` lên Google Sheets ngay lúc
  bị từ chối, nên **ít nhất còn dấu vết** — nhưng bao đang nằm trong hàng đợi (chưa gửi
  lần nào) thì vẫn mất không dấu vết.
  → Phải đo trong tuần chạy thử: cuối ngày kiểm tra (a) có phải đăng nhập lại giữa ca không,
  (b) đóng/mở app xong hàng đợi còn nguyên không.
- **Chốt ca / đóng lô / bảng tổng hợp vẫn quét cả sheet `BAO`.** Xem mục 1b. Ở 250.000 dòng,
  chốt ca đọc ~4,75 triệu ô. Chạy vài lần một ngày nên chịu được, nhưng sẽ chậm thấy rõ
  và tiến dần tới giới hạn 6 phút của Apps Script. Cách chữa gốc là lưu trữ theo năm.
- **Gửi lại bao đã xoá thì bao sống lại.** Chống trùng dựa vào `client_id` chỉ dò các dòng
  còn tồn tại. Cần bảng "đã xoá" mới xử lý gọn — chưa đáng làm.
- **Sửa bao không đổi được LOẠI.** Chọn nhầm loại thì phải xoá rồi nhập lại.
- **Bảng chỉ số `CHI_SO` là chỗ mới có thể hỏng.** Nếu ai sửa tay cho nhỏ đi, đường nhanh
  có thể cho lọt số bao trùng. Đã có 2 lớp bảo vệ: `tuKiemTra` đối chiếu chỉ số với dữ liệu
  gốc và báo đỏ, và menu ⚙️ → **"🔧 Dựng lại bảng đếm & chỉ số"** chữa được ngay.
  **Đừng sửa tay vào sheet `CHI_SO`.**
- **Banner "This application was created by a Google Apps Script user"** không bỏ được bằng
  code. Bọc iframe thì bỏ được nhưng **có nguy cơ chặn `localStorage`** trên Safari → hỏng
  hàng đợi offline. Đã khuyên giữ nguyên.

---

## 4. Bộ công cụ (thư mục `cong_cu/`)

Ba công cụ này **không dán lên Apps Script**, chỉ dùng trên máy.

| Lệnh | Làm gì |
|---|---|
| `bash cong_cu/chay_kiemthu.sh` | Chạy 431 kiểm thử logic máy chủ. Cần Node.js |
| `python3 cong_cu/tao_mo_phong.py` | Dựng `mo_phong.html` — thử tay giao diện thật trên logic máy chủ thật, không cần deploy |
| `python3 cong_cu/tao_pdf.py` | Xuất 2 file hướng dẫn ra PDF để in. Cần Google Chrome |
| `node cong_cu/do_hieu_nang.js 250000` | Đo mỗi thao tác đọc/ghi bao nhiêu ô Google Sheets, trên sheet BAO cỡ thật. Cần Node.js |

> ⚠️ **Cái bẫy của bản mô phỏng — đã mất thời gian vì nó ngày 22/08/2026.**
> `PropertiesService` trong `cong_cu/_gia_lap.html` là một object nằm trong bộ nhớ trang
> (`var _pp={}`), nên **tải lại trang là sinh khoá bí mật MỚI**. Vé đăng nhập lưu trong
> localStorage từ lần tải trước vì thế luôn hỏng, và app **tự đăng xuất giữa chừng** —
> trông y như lỗi phiên đăng nhập của sản phẩm. **Không phải lỗi sản phẩm:** trên
> Apps Script thật `PropertiesService` lưu vĩnh viễn.
> → Trước khi thử tay, chạy `localStorage.clear()` rồi mới tải lại trang.

**Thử giao diện:**

```
python3 cong_cu/tao_mo_phong.py
python3 -m http.server 8777
# mở http://localhost:8777/mo_phong.html   (PIN: 1111 công nhân, 9999 thống kê)
```

⚠️ Phải mở qua `http://`, **không** mở bằng `file://` — trình duyệt chặn script.

---

## 4b. Git — mốc an toàn (có từ 25/08/2026)

Mã nguồn nay nằm trong **git**, đẩy lên `github.com/andyNV-lang/May-1-buong`.
**Không nén zip nữa** — mỗi mốc phiên bản là một `tag` trong git, quay lại lúc nào cũng được.

| Mốc | Nội dung |
|---|---|
| `v1.6.0` | Bản 1.6 — mốc an toàn đầu tiên (đủ 6/6 yêu cầu) |
| `v1.6.1` | Sửa lỗi `apiSuaBao` làm hỏng số liệu bao mồ côi — mục **1i** |
| `v1.6.2` | Thêm `4_CACH_LAM_VIEC.md` |
| `v1.6.3` | Thêm `README.md` + `claude.md`; xác minh **431 kiểm thử xanh**, cây làm việc sạch, hai nhánh trùng nhau |

**Luật đã chốt (xem `README.md`):** chỉ gộp vào `main` khi kiểm thử xanh; `main` **luôn**
là bản dán lên Apps Script được ngay. Nhánh `dev` để làm hằng ngày.

Xem lại một mốc cũ mà không làm hỏng gì đang có:

```
git switch --detach v1.6.0     # xem bản cũ
git switch main                # quay về bản mới nhất
```

⚠️ **Đừng sửa lịch sử đã đẩy lên GitHub** (cấm `rebase` / `force-push`) — đó là điều
`claude.md` cấm, và cũng là thứ làm mất mốc an toàn của người khác.

---

## 5. Lưu ý về môi trường (đã mất thời gian vì mấy chỗ này)

- **Đường dẫn có dấu tiếng Việt.** Thư mục `Hỗ trợ nhập liệu` lưu ở dạng Unicode NFD trên
  macOS. Lệnh `cd` trong shell và `find` **thỉnh thoảng không khớp** đường dẫn gõ dạng NFC.
  Dùng Python với đường dẫn tuyệt đối thì ổn.
- **`node --check` không nhận đuôi `.gs`** — phải copy sang `.js` rồi mới kiểm tra cú pháp.
- **Node chạy thẳng được `9_KIEMTHU_LOGIC.js.txt`**, không cần đổi tên.
- **Bộ giả lập không có `HtmlService` thật.** Vì vậy kiểm thử logic **không bắt được** lỗi
  kiểu `addMetaTag` sai tên (lỗi từng làm app trắng màn hình ở bản 1.2). Loại lỗi này chỉ
  lộ ra khi chạy trên Apps Script thật, hoặc qua bản mô phỏng trình duyệt.
- **Bộ giả lập càng dễ dãi thì kiểm thử càng vô nghĩa.** Bản 1.4 có 176 kiểm thử "đạt hết"
  mà vẫn để lọt lỗi menu Tạo dữ liệu mẫu, chỉ vì `setValues` giả lập không kiểm tra chiều
  dữ liệu như Google thật. Bản 1.5 đã siết. **Nghi ngờ chỗ nào bộ giả lập dễ hơn Google
  thì siết chỗ đó trước, rồi mới đi tìm lỗi.**
- **Kiểm thử ghi đè trạng thái toàn cục là bẫy im lặng.** Mục 14 từng gán đè
  `SpreadsheetApp.getUi` vĩnh viễn, làm mọi kiểm thử viết SAU nó lặng lẽ không gọi được
  hộp thoại — mất khá lâu mới nhận ra. Nay dùng bộ giả lập `UI` chung, bật/tắt và trả lại.
- **Đổi kiểu ghi để "nhanh hơn" phải đo lại, đừng tin cảm giác.** Lần đầu làm mục #9 tôi
  ghi lại cả cột trạng thái: số lượt gọi giảm từ 48 xuống 7, nhưng số Ô GHI vọt từ 296 lên
  50.044. Đo mới lộ ra. Bản cuối ghi theo dải dòng liền nhau: 7 lượt gọi, 44 ô ghi.
  Kịch bản đo nằm ở `cong_cu/do_hieu_nang.js`.

---

## 6. Câu mồi cho phiên trò chuyện mới

**Mở Claude Code ngay tại thư mục `~/Desktop/Hỗ trợ nhập liệu`**, rồi dán:

```
Đọc 3 file này trước khi làm gì:
  may1buong_appscript/TIEN_DO.md        (đang dở ở đâu — đọc trước, đọc kỹ mục 1a NỢ KỸ THUẬT)
  may1buong_appscript/0_DOC_TRUOC.md    (lịch sử, lỗi đã sửa, tính năng)
  KIEN_TRUC_MO_RONG.md                  (nền móng mở rộng sang các máy khác)

⚠️ CHỈ LÀM VIỆC TRONG THƯ MỤC may1buong_appscript/
Thư mục "may1buong_appscript v1.5" là bản giải nén cũ để xem, ĐỪNG sửa vào đó.
⚠️ KHÔNG tạo file zip nén dự án nữa. Sửa thẳng vào thư mục, rồi liệt kê file cần dán lại.

Bối cảnh: hệ thống ghi chép sản xuất máy 1 buồng chạy trên Google Apps Script,
công nhân dùng điện thoại Android rẻ tiền. Tài khoản Gmail cá nhân miễn phí,
ngân sách dưới 10 USD/tháng.

TRẠNG THÁI: bản 1.5 ĐANG CHẠY THẬT. Bản 1.6 đã xong đủ 6/6 yêu cầu tôi đưa
ngày 22/08/2026 (4 đợt A/B/C/D), 431 kiểm thử xanh, đã bấm tay qua trình duyệt,
nhưng CHƯA DÁN LÊN APPS SCRIPT.

Cách làm tôi muốn giữ nguyên:
- Viết kiểm thử TRƯỚC, rồi mới sửa mã.
- Chạy kiểm thử trước khi sửa bất cứ thứ gì:
    bash may1buong_appscript/cong_cu/chay_kiemthu.sh     -> phải ra 431 đạt / 0 lỗi
- Thử tay giao diện trên bản mô phỏng trước khi bảo tôi dán lên Google:
    python3 may1buong_appscript/cong_cu/tao_mo_phong.py
    (mở qua http://, và chạy localStorage.clear() trước khi tải lại — xem mục 5)
- Đo hiệu năng khi đụng đường ghi/đọc:
    node may1buong_appscript/cong_cu/do_hieu_nang.js 250000
- Sửa xong + kiểm thử xanh thì COMMIT ngay, message tiếng Việt có dấu.
  Cập nhật TIEN_DO.md trong CÙNG lần sửa đó — hai phiên ngày 25/08 quên việc này.
- Nếu thiếu thông tin thì NÓI RÕ LÀ THIẾU, đừng tự suy đoán.
- Nói cho tôi từng bước tư duy trước khi trả lời, và tự nhận xét điểm yếu sau khi trả lời.

Đọc xong, tóm tắt lại cho tôi:
  (a) 3 việc đang chờ tôi quyết,
  (b) 3 món nợ kỹ thuật nặng nhất ở mục 1a,
rồi DỪNG chờ tôi.

Việc tôi muốn làm: <ghi việc cụ thể ở đây>
```

**Sáu chỗ trong câu mồi trên là cố ý, đừng bỏ:**

1. **Chạy kiểm thử trước khi sửa.** Để biết cái gì hỏng là do phiên mới gây ra,
   chứ không phải hỏng sẵn từ trước.
2. **"Tóm tắt rồi dừng"** — cách kiểm tra rẻ nhất xem nó có thật sự đọc file hay chỉ
   lướt qua. Bắt tóm cả **nợ kỹ thuật** để nó không vô tình đạp lên chỗ đang yếu.
3. **Ghi việc cụ thể.** Nói "làm tiếp đi" thì nó sẽ tự đoán, thường đoán sai.
4. **Chỉ rõ thư mục làm việc.** Có 2 thư mục cùng nội dung.
5. **"Thiếu thì nói là thiếu".** Bảng `TONG_HOP_LO` từng bị đặt theo suy đoán và tới giờ
   vẫn phải làm lại — cái giá của việc đoán đã trả một lần rồi.
6. **"Viết kiểm thử trước".** Cả bản 1.6 làm theo lối này: viết ca kiểm thử, chạy thấy
   đỏ, rồi mới sửa mã. Bỏ nó đi là mất luôn cách biết mình đã làm đúng.

### Vài câu mồi cho việc hay gặp

| Việc | Câu thêm vào dòng cuối |
|---|---|
| **Dán 1.6 lên gặp lỗi** | `Tôi dán bản 1.6 lên Apps Script và gặp lỗi này: <dán nguyên văn lỗi>` |
| **Chạy thật thấy sai** | `Bản 1.6 đã chạy thật. Công nhân báo: <mô tả>. Tìm nguyên nhân, viết kiểm thử tái hiện lỗi trước rồi mới sửa.` |
| Ghim cột "Mã lô" ở bảng tổng hợp | `Làm nợ kỹ thuật số 6 ở mục 1a: ghim cột Mã lô của bảng tổng hợp để cuộn ngang không mất dấu.` |
| Đưa nút CHỐT CA lên trên | `Làm nợ kỹ thuật số 7 ở mục 1a: CHỐT CA đang bị đẩy xuống quá sâu ở màn hình nhập liệu.` |
| Dựng lại kiểm thử giao diện | `Làm nợ kỹ thuật số 1 ở mục 1a: dựng lại bộ kiểm thử giao diện tự động (Playwright hỏng từ bản 1.1, ghi cứng đường dẫn Chromium máy Linux).` |
| Có file Excel của thống kê | `Đây là file Excel thật của bộ phận thống kê: <đường dẫn>. Sửa COLS.TONG_HOP_LO và tinhTongHopLo_() cho khớp đúng thứ tự cột của chị ấy.` |
| Thêm tính năng mới | `Tôi muốn thêm: <mô tả>. Viết kiểm thử trước, rồi mới sửa code.` |
| Xuất lại PDF | `Xuất lại 2 file PDF hướng dẫn theo nội dung mới nhất (bản 1.6 đổi khá nhiều màn hình).` |
| Làm lưu trữ theo năm | `Làm lưu trữ lô đã đóng sang sheet BAO_LUU_<năm> để sheet BAO không lớn vô hạn. Viết kiểm thử trước.` |
| Sheet BAO đã chậm | `Sheet BAO hiện <N> dòng và công nhân thấy chậm ở bước <mô tả>. Đo lại bằng cong_cu/do_hieu_nang.js rồi đề xuất cách xử lý.` |
