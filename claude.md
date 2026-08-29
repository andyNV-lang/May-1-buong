# Luật làm việc — dự án may1buong_appscript

## Bối cảnh
Hệ thống ghi chép sản xuất máy 1 buồng, chạy trên Google Apps
Script. Người nhập liệu dùng **cả điện thoại Android giá rẻ LẪN
iPhone** (Andy xác nhận 29/08/2026), không có thiết bị gắn thêm.
Mọi thay đổi giao diện phải tính cho CẢ HAI hệ — iPhone và Android
bày bàn phím khác nhau. Người chủ dự án (Andy) KHÔNG phải lập
trình viên — mọi giải thích phải bằng tiếng Việt, dùng từ đời thường.

## Nguồn sự thật
- TIEN_DO.md là nguồn sự thật DUY NHẤT về trạng thái dự án.
- Nếu tài liệu khác mâu thuẫn với TIEN_DO.md: tin mã nguồn
  thực tế, báo cho Andy, và đề xuất sửa tài liệu sai.

## Bắt buộc trước khi sửa bất cứ thứ gì
1. Chạy: bash cong_cu/chay_kiemthu.sh  (phải 0 lỗi / 0 thất bại)
2. Nếu chưa xanh — dừng lại, báo Andy. Không sửa tiếp.

## Bắt buộc sau khi sửa
1. Chạy lại bộ kiểm thử. Đỏ thì tự lùi, không để lại nửa vời.
2. Cập nhật TIEN_DO.md trong CÙNG lần sửa đó.
3. Liệt kê rõ file nào đã đổi và đổi gì.

## Git
- Mỗi lần sửa xong + kiểm thử xanh → commit.
- Commit message tiếng Việt có dấu, bắt đầu bằng loại:
  feat: / fix: / docs: / refactor: / test:
- Không sửa lịch sử commit đã push (cấm rebase/force-push).

## Cấm
- Cấm tạo file .zip để sao lưu. Dự án dùng git.
- Cấm ghi cứng đường dẫn của máy đang chạy AI vào mã nguồn.
- Cấm sửa file ngoài thư mục may1buong_appscript/.
- Cấm báo "đã kiểm thử" nếu chưa thực sự chạy lệnh kiểm thử.

## Khi không chắc
Hỏi Andy. Không đoán. Nói rõ "thông tin này có lỗ hổng".
