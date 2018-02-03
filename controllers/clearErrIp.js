const ipDao = require('../dao/IpDao');
const async = require('async');
const request = require('request');
(async ()=>{
    const allIp = await ipDao.getAll();
    const time = Date.now();
    async.mapLimit(allIp,100,(item,cb)=>{
        const pIp = concatProxyIp(item);
        let targetOptions = {
            method: 'GET',
            url: 'http://www.qq.com/robots.txt',
            proxy:pIp,
            timeout: 4000,
            gzip:true,
            encoding: null,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.8,en;q=0.6,zh-TW;q=0.4',
                'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
            },
        };
        request(targetOptions,(err,reps,body)=>{
            try {
                if (!err && reps.statusCode == 200) {
                    if(String(body).indexOf('http://www.qq.com/sitemap_index.xml') === -1){
                        cb(null,item.id)
                        console.log(`${pIp}，返回数据不完整，测试未通过`);
                        return
                    }
                    cb(null)
                    console.log(`${pIp}，ok`);
                }
                else{
                    console.log(`访问${pIp}返回报错，err:${err}, reps.statusCode:${reps && reps.statusCode}`);
                    cb(null,item.id)
                }
            }
            catch (err){
                console.log(`访问程序报错：${pIp}，${err}`);
                cb(null,item.id)
            }
        })
    },(error,results)=>{
        const data = results.filter(op=>op);
        console.log( '消耗时间：'+ (Date.now() - time)/1000 + 's');
        console.log('总计'+ data.length + '条无用数据');
        ipDao.bulkDelete(data);
    })

})()

function concatProxyIp(item){
    return (item.protocol === 'https' ? 'https://' : 'http://') + item.ip + ':' + item.port
}