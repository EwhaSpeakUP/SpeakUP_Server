const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            // 학번이자 아이디
            userId : {
               type: Sequelize.BIGINT,
               allowNull : false,
               unique: true,
            },
            isStudent : {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            isProfessor : {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            info : {
                type: Sequelize.TEXT,
                allowNull : true,
            },
        }, {
            sequelize,
            timestamps: true, // craeteAt, updateAt 생성
            underscored: true,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,   // deleteAt 생성
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db){
        db.User.hasOne(db.Student, {foreignKey: 'studentId', sourceKey: 'id'});
        db.User.hasOne(db.Professor, { foreignKey: 'professorId', sourceKey: 'id'});
    }   
}