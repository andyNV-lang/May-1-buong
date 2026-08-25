# -*- coding: utf-8 -*-
"""
Dựng bản mô phỏng để THỬ TAY GIAO DIỆN trên máy, không cần deploy lên Google.

Ghép Index + Style + Script thật với một bộ giả lập Google Apps Script chạy trong
trình duyệt, rồi nối google.script.run vào CHÍNH các hàm api thật trong file .gs.
Nhờ vậy thử được giao diện trên logic máy chủ thật.

    python3 cong_cu/tao_mo_phong.py
    python3 -m http.server 8777        # rồi mở http://localhost:8777/mo_phong.html

⚠️ PHẢI mở qua http://, không mở bằng file:// (trình duyệt chặn script).
"""
import io, os

CC = os.path.dirname(os.path.abspath(__file__))
DA = os.path.dirname(CC)

def doc(t):
    return io.open(os.path.join(DA, t), encoding='utf-8').read()

def main():
    gia_lap = io.open(os.path.join(CC, '_gia_lap.html'), encoding='utf-8').read()
    du_lieu = io.open(os.path.join(CC, '_du_lieu_mau.html'), encoding='utf-8').read()
    gs = ''.join('<script>\n' + doc(f + '.gs') + '\n</script>\n' for f in
                 ['00_Config','01_Util','02_Setup','03_Auth','04_Api','05_Report'])

    html = doc('Index.html')
    html = html.replace("<?!= include(\'Style\'); ?>", doc('Style.html'))
    html = html.replace("<?= tenMay ?>", "MÁY 1 BUỒNG")
    html = html.replace("<?!= include(\'Script\'); ?>",
                        gia_lap + gs + du_lieu + doc('Script.html'))

    ra = os.path.join(DA, 'mo_phong.html')
    io.open(ra, 'w', encoding='utf-8').write(html)
    print('Đã dựng:', ra)
    print('Chạy:    cd "%s" && python3 -m http.server 8777' % DA)
    print('Mở:      http://localhost:8777/mo_phong.html')
    print('PIN thử: 1111 (công nhân) · 9999 (thống kê) · 1234 (quản lý)')

if __name__ == '__main__':
    main()
