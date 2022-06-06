const Sequelize = require('sequelize');
const path = require('path');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const User = require('./user');
const Professor = require('./professor');
const Student = require('./student');
const Lecture =require('./lecture');
const Assignment = require('./assignment');
const Submission = require('./submission');

const db = {};
const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.User = User;
db.Professor = Professor;
db.Student = Student;
db.Lecture = Lecture;
db.Assignment = Assignment;
db.Submission = Submission;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].init(sequelize);
  }
});

/** 관계 생성 */
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;