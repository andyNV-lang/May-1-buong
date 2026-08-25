# Máy 1 Buồng — Hệ thống ghi chép sản xuất

> **Phiên bản hiện tại:** 1.6 · Chạy trên Google Apps Script  
> **Trạng thái:** 431 kiểm thử xanh · Bản 1.5 đang chạy thật · Bản 1.6 chưa dán lên Apps Script  

Hệ thống giúp người vận hành ghi chép số bao / khối lượng từ điện thoại Android giá rẻ,
thay thế hoàn toàn sổ giấy. Thống kê xem báo cáo trực tiếp trên Google Sheets.

---

## Cấu trúc file

| File | Vai trò |
|---|---|
| `00_Config.gs` | Hằng số, tên cột, cấu hình toàn cục |
| `01_Util.gs` | Tiện ích: đọc/ghi sheet, khoá chống ghi đè |
| `02_Setup.gs` | Menu ⚙️, tự tạo cấu trúc sheet khi cài lần đầu |
| `03_Auth.gs` | Đăng nhập PIN, chống dò PIN |
| `04_Api.gs` | Toàn bộ nghiệp vụ: lô, bao, chốt ca, đóng lô |
| `05_Report.gs` | Bảng tổng hợp theo lô cho thống kê |
| `06_WebApp.gs` | Điểm vào web (`doGet`) + hàm `tuKiemTra` |
| `Index.html` | Khung HTML chính của giao diện điện thoại |
| `Style.html` | CSS giao diện |
| `Script.html` | JavaScript phía client |
| `appsscript.json` | Cấu hình Google Apps Script project |
| `cong_cu/` | Công cụ chạy trên máy: kiểm thử, mô phỏng, đo hiệu năng |

### Tài liệu

| File | Đọc khi nào |
|---|---|
| `0_DOC_TRUOC.md` | Hệ thống hoạt động thế nào, lịch sử lỗi đã sửa |
| `TIEN_DO.md` | **Đọc đây trước khi làm việc** — đang dở ở đâu, việc tiếp theo là gì |
| `1_HUONG_DAN_TRIEN_KHAI.md` | 9 bước cài đặt lên Google Apps Script |
| `2_CAU_TRUC_SHEET.md` | Mô tả 6 sheet, ý nghĩa từng cột |
| `3_HUONG_DAN_CONG_NHAN.md` | 1 trang A4 in ra dán tại máy |
| `4_CACH_LAM_VIEC.md` | Quy trình sửa/nâng cấp an toàn 7 bước |
| `claude.md` | Luật làm việc cho AI (Claude, Cursor…) |

---

## Chạy kiểm thử

```bash
# Cần Node.js
bash cong_cu/chay_kiemthu.sh
# Kết quả đúng: 0 lỗi / 0 thất bại
```

---

## Quy ước nhánh

```
main   ← Bản ổn định, đã kiểm thử xanh
└── dev   ← Nhánh phát triển hàng ngày
    └── feature/tên-tính-năng   ← Khi làm tính năng lớn
```

**Luật:**
- Chỉ merge vào `main` khi kiểm thử xanh
- `main` luôn là bản có thể dán lên Apps Script ngay

---

## Quy ước commit message

```
feat: Thêm màn hình xem trước kết quả lô
fix: Sửa lỗi bao offline biến mất khi bị từ chối
docs: Cập nhật hướng dẫn triển khai bản 1.6
refactor: Tách hàm kiểm tra quyền ra module riêng
test: Thêm kiểm thử canh bất biến bảng chỉ số
```

---

## Lịch sử phiên bản

| Tag | Nội dung |
|---|---|
| `v1.6.2` | Thêm `4_CACH_LAM_VIEC.md` — sổ tay quy trình cho người không lập trình |
| `v1.6.1` | Sửa lỗi `apiSuaBao` làm hỏng số liệu báo mồ côi |
| `v1.6.0` | Bản 1.6 — mốc an toàn đầu tiên (đủ 6/6 yêu cầu) |

Chi tiết xem [`0_DOC_TRUOC.md`](0_DOC_TRUOC.md).

---

*Dự án của Andy (Nam Vu Down & Feathers JSC)*
