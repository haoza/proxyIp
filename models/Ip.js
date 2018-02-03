const db = require('../db/mysql');

module.exports = db.defineModel('Ip', {
    ip: {
        type: db.STRING(100),
        unique: true
    },
    port: db.STRING(100),
    address: {
        type: db.STRING(36),
        allowNull: true,
    },
    protocol:{
        type: db.STRING(50),
        allowNull: true,
    },
    // 连接速度
    speed:{
        type: db.STRING(50),
        allowNull: true,
    },
    // 存活时间
    time:{
        type: db.STRING(50),
        allowNull: true,
    },
    // 验证时间
    verifyTime:{
        type: db.STRING(50),
        allowNull: true,
    }
});