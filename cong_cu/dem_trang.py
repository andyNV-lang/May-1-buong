import re, sys
def dem(p):
    b = open(p,'rb').read()
    m = re.findall(rb'/Type\s*/Pages[^>]*?/Count\s+(\d+)', b)
    if m: return max(int(x) for x in m)
    m = re.findall(rb'/Count\s+(\d+)', b)
    if m: return max(int(x) for x in m)
    return len(re.findall(rb'/Type\s*/Page[^s]', b))
for p in sys.argv[1:]:
    print('%s: %d trang' % (p.split('/')[-1], dem(p)))
