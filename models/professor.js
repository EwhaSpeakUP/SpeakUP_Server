const Sequelize = require('sequelize');

module.exports = class Professor extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            professorId : {
                type : Sequelize.INTEGER,
                allowNull : false,
            },
            name : {
                type : Sequelize.STRING(255),
                allowNull : false,
            },
        }, {
            sequelize,
            timestamps: true,
            paranoid : true,
            tableName : 'professors',
            modelName : 'Professor',
            charset : 'utf8',
            collate : 'utf8_general_ci',
        });
    }

    static associate(db) {
        db.Professor.belongsTo(db.User, { foreignKey: 'professorId', targetKey: 'id'});
        db.Professor.hasMany(db.Lecture, { foreignKey: 'professor', sourceKey: 'id'});
    }
}