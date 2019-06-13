// sign in:
//jshint esversion:8
var index = 0;
const fs = require('fs');

const path = require('path');

const exec = require('child_process').exec;
module.exports = {
    'GET /signin': async (ctx, next) => {
        let names = 'ABCDEFGHIJ';
        let name = names[index % 10];
        ctx.render('signin.html', {
            name: `路人${name}`
        });
    }, 

    'POST /signin': async (ctx, next) => {
        index ++;
        let name = ctx.request.body.name || '路人甲';
        let user = {
            id: index,
            name: name,
            image: index % 10
        };
        let value = Buffer.from(JSON.stringify(user)).toString('base64');
        console.log(`Set cookie value: ${value}`);
        ctx.cookies.set('name', value);
        ctx.response.redirect('/');
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
        var order = await 'python LSB.py '+ file.name + ' ' + msg;
        await console.log(order);
        exec(order,{ cwd: 'D:\\code\\crytodesign\\LSB' },function(error,stdout,stderr){
            if(error) {
                console.info('stderr : '+ stderr);
            }else{
                console.log('[LSB加密成功]' + file.name)
            }
        });
        ctx.response.redirect('/');
      }
};
