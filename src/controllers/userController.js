const jwt = require('../../config/jwt');
//const auth = require("../../auth");
const crypto = require('crypto');
//const { type } = require('os');
//const jwtsecret = require('../../config/secret_config').jwtsecret;
const User = require('../../models/user');
const Student = require('../../models/student');
const Professor = require('../../models/professor');
const passport = require('passport');

/**---------- 회원가입 API ------------ */ 
exports.signUp = async function(id, role, password, name){
    
    /** 입력 확인 */
    if (id.toString().length != 7) {
        throw new Error('Invalid Id');
    }
    if (role !== 'professor' && role !== 'student'){
        throw new Error('Invalid Role');
    }

    const encoded_password = crypto.createHash('sha512').update(password).digest('base64');
    try {
        /** 해당 학번, 교번에 해당하는 사용자가 있다면, 회원가입이 되지 않는다. */
        const exuser = await User.findOne({ where : {id}});
        if (exuser) {
            throw new Error('UserAlreadyExist Error');
        };

        /** 회원 가입 */
        let is_student_val;
        let is_professor_val;

        if (role === 'student') {
            is_student_val = true;
            is_professor_val = false;
        } else if ( role === 'professor' ){
            is_student_val = false;
            is_professor_val = true;
        }
        const user = await User.create({
            id :id,
            isStudent: is_student_val,
            isProfessor: is_professor_val,
            password: encoded_password,
            info : ''
        });

        if (role === 'student') {
            const student = await Student.create({
                studentId : id,
                name : name,
                year : '1',
            });
            return student;
        } else if ( role === 'professor' ){
            const professor = await Professor.create({
                professorId : id,
                name : name,
            });
            return professor;
        }
    } catch(error) {
        throw error;
    } 

}
    

/**---------- 로그인 API ------------ **/
exports.signIn = async function(id, password){
    console.log("API execution: SignIN");

    const encoded_password = crypto.createHash('sha512').update(password).digest('base64');
    
    if (!id || !password){
        throw new Error('Empty Input');
    }
    if (id.toString().length != 7) {
        throw new Error('Invalid Input');
    }
    
    try {
        const user = await User.findOne({where: {id}});
        if(!user) {
            throw new Error('Not Registered Id');
        }
        if (user.password !== encoded_password) {
            throw new Error('Incorrect Password');
        }

        let jwtObject = {};
        const jwtOption = {
            expiredIn : "10d",
            issuer: "speakup_server.admin",
            subject : "user.login.info",
        }
        
        if (user.isStudent) {
            const student = await Student.findOne({where:{studentId:id}});
            jwtObject.role = "student";
            jwtObject.studentId = id;
            jwtObject.name = student.name;
        }
        else if(user.isProfessor) {
            const professor = await Professor.findOne({where:{professorId: id}});
            jwtObject.role = 'professor';
            jwtObject.professorId = id;
            jwtObject.name = professor.name;
        }
        return token = jwt.sign(jwtObject, jwtOption);

    } catch (error) {
        throw error;
    }
}
