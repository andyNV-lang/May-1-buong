# CÁCH LÀM VIỆC VỚI THƯ MỤC NÀY

**Dành cho Andy — người không phải lập trình viên.**
Trả lời hai câu hỏi: *thư mục này có những file gì* và *muốn sửa thì làm theo trình tự nào để không hỏng*.

> Ba file tài liệu kia trả lời việc khác: `0_DOC_TRUOC.md` = hệ thống này là gì,
> `1_HUONG_DAN_TRIEN_KHAI.md` = cài đặt lần đầu, `TIEN_DO.md` = đang dở ở đâu.
> File này = **quy trình tay chân hằng ngày.**

---

## 1. Điều quan trọng nhất: ở đây có HAI thế giới

Đây là chỗ hay nhầm nhất, và hiểu sai chỗ này là gốc của gần như mọi rắc rối.

| | **Máy tính của Andy** | **Google** |
|---|---|---|
| Nằm ở đâu | Thư mục `may1buong_appscript/` này | script.google.com + file Google Sheets |
| Chứa gì | Bản gốc của toàn bộ code + tài liệu | Bản đang chạy thật, người vận hành đang dùng |
| Sửa ở đây thì | **Chưa ảnh hưởng gì tới người vận hành** | Ảnh hưởng **ngay lập tức** |

Hai thế giới này **không tự đồng bộ với nhau.** Sửa file trong thư mục này xong,
app của người vận hành vẫn y nguyên như cũ cho tới khi Andy tự tay dán code lên Apps Script
và bấm **Triển khai lại**.

Hệ quả cần nhớ:

- Sửa trong thư mục này thì **an toàn tuyệt đối** — cứ thử thoải mái.
- **Đừng bao giờ sửa trực tiếp trên script.google.com.** Sửa trên đó xong là bản gốc
  dưới máy và bản đang chạy trên Google khác nhau, và không ai còn biết bản nào đúng.
  Luôn sửa dưới máy trước, rồi dán lên.

---

## 2. Bản đồ thư mục

### Nhóm A — 7 file `.gs`: bộ não, chạy trên máy chủ Google

Đây là phần **phải dán lên Apps Script**. Số ở đầu tên file là thứ tự đọc, không phải thứ tự quan trọng.

| File | Dòng | Làm gì | Khi nào cần đụng vào |
|---|---:|---|---|
| `00_Config.gs` | 244 | Toàn bộ hằng số: tên 7 sheet, tên từng cột, giá trị mặc định, quy tắc nghiệp vụ ghi ở đầu file | Thêm cột mới vào sheet. **Đọc kỹ mục 5 trước khi đụng** |
| `01_Util.gs` | 757 | Dụng cụ chung: đọc/ghi sheet, khoá chống hai người ghi cùng lúc, làm tròn, kiểm tra dữ liệu | Hiếm. Sửa ở đây là ảnh hưởng cả hệ thống |
| `02_Setup.gs` | 378 | Menu ⚙️ trong Google Sheets + lệnh tự tạo cấu trúc sheet | Thêm một mục vào menu ⚙️ |
| `03_Auth.gs` | 183 | Đăng nhập PIN, chống dò PIN, cấp "vé" cho điện thoại | Hiếm. Đụng vào là đụng vào bảo mật |
| `04_Api.gs` | **1657** | **File lớn nhất và quan trọng nhất.** Mọi việc người vận hành bấm trên điện thoại đều chạy vào đây: tạo lô, lưu bao, sửa, xoá, chốt ca, đóng lô | Đa số việc sửa nghiệp vụ nằm ở đây |
| `05_Report.gs` | 245 | Bảng `TONG_HOP_LO` cho bộ phận thống kê + công thức tính tỉ lệ thu hồi / hao hụt | Đổi cách tính tỉ lệ, thêm cột vào bảng tổng hợp |
| `06_WebApp.gs` | 270 | Cửa vào của app — hàm `doGet` chạy khi người vận hành bấm link | Rất hiếm |

### Nhóm B — 3 file HTML: cái người vận hành nhìn thấy

Cũng **phải dán lên Apps Script**. Ba file này ghép lại thành một trang duy nhất.

| File | Dòng | Làm gì |
|---|---:|---|
| `Index.html` | 441 | **Bộ khung** — có những màn hình nào, nút nào, ô nhập nào |
| `Script.html` | 2149 | **Cách màn hình cư xử** — bấm nút thì gì xảy ra, gọi máy chủ, xếp hàng chờ khi mất mạng |
| `Style.html` | 453 | **Màu sắc, cỡ chữ, cỡ nút.** Nút to, tương phản cao vì xưởng thiếu sáng và người vận hành đeo găng |

Muốn *đổi chữ trên nút* → `Index.html`. Muốn *đổi màu / cỡ chữ* → `Style.html`.
Muốn *đổi việc bấm nút thì làm gì* → `Script.html`.

### Nhóm C — cấu hình dự án

| File | Làm gì |
|---|---|
| `appsscript.json` | 10 dòng, cũng phải dán lên. Đặt múi giờ Việt Nam, bật V8, và cho phép **bất kỳ ai có link** đều mở được app (`ANYONE_ANONYMOUS`) — đó là lý do người vận hành không cần tài khoản Google |

### Nhóm D — 6 file tài liệu `.md`

Không dán lên Google. Chỉ để đọc.

| File | Dòng | Ai đọc |
|---|---:|---|
| `0_DOC_TRUOC.md` | 360 | Andy — hệ thống là gì, lịch sử các bản, đã sửa lỗi nào |
| `1_HUONG_DAN_TRIEN_KHAI.md` | 244 | Andy — 9 bước cài đặt từ số 0, mất 25–35 phút |
| `2_CAU_TRUC_SHEET.md` | 274 | Andy + bộ phận thống kê — 7 sheet có cột gì, nghĩa là gì |
| `3_HUONG_DAN_CONG_NHAN.md` | 182 | **Người vận hành** — 1 trang A4 in ra ép nhựa dán tại máy |
| `4_CACH_LAM_VIEC.md` | — | File này |
| `TIEN_DO.md` | 794 | **Claude ở phiên trò chuyện sau** — đang dở ở đâu, chờ quyết gì |

> `TIEN_DO.md` là file quan trọng nhất mà Andy hay quên. Mỗi lần mở một cuộc trò chuyện
> mới với Claude, bảo nó đọc `0_DOC_TRUOC.md` + `TIEN_DO.md` trước là đỡ được rất nhiều
> giải thích lại từ đầu.

### Nhóm E — `cong_cu/`: chạy dưới máy Andy, **KHÔNG BAO GIỜ dán lên Google**

| File | Chạy bằng lệnh gì | Làm gì |
|---|---|---|
| `chay_kiemthu.sh` | `bash cong_cu/chay_kiemthu.sh` | **Dùng nhiều nhất.** Chạy 431 bài kiểm tra logic trong ~1 giây, không cần mạng, không đụng dữ liệu thật |
| `tao_mo_phong.py` | `python3 cong_cu/tao_mo_phong.py` | Dựng `mo_phong.html` để **thử giao diện ngay trên máy**, không cần deploy |
| `tao_pdf.py` | `python3 cong_cu/tao_pdf.py` | Xuất 2 file hướng dẫn ra PDF để in (dùng Google Chrome) |
| `md2html.py` | (tao_pdf gọi tự động) | Chuyển markdown sang HTML |
| `dem_trang.py` | `python3 cong_cu/dem_trang.py file.pdf` | Đếm số trang PDF — kiểm tra hướng dẫn người vận hành có vừa 1 trang A4 không |
| `do_hieu_nang.js` | `node cong_cu/do_hieu_nang.js` | Đo mỗi thao tác tốn bao nhiêu ô Google Sheets. Google tính tiền theo ô, không theo giây |
| `IN_*.html`, `_du_lieu_mau.html`, `_gia_lap.html` | — | File phụ trợ do các công cụ trên dùng |

### Nhóm F — 2 file kiểm thử `.js.txt`

Đuôi `.txt` là cố ý, để Apps Script không nhận nhầm là code cần chạy.

| File | Tình trạng |
|---|---|
| `9_KIEMTHU_LOGIC.js.txt` | **Chạy tốt trên máy Andy.** 431 bài, gọi bằng `chay_kiemthu.sh` |
| `9_KIEMTHU_GIAODIEN.js.txt` | **Hiện KHÔNG chạy được trên máy Andy** — nó tìm trình duyệt ở đường dẫn Linux `/opt/pw-browsers/...` không có trên macOS. Cần thì nhờ Claude sửa đường dẫn |

### Nhóm G — file sinh ra tự động

| File | |
|---|---|
| `mo_phong.html` | 6633 dòng, **do `tao_mo_phong.py` tự dựng ra**. Đừng sửa tay — lần chạy sau là mất hết |
| `.git/` (thư mục ẩn) | Sổ lịch sử phiên bản. Đừng đụng vào |
| `.gitignore` | Danh sách rác không cần lưu lịch sử |

---

## 3. Trước khi sửa code: kiểm tra xem có cần sửa code không

**Rất nhiều thứ chỉnh được ngay trong Google Sheets, không cần đụng một dòng code nào.**
Mở file `DULIEU_MAY1BUONG` → sheet **`CAU_HINH`** → sửa cột giá trị → xong ngay lập tức,
không cần dán lại gì hết:

| Khoá trong sheet CAU_HINH | Mặc định | Ý nghĩa |
|---|---:|---|
| `KL_MIN` / `KL_MAX` | 1 / 200 | Khối lượng cho phép của 1 bao (kg) |
| `KL_VAO_MAX` | 100000 | Khối lượng đầu vào tối đa 1 lô |
| `SO_LE` | 1 | Số chữ số thập phân của khối lượng |
| `PIN_DO_DAI` | 4 | Số ký tự mã PIN |
| `PIN_SAI_TOI_DA` / `PIN_KHOA_PHUT` | 5 / 5 | Nhập sai mấy lần thì khoá, khoá mấy phút |
| `PHIEN_GIO` | 14 | Đăng nhập một lần dùng được mấy giờ |
| `TU_KHOA_SAU_GIO` | 12 | Bao tự khoá sau mấy giờ dù chưa chốt ca (0 = tắt) |
| `CANH_BAO_NHAY_SO` | 20 | Cảnh báo khi số bao nhảy cách quá xa |
| `HAO_HUT_MIN` / `HAO_HUT_MAX` | 20 / 30 | Ngưỡng cảnh báo tỉ lệ hao hụt (%) |
| `SO_BAO_MOI_LAN` | 20 | Nhập tối đa mấy bao trong một lần lưu |
| `TIEN_TO_A` / `TIEN_TO_B` | T / D | Ký tự đầu mã lô ứng với ký hiệu A / B |
| `TONG_HOP_PHUT` | 15 | Bao lâu tự cập nhật bảng tổng hợp một lần |
| `TEN_MAY` | MÁY 1 BUỒNG | Tên hiện trên đầu màn hình |

**Đổi giới hạn cân, đổi ngưỡng cảnh báo, đổi tên máy, đổi thời gian khoá — tất cả đều
là sửa sheet, không phải sửa code.** Chỉ khi việc muốn làm không nằm trong bảng trên
thì mới bước sang mục 4.

---

## 4. Quy trình sửa code — 7 bước

Làm đúng thứ tự. Mỗi bước là một cái lưới an toàn.

**Bước 1 — Chốt một mốc an toàn.**

```bash
cd ~/Desktop/"Hỗ trợ nhập liệu"/may1buong_appscript
git status
```

Nếu hiện `nothing to commit, working tree clean` là sạch, đi tiếp.
Nếu đang có sửa dở thì hoặc chốt lại:

```bash
git add -A && git commit -m "Mo ta ngan viec vua lam"
```

hoặc vứt bỏ hết sửa dở: `git checkout -- .`

**Bước 2 — Nói rõ điều muốn thay đổi.**

Nói với Claude bằng tiếng Việt đời thường, **mô tả hiện tượng chứ đừng đoán tên file**:

> *"Người vận hành báo là khi nhập bao thứ 3 trở đi thì máy gợi ý sai số bao."*

Tốt hơn nhiều so với *"sửa hàm apiLuuBao trong 04_Api.gs"* — vì bệnh có thể không nằm ở đó.

**Bước 3 — Để Claude sửa dưới máy.** Chưa đụng gì tới Google, chưa ai bị ảnh hưởng.

**Bước 4 — Chạy kiểm thử. Đây là bước không được bỏ.**

```bash
bash cong_cu/chay_kiemthu.sh
```

Phải thấy dòng cuối: `KẾT QUẢ:  431 đạt / 0 lỗi` (số 431 sẽ tăng khi thêm tính năng mới).
**Còn dù chỉ 1 lỗi thì dừng lại**, đưa nguyên đoạn báo lỗi cho Claude, đừng dán lên Google.

**Bước 5 — Thử tay giao diện** (chỉ khi có sửa `Index/Script/Style.html`):

```bash
python3 cong_cu/tao_mo_phong.py
python3 -m http.server 8777
```

Rồi mở `http://localhost:8777/mo_phong.html`. Bấm thử như người vận hành.
⚠️ Phải mở qua `http://`, mở bằng cách nhấp đúp vào file thì trình duyệt chặn.
Xong thì bấm `Ctrl+C` ở cửa sổ Terminal để tắt.

**Bước 6 — Ghi mốc mới vào sổ.**

```bash
git add -A && git commit -m "Sua goi y so bao khi nhap tu bao thu 3"
```

**Bước 7 — Đưa lên Google.**

1. Mở script.google.com → project của máy 1 buồng.
2. Với **mỗi file đã sửa**: mở file cùng tên bên đó, **xoá sạch toàn bộ**, dán bản mới vào.
   *(Chỉ dán những file thật sự đã sửa. Không cần dán lại cả 11 file.)*
3. Bấm **Lưu** (biểu tượng đĩa mềm).
4. Bấm **Triển khai → Quản lý các bản triển khai → biểu tượng bút chì → Phiên bản: Phiên bản mới → Triển khai.**

> ⚠️ **Bước 4 là bước hay quên nhất.** Chỉ bấm Lưu mà không Triển khai lại thì
> **link của người vận hành vẫn chạy code cũ.** Sửa xong thấy "không có gì thay đổi" thì
> 9/10 lần là quên bước này.

**Muốn biết đang cần dán những file nào?** Hỏi git:

```bash
git diff --name-only HEAD~1
```

---

## 5. Bốn luật không được phá

**Luật 1 — Cột mới phải thêm vào CUỐI.**
Sheet khớp dữ liệu theo **vị trí cột**, không theo tên. Chèn một cột vào giữa là
toàn bộ dữ liệu đã có bị lệch sang một ô — số bao thành khối lượng, ngày thành tên người.
Ghi rõ ngay trong `00_Config.gs`, nhưng dễ quên nhất.

**Luật 2 — Không đổi tên sheet, không đổi tên cột.** Code tìm theo đúng tên đó.

**Luật 3 — Không sửa tay vào sheet `TONG_HOP_LO`.** Sheet này bị ghi đè toàn bộ
mỗi 15 phút. Mọi thứ gõ vào đó sẽ biến mất.

**Luật 4 — Không đưa file Google Sheets cho người vận hành.** Người vận hành chỉ nhận **link app**.
Ai mở được file Sheets là xem được PIN của tất cả mọi người.

---

## 6. Khi hỏng thì lùi lại

Đây là lý do có git. Ba lệnh, dùng theo tình huống:

**Vừa sửa xong thấy sai, chưa commit — vứt hết, quay về mốc gần nhất:**

```bash
git checkout -- .
```

**Đã commit rồi mới thấy sai — quay về ngay trước đó:**

```bash
git reset --hard HEAD~1
```

**Xem lại lịch sử các mốc:**

```bash
git log --oneline
```

Sau khi lùi dưới máy, muốn người vận hành cũng quay về bản cũ thì **phải dán lại lên Apps Script**
và triển khai lại — lùi dưới máy không tự lùi trên Google.

> **Còn một lưới an toàn nữa Google cho sẵn:** trong Apps Script, menu
> **Tệp → Xem lịch sử phiên bản** giữ lại các bản đã dán. Còn dữ liệu thì
> Google Sheets có **Tệp → Lịch sử phiên bản** riêng.

---

## 7. Sổ tay lệnh

Mở Terminal, dán dòng đầu tiên trước, rồi dùng các dòng sau.

```bash
# Vào thư mục dự án (luôn chạy dòng này trước)
cd ~/Desktop/"Hỗ trợ nhập liệu"/may1buong_appscript

# Xem đang sửa những gì, đã sạch chưa
git status

# Chạy 431 bài kiểm thử  (bắt buộc trước khi dán lên Google)
bash cong_cu/chay_kiemthu.sh

# Thử giao diện trên máy
python3 cong_cu/tao_mo_phong.py
python3 -m http.server 8777          # mở http://localhost:8777/mo_phong.html — Ctrl+C để tắt

# Chốt một mốc an toàn
git add -A && git commit -m "Mo ta ngan viec vua lam"

# Xem lịch sử các mốc
git log --oneline

# Xem lần sửa gần nhất đụng vào những file nào (= những file cần dán lên Google)
git diff --name-only HEAD~1

# Vứt bỏ mọi sửa đổi chưa commit
git checkout -- .

# In lại 2 file hướng dẫn ra PDF
python3 cong_cu/tao_pdf.py
```

---

## 8. Bảng tra nhanh: muốn sửa X thì mở file nào

| Muốn làm gì | Chỗ cần sửa |
|---|---|
| Đổi giới hạn cân, ngưỡng cảnh báo, tên máy, thời gian khoá | **Sheet `CAU_HINH`** — không đụng code |
| Thêm / sửa / khoá tài khoản người vận hành, đổi PIN | **Sheet `NGUOI_DUNG`** — không đụng code |
| Đổi chữ trên nút, thêm ô nhập | `Index.html` |
| Đổi màu, cỡ chữ, cỡ nút | `Style.html` |
| Đổi hành vi khi bấm nút | `Script.html` |
| Đổi quy tắc nghiệp vụ (ai được sửa gì, khi nào khoá) | `04_Api.gs` |
| Đổi công thức tỉ lệ thu hồi / hao hụt | `05_Report.gs` |
| Thêm cột vào sheet | `00_Config.gs` (**thêm vào CUỐI**) + `02_Setup.gs` |
| Thêm mục vào menu ⚙️ | `02_Setup.gs` |
| Sửa cách đăng nhập / PIN | `03_Auth.gs` |

---

## 9. Ba câu nên nói với Claude ở đầu mỗi phiên mới

1. *"Đọc `0_DOC_TRUOC.md` và `TIEN_DO.md` trước đã."*
2. *"Chạy `bash cong_cu/chay_kiemthu.sh` sau khi sửa xong, phải 0 lỗi."*
3. *"Sửa xong thì commit lại giúp tôi và cho biết cần dán những file nào lên Apps Script."*
