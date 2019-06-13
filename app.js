//jshint esversion:8
const url = require('url');

const ws = require('ws');

const Cookies = require('cookies');

const NodeRSA  = require('node-rsa') ;

const fs = require('fs');

const Koa = require('koa');

const bodyParser = require('koa-bodyparser');

const controller = require('./controller');

const templating = require('./templating');

const Sequelize = require('sequelize');

const koaBody = require('koa-body');

const WebSocketServer = ws.Server;

const path = require('path');

const exec = require('child_process').exec;

const app = new Koa();

const { JSDOM } = require('jsdom');

const jsdom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

const { window } = jsdom;

global.window = window;
global.document = window.document;
global.navigator = {
    userAgent:'node.js',
};

const { JSEncrypt } = require('jsencrypt');

var jse = new JSEncrypt();
// log request URL:
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});
//update image
app.use(koaBody({
     "multipart": true,            //接收form表单数据
     formidable: {
        maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
})
);

// parse user from cookie:
app.use(async (ctx, next) => {
    ctx.state.user = parseUser(ctx.cookies.get('name') || '');
    await next();
});


// static file support:
let staticFiles = require('./static-files');
app.use(staticFiles('/static/', __dirname + '/static'));

// parse request body:
app.use(bodyParser());

// add nunjucks as view:
app.use(templating('views', {
    noCache: true,
    watch: true
}));

// add controller middleware:
app.use(controller());

let server = app.listen(3000);

function parseUser(obj) {
    if (!obj) {
        return;
    }
    console.log('try parse: ' + obj);
    let s = '';
    if (typeof obj === 'string') {
        s = obj;
    } else if (obj.headers) {
        let cookies = new Cookies(obj, null);
        s = cookies.get('name');
    }
    if (s) {
        try {
            let user = JSON.parse(Buffer.from(s, 'base64').toString());
            console.log(`User: ${user.name}, ID: ${user.id}`);
            return user;
        } catch (e) {
            // ignore
        }
    }
}

var privatekey = `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQCsivDJvpQhPmsEV5NuB7gGe6/iEIsLnHtfuDIiXha+MuukbANI
urAKPDeIPaB4+k73OMvEPTsZudQ9niyjIeEi33IPPWifvbDFkVcH7rLj93VzYAjc
nUvQZQj9CTp3MIvX2iILP68oR5iYzSsREghIM76mZVkJ6/dA14k2+LwjZQIDAQAB
AoGAHgbL4n/87VAcdZP7/yDuwIoT0KaKXAnuWnkGmH6BPLZF1cZKSATdD9rs2xPG
cmc1CMbkhxEU0ORK8DIvmHAT6qFEhobGL9njGedOVO5X5fej6/dXiaISzRN6Vzu9
+ti63poJKWTdFSS7TjUjm5Ktq4yhD0AjO2Qqey8mrK6nvWECQQDlThWHkgHU2J9R
8XXK32M9MEG2YwaRdms2+sXz8oiGHgST6aktnO97FnMxY5i7T/tysm0PrmURNGC7
Eh9X8+e9AkEAwKEvfCKmnfbtj8WLwALnBpcWP/WWnylLzzApEyTQJTG06BX2mN94
e7EPn6TjBQKMC8H/K/7UAVlqNYS4j4LwyQJADg/azCSNDjN2mbzX/2fxmwgBj6DE
/1imvIlmaE5gRvFCUJvMrypnmUHIMKgt7pa6Ec+VVpfYRNTUdcRnvaoMdQJARhzl
GbvLBYgRI9l1amgkCsQHdzQ+pKP1Ue5npO4rTL5w6GDGJxJ/2hWyaBst/m7U5pqv
9CWGqQ8Ql3Y9bw7r8QJBALMwkiH8BNGGwQxNItAkNHb2GT3Zl6+TSllsiD1Zyn4c
wz8baoBTJkIEftLZtNlTbvv6i2AH3+0BcrcSZxXkAHM=
-----END RSA PRIVATE KEY-----
`;

function createWebSocketServer(server, onConnection, onMessage, onClose, onError) {
    let wss = new WebSocketServer({
        server: server
    });
    wss.broadcast = async function broadcast(data) {
        // console.log(data);
        var dataobj = await JSON.parse(data);
        if(dataobj.type == "chat"){
        jse.setPrivateKey(privatekey);
        console.log(dataobj.data);
　　    var rawtext = await jse.decrypt(dataobj.data);
        await console.log(rawtext);
        dataobj.data = await rawtext;
        console.log('[解密] ' + rawtext);
        if(dataobj.data.endsWith('.png')){
            // console.log('is a picture');
            var arr = dataobj.data.split('.');
            dataobj.data = await 'http://localhost:3000/static/images/' + arr[0] + '_hide' + '.png';
        }
    }
        data = await JSON.stringify(dataobj);
        // console.log(data);
        // console.log(dataobj);
        
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    };
    onConnection = onConnection || function () {
        console.log('[WebSocket] connected.');
    };
    onMessage = onMessage || function (msg) {
        console.log('[WebSocket] message received: ' + msg);
    };
    onClose = onClose || function (code, message) {
        console.log(`[WebSocket] closed: ${code} - ${message}`);
    };
    onError = onError || function (err) {
        console.log('[WebSocket] error: ' + err);
    };
    wss.on('connection', function (ws) {
        let location = url.parse(ws.upgradeReq.url, true);
        console.log('[WebSocketServer] connection: ' + location.href);
        ws.on('message', onMessage);
        ws.on('close', onClose);
        ws.on('error', onError);
        if (location.pathname !== '/ws/chat') {
            // close ws:
            ws.close(4000, 'Invalid URL');
        }
        // check user:
        let user = parseUser(ws.upgradeReq);
        if (!user) {
            ws.close(4001, 'Invalid user');
        }
        ws.user = user;
        ws.wss = wss;
        onConnection.apply(ws);
    });
    console.log('WebSocketServer was attached.');
    return wss;
}

var messageIndex = 0;

function createMessage(type, user, data) {
    messageIndex ++;
    return JSON.stringify({
        id: messageIndex,
        type: type,
        user: user,
        data: data
    });
}
 
function onConnect() {
    let user = this.user;
    let msg = createMessage('join', user, `${user.name} joined.`);
    this.wss.broadcast(msg);
    // build user list:
    let users = this.wss.clients.map(function (client) {
        return client.user;
    });
    this.send(createMessage('list', user, users));
}

async function onMessage(message) {
    console.log(message);
    if (message && message.trim()) {
        let msg = createMessage('chat', this.user, message.trim());
        let msgobj = await JSON.parse(msg);
        let order = 'python module1.py ' + msgobj.data;
        await exec(order,{ cwd: 'D:\\code\\crytodesign' },function(error,stdout,stderr){
            if(error) {
                console.info('stderr : '+ stderr);
            }else{
                    console.log('[RSA]');
            }
        });
        this.wss.broadcast(msg);
    }
}

function onClose() {
    let user = this.user;
    let msg = createMessage('left', user, `${user.name} is left.`);
    this.wss.broadcast(msg);
}

app.wss = createWebSocketServer(server, onConnect, onMessage, onClose);

console.log('app started at port 3000...');
