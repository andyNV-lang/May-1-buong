# HƯỚNG DẪN TRIỂN KHAI — Máy 1 buồng (Google Apps Script)

> Làm đúng theo thứ tự. Toàn bộ mất khoảng **25–35 phút**.
> Không cần biết lập trình, chỉ cần copy–paste.

---

## BƯỚC 0 — Chuẩn bị

- Một tài khoản Google (Gmail cá nhân dùng được).
- Máy tính (không làm được trên điện thoại).
- 11 file cần dán vào Apps Script (7 file `.gs` + 3 file HTML + `appsscript.json`).

⚠️ **Quan trọng:** tài khoản Google này sẽ là **chủ sở hữu dữ liệu**.
Nếu sau này bàn giao cho công ty, phải chuyển chủ sở hữu cả file Sheets lẫn project Apps Script.

---

## BƯỚC 1 — Tạo file Google Sheets

1. Mở https://sheets.google.com → tạo bảng tính trống.
2. Đặt tên file: **`DULIEU_MAY1BUONG`**
3. Không cần tạo sheet nào bằng tay — hệ thống sẽ tự tạo.

---

## BƯỚC 2 — Mở trình soạn thảo Apps Script

Trong file Sheets vừa tạo: menu **Tiện ích mở rộng (Extensions) → Apps Script**.

Một tab mới mở ra. Đây là nơi dán code.

---

## BƯỚC 3 — Dán code

### 3.1. Về file mặc định `Code.gs`
Trong khung bên trái có sẵn file `Code.gs`. **Cứ để yên đó, chưa động vào.**
Làm xong bước 3.2 (đã tạo đủ 7 file `.gs` mới) thì mới xoá nó: chuột phải → Delete.
Lý do phải xoá sau: Apps Script không cho xoá file cuối cùng của project.

### 3.2. Tạo và dán từng file `.gs`

Với mỗi file dưới đây: bấm **＋ → Script**, đặt tên **đúng như cột "Tên đặt trong Apps Script"** (không cần gõ đuôi `.gs`), rồi dán toàn bộ nội dung file tương ứng.

| File trong gói | Tên đặt trong Apps Script |
|---|---|
| `00_Config.gs` | `00_Config` |
| `01_Util.gs` | `01_Util` |
| `02_Setup.gs` | `02_Setup` |
| `03_Auth.gs` | `03_Auth` |
| `04_Api.gs` | `04_Api` |
| `05_Report.gs` | `05_Report` |
| `06_WebApp.gs` | `06_WebApp` |

Xong 7 file trên thì quay lại **xoá file `Code.gs`** (chuột phải → Delete).

### 3.3. Tạo và dán 3 file HTML

Bấm **＋ → HTML**, đặt tên **chính xác** (phân biệt hoa thường):

| File trong gói | Tên đặt trong Apps Script |
|---|---|
| `Index.html` | `Index` |
| `Style.html` | `Style` |
| `Script.html` | `Script` |

⚠️ Tên phải đúng **`Index`**, **`Style`**, **`Script`** — sai một chữ là app không chạy.

### 3.4. Đặt múi giờ

Bấm biểu tượng ⚙️ **Project Settings** ở cột trái → mục **Time zone** → chọn
**(GMT+07:00) Ho Chi Minh City**.

> Nếu muốn dùng luôn file `appsscript.json` trong gói: ở Project Settings tích ô
> *"Show appsscript.json manifest file in editor"*, rồi dán đè nội dung file đó.

### 3.5. Lưu
Bấm biểu tượng 💾 (Save) hoặc Ctrl+S.

---

## BƯỚC 4 — Tạo cấu trúc sheet

1. Quay lại tab **Google Sheets**, **tải lại trang (F5)**.
2. Trên thanh menu xuất hiện mục mới: **⚙️ Máy 1 buồng**.
   - Nếu chưa thấy: đợi 10 giây rồi F5 lại.
3. Bấm **⚙️ Máy 1 buồng → 1. Tạo / kiểm tra cấu trúc sheet**.
4. Google hỏi cấp quyền → **Continue → chọn tài khoản → Advanced → Go to … (unsafe) → Allow**.
   - Màn hình "unsafe" là bình thường: Google hiện như vậy với mọi script cá nhân chưa đăng ký kiểm duyệt.
5. Chạy lại bước 3 nếu lần đầu bị ngắt giữa chừng.

Kết quả: **7 sheet** được tạo — `NGUOI_DUNG`, `LO`, `BAO`, `LOG`, `CAU_HINH`,
`TONG_HOP_LO`, `CHI_SO`.

> **Bước này BẮT BUỘC chạy lại mỗi lần nâng cấp phiên bản**, kể cả khi đã cài từ trước.
> Nó tạo sheet/cột mới và dựng lại bảng đếm — chạy lại bao nhiêu lần cũng an toàn,
> **không đụng vào dữ liệu cũ**.

---

## BƯỚC 5 — Nhập danh sách người vận hành

Mở sheet **`NGUOI_DUNG`**, điền từ dòng 2:

| ma_nv | ten | pin | vai_tro | dang_dung |
|---|---|---|---|---|
| CN01 | Nguyễn Văn A | 4726 | CONG_NHAN | CO |
| CN02 | Trần Thị B | 8351 | CONG_NHAN | CO |
| CN03 | Lê Văn C | 1907 | CONG_NHAN | CO |
| TK01 | Chị Thống kê | 5583 | THONG_KE | CO |
| QL01 | Andy | 2094 | QUAN_LY | CO |

**Quy tắc:**
- `ma_nv`: viết liền, không dấu, không trùng nhau.
- `pin`: **4 chữ số**. Không đặt 1234, 0000, 1111, hay ngày sinh.
- `vai_tro`: gõ đúng một trong ba giá trị `CONG_NHAN` / `THONG_KE` / `QUAN_LY`.
  - `CONG_NHAN`: chỉ nhập liệu, **không thấy màn hình tổng hợp**.
  - `THONG_KE` / `QUAN_LY`: thấy thêm nút "Xem tổng hợp theo lô".
- `dang_dung`: `CO` = đang dùng, `KHONG` = khoá tài khoản (nghỉ việc).

---

## BƯỚC 6 — Đưa app lên mạng (Deploy)

1. Về tab **Apps Script**.
2. Góc phải trên: **Deploy → New deployment**.
3. Bấm bánh răng ⚙️ cạnh "Select type" → chọn **Web app**.
4. Điền:
   - **Description**: `Ban 1.0`
   - **Execute as**: **Me (email của bạn)** ← bắt buộc
   - **Who has access**: **Anyone** ← bắt buộc (người vận hành không có tài khoản Google)
5. Bấm **Deploy** → cấp quyền nếu được hỏi.
6. Copy **Web app URL** — đây là link gửi cho người vận hành.

> 🔒 **Vì sao chọn "Anyone" mà vẫn an toàn:** ai có link chỉ thấy màn hình nhập PIN.
> Không có mã PIN thì không vào được. Đây là mức bảo vệ phù hợp cho nội bộ nhà máy.
>
> ⚠️ **TUYỆT ĐỐI KHÔNG chia sẻ file Google Sheets cho người vận hành.** Nếu họ vào được
> Sheets, mọi phân quyền trong app đều vô nghĩa. App truy cập Sheets bằng tài khoản
> của bạn nên người vận hành **không cần** quyền gì trên file Sheets.

---

## BƯỚC 7 — Chạy thử

1. Mở link Web app trên máy tính.
2. Chọn tên → nhập PIN → vào được là đạt.
3. Bấm **TẠO LÔ MỚI**, nhập mã lô `T0748LA`, số bao vào `163`,
   khối lượng đầu vào gõ thử `1.000` → phải thấy dòng xanh **✓ Máy hiểu: 1.000 kg**.
4. Chọn **Loại 1**, nhập khối lượng `49.8` → **LƯU BAO**.
5. Kiểm tra sheet `BAO` trên Google Sheets đã có dòng mới chưa.
6. Nhập thử một bao **150 kg** → phải lưu được (khoảng cho phép là 1–200 kg).

**Kiểm tra tự động:** trong Apps Script, chọn hàm `tuKiemTra` ở ô dropdown trên cùng
→ bấm **Run** → xem kết quả ở **Execution log**. **Tất cả phải là ✅.**

Từ bản 1.5 hàm này canh thêm 4 thứ, mỗi thứ đều là một lỗi cài đặt từng gặp thật:

| Nó kiểm tra | Sai thì sao |
|---|---|
| Đã dán đủ code chưa | Sót một file khi nâng cấp → app hỏng theo kiểu khó đoán. Nó chỉ đích danh hàm nào thiếu, nằm ở file nào |
| Cột trên sheet khớp code | Quên chạy BƯỚC 4 sau khi nâng cấp |
| **Múi giờ project khớp code** | `appsscript.json` lệch `MUI_GIO` → logic tự khoá 12 giờ sai lệch đúng bằng khoảng chênh, **không báo gì cả** |
| **Bảng chỉ số & bộ đếm khớp dữ liệu gốc** | Chỉ số sai có thể cho lọt **số bao trùng**. Chữa bằng menu ⚙️ → 🔧 Dựng lại bảng đếm & chỉ số |

---

## BƯỚC 8 — Cài lên điện thoại người vận hành

Gửi link qua Zalo cho từng người, rồi làm trên máy họ:

**iPhone (Safari):** mở link → nút Chia sẻ ⬆️ → **Thêm vào MH chính** → đặt tên `MÁY 1 BUỒNG`.

**Android (Chrome):** mở link → menu ⋮ → **Thêm vào Màn hình chính**.

Từ đó app hiện như một biểu tượng riêng, mở ra là dùng, **không cần đăng nhập lại trong 14 giờ**.

---

## BƯỚC 9 — (Tuỳ chọn) Tự cập nhật bảng tổng hợp

Trong Apps Script, chọn hàm `caiTriggerTongHop` → **Run**.
Từ đó sheet `TONG_HOP_LO` tự làm mới mỗi **15 phút**, chị thống kê không phải bấm gì.

> Bản 1.4 trở về trước là 1 giờ. Muốn đổi nhịp: sheet `CAU_HINH` → `TONG_HOP_PHUT`
> (chỉ nhận 1, 5, 10, 15 hoặc 30) rồi chạy lại `caiTriggerTongHop` một lần.
> **Đã cài ở bản cũ thì phải chạy lại hàm này** mới nhận nhịp mới.

---

## VẬN HÀNH HÀNG NGÀY

> ⚠️ Menu **⚙️ Máy 1 buồng → 2. Tạo dữ liệu mẫu** đặt PIN thử `1111`/`2222`/`9999` —
> cố tình dễ nhớ để chạy thử. **Phải đổi hết trước khi dùng thật**, theo quy tắc ở BƯỚC 5.

| Việc | Ai làm | Ở đâu |
|---|---|---|
| Tạo lô, nhập bao, chốt ca | Người vận hành | App trên điện thoại |
| Xem dữ liệu thô | Thống kê | Sheet `BAO` |
| Xem tổng hợp theo lô | Thống kê | Sheet `TONG_HOP_LO` hoặc nút trong app |
| Xem ai đã nhập/sửa/xoá gì | Andy | Sheet `LOG` |
| Đổi giới hạn khối lượng, tên máy… | Andy | Sheet `CAU_HINH` |
| Mở lại lô đã đóng nhầm | Andy | Menu ⚙️ Máy 1 buồng → Mở lại 1 lô |
| Sửa mã lô gõ sai / xoá lô nhập sai | Người tạo lô, hoặc Andy | Ngay trong app, màn hình nhập bao |

---

## SỬA LỖI THƯỜNG GẶP

| Hiện tượng | Nguyên nhân & cách xử lý |
|---|---|
| Không thấy menu ⚙️ Máy 1 buồng | Chưa lưu code, hoặc chưa F5 lại trang Sheets |
| "Chưa có sheet …" | Chạy lại **Tạo / kiểm tra cấu trúc sheet** |
| Màn hình trắng khi mở link | Sai tên file HTML. Phải đúng `Index`, `Style`, `Script` |
| Trang trắng + dòng `The meta tag you specified is not allowed in this context` | Đã sửa ở v1.2.1. Nếu vẫn gặp: bạn đang chạy bản code cũ — dán lại `06_WebApp` rồi **Deploy → Manage deployments → ✏️ → New version** |
| Sửa code rồi mà mở link vẫn lỗi y hệt | Link `/exec` chạy **bản đã deploy**, không phải code mới nhất. Phải tạo **New version** thì link mới đổi |
| "Danh sách trống" ở màn đăng nhập | Chưa nhập ai vào sheet `NGUOI_DUNG`, hoặc cột `dang_dung` không phải `CO` |
| Sửa code xong app không đổi | Phải **Deploy → Manage deployments → ✏️ → Version: New version → Deploy** |
| Nâng cấp lên bản 1.3 mà app báo lỗi cột | Sheet `LO` thiếu cột mới `kl_vao`. Chạy **⚙️ Máy 1 buồng → 1. Tạo / kiểm tra cấu trúc sheet** một lần, dữ liệu cũ giữ nguyên |
| **Nâng cấp lên 1.5: danh sách lô hiện 0 bao cho mọi lô cũ** | Chưa chạy BƯỚC 4 sau khi dán code. Hai cột đếm sẵn `so_bao_ra`/`kl_ra` còn trống. Chạy **⚙️ → 1. Tạo / kiểm tra cấu trúc sheet**, hoặc **⚙️ → 🔧 Dựng lại bảng đếm & chỉ số** |
| **Nâng cấp lên 1.5: bấm ĐÓNG LÔ thì báo "Chưa xác nhận đúng mã lô"** | App trên điện thoại còn là bản cũ, không có ô gõ xác nhận. Bảo người vận hành **đóng hẳn app rồi mở lại**. Dữ liệu không mất gì |
| **`tuKiemTra` báo đỏ "Bảng chỉ số CHI_SO"** | Chạy **⚙️ → 🔧 Dựng lại bảng đếm & chỉ số**. Nếu tái diễn: có ai đang sửa tay vào sheet `CHI_SO` — sheet đó máy tự quản, đừng đụng vào |
| **`tuKiemTra` báo đỏ "Múi giờ project"** | Vào ⚙️ Project Settings trong Apps Script, đặt lại Time zone thành **(GMT+07:00) Bangkok, Hanoi, Jakarta** |
| **Người vận hành báo bao trên 100 kg không nhập được** | Sheet `CAU_HINH` → `KL_MAX` → đổi thành `200`. Có hiệu lực ngay, không cần deploy lại |
| Màn hình kết quả hiện toàn dấu `—` | Lô đó chưa có khối lượng đầu vào. Nhập vào ô trên cùng rồi bấm LƯU |
| "Hệ thống đang bận" | Hai người bấm lưu cùng lúc. Bấm lại sau 2–3 giây |
| Người vận hành quên PIN | Andy mở sheet `NGUOI_DUNG` đổi PIN mới |

---

## GIỚI HẠN CẦN BIẾT (nói thẳng)

1. **Hàng đợi offline nằm trong chính điện thoại đó.** Mất mạng vẫn nhập được, nhưng
   phải mở lại app **trên đúng máy đó** khi có mạng để dữ liệu được gửi lên. Đổi máy
   hoặc xoá dữ liệu trình duyệt = mất phần chưa gửi.
2. **Tạo lô mới / chốt ca / đóng lô BẮT BUỘC phải có mạng.** Chỉ thao tác "lưu bao"
   mới chạy được offline.
3. **PIN 4 số lưu dạng chữ thường trong sheet.** Đủ chặn nhầm lẫn nội bộ, không phải
   bảo mật cấp cao. Ai xem được sheet là xem được PIN — nên chỉ Andy giữ quyền vào Sheets.
4. **Google Sheets chậm dần khi vượt ~50.000 dòng** ở sheet `BAO`. Với ~50 bao/ngày thì
   khoảng 3 năm mới tới ngưỡng. Khi tới, tạo file mới theo năm.
5. Số lượt chạy Apps Script/ngày có giới hạn theo loại tài khoản. Với 3–10 người vận hành
   thì không chạm ngưỡng; nếu mở rộng lên vài chục người cần theo dõi lại.
