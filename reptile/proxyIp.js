/**
 * Created by md-rdweb01 on 2018/1/31.
 */
const request = require("request");
const iconv = require('iconv-lite');
const async = require('async');
const {proxyIp} = require('../config/config');
const cheerio = require('cheerio');
const fs = require('fs');
const IpDao = require('../dao/IpDao');
let proxyList = [];
let targetUrl = 'http://www.xicidaili.com/nn/';
// let targetUrl = 'http://www.qq.com/robots.txt';

for (let i = 1; i < 3000; i++) {
    proxyList.push(targetUrl + i)
}
let proxyIpArr = [];

(async () => {
    // proxyIpArr = await IpDao.getPageBy();
    async.mapLimit(proxyList, 2, (url, cb) => {
            (async ()=>{
                const _time = Date.now();
                const body = await getHtml(url).catch((err)=>{
                    if (Date.now() - _time < 1000) {
                        setTimeout(function(){cb(null)}, 1000)
                    }
                    else {
                        cb(null);
                    }
                    console.log('请求出错了'+err)
                });
                if(!body) {
                    return
                }
                const data = getResult(body);

                if (Date.now() - _time < 1000) {
                    setTimeout(function(){cb(null, data)}, 1000)
                }
                else {
                    cb(null, data);
                }

                await IpDao.add(data).catch((error) => {
                    console.error("操作数据库错误：" + error)
                });
            })()

    }, (err, results) => {
        // fs.readdirSync('test.txt',JSON.stringify(results))
    })
})()



function getHtml(url) {
    // const _a = Math.floor(Math.random() * 100);
    // const proxyUrl = `http://${proxyIpArr[_a].ip}:${proxyIpArr[_a].port}`;
    // console.log('代理Ip：'+proxyUrl);
    console.log('访问Ip：'+url);
    const options = {
        method: 'GET',
        url: url,
        timeout: 3000,
        gzip: true,
        encoding: null,
        headers: proxyIp.getIpHeaderConfig,
        // proxy: proxyUrl
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                if (/meta.*charset=gb2312/.test(body)) {
                    body = iconv.decode(body, 'gbk');
                }
                resolve(body)
            }
            else {
                reject(error)
            }
        })
    })
}

function getResult(body) {
    let result = [];
    const $ = cheerio.load(body);
    const oTr = $('#ip_list tr');
    Array.prototype.forEach.call(oTr, (op, index) => {
        if (index > 0) {
            let obj = {};

            Array.prototype.forEach.call($(op).find('td'), (item, i) => {
                const $item = $(item)
                if (i === 1) {
                    obj.ip = $item.text();
                }
                else if (i === 2) {
                    obj.port = $item.text();
                }
                else if (i === 3) {
                    obj.address = $item.find('a').text();
                }
                else if (i === 5) {
                    obj.protocol = $item.text();
                }
                else if (i === 6) {
                    obj.speed = $item.find('.bar').attr('title');
                }
                else if (i === 8) {
                    obj.time = $item.text()
                }
                else if (i === 9) {
                    obj.verifyTime = $item.text()
                }
            })
            result.push(obj)
        }
    });
    return result
}


//并发
function getProxyList() {

    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: proxyIp.getIpUrl,
            gzip: true,
            encoding: null,
            headers: proxyIp.getIpHeaderConfig,
        };
        request(options, function (error, response, body) {
            try {
                if (error) throw error;

                if (/meta.*charset=gb2312/.test(body)) {
                    body = iconv.decode(body, 'gbk');
                }

                const ret = body.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,4}/g);
                resolve(ret);

            } catch (e) {
                return reject(e);
            }
        });
    })
}

// getProxyList().then(function (proxyList) {
//     console.log('proxyList：'+proxyList)
//     // let targetOptions = {
//     //     method: 'GET',
//     //     // url: 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=JSON',
//     //     // url: 'http://ip.chinaz.com/getip.aspx',
//     //     url: 'http://www.qq.com/robots.txt',
//     //     timeout: 3000,
//     //     gzip:true,
//     //     encoding: null,
//     //     headers: {
//     //         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//     //         'Accept-Encoding': 'gzip, deflate',
//     //         'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
//     //         'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
//     //         'referer': 'http://www.66ip.cn/'
//     //     },
//     // };
//     // async.mapLimit(proxyList,20,(url,cb)=>{
//     //     targetOptions.proxy = `http://${url}`;
//     //     request(targetOptions,(err,reps,body)=>{
//     //         try {
//     //             if (!err && reps.statusCode == 200) {
//     //                 console.log('返回结构：'+body)
//     //                 if(String(body).indexOf('http://www.qq.com/sitemap_index.xml') === -1){
//     //                     cb(null,'没有返回关键信息')
//     //                     return
//     //                 }
//     //                 cb(null,String(body))
//     //             }
//     //             else{
//     //                 cb(null,'请求失败')
//     //             }
//     //         }
//     //         catch (err){
//     //             console.log(err)
//     //         }
//     //
//     //     })
//     // },(err,results)=>{
//     //     console.log(results)
//     // })
// }).catch(e => {
//     console.log("错误："+e);
// })
