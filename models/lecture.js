const Sequelize = require('sequelize');

module.exports = class Lecture extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            professor: {
                type: Sequelize.INTEGER,
                allowNull : true,
            },
            name : {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            subjectId : { // 학수번호
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            group : { // 분반
                type: Sequelize.INTEGER,
                allowNull : false,
            }
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            tableName : 'Lectures',
            modelName : 'Lecture',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
         db.Lecture.belongsTo(db.Professor, { foreignKey: 'professor', targetKey: 'id'});
         db.Lecture.belongsToMany(db.Student, {through: 'StudentLecture'});

         db.Lecture.hasMany(db.Assignment, { foreignKey : 'lectureId', sourceKey: 'id'});
    }
}