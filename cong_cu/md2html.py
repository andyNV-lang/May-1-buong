# -*- coding: utf-8 -*-
"""Chuyen markdown (tap con dung trong 2 file tai lieu) sang HTML de in."""
import re, io, html as H

def inline(t):
    t = H.escape(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'<em>\1</em>', t)
    return t

def cells(line):
    line = line.strip()
    if line.startswith('|'): line = line[1:]
    if line.endswith('|'): line = line[:-1]
    return [c.strip() for c in line.split('|')]

def convert(md):
    lines = md.split('\n')
    out, i, n = [], 0, len(lines)
    while i < n:
        L = lines[i]
        s = L.strip()

        # khoi code
        if s.startswith('```'):
            i += 1; buf = []
            while i < n and not lines[i].strip().startswith('```'):
                buf.append(H.escape(lines[i])); i += 1
            i += 1
            out.append('<pre>' + '\n'.join(buf) + '</pre>')
            continue

        # duong ke ngang
        if re.fullmatch(r'-{3,}', s):
            out.append('<hr>'); i += 1; continue

        # tieu de
        m = re.match(r'^(#{1,4})\s+(.*)$', s)
        if m:
            lv = len(m.group(1))
            out.append('<h%d>%s</h%d>' % (lv, inline(m.group(2)), lv))
            i += 1; continue

        # bang
        if s.startswith('|') and i + 1 < n and re.match(r'^\|[\s:|-]+\|?$', lines[i+1].strip()):
            head = cells(L); i += 2; rows = []
            while i < n and lines[i].strip().startswith('|'):
                rows.append(cells(lines[i])); i += 1
            t = ['<table><thead><tr>']
            t += ['<th>%s</th>' % inline(c) for c in head]
            t.append('</tr></thead><tbody>')
            for r in rows:
                t.append('<tr>' + ''.join('<td>%s</td>' % inline(c) for c in r) + '</tr>')
            t.append('</tbody></table>')
            out.append(''.join(t)); continue

        # trich dan (gop nhieu dong lien tiep)
        if s.startswith('>'):
            buf = []
            while i < n and lines[i].strip().startswith('>'):
                buf.append(lines[i].strip()[1:].strip()); i += 1
            out.append('<blockquote>%s</blockquote>' % inline(' '.join(buf)))
            continue

        # danh sach co so thu tu
        if re.match(r'^\d+\.\s', s):
            buf = []
            while i < n and (re.match(r'^\d+\.\s', lines[i].strip()) or
                             (lines[i].startswith('   ') and lines[i].strip())):
                cur = lines[i].strip()
                if re.match(r'^\d+\.\s', cur): buf.append(re.sub(r'^\d+\.\s+', '', cur))
                else: buf[-1] += ' ' + cur
                i += 1
            out.append('<ol>' + ''.join('<li>%s</li>' % inline(x) for x in buf) + '</ol>')
            continue

        # danh sach gach dau dong
        if s.startswith('- '):
            buf = []
            while i < n and (lines[i].strip().startswith('- ') or
                             (lines[i].startswith('  ') and lines[i].strip())):
                cur = lines[i].strip()
                if cur.startswith('- '): buf.append(cur[2:])
                else: buf[-1] += ' ' + cur
                i += 1
            out.append('<ul>' + ''.join('<li>%s</li>' % inline(x) for x in buf) + '</ul>')
            continue

        if not s:
            i += 1; continue

        # doan van (gop cac dong lien tiep)
        buf = []
        while i < n and lines[i].strip() and not re.match(
                r'^(#{1,4}\s|\||>|-{3,}$|```|\d+\.\s|- )', lines[i].strip()):
            buf.append(lines[i].strip()); i += 1
        out.append('<p>%s</p>' % inline(' '.join(buf)))
    return '\n'.join(out)

def build(md_path, css, title, out_path):
    md = io.open(md_path, encoding='utf-8').read()
    body = convert(md)
    page = ('<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8">'
            '<title>' + H.escape(title) + '</title><style>' + css + '</style></head>'
            '<body>' + body + '</body></html>')
    io.open(out_path, 'w', encoding='utf-8').write(page)
    return out_path
