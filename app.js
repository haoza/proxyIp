/**
 * Created by md-rdweb01 on 2018/1/31.
 */
var request = require("request");
var iconv = require('iconv-lite');
const async = require('async');  //并发
var fs = require("fs");
function getProxyList() {
    // var apiURL = 'http://www.66ip.cn/mo.php?sxb=&tqsl=100&port=&export=&ktip=&sxa=&submit=%CC%E1++%C8%A1&textarea=http%3A%2F%2Fwww.66ip.cn%2F%3Fsxb%3D%26tqsl%3D100%26ports%255B%255D2%3D%26ktip%3D%26sxa%3D%26radio%3Dradio%26submit%3D%25CC%25E1%2B%2B%25C8%25A1';
    var apiUrl = 'http://www.66ip.cn/?sxb=&tqsl=100&ports%5B%5D2=&ktip=&sxa=&radio=radio&submit=%CC%E1++%C8%A1';
    return new Promise((resolve, reject) => {
        var options = {
            method: 'GET',
            url: apiURL,
            gzip: true,
            encoding: null,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
                'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
                'referer': 'http://www.66ip.cn/'
            },

        };

        request(options, function (error, response, body) {
            try {
                if (error) throw error;

                if (/meta.*charset=gb2312/.test(body)) {
                    body = iconv.decode(body, 'gbk');
                }

                var ret = body.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,4}/g);


                resolve(ret);

            } catch (e) {
                return reject(e);
            }


        });
    })
}


getProxyList().then(function (proxyList) {
    var targetOptions = {
        method: 'GET',
        // url: 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=JSON',
        // url: 'http://ip.chinaz.com/getip.aspx',
        url: 'http://www.qq.com/robots.txt',
        timeout: 3000,
        gzip:true,
        encoding: null,
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
            'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
            'referer': 'http://www.66ip.cn/'
        },
    };
    async.mapLimit(proxyList,20,(url,cb)=>{
        targetOptions.proxy = `http://${url}`;
        request(targetOptions,(err,reps,body)=>{
            try {
                if (!err && reps.statusCode == 200) {
                    console.log('返回结构：'+body)
                    if(String(body).indexOf('http://www.qq.com/sitemap_index.xml') === -1){
                        cb(null,'没有返回关键信息')
                        return
                    }
                    cb(null,String(body))
                }
                else{
                    cb(null,'请求失败')
                }
            }
            catch (err){
                console.log(err)
            }

        })
    },(err,results)=>{
        console.log(results)
    })
    // async.mapLimit(proxyList,10,(proxyUrl,cb)=>{
    //     console.log(`testing ${proxyUrl}`);
    //     targetOptions.proxy = 'http://' + proxyUrl;
    //     request(targetOptions,(err,reps,body)=>{
    //         if (!err && reps.statusCode == 200) {
    //             console.log('==================================请求成功=============================')
    //             console.log("请求结果："+JSON.stringify(JSON.parse(body)))
    //             cb(null,JSON.stringify(JSON.parse(body)))
    //         }
    //         else{
    //             cb(null)
    //         }
    //     })
    // },((error,results)=>{
    //     console.log("result :"+results);
    //     console.log("准备写入文件");
    //     fs.writeFile('input.txt', results.toString(),  function(err) {
    //         if (err) {
    //             return console.error(err);
    //         }
    //         console.log("数据写入成功！");
    //         console.log("--------我是分割线-------------")
    //         console.log("读取写入的数据！");
    //         fs.readFile('input.txt', function (err, data) {
    //             if (err) {
    //                 return console.error(err);
    //             }
    //             console.log("异步读取文件数据: " + data.toString());
    //         });
    //     });
    // }))
    //这里修改一下，变成你要访问的目标网站
}).catch(e => {
    console.log(e);
})
