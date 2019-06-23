// sign in:
//jshint esversion:8
var index = 0;
const fs = require('fs');

const path = require('path');

const mysql = require('mysql');

const spawn = require('child_process').spawn;

const exec = require('child_process').exec;

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'liutiansql234',
    database: 'test'
});


function sleep(n) {
    var start = new Date().getTime();
    //  console.log('休眠前：' + start);
    while (true) {
        if (new Date().getTime() - start > n) {
            break;
        }
    }
}

function findkey(username, callback1) {
    connection.query(`select * from users where name = '${username}'`, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            callback1(results[0].publickey, results[0].privatekey);
        }
    });
}
// function findprikey (username,callback){
//     connection.query(`select * from users where name = '${username}'`,function (err, results) {
//         if (err) {
//             console.log(err);
//         } else {
//             callback(results[0].privatekey);
//         }
//     });
// }
module.exports = {
    'GET /signin': async (ctx, next) => {
        console.log('GET signin');
        var user = ctx.state.user;
        ctx.render('signin.html', {
            username: '',
        });
    },

    'POST /signin': (ctx, next) => {
        let username = ctx.request.body.username;
        let pwd = ctx.request.body.pwd;
        var promise = new Promise(function (resolve, reject) {
            index++;
            connection.query(`select * from users where name = '${username}'`, function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    resolve(results);
                }
            });
            // console.log('rows ' + rows[0].username);
            // console.log('fields ' + fields);
        });

        promise.then(function (results) {
            if (results[0].userpwd == pwd) {
                let user = {
                    id: index,
                    username: username,
                    image: index % 10,
                };
                console.log(user);
                let value = JSON.stringify(user);
                console.log(`Set cookie value: ${value}`);
                ctx.cookies.set('name', value, {
                    httpOnly: false
                });
                ctx.body = JSON.stringify(user);
                ctx.response.redirect('/');
            } else {
                return ctx.response.redirect('/fail');
            }
        });
        return promise;
    },
    'GET /signout': async (ctx, next) => {
        ctx.cookies.set('name', '');
        ctx.response.redirect('/signin');
    },
    'POST /uploadfile': async (ctx, next) => {
        // 上传单个文件
        const file = ctx.request.files.file; // 获取上传文件
        // 创建可读流
        const reader = fs.createReadStream(file.path);
        let filePath = 'D:/code/crytodesign/LSB' + `/${file.name}`;
        // 创建可写流
        const upStream = fs.createWriteStream(filePath);
        // 可读流通过管道写入可写流
        await reader.pipe(upStream);
        await console.log('[upload] ' + file.name);
        const msg = await ctx.request.body.msg;
        var order = await 'python LSB.py ' + file.name + ' ' + msg;
        await console.log(order);
        exec(order, {
            cwd: 'D:\\code\\crytodesign\\LSB'
        }, function (error, stdout, stderr) {
            if (error) {
                console.info('stderr : ' + stderr);
            } else {
                console.log('[LSB加密成功]' + file.name);
            }
        });
        ctx.response.redirect('/');
    },
    'GET /register': async (ctx, next) => {
        ctx.render('register.html');
    },
    'GET /fail': async (ctx, next) => {
        ctx.render('fail.html');
    },
    'POST /register': async (ctx, next) => {
        console.log('[register] ' + ctx.request.body.username);
        var username = ctx.request.body.username;
        let pwd = ctx.request.body.pwd;
        var flag = await fs.existsSync(path.join(__dirname, '../keys/' + username + 'privatekey.pem'));
        console.log('是否存在：' + flag);
        var order;
        var regis = spawn('java', ['-jar', 'Regis.jar', username, pwd, 'null', 'null']);
        regis.stdout.on('data', function (data) {
            console.log('stdout:' + data);
        });
        if (flag == false) {
            order = await 'openssl genrsa -out ' + username + 'privatekey.pem 1024';
            await exec(order, {
                cwd: 'D:\\code\\crytodesign\\keys'
            }, function (error, stdout, stderr) {
                if (error) {
                    console.log('stderr : ' + stderr);
                } else {
                    console.log('[私钥生成成功]');
                }
            });
        }
        await sleep(2000);
        var flag2 = await fs.existsSync(path.join(__dirname, '../keys/' + username + 'publickey.pem'));
        if (flag2 == false) {
            order = await 'openssl rsa -in ' + username + 'privatekey.pem -out ' + username + 'publickey.pem -pubout';
            await exec(order, {
                cwd: 'D:\\code\\crytodesign\\keys'
            }, function (error, stdout, stderr) {
                if (error) {
                    console.info('stderr : ' + stderr);
                } else {
                    console.log('[公钥生成成功]');

                }
            });
        }
        await sleep(1000);
        var pubkey;
        var prikey;
        prifilename = await path.join(__dirname, '../keys/' + username + 'privatekey.pem');
        console.log(prifilename);
        await fs.readFile(prifilename, 'utf-8', function (err, data) {
            if (err) {
                console.log(err);
            }
            console.log(data.toString());
            connection.query(`UPDATE users SET privatekey = '${data.toString()}' WHERE name = '${username}'`, function (err, result) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    return;
                }
                console.log(data.toString());
                console.log('UPDATE affectedRows', result.affectedRows);
            });
        });
        var pubfilename = await path.join(__dirname, '../keys/' + username + 'publickey.pem');
        await fs.readFile(pubfilename, function (err, data) {
            if (err) {
                console.error(err);
            }
            connection.query(`UPDATE users SET publickey = '${data.toString()}' WHERE name = '${username}'`, function (err, result) {
                if (err) {
                    console.log('[UPDATE ERROR] - ', err.message);
                    return;
                }
                console.log('UPDATE affectedRows', result.affectedRows);
            });
        });
        await connection.query(`select * from users where name = '${username}'`, async function (err, results) {
            if (err) {
                console.log(err);
            } else {
                prikey = results[0].privatekey;
            }
        });
        await connection.query(`select * from users where name = '${username}'`, async function (err, results) {
            if (err) {
                console.log(err);
            } else {
                console.log('查询到的公钥:' + results[0].publickey)
                pubkey = results[0].publickey;
            }
        });
        let user = {
            id: index,
            username: username,
            image: index % 10,
            prikey: prikey,
            pubkey: pubkey
        };
        console.log(user);
        ctx.response.redirect('/signin');
    },

    'GET /keys': async function (ctx, next) {
        let username = await ctx.query.username;
        var promise = new Promise(function (resolve, reject) {
            findkey(username,(pubkey,prikey) => {
                let user = {};
                user.publickey = pubkey;
                user.privatekey = prikey;
                resolve(user);
            })
            // console.log('rows ' + rows[0].username);
            // console.log('fields ' + fields);
        });

        promise.then(function (user) {
                ctx.body = JSON.stringify(user);
            
        });
        return promise;
        
    }
};