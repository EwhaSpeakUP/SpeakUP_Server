const Sequelize = require('sequelize');

module.exports = class Submission extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            assignmentId: {
                type: Sequelize.INTEGER,
                allowNull : false,
            },
            studentId : {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            submitDate : {
                type: Sequelize.DATE,
                allowNull: true,
            },
            status : {
                type: Sequelize.ENUM('NOT SUBMIT', 'SUBMIT IN TIME', 'SUBMIT LATE'),
                allowNull : false,
                defaultValue : 'NOT SUBMIT',
            },
            submitvoice : {
                type: Sequelize.TEXT,
                allowNull : false,
            },
            transcription : {
                type: Sequelize.TEXT,
                allowNull : true,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid: true,
            tableName : 'Submissions',
            modelName : 'Submission',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
         db.Submission.belongsTo(db.Student, { foreignKey: 'studentId', targetKey: 'id'});
         db.Submission.belongsTo(db.Assignment, { foreignKey: 'assignmentId', targetKey: 'id'});
    }
}