const User = require("../Model/user.model");
const asyncWrapper = require('../middleware/async')
const jwt = require("jsonwebtoken");

const Register = asyncWrapper(async (req, res,next) => {
    console.log(req.body);
    User.getUserByUserName.service({ userName : req.body.userName}, (dbError, data1) => {
          if(dbError){
            console.log(">>>Database is down<<<")
             res.status(400).json({
                 status : "failure",
                errorCode : "db/unknown-error",
                error : dbError /* only here for debugging purposes */
             });
          }
         else{
            console.log(data1)
             if(data1.length !== 0){ /* Username already exists */
             console.log(">>>User name already exists<<<")
                res.status(401).json({
                    status : "failure",
                      errorCode : "auth/username-exists"
                  });
              }
             else{
                User.getUserByEmail.service({email : req.body.email}, (dbError, data2) => {
                       if(dbError){
                        console.log(">>>email already exists<<<")
                        res.status(402).json({
                            status : "failure",
                            errorCode : "db/unknown-error",
                            error : dbError /* only here for debugging purposes */
                        });
                     }
                    else{
                          if(data2.length != 0){ /* Email already exists */
                          console.log("email already exists")
                              res.status(403).json({
                                status : "failure",
                                errorCode : "auth/email-exists"
                            });
                         }
                        else{
                              User.createUser.service(req.body, (dbError) => {
                                if(dbError){
                                    console.log("DB error2")
                                       res.status(404).json({
                                          status : "failure",
                                          errorCode : "db/unknown-error",
                                        error : dbError /* only here for debugging purposes */
                                    });
                                 }
                                  else
                                       res.status(200).json({
                                           status : "success",
                                          data : res.body
                                      });
                             });   
                           }
                    }
                });
              }
           }
     });
})
const  SearchByName = asyncWrapper(async(req, res) => {
        User.getUserByUserName.service(req.params, (dbError, data) => {
            if(dbError){
                res.status(400).json({
                    status : "failure",
                    errorCode : "db/unknown-error",
                    error : dbError
                });
            }
            else
                res.status(200).json({
                    status : "success",
                    data : data
                });
        });
})
const  SearchByEmail = (req, res) => {
        User.getUserByEmail.service(req.params, (dbError, data) => {
            if(dbError){
                res.status(400).json({
                    status : "failure",
                    errorCode : "db/unknown-error",
                    error : dbError
                });
            }
            else
                res.status(200).json({
                    status : "success",
                    data : data
                });
        });
    }
const  signIn = asyncWrapper(async(req, res, next) => {
    console.log(req.body);
    User.getUserByUserName.service({ userName : req.body.userName}, (dbError, data) => {
          if(dbError){
            res.status(400).json({
                   status : "failure",
                   errorCode : "db/unknown-error",
                   error : dbError /* only here for debugging purposes */
            });
         }
         else{
            if(data.length == 0){ /* username doesnt exists */
                console.log("User does not exist")
                res.status(400).json({
                    status : "failure",
                    errorCode : "auth/invalid-email-password"
                });
              }
            else{  
                if(req.body.pass == data[0].pass){
                    const accessToken = jwt.sign(
                        { userName : req.body.userName, userRole : req.body.userRole }, 
                        process.env.ACCESS_TOKEN_SECRET, 
                        {expiresIn : '1m'}
                    );
                    res.status(200).json({
                        status : "success",
                        accessToken : accessToken,
                    });   
                }
                else{
                    res.status(400).json({
                        status : "failure",
                        errorCode : "auth/invalid-email-password"
                    });
                }
            }
          }
     });

})

const UpdateProfile = (req, res) => {
    User.updateProfile.service({...req.body, userName : req.user.userName}, (dbError, data) => {
        if(dbError){
            return res.status(400);
        }
        res.status(200).json(data);   
    });
}
module.exports = {
        Register,
        signIn,
        SearchByEmail,
        SearchByName,
        UpdateProfile
}


