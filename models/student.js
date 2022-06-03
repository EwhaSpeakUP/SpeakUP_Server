const Sequelize = require('sequelize');

module.exports = class Student extends Sequelize.Model {
    static init(sequelize){
        return super.init({
            studentId : {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            name : {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            year : {
                type : Sequelize.ENUM(['1','2','3','4']),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            tableName: 'students',
            modelName: 'Student',
            charset: 'utf8',
            collate : 'utf8_general_ci',
        })
    }

    static associate(db) {
        db.Student.belongsTo(db.User, {foreignKey: 'studentId', targetKey: 'id'});
        db.Student.belongsToMany(db.Lecture, {through: 'StudentLecture'})

        db.Student.hasMany(db.Submission, { foreignKey: 'studentId', sourceKey: 'id'});
    }
}