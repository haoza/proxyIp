const Sequelize = require('sequelize');
const uuid = require('node-uuid');
const config = require('./../config/dbConfig');
const {formatDate, isArray} = require('../util/util');
const Op = Sequelize.Op;

function generateId() {
    return uuid.v4();
}

console.log('init sequelize...');

var sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, {
    host: config.mysql.host,
    dialect: config.mysql.dialect,
    logging:config.mysql.logging,
    benchmark:false,
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },
    operatorsAliases: {
        $and: Op.and,
        $or: Op.or,
        $eq: Op.eq,
        $gt: Op.gt,
        $lt: Op.lt,
        $lte: Op.lte,
        $like: Op.like
    }
});


function defineModel(name, attributes, options = {}) {

    var attrs = {};
    for (let key in attributes) {
        let value = attributes[key];
        if (typeof value === 'object' && value['type']) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            };
        }
    }
    attrs.createdAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.updatedAt = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    attrs.version = {
        type: Sequelize.BIGINT,
        allowNull: false
    };
    // console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, function (k, v) {
    //     if (k === 'type') {
    //         for (let key in Sequelize) {
    //             if (key === 'ABSTRACT' || key === 'NUMBER') {
    //                 continue;
    //             }
    //             let dbType = Sequelize[key];
    //             if (Object.prototype.toString.call(dbType) === '[object Function]') {
    //                 try {
    //                     if (v._length) {
    //                         return `${v}`;
    //                     }
    //                     return dbType.key;
    //                     if (v === dbType) {
    //                         return dbType.key;
    //                     }
    //                 }
    //                 catch (err) {
    //                     console.log(dbType.prototype)
    //                     console.log(err)
    //                 }
    //
    //             }
    //         }
    //     }
    //     return v;
    // }, '  '));

    return sequelize.define(name, attrs, {
        freezeTableName: true,
        tableName: name,
        timestamps: false,
        ...config.mysql.dialectOptions,
        ...options,
        hooks: {
            beforeValidate(obj) {
                console.log(obj)
                let now = Date.now();
                if (!obj.userPin) {
                    obj.userPin = generateId()
                }
                if (obj.isNewRecord) {
                    obj.createdAt = now;
                    obj.updatedAt = now;
                    obj.version = 0;
                } else {
                    obj.updatedAt = now;
                    obj.version++;
                }
            },
            beforeBulkCreate(arr) {
                let now = Date.now();
                arr.map(obj => {
                    if (obj.isNewRecord) {
                        obj.createdAt = now;
                        obj.updatedAt = now;
                        obj.version = 0;
                    } else {
                        obj.updatedAt = now;
                        obj.version++;
                    }
                })
            },
            afterFind(value) {
                if (value && isArray(value)) {
                    value.map(item => {
                        if (item.dataValues.createdAt) {
                            item.dataValues.createdAt = formatDate(item.dataValues.createdAt)
                        }
                        if (item.dataValues.updatedAt) {
                            item.dataValues.updatedAt = formatDate(item.dataValues.updatedAt)
                        }
                    })
                }
            }
        }
    });
}

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN'];

var exp = {
    defineModel: defineModel,
    sync: () => {
        sequelize.sync(
            {
                force: config.mysql.force,
            });

        // only allow create ddl in non-production environment:
        // if (process.env.NODE_ENV === 'production') {
        //     sequelize.sync({force: false});
        //
        // } else {
        //     throw new Error('Cannot sync() when NODE_ENV is set to \'production\'.');
        // }
    }
};

for (let type of TYPES) {
    exp[type] = Sequelize[type];
}


module.exports = exp;