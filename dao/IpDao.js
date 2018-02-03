const model = require('../model');
const Ip = model.Ip;
// Ip.create({
//     'ip': '192.168.0.196',
//     'port': '8888',
// })
// Ip.bulkCreate([])
module.exports = {
    add(params) {
        return Ip.bulkCreate(params)
    },
    bulkDelete(arr){
        Ip.destroy({
            'where': {'id': arr}
        });
    },
    getPageBy({page = 100,size = 0} = {}){
        return Ip.findAll({
            'limit': page,
            'offset': size,
            'attributes': ['ip', 'port']
        });
    },
    getAll(){
       return  Ip.findAll({
            'attributes': ['id','ip', 'port','protocol']
        })
    }
}
