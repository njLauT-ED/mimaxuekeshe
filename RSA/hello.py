import eel

eel.init("D:\code\crytodesign\\views")

@eel.expose
def sayhello(x):
    return ('hello' + x)

eel.start("/",{'port':3000})