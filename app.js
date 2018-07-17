//导入模块
 let express = require('express');
//验证码
let svgCaptcha = require('svg-captcha');
//路径
let  path = require('path');
//实例化
let app = express();
//设置静态资源
app.use(express.static('static'));

//路由一当用户访问登陆页面的时候 直接读取登陆页面返回
app.get('/login',(req,res)=>{
        res.sendfile(path.join(__dirname,'/static/view/login.html'))
})
//路由二 生成图片功能
app.get('/login/captcha',(req,res)=>{
    var captcha = svgCaptcha.create();
    //打印验证码
    console.log(captcha.text);
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
})

//监听
app.listen(8848,'127.0.0.1',()=>{
console.log('success');

})