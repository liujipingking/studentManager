//导入模块
 let express = require('express');
//验证码
let svgCaptcha = require('svg-captcha');
//路径
let  path = require('path');
//导入基于express的中间件session
let session = require('express-session');
//导入 中间件 body-parser
let bodyParser = require('body-parser')
//导入mongoDb ,以下为使用mogndb的配置
const MongoClient = require('mongodb').MongoClient;
// Connection URL
const url = 'mongodb://localhost:27017'
// Database Name
const dbName = 'user';
//实例化
let app = express();
//使用session 中间件,这样我们的路由中多了一个可以访问的session属性.
//在我们的每个路由的req对象中增加session属性.这是个对象来着可以用点方法加东西eg:.req.session.userInfo
//使用body-parser 中间件
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({
    secret: 'keyboard cat',
  }))
//设置静态资源
    app.use(express.static('static'));
 
//路由一当用户访问登陆页面的时候 直接读取登陆页面返回
app.get('/login',(req,res)=>{
        //打印一下session                                                         
        // console.log(req.session);
        //结果是个对象.可以去加东西加属性 这样我们的路由中多了一个可以访问的session属性.
        req.session.info ="你来登陆页了"    

        res.sendfile(path.join(__dirname,'/static/view/login.html'))
})
//路由2使用post方法提交数据过来(表单submit中用来post 提交数据过来)
    app.post('/login',(req,res)=>{
        //获取表单提交过来的数据
            //  console.log(req);
           
        //接受数据,比较验证码
            let userName = req.body.userName;
            let userPass = req.body.userPass;
            let code = req.body.code;
            // console.log("code="+code);
            
            //比较验证码
            if(code==req.session.captcha){
                console.log('验证成功'); 
                //设置session
                req.session.userInfo = ({
                userName,userPass
                })
                //去首页
                res.setHeader('content-type','text/html');
                res.send('<script>alert("欢迎欢迎");window.location.href="/index"</script>') ;
            }
            else{
                console.log('验证失败');
                //打回去
              res.setHeader('content-type','text/html');
              res.send('<script>alert("验证码错误");window.location.href="/login"</script>') ;
            }
           
    })
    

//路由3 生成图片功能
app.get('/login/captcha',(req,res)=>{
    var captcha = svgCaptcha.create();
    //打印验证码
    // console.log(captcha.text);
    //保存验证码的值到session中, 方便后续使用
    //为了方便比较直接转小写
    req.session.captcha = captcha.text.toLocaleLowerCase();
    console.log(req.session.captcha);
    
	res.type('svg'); // 使用ejs等模板时如果报错 res.type('html')
	res.status(200).send(captcha.data);
})
// 路由4 访问首页j
app.get('/index',(req,res)=>{
    //有session欢迎
    if(req.session.userInfo){
        //登陆
        //读出首页返回
        res.sendfile(path.join(__dirname,'/static/view/index.html')); 
    }
    //没有就回去login
    else{
        res.setHeader('content-type','text/html');
        res.send('<script>alert("请登录");window.location.href="/login"</script>') ;  
    }
}) 
//路由5登出操作 删除session
app.get('/logout',(req,res)=>{
    //删除session中的userInfo
    delete req.session.userInfo;
    //再去登陆页
    res.redirect('/login');
})
//路由6 由login页点击注册进入到注册页面
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'static/view/register.html'))
})
//路由7 注册页点击注册提交表单
app.post('/register',(req,res)=>{
    //接受数据
    let userName = req.body.userName;
    let userPass = req.body.userPass;
    // console.log(userName);
    // console.log(userPass);
    //添加到数据库(连接到数据库)
      MongoClient.connect(url,{useNewUrlParser: true },(err, client)=>{
        const db = client.db(dbName);
        //选择需要的集合
        const collection = db.collection('userList');
        //因为是注册所以要判断是否重名 所以先查询数据再新增
        collection.find({
            userName
        }).toArray((req,doc)=>{
            // console.log(doc);
            // console.log(doc.length);  
                if(doc.length==0){
                    //==0说明没有查到类似的名字那就新增数据
                    collection.insertOne({
                        userName,
                        userPass
                    }, function(err, result) {
                        console.log(err);
                        console.log("Inserted 3 documents into the collection");
                        res.setHeader('content-type','text/html');
                        res.send("<script>alert('成功注册');window.loaction.href='/login'</script>") 
                          // 关闭数据库连接
                            client.close();
                      });
                }
                else{
                    res.setHeader('content-type','text/html');
                    res.send("<script>alert('已被注册');window.loaction.href='/login'</script>")  
                }
        })
      });
})
//监听  
app.listen(8848,'127.0.0.1',()=>{
console.log('success');

})