# -*- coding: utf-8 -*-
"""
Xuất 2 file hướng dẫn ra PDF để in (dùng Google Chrome ở chế độ ẩn).

    python3 cong_cu/tao_pdf.py

Ra 2 file ở thư mục cha: IN_Huong_dan_cong_nhan.pdf, IN_Cau_truc_sheet.pdf
"""
import io, os, re, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from md2html import convert

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.dirname(SRC)
SP  = os.path.dirname(os.path.abspath(__file__))
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CHUNG = """
@page { size: A4; margin: 12mm 12mm 12mm 12mm; }
* { box-sizing: border-box; }
body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif;
       color: #16181d; margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
table { border-collapse: collapse; width: 100%; break-inside: auto; }
th { background: #1f3864; color: #fff; text-align: left; font-weight: 700; }
tr { break-inside: avoid; page-break-inside: avoid; }
tbody tr:nth-child(even) { background: #f2f4f8; }
code { font-family: "SF Mono", Menlo, Consolas, monospace; background: #e8ebf2;
       padding: 1px 4px; border-radius: 3px;
       /* KHONG dung nowrap: danh sach cot dai cua TONG_HOP_LO se tran ra ngoai le
          va bi cat mat chu khi in. break-word chi ngat khi that su can. */
       white-space: normal; overflow-wrap: break-word; }
table, pre, blockquote { max-width: 100%; }
pre { font-family: "SF Mono", Menlo, Consolas, monospace; background: #f2f4f8;
      border-left: 3px solid #1f3864; padding: 8px 10px; white-space: pre-wrap;
      break-inside: avoid; page-break-inside: avoid; }
blockquote { margin: 8px 0; padding: 7px 11px; background: #fff8e1;
             border-left: 4px solid #e0a800; break-inside: avoid; }
blockquote p { margin: 0; }
hr { border: 0; border-top: 1px solid #ccd2de; margin: 12px 0; }
strong { font-weight: 700; }
"""

# ---------- 1. Phiếu dán tại máy: chữ to, đọc được khi đeo găng ----------
CSS_CN = CHUNG + """
@page { margin: 10mm 11mm; }
body { font-size: 11.6pt; line-height: 1.36; }
h1 { font-size: 21pt; text-align: center; margin: 0 0 2px; color: #1f3864;
     letter-spacing: .3px; }
h3 { font-size: 10.5pt; text-align: center; font-weight: 600; color: #5a6478;
     margin: 0 0 10px; }
h1 + h3 { padding-bottom: 8px; border-bottom: 3px solid #1f3864; }
h2 { font-size: 14pt; color: #fff; background: #1f3864; margin: 0 0 7px;
     padding: 5px 10px; border-radius: 5px; }
section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 11px; }
p { margin: 5px 0; }
ul, ol { margin: 5px 0; padding-left: 20px; }
li { margin: 3px 0; }
th, td { border: 1px solid #b9c0cf; padding: 4px 7px; font-size: 10.7pt;
         vertical-align: top; }
pre { font-size: 10.3pt; line-height: 1.3; text-align: center; font-weight: 600; }
blockquote { font-size: 10.6pt; }
hr { display: none; }
"""

# ---------- 2. Tài liệu tra cứu cấu trúc sheet ----------
CSS_ST = CHUNG + """
body { font-size: 10pt; line-height: 1.45; }
h1 { font-size: 19pt; color: #1f3864; margin: 0 0 4px;
     border-bottom: 3px solid #1f3864; padding-bottom: 7px; }
h2 { font-size: 13pt; color: #1f3864; margin: 17px 0 7px;
     border-left: 5px solid #1f3864; padding-left: 9px; }
p { margin: 6px 0; }
ul, ol { margin: 6px 0; padding-left: 20px; }
th, td { border: 1px solid #c3c9d6; padding: 4px 7px; font-size: 9.1pt;
         vertical-align: top; }
td code { font-size: 8.7pt; }
"""

def boc_section(html):
    """Gom nội dung giữa 2 thẻ h2 vào <section> để không bị cắt ngang trang."""
    phan = re.split(r'(?=<h2>)', html)
    ra = []
    for p in phan:
        ra.append('<section>' + p + '</section>' if p.startswith('<h2>') else p)
    return ''.join(ra)

def lam(ten_md, css, tieu_de, ten_pdf, boc=False):
    md = io.open(os.path.join(SRC, ten_md), encoding='utf-8').read()
    body = convert(md)
    if boc: body = boc_section(body)
    html = ('<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>'
            + tieu_de + '</title><style>' + css + '</style></head><body>'
            + body + '</body></html>')
    hp = os.path.join(SP, ten_pdf.replace('.pdf', '.html'))
    io.open(hp, 'w', encoding='utf-8').write(html)
    pdf = os.path.join(OUT, ten_pdf)
    if os.path.exists(pdf): os.remove(pdf)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-sandbox',
                    '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw',
                    '--virtual-time-budget=4000',
                    '--print-to-pdf=' + pdf, 'file://' + hp],
                   capture_output=True, timeout=120)
    return pdf

a = lam('3_HUONG_DAN_CONG_NHAN.md', CSS_CN,
        'Huong dan nhap lieu - May 1 buong', 'IN_Huong_dan_cong_nhan.pdf', boc=True)
b = lam('2_CAU_TRUC_SHEET.md', CSS_ST,
        'Cau truc du lieu - May 1 buong', 'IN_Cau_truc_sheet.pdf')
for f in (a, b):
    print(('OK  %s  (%.0f KB)' % (os.path.basename(f), os.path.getsize(f)/1024))
          if os.path.exists(f) else 'LOI: khong tao duoc ' + f)
