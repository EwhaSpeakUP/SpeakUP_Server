const Sequelize = require('sequelize');

module.exports = class Assignment extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            lectureId : {
                type : Sequelize.INTEGER,
                allowNull : false,
            },
            title : {
                type : Sequelize.STRING(255),
                allowNull : false,
            },
            opendate: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue : Sequelize.NOW,
            },
            duedate: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            originvoice : {
                type: Sequelize.TEXT,
                allowNull : false,
            }
        }, {
            sequelize,
            timestamps: true,
            paranoid : true,
            tableName: 'assignments',
            modelName: 'Assignment',
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
         db.Assignment.belongsTo(db.Lecture, { foreignKey : 'lectureId', targetKey: 'id'});
         
         db.Assignment.hasMany(db.Submission, { foreignKey: 'assignmentId', sourceKey: 'id'});
    }
}