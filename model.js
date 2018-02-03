// scan all models defined in models:
const fs = require('fs');
const db = require('./db/mysql');

let files = fs.readdirSync(__dirname + '/models');

let js_files = files.filter((f) => {
    return f.endsWith('.js');
}, files);

module.exports = {};

for (let f of js_files) {
    console.log(`import model from file ${f}...`);
    let name = f.substring(0, f.length - 3);
    module.exports[name] = require(__dirname + '/models/' + f);
}

// let {User, Forum_topic, Forum_topic_back, Chat} = module.exports;

/*
 * User的实例对象将拥有getNotes、setNotes、addNote、createNote、removeNote、hasNote方法
 */
// User.hasMany(Forum_topic);
// User.hasMany(Forum_topic_back);
// User.hasMany(Chat,{logging:false});
// Forum_topic_back.hasMany(Forum_topic_back, {'as': 'user_reply'});
// Forum_topic.hasMany(Forum_topic_back, {'as': 'reply'});

/*
 * Note的实例对象将拥有getUser、setUser、createUser方法
 */
// Forum_topic.belongsTo(User);
// Forum_topic_back.belongsTo(User);
// Forum_topic_back.belongsTo(Forum_topic);
// Forum_topic_back.belongsTo(Forum_topic_back);


module.exports.sync = () => {
    db.sync();
};

db.sync();