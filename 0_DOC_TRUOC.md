# MÁY 1 BUỒNG — Hệ thống ghi chép sản xuất (Google Apps Script)

**Phiên bản 1.5 · 21/08/2026 · Nam Vu Down & Feathers JSC**
*(v1.1: sửa 9 lỗi. v1.2: rà soát độc lập, sửa thêm 5 lỗi. v1.2.1 + v1.2.2: vá lỗi trang trắng và làm cho `doGet` không thể chết vì thẻ meta — xem cuối file)*

---

## Gói này có gì

| File | Dùng để làm gì | Ai đọc |
|---|---|---|
| **`0_DOC_TRUOC.md`** | File này | Andy |
| **`TIEN_DO.md`** | Đang dở ở đâu, chờ quyết gì, rủi ro gì — đọc khi quay lại sau một thời gian | Andy |
| `cong_cu/` | 4 công cụ chạy trên máy: kiểm thử, mô phỏng giao diện, xuất PDF, **đo hiệu năng**. **Không dán lên Apps Script** | Andy |
| **`1_HUONG_DAN_TRIEN_KHAI.md`** | **Đọc file này trước tiên.** 9 bước cài đặt | Andy |
| `2_CAU_TRUC_SHEET.md` | Mô tả 6 sheet, ý nghĩa từng cột | Andy + thống kê |
| `3_HUONG_DAN_CONG_NHAN.md` | 1 trang A4 in ra dán tại máy | Công nhân |
| **`4_CACH_LAM_VIEC.md`** | Thư mục có file gì, quy trình sửa/nâng cấp an toàn 7 bước | Andy |
| `appsscript.json` | Cấu hình project | (dán vào Apps Script) |
| `00_Config.gs` | Hằng số, tên cột, cấu hình | |
| `01_Util.gs` | Tiện ích, đọc/ghi sheet, khoá chống ghi đè | |
| `02_Setup.gs` | Menu ⚙️, tự tạo cấu trúc sheet | |
| `03_Auth.gs` | Đăng nhập PIN, chống dò PIN | |
| `04_Api.gs` | Toàn bộ nghiệp vụ (lô, bao, chốt ca, đóng lô) | |
| `05_Report.gs` | Bảng tổng hợp theo lô cho thống kê | |
| `06_WebApp.gs` | Điểm vào web + hàm `tuKiemTra` | |
| `Index.html` / `Style.html` / `Script.html` | Giao diện điện thoại | |
| `9_KIEMTHU_LOGIC.js.txt` | **289** kiểm thử logic máy chủ (chạy bằng Node) | (tham khảo) |
| `9_KIEMTHU_GIAODIEN.js.txt` | 43 kiểm thử giao diện (chạy bằng Playwright) | (tham khảo) |

---

## Thiết kế đáp ứng đúng 4 yêu cầu của Andy

| Yêu cầu | Cách hiện thực |
|---|---|
| Công nhân **chỉ chọn 1/2/3** | 3 nút to. Ký hiệu A/B máy tự suy từ ký tự đầu mã lô (`T`→A, `D`→B), công nhân không chạm tới |
| **Không có giao diện thống kê** trong thao tác công nhân | Nút "Xem tổng hợp" chỉ hiện với vai trò `THONG_KE` / `QUAN_LY`; máy chủ cũng từ chối nếu công nhân gọi thẳng API |
| **Không sửa số liệu của nhau, không sửa số liệu cũ** | Kiểm tra ở **máy chủ** (không phải chỉ ẩn nút): chỉ sửa/xoá được khi `chưa CHỐT CA` **và** `đúng người nhập` **và** `lô còn đang chạy` **và** `nhập chưa quá 12 giờ` — điều kiện cuối lo cả trường hợp công nhân quên bấm chốt ca |
| **Lưu lịch sử thao tác trên Google Sheets** | Sheet `LOG` ghi mọi hành động kèm **tên người**, **giá trị cũ → giá trị mới**. Sheet `BAO` cũng có cột `nguoi_nhap` / `nguoi_sua` |

---

## Thao tác của công nhân — 2 chạm mỗi bao

```
  Chọn lô  →  bấm LOẠI 1/2/3 (1 lần cho cả dải)  →  gõ khối lượng  →  LƯU BAO
                                                       ↑______________________|
                                        số bao tự tăng, ô khối lượng tự xoá
```

Ngoài ra máy tự chặn sẵn: khối lượng ngoài 1–100 kg, trùng số bao trong cùng nhóm,
mã lô sai tiền tố, nhảy số bao bất thường (cảnh báo, không chặn).

---

## Đã kiểm thử

**Tầng 1 — Logic máy chủ: 289 kiểm thử, đạt 289/289** (chạy lại và xác nhận 21/08/2026,
Node v22, trên bản giả lập Google Sheets đã siết chặt ở bản 1.5):

- suy ký hiệu A/B từ mã lô (kể cả chữ thường, mã sai tiền tố)
- chặn trùng số bao trong cùng nhóm, cho phép trùng khi khác loại
- chặn khối lượng gõ thiếu dấu thập phân (498 thay vì 49.8)
- gợi ý số bao đúng theo **từng nhóm riêng** (A1, A2, A3 có dải số khác nhau)
- công nhân B không sửa/xoá được dữ liệu của công nhân A
- sau CHỐT CA thì khoá hoàn toàn, ca sau vẫn nhập tiếp vào cùng lô
- lô đã ĐÓNG thì không ai thêm bao được
- công nhân bị từ chối khi gọi API thống kê
- gửi lại cùng một bao (mạng chập chờn) không tạo dòng trùng
- nhật ký ghi đủ giá trị cũ → mới
- khoá tạm sau 5 lần sai PIN
- API không rò rỉ mã PIN ra ngoài

**Tầng 2 — Giao diện thật (43 kiểm thử)** chạy trên trình duyệt Chromium
giả lập iPhone 390×844, bấm đúng như công nhân bấm:

- đăng nhập PIN sai/đúng, ô PIN tự xoá khi sai
- tạo lô, xem trước ký hiệu A/B ngay khi gõ mã lô
- nhập bao: chọn loại 1 lần → gõ khối lượng → LƯU, số bao tự tăng
- **gõ khối lượng bằng dấu phẩy `49,8` vẫn lưu đúng 49.8**
- báo lỗi trùng số bao, chặn 498 kg ngay tại điện thoại
- ngắt mạng giữa chừng: vẫn nhập được, hiện dải "chờ gửi", có mạng lại tự gửi
- mọi nút ≥ 44px, không tràn ngang màn hình, **không còn một chữ tiếng Anh nào**
- không phát sinh lỗi JavaScript nào trong suốt phiên thử

⚠️ **Về tầng 2:** kết quả 43/43 là từ lần chạy trước trên máy Linux. File
`9_KIEMTHU_GIAODIEN.js.txt` đang ghi cứng đường dẫn Chromium của máy đó
(`/opt/pw-browsers/...`) nên **chưa chạy lại được** ở lần rà soát 20/08/2026.
Muốn dùng lại thì sửa `executablePath` cho khớp máy mình. Không chặn việc triển khai.

Trên Apps Script, chạy hàm `tuKiemTra` để kiểm tra lại môi trường thật.

---

## 9 lỗi đã tìm ra và sửa ở v1.1

| # | Lỗi | Mức độ | Hậu quả nếu không sửa |
|---|---|---|---|
| 1 | Bàn phím tiếng Việt cho ra dấu **phẩy** `49,8`, ô `type=number` nuốt mất giá trị | 🔴 Nặng | Công nhân gõ khối lượng mà máy báo "chưa nhập" — kẹt hẳn luồng chính |
| 2 | Hàng đợi offline **không gắn tên người** | 🔴 Nặng | Công nhân A để lại hàng đợi, B đăng nhập cùng máy → số liệu của A bị ghi tên B |
| 3 | Google Sheets tự đổi chuỗi thời gian thành ô **Date** | 🔴 Nặng | Hiển thị sai giờ, logic tự khoá theo thời gian sập |
| 4 | Quên bấm CHỐT CA thì dữ liệu **cũ vẫn sửa được mãi** | 🔴 Nặng | Vi phạm đúng yêu cầu "không sửa được số liệu cũ" |
| 5 | PIN `0472` bị Google Sheets lưu thành số `472` | 🟠 Vừa | Công nhân không đăng nhập được, không hiểu vì sao |
| 6 | `dang_dung` gõ "Không" (có dấu) không bị nhận diện | 🟠 Vừa | Người đã nghỉ việc vẫn đăng nhập được |
| 7 | CHỐT CA chỉ quét đúng mã phiên hiện tại | 🟠 Vừa | Bao sót từ ca trước không bao giờ được khoá |
| 8 | Ai cũng đóng được lô khi người khác đang nhập dở | 🟠 Vừa | Khoá mất phần đang nhập của đồng nghiệp |
| 9 | Nút ✎ và nút thanh trên chỉ 42px | 🟡 Nhẹ | Dưới chuẩn chạm 44px — dễ bấm trượt khi tay bẩn/đeo găng |

**Cải tiến kèm theo:** mỗi bao giờ chỉ tốn **1 lượt gọi mạng** thay vì 2
(trước đây lưu xong lại tải lại cả lô) — nhập nhanh hơn rõ rệt khi wifi xưởng yếu.

---

## Bản 1.5 — Rà soát toàn diện & chịu tải 1000 bao/ngày (21/08/2026)

Bản này ra đời từ một lượt rà soát lại **toàn bộ** mã nguồn với con mắt kiểm thử,
sau đó Andy duyệt 13 mục để làm.

### 🔴 Phát hiện quan trọng nhất: `KL_MAX` đang chặn oan bao thật

Bản 1.3 **đang chạy thật** đặt khối lượng tối đa 1 bao là **100 kg**, trong khi bao
thật của xưởng nặng tới **200 kg** (Andy xác nhận 21/08/2026). Bao trên 100 kg bị máy
từ chối, mà câu báo lỗi lại bảo công nhân *"kiểm tra lại dấu thập phân"* — chỉ sai
hướng hoàn toàn. Công nhân rất dễ gõ đại một số nhỏ hơn cho qua.

→ Sửa ngay được trên Google Sheets: sheet `CAU_HINH` → `KL_MAX` → `200`.
Bản 1.5 đã đổi mặc định trong code, và `tuKiemTra` từ nay canh luôn khoảng khối lượng.

### 5 lỗi đã tìm ra và sửa

| # | Lỗi | Mức độ | Hậu quả nếu không sửa |
|---|---|---|---|
| 1 | **Bao offline bị từ chối thì BIẾN MẤT** | 🔴 Nặng | Hàng đợi gửi lên, máy chủ từ chối (trùng số bao, lô đã đóng…) → bao bị xoá thẳng khỏi hàng đợi, chỉ báo bằng dòng chữ chạy 2,8 giây. Công nhân đang cầm bao, không nhìn màn hình là **mất hẳn**: không vào sheet, không vào nhật ký, không ai biết. Đây là đường mất số liệu duy nhất còn lại của hệ thống |
| 2 | **`apiDongLo` không kiểm tra quyền gì cả** | 🟠 Vừa | Ai cũng đóng vĩnh viễn được lô của người khác chỉ bằng một cú bấm — trong khi sửa mã lô và xoá lô đều có chốt chặn. Mà đóng lô mới là thứ khoá vĩnh viễn, mở lại phải nhờ quản lý vào Google Sheets |
| 3 | **Gõ `1.000` kg thành `1` kg** | 🟠 Vừa | Ô khối lượng đầu vào là **mẫu số của mọi tỉ lệ thu hồi**. Gõ dấu phân cách nghìn theo thói quen là cả báo cáo của lô sai 1000 lần |
| 4 | **Menu "Tạo dữ liệu mẫu" ném lỗi** | 🟡 Nhẹ | Hỏng từ bản 1.3: mảng gõ cứng 9 giá trị ghi vào vùng 10 cột (bản 1.3 thêm cột `kl_vao` mà quên sửa chỗ này). Người cài mới gặp lỗi đỏ ngay bước 2 |
| 5 | **Còn 6 chỗ ghép chuỗi vào HTML chưa lọc** | 🟡 Nhẹ | Bản 1.2 đã sửa lỗi này cho `ma_nv`/`ma_lo` nhưng bỏ sót `ky_hieu`, `loai`, `ngay_mo`… Thống kê gõ tay vào sheet, chỉ một dấu nháy đơn là vỡ giao diện |

### Vì sao 176 kiểm thử "đạt hết" mà vẫn lọt lỗi #4

Vì **bộ giả lập dễ dãi hơn Google thật**: hàm `setValues` giả lập ghi bừa, không kiểm
tra dữ liệu có khớp chiều vùng ghi không. Google thật thì ném lỗi.

Việc đầu tiên của bản 1.5 là **siết bộ giả lập** cho giống Google, rồi mới đi sửa lỗi.
Siết xong là lỗi #4 lộ ra ngay. Bài học đáng nhớ: *một bộ kiểm thử chỉ nghiêm khắc
bằng đúng bộ giả lập của nó.*

Cũng phát hiện thêm: mục kiểm thử số 14 gán đè `SpreadsheetApp.getUi` **vĩnh viễn**,
làm mọi kiểm thử viết sau nó lặng lẽ không gọi được hộp thoại. Đã sửa.

### Chịu được nhịp 1000 bao/ngày

Andy cho biết nhịp thật là **200–500 bao/ngày** và yêu cầu tính an toàn cho **1000**.
Con số này làm đổi hẳn bài toán: tài liệu cũ ước tính *"~50 bao/ngày, ngưỡng 50.000
dòng ≈ 3 năm"*, còn thực tế là **chạm ngưỡng sau ~2 tháng**, và sau 1 năm sheet `BAO`
có **250.000 dòng**.

Mã cũ đọc **toàn bộ** sheet `BAO` mỗi lần lưu bao — tức **3,25 triệu ô** cho một thao
tác mà công nhân đang đứng chờ. Không dùng được.

**Cách xử lý — sheet `CHI_SO` mới:** giữ sẵn số bao lớn nhất của 6 nhóm (A1…B3), đúng
6 dòng. Bất biến: `stt_max` **luôn ≥ mọi số bao đang có**, và **chỉ được tăng, không
bao giờ giảm** (xoá bao thì không hạ xuống). Nhờ đó:

- Số bao mới **lớn hơn** `stt_max` → **chắc chắn chưa ai dùng, khỏi đọc sheet BAO**.
  Đây là gần như 100% thao tác thật, vì máy điền sẵn số tăng dần.
- Số bao mới **nhỏ hơn hoặc bằng** → mới quét, và đó đúng là tình huống gõ nhầm mà
  việc chống trùng sinh ra để bắt.

Thêm **2 cột đếm sẵn** `so_bao_ra` / `kl_ra` ở cuối sheet `LO`, cộng dồn lúc lưu bao,
để màn hình danh sách lô không phải quét sheet `BAO` chỉ để đếm.

**Kết quả đo trên sheet 250.000 dòng** (`node cong_cu/do_hieu_nang.js 250000`):

| Thao tác | 1.4 đọc | 1.5 đọc |
|---|---|---|
| Mở màn hình đầu | 3.250.030 ô | **32 ô** |
| Lưu 1 bao | 3.250.030 ô | **86 ô** |
| Lưu mẻ 20 bao | 3.250.043 ô | **86 ô** |
| Mở 1 lô | 3.250.323 ô | 2.500.286 ô |
| Chốt ca | 6.500.849 ô | 4.750.431 ô |

**Nói thẳng phần chưa xong:** mở 1 lô, chốt ca, đóng lô và bảng tổng hợp **vẫn quét cả
sheet**. Chúng phải tìm "bao của lô này" trên toàn bộ dữ liệu, không chỉ số nào giúp
được. Chạy vài lần một ngày nên chịu được, nhưng đó là giới hạn còn lại. Cách chữa gốc
là **lưu trữ lô đã đóng sang sheet theo năm** — chưa làm vì đụng vào dữ liệu thật.

### Hai lớp bảo vệ cho bảng chỉ số

Đường nhanh chỉ an toàn chừng nào bất biến còn đúng, nên có 2 lưới an toàn:

1. **`tuKiemTra` đối chiếu** chỉ số và bộ đếm với dữ liệu gốc, báo đỏ nếu lệch
   (chấp nhận quét cả sheet — hàm này chạy tay, thỉnh thoảng mới chạy).
2. **Menu ⚙️ → "🔧 Dựng lại bảng đếm & chỉ số"** tính lại từ sheet `BAO`, chữa được ngay.

⚠️ **Đừng sửa tay vào sheet `CHI_SO`.**

### Những thay đổi công nhân sẽ thấy

| Thay đổi | Vì sao |
|---|---|
| **Bao trên 100 kg nhập được** (tới 200 kg) | Khoảng cũ chặn oan |
| **Đóng lô phải gõ lại mã lô** | Đóng lô là khoá vĩnh viễn, không thể rẻ hơn xoá lô về mặt thao tác |
| **Dải đỏ "N bao KHÔNG gửi lên được"** | Bao bị từ chối nay nằm lại trong khay, sửa rồi gửi lại được — thay vì biến mất |
| **Ô khối lượng đầu vào hiện lại số máy hiểu** | Gõ `1.000` thì máy hiện ngay `✓ Máy hiểu: 1.000 kg` để công nhân xác nhận bằng mắt |
| Còn bao trong khay lỗi thì **chưa chốt ca / đóng lô / xem kết quả được** | Nếu cho qua, công nhân sẽ chốt một bộ số liệu thiếu mà tưởng là đủ — rồi chốt ca xong là khoá luôn |

**Bổ sung 113 kiểm thử** (176 → 289), gồm cả kiểm thử canh **bất biến của bảng chỉ số**
sau mỗi đường sửa/xoá, và kiểm thử chứng minh `tuKiemTra` bắt được chỉ số bị phá.

---

## Bản 1.4 — Sửa mã lô / Xoá lô (20/08/2026)

| Tính năng | Ai làm được | Cách làm |
|---|---|---|
| **Sửa mã lô** (gõ sai chính tả) | Người tạo lô, hoặc quản lý | Đổi mã ở `LO` **và đổi kèm mọi dòng ở `BAO`** trong cùng một khoá ghi |
| **Xoá lô** (nhập sai, làm lại từ đầu) | Người tạo lô, hoặc quản lý | Chụp toàn bộ số liệu vào nhật ký **trước khi** xoá, rồi xoá lô + toàn bộ bao. Phải gõ lại mã lô để xác nhận |

**Điều nguy hiểm nhất đã xử lý:** `ma_lo` là **khoá nối** sheet `BAO` với sheet `LO`.
Đổi mã ở một nơi mà quên nơi kia thì toàn bộ bao đã nhập thành dòng **mồ côi** — mất trắng.
Hai việc này giờ luôn đi cùng nhau, và có kiểm thử canh riêng đúng chuyện đó.

**Bẫy thứ hai:** sửa cả chữ cái đầu (`T`↔`D`) làm ký hiệu đổi `A`↔`B`, kéo cả lô sang **nhóm
đánh số bao khác** và có thể **đụng số bao** của lô khác. Máy soát trước; có đụng thì từ chối
và **giữ nguyên mọi thứ**, không sửa nửa vời. Màn hình cũng cảnh báo ngay khi gõ.

### ⚠️ Ba giới hạn tôi tự đặt thêm — Andy đọc kỹ

Yêu cầu của bạn là *"admin hoặc chính nhân viên tạo lô đó"*. Tôi làm chặt hơn ở 3 chỗ,
vì nếu làm đúng nguyên văn thì phá vỡ những lời hứa gốc của hệ thống:

1. **Công nhân KHÔNG xoá được lô có bao của người khác** (quản lý thì được) — nếu không thì
   phá lời hứa *"không sửa số liệu của nhau"*.
2. **Công nhân KHÔNG xoá được lô đã có bao CHỐT CA** (quản lý thì được) — nếu không thì
   *"chốt ca là khoá vĩnh viễn"* không còn đúng.
3. **Lô đã ĐÓNG thì không ai sửa/xoá được**, kể cả quản lý — phải mở lại lô trước
   (menu ⚙️ → 🔓 Mở lại 1 lô), để việc mở lại có dấu vết riêng.

Thấy chặt quá thì báo tôi nới — đây là lựa chọn của tôi, không phải ràng buộc kỹ thuật.

**Bổ sung 31 kiểm thử** cho riêng hai tính năng này (145 → 176), gồm: bao có đi theo mã mới
không, có sót dòng mồ côi không, đổi T→D bị chặn khi trùng số bao, và nhật ký có chụp đủ
số liệu trước khi xoá không.

---

## Bản 1.3 — 4 tính năng Andy yêu cầu (20/08/2026)

| # | Tính năng | Cách làm |
|---|---|---|
| 1 | **Khối lượng đầu vào của lô** | Cột mới `kl_vao` ở sheet `LO`. Công nhân nhập lúc tạo lô, hoặc bổ sung sau ở màn hình xem trước. Mọi lần sửa đều vào nhật ký `SUA_KL_VAO` |
| 2 | **Xem trước kết quả chạy máy** | Màn hình mới trước bước đóng lô: tỉ lệ thu hồi từng loại + tỉ lệ hao hụt (2 số lẻ), cảnh báo khi hao hụt ngoài 20–30%. **Chỉ cảnh báo, không chặn.** Xem xong quay lại sửa số liệu được, rồi mới đóng lô |
| 3 | **Nhập nhiều bao cùng lúc** | Nút ＋ thêm dòng, tối đa 20 dòng/lần. Số bao tự tăng dần, chỉ phải gõ khối lượng. Cả mẻ đi trong **1 lượt gọi mạng** |
| 4 | **Màu riêng từng loại** | Loại 1 xanh nước biển, loại 2 vàng, loại 3 xanh lá đậm — áp cho cả nút chọn loại lẫn danh sách bao đã nhập |

**Hai quyết định thiết kế cần Andy biết:**

- **Lưu nhiều bao là "được ăn cả, ngã về không".** Một dòng sai thì không dòng nào được ghi,
  và máy chỉ rõ sai ở dòng thứ mấy. Chọn vậy để công nhân không bao giờ phải hỏi
  *"bao số 5 đã lưu chưa?"* — chỉ có hai kết cục: lưu hết, hoặc chưa lưu gì.
- **Cột `kl_vao` nằm ở CUỐI sheet `LO`**, không nằm cạnh `so_bao_vao` như logic thông thường.
  Bắt buộc phải vậy vì bảng tính đã có dữ liệu thật; chèn cột vào giữa sẽ làm lệch mọi dòng cũ.

**Một lỗi phát sinh trong lúc làm, đã sửa:** sửa khối lượng đầu vào xong màn hình vẫn hiện
số cũ — do phải gọi mạng hai lượt (lưu, rồi hỏi lại) và phản hồi về sai thứ tự. Đã bỏ hẳn
lượt thứ hai: máy chủ trả về luôn kết quả đã tính lại. Vừa hết lỗi, vừa nhanh hơn một lượt mạng.

**Bổ sung 38 kiểm thử** cho 4 tính năng này (107 → 145), gồm cả trường hợp hao hụt âm
(ra nhiều hơn vào) và trường hợp chưa nhập khối lượng đầu vào.

---

## 5 lỗi đã tìm ra và sửa ở v1.2 (rà soát độc lập 20/08/2026)

| # | Lỗi | Mức độ | Hậu quả nếu không sửa |
|---|---|---|---|
| 1 | Phân quyền **"mở toang"**: máy chủ chỉ cấm ai có `vai_tro` bằng đúng `CONG_NHAN` | 🔴 Nặng | Gõ sai cột `vai_tro` trong sheet (có dấu "Công nhân", thiếu gạch dưới "CONGNHAN") là **công nhân xem được toàn bộ số liệu tổng hợp** — vi phạm đúng yêu cầu số 2 của Andy. Đã đổi sang danh sách trắng: chỉ `THONG_KE`/`QUAN_LY` được vào, mọi giá trị lạ đều hạ về quyền thấp nhất |
| 2 | **CHỐT CA khoá luôn bao ở lô khác** | 🔴 Nặng | Andy xác nhận công nhân **có nhập nhiều lô song song** → bấm chốt ca ở lô A khoá mất phần đang nhập dở ở lô B. Nay chốt ca chỉ tính đúng lô đang mở; bao quá hạn ở lô khác vẫn được quét dọn nên không sinh dòng mồ côi |
| 3 | Menu **XOÁ TOÀN BỘ DỮ LIỆU xoá luôn sheet `LOG`** | 🟠 Vừa | Mất sạch bằng chứng "ai sửa gì lúc nào" — đúng thứ mà yêu cầu số 4 của Andy đòi hỏi. Nay `LOG` được giữ lại, và chính hành động xoá cũng bị ghi vào `LOG` |
| 4 | `caiTriggerTongHop` gọi `getUi()` không bọc try/catch | 🟡 Nhẹ | BƯỚC 9 của hướng dẫn bảo chạy hàm này **từ trình soạn thảo**, nơi không có giao diện → báo lỗi đỏ dù lịch đã cài xong. Người cài tưởng thất bại nên chạy lại nhiều lần |
| 5 | Mã NV / mã lô được nhét thẳng vào `onclick` của HTML | 🟡 Nhẹ | Andy gõ tay `ma_nv`, thống kê gõ tay `ma_lo` vào sheet — chỉ một dấu nháy đơn là hỏng nút đăng nhập / nút chọn lô. Nay truyền vị trí trong danh sách, không ghép chuỗi |

| 6 | **Trang trắng ngay khi công nhân mở link** — `doGet` gọi `addMetaTag('theme-color', ...)` | 🔴 Nặng | `addMetaTag()` của Apps Script CHỈ nhận 4 tên: `viewport`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `google-site-verification`. Tên khác làm `doGet` ném lỗi → **app không mở được, hỏng hoàn toàn ở BƯỚC 8**. Lỗi này có từ v1.1 và đã lọt qua lần rà soát v1.2 vì chỉ lộ ra khi chạy trên Apps Script thật. Nay bỏ khỏi `doGet`, chuyển `theme-color` vào `<head>` của `Index.html` |

**Kèm theo:** bổ sung **18 kiểm thử mới** canh đúng 5 lỗi đầu (83 → 101), để chúng không tái phát.
Riêng lỗi #6 lúc đầu **không kiểm thử nào bắt được** — bộ giả lập chưa có `HtmlService`.
Bản **v1.2.2** đã xử lý triệt để hơn thay vì chỉ bỏ thẻ gây lỗi:

- `doGet` gắn **từng thẻ meta một, mỗi thẻ trong try/catch riêng**. Thẻ nào bị Google từ
  chối thì bỏ qua thẻ đó và ghi vào Execution log — **không bao giờ làm sập cả trang nữa**.
  Với app đặt tại máy sản xuất, trang trắng nghĩa là dừng việc, nên đây là đánh đổi đúng:
  thà mất một thẻ meta trang trí còn hơn mất cả ứng dụng.
- Thêm **6 kiểm thử** giả lập `HtmlService` (101 → 107), trong đó có tình huống
  *Google siết danh sách thẻ meta trong tương lai* — app vẫn phải mở được.

---

## Còn treo, CHƯA sửa ở v1.2 (đã biết, mức nhẹ)

- **Gửi lại bao đã xoá thì bao sống lại.** Chống trùng dựa vào `client_id` chỉ dò các dòng
  còn tồn tại. Kịch bản: bao nằm hàng đợi offline → công nhân xoá nó → có mạng, hàng đợi
  gửi lên → bao được tạo lại. Cần bảng "đã xoá" mới xử lý gọn, chưa đáng làm lúc này.
- **Sửa bao không đổi được LOẠI.** Chọn nhầm Loại 1 thay vì Loại 2 thì phải xoá rồi nhập lại.
- **Rủi ro `localStorage`.** Cả vé đăng nhập 14 giờ lẫn hàng đợi offline nằm trong
  `localStorage` của khung sandbox `googleusercontent.com` do Google cấp — tên miền này
  **có thể đổi**. Nếu đổi, công nhân phải đăng nhập lại và **phần chưa gửi biến mất**.
  → Phải theo dõi thật trong tuần chạy thử, xem mục kế hoạch bên dưới.
- ~~**Hiệu năng.** Mỗi lần lưu 1 bao, máy chủ đọc **toàn bộ** sheet `BAO`.~~
  → **Đã xử lý ở bản 1.5** bằng sheet chỉ số `CHI_SO`: lưu 1 bao nay đọc 86 ô thay vì
  3,25 triệu ô. Nhưng mở 1 lô / chốt ca / đóng lô / bảng tổng hợp **vẫn quét cả sheet** —
  xem phần bản 1.5 ở trên.

---

## ⚠️ Những việc còn treo — cần Andy xử lý

1. **`KL_MAX` trên bản đang chạy thật vẫn là 100 kg.** Sửa ngay trên Google Sheets:
   sheet `CAU_HINH` → `KL_MAX` → `200`. Không cần dán code, không cần deploy.
   Và kiểm tra xem đã có bao nào bị chặn oan chưa.

2. **Thứ tự cột bảng `TONG_HOP_LO` chưa khớp file Excel của bộ phận thống kê.**
   Bạn chưa gửi file đó nên tôi đặt theo suy đoán. Đây là mắt xích quyết định
   dự án có thật sự tiết kiệm 3–4 giờ/ngày hay không — gửi file, tôi sửa lại cho khớp
   để chị ấy **dán 1 lần là xong**.

3. **Chưa xác nhận con số `(163)` trên phiếu giấy.** Tôi đang hiểu đó là *tổng số bao
   đầu vào* (khớp với câu trả lời số 5 của bạn) và để nó vào cột `so_bao_vao`.
   Nếu là thứ khác thì cần chỉnh lại.

4. **Chưa rõ có ai mang vai `QUAN_LY` trong sheet `NGUOI_DUNG` không.**
   Hiện **mở lại lô đã đóng bắt buộc phải vào Google Sheets** — mà công nhân không được
   chia sẻ file đó. Mỗi lần đóng nhầm lô là phải chờ Andy mở máy tính.

5. **Chưa quyết có làm lưu trữ theo năm không.** Xem phần bản 1.5.

6. **Đo hiệu quả thật.** Trước khi mở rộng, bấm giờ 3 ngày xem riêng máy 1 buồng
   chiếm bao nhiêu phút trong 3–4 giờ nhập liệu/ngày của thống kê. Nếu chỉ ~15 phút
   thì nên chọn công đoạn tốn giờ nhất để làm tiếp, thay vì mở rộng tuần tự.

## Giới hạn đã biết (nói thẳng, không tô hồng)

- Hàng đợi offline nằm trong **chính điện thoại đó** — đổi máy hoặc xoá dữ liệu
  trình duyệt là mất phần chưa gửi.
- **Tạo lô / chốt ca / đóng lô bắt buộc phải có mạng.** Chỉ "lưu bao" chạy được offline.
- PIN lưu dạng chữ thường trong sheet — đủ chặn nhầm lẫn nội bộ, **không phải bảo mật
  cấp cao**. Vì vậy **không được chia sẻ file Google Sheets cho công nhân**.
- **Sheet `BAO` lớn dần và không tự dọn.** Ở nhịp 1000 bao/ngày là 250.000 dòng/năm.
  Bản 1.5 đã gỡ được ba đường nóng nhất, nhưng chưa có cơ chế lưu trữ theo năm.

---

## Kế hoạch chạy thử đề xuất

| Tuần | Việc |
|---|---|
| 1 | Cài đặt, 1 công nhân dùng thử, **vẫn ghi giấy song song**. Mỗi cuối ngày kiểm tra 2 việc: (a) có phải đăng nhập lại giữa ca không, (b) đóng/mở app xong hàng đợi offline có còn nguyên không — đây là phép đo rủi ro `localStorage` |
| 2 | Mở cho cả 3 công nhân, cuối tuần đối chiếu app vs giấy |
| 3–4 | Nếu lệch = 0 hai tuần liên tiếp → bỏ giấy. Đo lại giờ nhập liệu của thống kê |
| 5+ | Chốt số liệu ROI → quyết định mở rộng sang công đoạn khác |
