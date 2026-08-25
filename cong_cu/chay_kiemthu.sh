#!/bin/bash
# Chạy toàn bộ kiểm thử logic máy chủ. Cần có Node.js.
#     bash cong_cu/chay_kiemthu.sh
cd "$(dirname "$0")/.." || exit 1
node 9_KIEMTHU_LOGIC.js.txt
