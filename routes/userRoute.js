import express from 'express'
import * as authController from '../controllers/authController'
import * as userController from '../controllers/userController'
const router = express.Router()

//auth rooutes
router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgetpassword',authController.forgetPassword);
router.patch('/resetpassword/:token',authController.resetPassword);

//protetcetd routes
router.use(authController.protect);
//Profile
router.get('/profile',authController.protect,userController.getMe,userController.getUser);
//userchef request
router.post("/requestchef",userController.requestChef);
router.get("/chefrequeststatus",userController.getChefRequestStatus)
//User
router.patch('/updatepassword',authController.protect,authController.updatePassword)
router.get('/logout',authController.protect,authController.logout);
router.get('/me', authController.protect,userController.getMe, userController.getUser);
router.route('/:id').get(userController.getUser)
.patch(userController.updateUser)

//router.route('/uploadimage').post(userController.uploadAvatar);
router.post(
  "/avatar",
  authController.protect,
  userController.upload.single("file"),
  userController.uploadAvatar
);
//only admins
router.use(authController.restrictToAdmin);
router.get('/',userController.getAllUsers)
router.route('/:id').delete(userController.deleteUser)
export default router;
