const util = {
    checkVacuity(val) {
        return val === '' || val === null || val === undefined
    },
    checkPhone(val) {
        return /^1[34578]\d{9}$/.test(val)
    },
    isObject(val) {
        return val !== null && typeof val === 'object'
    },
    isArray(o) {
        return Object.prototype.toString.call(o) == '[object Array]'
    },
    formatDate (timestamp, fmt = 'yyyy-MM-dd hh:mm:ss') {
        if (!Date.prototype._format) {
            Date.prototype._format = function (timestamp, fmt) {
                if (timestamp) {
                    this.setTime(timestamp);
                }
                var o = {
                    "M+": this.getMonth() + 1,                 //月份
                    "d+": this.getDate(),                    //日
                    "h+": this.getHours(),                   //小时
                    "m+": this.getMinutes(),                 //分
                    "s+": this.getSeconds(),                 //秒
                    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                    "S": this.getMilliseconds()             //毫秒
                };

                if (/(y+)/.test(fmt))
                    fmt = fmt.replace(RegExp.$1, (this.getFullYear().toString()).substr(4 - RegExp.$1.length));
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(fmt))
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
                return fmt;
            };
        }
        return new Date()._format(timestamp, fmt)
    },

};
module.exports = util;