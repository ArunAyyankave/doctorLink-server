const router = require('express').Router();
const userController = require('../controllers/userController/userSignin&Signup');
const docController = require('../controllers/userController/docController');
const appointmentController = require('../controllers/userController/appointmentController');
const auth = require('../middlewares/userAuth');


router.post('/signup', userController.userSignup);
router.post('/signin', userController.userSignin);
router.post('/mobileExist', userController.mobileExist);
router.get('/getUser', userController.getUser);
router.get('/forgotPwd/mobileExist', userController.MobileExistForForgot);
router.post('/forgotPwd', userController.newPassSet);

router.post('/signin/google', userController.googleSignin);

router.post('/docMobile', docController.mobileExist);
router.post('/docSignup', docController.docSignup);

router.get('/getDoctors', docController.getDoctors);
router.get('/doctorDetails/:_id', docController.getDoctor);
router.get('/search', docController.searchDoctor);

router.post('/book-appointment', auth, appointmentController.bookAppointment);
router.get('/appointments', auth, appointmentController.getAps);

module.exports = router;