import sys
import cv2
import numpy as np


print(sys.argv[1] + '\n' + sys.argv[2])
PicName = sys.argv[1]
source = cv2.imread(PicName)
h, w = source.shape[:2]
message = sys.argv[2]
x, y = (160, 250)
color = [88, 26, 16]
cv2.putText(source, message, (x, y), cv2.QT_FONT_BLACK, 1, color, thickness=1)
carrier = cv2.imread(PicName)
for i in range(h):
    for j in range(w):
        # 把整幅图的B通道全设置为偶数
        if carrier[i, j, 0] % 2 == 1:
            carrier[i, j, 0] -= 1

for i in range(h):
    for j in range(w):
        if list(source[i, j]) == color:
            carrier[i, j, 0] += 1  # 对比图片， 将有文字的位置设置为奇
s = 'D:\code\crytodesign\static\images\\' + sys.argv[1].split('.')[0] + '_hide.png'
cv2.imwrite('hide.png', carrier)
cv2.imwrite(s, carrier)

img = cv2.imread('hide.png')
h, w = img.shape[:2]
# 新建一张图用来放解出来的信息
info = np.zeros((h, w, 3), np.uint8)
for i in range(h):
    for j in range(w):
        # 发现B通道为奇数则为信息的内容
        if img[i, j, 0] % 2 == 1:
            info[i, j, 0] = 255
            info[i, j, 1] = 255
            info[i, j, 2] = 255
cv2.imwrite('info.png', info)
