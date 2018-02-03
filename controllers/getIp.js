/**
 * Created by md-rdweb01 on 2018/1/31.
 */
const request = require("request");
const iconv = require('iconv-lite');
const async = require('async');
const {proxyIp} = require('../config/config');

//并发
function getProxyList() {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            url: proxyIp.getIpUrl,
            timeout: 3000,
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


getProxyList().then(function (proxyList) {
    console.log('proxyList：' + proxyList)
    let targetOptions = {
        method: 'GET',
        url: 'http://www.qq.com/robots.txt',
        timeout: 3000,
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
    async.mapLimit(proxyList, 20, (url, cb) => {
        targetOptions.proxy = `http://${url}`;
        request(targetOptions, (err, reps, body) => {
            try {
                if (!err && reps.statusCode == 200) {
                    console.log('返回结构：' + body)
                    if (String(body).indexOf('http://www.qq.com/sitemap_index.xml') === -1) {
                        cb(null, '没有返回关键信息')
                        return
                    }
                    cb(null, String(body))
                }
                else {
                    cb(null, '请求失败')
                }
            }
            catch (err) {
                console.log(err)
            }

        })
    }).catch(e => {
        console.log("错误：" + e);
    })
})
