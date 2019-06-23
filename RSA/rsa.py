# -*- coding: utf-8 -*-
from gcd import ext_gcd
from exponentiation import exp_mode
import time  # 生成公钥私钥，p、q为两个超大质数


def gen_key(p, q):  # p, q是两个超大质数
    n = p * q
    fy = (p - 1) * (q - 1)
    # 计算与n互质的整数个数 欧拉函数
    e = 3889  # 选取e   一般选取65537 # generate d
    a = e
    b = fy
    r, x, y = ext_gcd(a, b)
    # print(x)  # 计算出的x不能是负数，如果是负数，说明p、q、e选取失败，一般情况下e选取65537
    d = x  # 返回：   公钥     私钥
    return (n, e), (n, d)  # 返回公钥私钥对


# 加密 m是被加密的信息 加密成为c
def encrypt(m, pubkey):  # m 是信息
    n = pubkey[0]  # 获取公钥
    e = pubkey[1]  # 获取私钥
    c = exp_mode(m, e, n)
    return c

 # 解密 c是密文，解密为明文m


def decrypt(c, selfkey):
    n = selfkey[0]
    d = selfkey[1]
    m = exp_mode(c, d, n)
    return m


if __name__ == "__main__":
    '''公钥私钥中用到的两个大质数p,q，都是1024位'''
    p = 106697219132480173106064317148705638676529121742557567770857687729397446898790451577487723991083173010242416863238099716044775658681981821407922722052778958942891831033512463262741053961681512908218003840408526915629689432111480588966800949428079015682624591636010678691927285321708935076221951173426894836169
    q = 144819424465842307806353672547344125290716753535239658417883828941232509622838692761917211806963011168822281666033695157426515864265527046213326145174398018859056439431422867957079149967592078894410082695714160599647180947207504108618794637872261572262805565517756922288320779308895819726074229154002310375209
    '''生成公钥私钥'''
    pubkey, selfkey = gen_key(p, q)
    '''需要被加密的信息转化成数字，长度小于秘钥n的长度，如果信息长度大于n的长度，那么分段进行加密，分段解密即可。'''
    print("元信息m: ")
    m = 123123123
    print(m)
    '''信息加密，m被加密的信息，c是加密后的信息'''
    print("加密之后：")
    c = encrypt(m, pubkey)
    print(c)
    '''信息解密'''
    print("解密之后：")
    d = decrypt(c, selfkey)
    print(d)