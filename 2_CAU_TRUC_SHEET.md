# CẤU TRÚC DỮ LIỆU — Máy 1 buồng

Hệ thống tự tạo **7 sheet** (bản 1.5 thêm `CHI_SO`). **Không đổi tên sheet và không
đổi tên cột** — code đọc theo đúng tên này.

---

## 1. `NGUOI_DUNG` — Andy nhập tay

| Cột | Kiểu | Ý nghĩa |
|---|---|---|
| `ma_nv` | Chữ | Mã nhân viên, viết liền không dấu. VD `CN01`. Không trùng |
| `ten` | Chữ | Tên hiển thị trên app. VD `Nguyễn Văn A` |
| `pin` | 4 chữ số | Mã PIN đăng nhập. Hệ thống tự đặt ô này về dạng **Văn bản** để không mất số 0 đứng đầu (0472). Nếu lỡ mất, code vẫn tự bù lại |
| `vai_tro` | Chọn | `CONG_NHAN` / `THONG_KE` / `QUAN_LY`. **Gõ đúng từng ký tự.** Gõ sai kiểu gì (có dấu, thiếu gạch dưới, để trống) đều bị hạ về `CONG_NHAN` — quyền thấp nhất. Nếu chị thống kê không thấy nút "Xem tổng hợp", kiểm tra ô này trước tiên |
| `dang_dung` | Chọn | `CO` = hoạt động, `KHONG` = khoá |

---

## 2. `LO` — app tự ghi (Andy có thể nhập trước mã lô)

| Cột | Ý nghĩa |
|---|---|
| `ma_lo` | Mã lô, VD `T0748LA`. Ký tự đầu **T** → ký hiệu A, **D** → ký hiệu B |
| `ky_hieu` | `A` hoặc `B`. **Máy tự suy ra**, không nhập tay |
| `so_bao_vao` | Tổng số bao đầu vào. Được phép để trống |
| `kl_vao` | **Tổng khối lượng đầu vào (kg)** — người vận hành tự nhập. Là MẪU SỐ để tính tỉ lệ thu hồi. Nhập lúc tạo lô, hoặc bổ sung sau ở màn hình "Xem trước kết quả". Cột này nằm ở **cuối bảng** vì được thêm sau khi đã có dữ liệu thật |
| `trang_thai` | `DANG_CHAY` / `DA_DONG` |
| `ghi_chu` | Ghi chú tự do |
| `nguoi_mo` | Mã NV người tạo lô |
| `tg_mo` | Thời điểm tạo lô |
| `nguoi_dong` | Mã NV người đóng lô |
| `tg_dong` | Thời điểm đóng lô |
| `so_bao_ra` | **(bản 1.5)** Số bao đã nhập của lô — máy cộng dồn sẵn. **KHÔNG SỬA TAY** |
| `kl_ra` | **(bản 1.5)** Tổng khối lượng đã nhập (kg) — máy cộng dồn sẵn. **KHÔNG SỬA TAY** |

> **Hai cột `so_bao_ra` / `kl_ra` là bản đếm sẵn cho nhanh, không phải số liệu gốc.**
> Số liệu gốc luôn là sheet `BAO`. Trước bản 1.5, màn hình danh sách lô đọc toàn bộ
> sheet `BAO` chỉ để đếm hai con số này — với 250.000 dòng thì đó là 3,25 triệu ô cho
> một màn hình người vận hành mở liên tục trong ca.
> Nghi hai cột này lệch thì chạy menu ⚙️ → **🔧 Dựng lại bảng đếm & chỉ số**.

> Muốn thống kê nhập sẵn danh sách mã lô: thêm dòng vào sheet này với
> `trang_thai = DANG_CHAY`. Cột `ky_hieu` có thể bỏ trống, app sẽ tự suy ra.

---

## 3. `BAO` — app tự ghi. **KHÔNG SỬA TAY**

| Cột | Ý nghĩa |
|---|---|
| `id` | Mã duy nhất của dòng (máy sinh) |
| `ma_lo` | Thuộc lô nào |
| `ky_hieu` | `A` / `B`, chép từ lô |
| `loai` | `1` / `2` / `3` — người vận hành chọn |
| `stt_bao` | Số thứ tự bao, người vận hành tự đánh. **Không trùng trong cùng (ký hiệu + loại)** |
| `khoi_luong` | kg, trong khoảng cấu hình (mặc định 1–100) |
| `phien` | Mã phiên làm việc — dùng để CHỐT CA theo từng lượt nhập |
| `trang_thai` | `DANG_NHAP` (còn sửa được) / `DA_CHOT` (đã khoá) |
| `nguoi_nhap` | **Ai đã nhập dòng này** |
| `tg_nhap` | Thời điểm nhập |
| `nguoi_sua` | Ai sửa lần cuối (nếu có) |
| `tg_sua` | Thời điểm sửa lần cuối |
| `client_id` | Mã chống gửi trùng khi mạng chập chờn |

**Quy tắc khoá (kiểm tra ở MÁY CHỦ, không phải chỉ ẩn nút):** một dòng chỉ sửa/xoá được khi
đồng thời thoả **cả 4** điều kiện:

1. `trang_thai = DANG_NHAP` (chưa bấm CHỐT CA)
2. `nguoi_nhap` = chính người đang đăng nhập
3. Lô còn `DANG_CHAY`
4. Nhập chưa quá `TU_KHOA_SAU_GIO` giờ (mặc định 12h)

→ Người vận hành **không sửa được số liệu của nhau** và **không sửa được số liệu cũ**,
kể cả khi quên bấm CHỐT CA (điều kiện 4 lo phần này).

**CHỐT CA** khoá **toàn bộ** bao còn treo của người đó **trong lô đang mở** — kể cả bao
sót lại từ ca trước. Bao ở **lô khác** đang nhập dở **không bị đụng tới** (người vận hành có
chạy nhiều lô song song — Andy xác nhận 20/08/2026).

Để không còn dòng "mồ côi", mỗi lần chốt ca máy còn quét dọn thêm những bao của người đó
ở lô khác **đã quá `TU_KHOA_SAU_GIO` giờ** — các bao đó dù sao cũng đã hết sửa được rồi.

---

## 4. `LOG` — nhật ký thao tác. **CHỈ ĐỌC**

| Cột | Ý nghĩa |
|---|---|
| `tg` | Thời điểm |
| `ma_nv`, `ten` | Ai làm |
| `hanh_dong` | `DANG_NHAP`, `DANG_NHAP_SAI`, `TAO_LO`, `THEM_BAO`, `THEM_NHIEU_BAO`, `SUA_BAO`, `XOA_BAO`, `SUA_KL_VAO`, `SUA_MA_LO`, `XOA_LO`, `CHOT_CA`, `DONG_LO`, `MO_LAI_LO`, `XOA_TOAN_BO` |
| `bang` | Tác động lên sheet nào |
| `khoa` | ID dòng / mã lô liên quan |
| `gia_tri_cu` | Giá trị **trước** khi sửa |
| `gia_tri_moi` | Giá trị **sau** khi sửa |
| `ghi_chu` | Cảnh báo, ghi chú kèm theo |

Đây là nơi trả lời câu hỏi *"ai đã sửa 49.8 thành 43.1 lúc mấy giờ"*.

> 🔒 Menu **🧹 XOÁ TOÀN BỘ DỮ LIỆU** xoá `LO`, `BAO`, `TONG_HOP_LO` nhưng **giữ nguyên
> sheet `LOG`**, và ghi thêm một dòng `XOA_TOAN_BO` ghi nhận chính việc xoá đó.

---

## 5. `CAU_HINH` — Andy chỉnh, không cần sửa code

| khoa | Mặc định | Ý nghĩa |
|---|---|---|
| `KL_MIN` | 1 | Khối lượng tối thiểu 1 bao (kg) |
| `KL_MAX` | **200** | Khối lượng tối đa 1 bao (kg). **Bản 1.4 trở về trước để 100 — chặn oan bao thật của xưởng** |
| `SO_LE` | 1 | Số chữ số thập phân |
| `PIN_DO_DAI` | 4 | Độ dài mã PIN |
| `PIN_SAI_TOI_DA` | 5 | Số lần sai trước khi khoá tạm |
| `PIN_KHOA_PHUT` | 5 | Số phút khoá |
| `PHIEN_GIO` | 14 | Số giờ không phải đăng nhập lại |
| `TU_KHOA_SAU_GIO` | 12 | **Tự khoá bao sau N giờ dù chưa bấm CHỐT CA** (đặt 0 để tắt) |
| `CANH_BAO_NHAY_SO` | 20 | Cảnh báo nếu số bao nhảy quá xa |
| `HAO_HUT_MIN` | 20 | Cảnh báo nếu tỉ lệ hao hụt **thấp hơn** mức này (%) |
| `HAO_HUT_MAX` | 30 | Cảnh báo nếu tỉ lệ hao hụt **cao hơn** mức này (%) |
| `KL_VAO_MAX` | 100000 | **(bản 1.5)** Khối lượng đầu vào tối đa 1 lô (kg) — chặn gõ thừa số 0 |
| `SO_BAO_MOI_LAN` | 20 | Số bao tối đa nhập được trong cùng một lần lưu |
| `TONG_HOP_PHUT` | 15 | **(bản 1.5)** Bao lâu tự cập nhật bảng tổng hợp 1 lần (chỉ nhận 1/5/10/15/30) |
| `TIEN_TO_A` | T | Ký tự đầu mã lô ứng với ký hiệu **A** |
| `TIEN_TO_B` | D | Ký tự đầu mã lô ứng với ký hiệu **B** |
| `TEN_MAY` | MÁY 1 BUỒNG | Tên hiện trên đầu app |

> Sửa xong nên tải lại app trên điện thoại để nhận giá trị mới.

---

## 6. `TONG_HOP_LO` — máy ghi đè hoàn toàn mỗi lần cập nhật

Một dòng = một lô:

`ma_lo | ky_hieu | trang_thai | ngay_mo | ngay_dong | so_bao_vao |
so_bao_L1 | kl_L1 | so_bao_L2 | kl_L2 | so_bao_L3 | kl_L3 |
tong_so_bao_ra | tong_kl_ra | kl_trung_binh_bao | nguoi_nhap | ghi_chu | cap_nhat_luc |
kl_vao | ti_le_L1 | ti_le_L2 | ti_le_L3 | ti_le_hao_hut`

> 5 cột cuối (`kl_vao` → `ti_le_hao_hut`) là **phần tôi thêm ở bản 1.3**, chưa nằm trong
> yêu cầu ban đầu. Thêm vì bộ phận thống kê cần thấy tỉ lệ thu hồi ngay trên bảng tổng hợp,
> khỏi tính tay. Không cần thì báo tôi bỏ đi.

⚠️ **Không gõ gì vào sheet này** — mọi thay đổi sẽ bị ghi đè ở lần cập nhật kế tiếp.

**Cách làm mới:** menu ⚙️ Máy 1 buồng → 🔄 Cập nhật bảng TỔNG HỢP THEO LÔ.
Hoặc chạy hàm `caiTriggerTongHop` một lần để nó tự chạy mỗi giờ.

---

---

## 7. `CHI_SO` — máy tự quản. ⛔ **TUYỆT ĐỐI KHÔNG SỬA TAY** (bản 1.5)

Đúng **6 dòng**, mỗi dòng một nhóm đánh số bao: `A1 A2 A3 B1 B2 B3`.

| Cột | Ý nghĩa |
|---|---|
| `nhom` | `A1` … `B3` — ghép từ ký hiệu + loại |
| `stt_max` | **Số bao lớn nhất từng dùng của nhóm** |
| `so_bao` | Tổng số bao của nhóm (để theo dõi) |
| `cap_nhat_luc` | Lần cập nhật gần nhất |

### Bảng này để làm gì

Mỗi lần lưu bao, máy phải trả lời *"số bao này đã ai dùng chưa"*. Trước bản 1.5 nó trả
lời bằng cách đọc **toàn bộ** sheet `BAO`. Ở nhịp 1000 bao/ngày, sau 1 năm là 250.000
dòng — tức 3,25 triệu ô cho một thao tác mà người vận hành đang đứng chờ.

Với bảng này, máy chỉ cần so với `stt_max`:

- Số bao mới **lớn hơn** `stt_max` → chắc chắn chưa ai dùng, **khỏi đọc sheet `BAO`**.
  Đây là gần như 100% trường hợp thật, vì máy điền sẵn số tăng dần.
- Số bao mới **nhỏ hơn hoặc bằng** → mới quét sheet `BAO` để dò. Đó đúng là tình huống
  người vận hành tự gõ một số cũ, tức tình huống cần bắt.

### Vì sao không được sửa tay

`stt_max` **chỉ được tăng, không bao giờ giảm** — kể cả khi xoá bao. Để nó cao hơn thực
tế là an toàn (cùng lắm máy quét thêm vài lần). **Hạ nó xuống là mở đường cho số bao
trùng lọt qua** — hỏng đúng lời hứa quan trọng nhất của hệ thống.

Có hai lưới an toàn:

1. Chạy hàm **`tuKiemTra`** — nó đối chiếu bảng này với dữ liệu gốc và **báo đỏ** nếu lệch.
2. Menu ⚙️ → **🔧 Dựng lại bảng đếm & chỉ số** — tính lại từ sheet `BAO`, chữa được ngay.
   Chạy lại bao nhiêu lần cũng an toàn.

---

## 7b. AI ĐƯỢC SỬA MÃ LÔ / XOÁ LÔ / ĐÓNG LÔ

Áp dụng từ bản 1.4. Kiểm tra ở **máy chủ**, không phải chỉ ẩn nút.

| Việc | Người tạo lô | Quản lý (`QUAN_LY`) | Người khác |
|---|---|---|---|
| Sửa mã lô (lô đang chạy) | ✅ | ✅ | ❌ |
| Xoá lô — chỉ có bao của chính mình, chưa chốt ca | ✅ | ✅ | ❌ |
| Xoá lô — có bao của **người khác** | ❌ | ✅ | ❌ |
| Xoá lô — đã có bao **CHỐT CA** | ❌ | ✅ | ❌ |
| Sửa / xoá lô **đã ĐÓNG** | ❌ | ❌ | ❌ |
| **Đóng lô** (bản 1.5) | ✅ | ✅ | ✅ — nhưng **phải gõ lại mã lô** |

> **Về đóng lô (thay đổi ở bản 1.5).** Trước bản 1.5, hàm đóng lô **không kiểm tra
> quyền gì cả**: ai cũng khoá vĩnh viễn được lô của người khác chỉ bằng một cú bấm,
> trong khi sửa mã lô và xoá lô đều có chốt chặn. Andy chốt phương án: **ai cũng đóng
> được** (ca sau đóng lô do ca trước tạo là chuyện bình thường ở xưởng) **nhưng phải gõ
> lại đúng mã lô để xác nhận**, giống hộp thoại xoá lô. Vẫn giữ nguyên chốt chặn cũ:
> người khác còn bao chưa CHỐT CA thì không ai đóng được.

**Ba giới hạn trên là do tôi đặt thêm, ngoài yêu cầu ban đầu — Andy đọc kỹ chỗ này:**

1. **Người vận hành không xoá được lô có bao của người khác.** Yêu cầu gốc nói "người tạo lô
   xoá được", nhưng hệ thống này có một lời hứa từ đầu là *"không sửa số liệu của nhau"*.
   Cho phép người tạo lô xoá cả phần đồng nghiệp đã nhập là phá lời hứa đó. Quản lý vẫn xoá được.
2. **Người vận hành không xoá được lô đã có bao CHỐT CA.** Chốt ca nghĩa là *"khoá vĩnh viễn"*.
   Nếu xoá lô bỏ qua được, câu đó không còn đúng nữa. Quản lý vẫn xoá được.
3. **Lô đã ĐÓNG thì không ai sửa/xoá được**, kể cả quản lý. Muốn sửa thì mở lại lô trước
   (menu ⚙️ Máy 1 buồng → 🔓 Mở lại 1 lô), để việc mở lại có dấu vết riêng trong nhật ký.

Thấy chặt quá thì báo tôi nới ra — đây là lựa chọn của tôi, không phải ràng buộc kỹ thuật.

**Sửa mã lô làm gì bên dưới:** đổi `ma_lo` ở sheet `LO` **và đổi kèm mọi dòng ở sheet `BAO`**
trong cùng một khoá ghi. `ma_lo` là khoá nối hai sheet — đổi một nơi mà quên nơi kia thì toàn bộ
bao đã nhập thành dòng mồ côi, coi như mất trắng.

⚠️ **Nếu sửa cả chữ cái đầu** (`T` ↔ `D`), ký hiệu đổi `A` ↔ `B`, kéo cả lô sang **nhóm đánh số
bao khác**. Máy soát trước xem có bao nào bị trùng số ở nhóm mới không; có trùng thì **từ chối
và giữ nguyên mọi thứ**, không sửa nửa vời.

**Xoá lô làm gì bên dưới:** chụp toàn bộ số liệu của lô vào sheet `LOG` (từng bao: nhóm, số bao,
khối lượng, người nhập) **trước khi** xoá, rồi mới xoá dòng lô và toàn bộ bao. Xoá xong vẫn tra
được lô đó từng có gì. Người vận hành phải **gõ lại đúng mã lô** để xác nhận.

---

## 7. CÁCH TÍNH TỈ LỆ THU HỒI VÀ HAO HỤT

Áp dụng từ bản 1.3 (Andy chốt 20/08/2026):

```
tỉ lệ thu hồi loại 1 = tổng KL các bao loại 1 của lô ÷ kl_vao × 100      (2 số lẻ)
tỉ lệ thu hồi loại 2 = tổng KL các bao loại 2 của lô ÷ kl_vao × 100      (2 số lẻ)
tỉ lệ thu hồi loại 3 = tổng KL các bao loại 3 của lô ÷ kl_vao × 100      (2 số lẻ)

tỉ lệ hao hụt = 100% − (tỉ lệ L1 + tỉ lệ L2 + tỉ lệ L3)
```

Phép trừ thực hiện trên các số **đã làm tròn 2 số lẻ**, để 4 con số hiện trên màn hình
cộng lại đúng bằng 100% — người vận hành nhẩm lại được, không thấy lệch vô lý.

**Cảnh báo (chỉ cảnh báo, KHÔNG chặn đóng lô):**

| Tình huống | Máy báo |
|---|---|
| Hao hụt < `HAO_HUT_MIN` (mặc định 20%) | THẤP bất thường |
| Hao hụt > `HAO_HUT_MAX` (mặc định 30%) | CAO bất thường |
| Hao hụt **âm** | Khối lượng ra đang nhiều hơn khối lượng vào — chắc chắn có số nhập sai |
| Chưa nhập `kl_vao` | Không tính tỉ lệ, hiện dấu `—` và nhắc nhập |

---

## ⚠️ VIỆC CÒN LẠI CẦN ANDY CHỐT

Thứ tự cột của `TONG_HOP_LO` hiện đang do tôi tự đặt theo suy đoán, **chưa khớp
với file Excel thật của bộ phận thống kê** (bạn chưa gửi file đó).

Khi có file thật, việc cần làm rất nhỏ: sửa mảng `COLS.TONG_HOP_LO` trong file
`00_Config.gs` và các trường tương ứng trong `tinhTongHopLo_()` ở `05_Report.gs`
cho khớp đúng thứ tự cột của chị ấy — khi đó chị chỉ cần **copy 1 lần dán thẳng**,
không phải sắp xếp lại.

Đây là mắt xích quyết định việc dự án có thật sự tiết kiệm được 3–4 giờ/ngày hay không.
