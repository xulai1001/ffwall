# -*- encoding: utf-8 -*-
import os, sys, math
from pprint import *
from PIL import Image, ImageDraw, ImageFont

font = ImageFont.truetype("msyh.ttc", 18)

path = "../../temp/smallimg/"
result_file = "out.jpg"
nx, ny = 1, 1
scale = 1
quality = 65
aw, ah = 230, 280   # smallimg original size
op = "draw"

files = sorted(os.listdir(path), key=lambda fn: int(fn.split('.')[0]))

if len(sys.argv) < 5:
    print "usage: python puzzle.py [nx] [ny] [scale] [op]"
    sys.exit()
else:
    nx, ny = int(sys.argv[1]), int(sys.argv[2])
    scale = float(sys.argv[3])
    op = sys.argv[4]
#    print nx, ny, scale

if op == "draw":
    print "warm up..."
    for y in xrange(ny):
        print ".",
        for x in xrange(nx):
            n = y*nx + x
            if n >= len(files): break
            im = Image.open(os.path.join(path, files[n]))
            im.close()
    print ""
    
    result = Image.new('RGB', (int(aw * nx * scale), int(ah * ny * scale)))
    for y in xrange(ny):
        for x in xrange(nx):
            try:
                n = y*nx+x
                if n >= len(files): break
                im = Image.open(os.path.join(path, files[n]))
                r_im = im.resize((int(aw * scale), int(ah * scale)))
                result.paste(r_im, (int(x*aw*scale), int(y*ah*scale)))
                
                im.close(); r_im.close()
                if (n+1) % 10 == 0:
                    print n+1, "/", ny*nx
            except:
                print files[y*nx+x], "is broken"

    result.save(result_file, quality=quality)
elif op == "count":
    print "Total:", len(files), "size:", aw, ah, "ratio:", nx, ny
    total = len(files)
    sx2 = float(total * ah * nx) / (aw * ny)
    sx = int(math.sqrt(sx2)) + 1
    sy = int(total / sx) + 1
    print "%d * %d = %d, size %d * %d" % (sx, sy, sx*sy, int(sx*aw*scale), int(sy*aw*scale))
    
