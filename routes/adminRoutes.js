const router = require('express').Router();
const adminController = require('../controllers/adminController/adminLogin');
const userController = require('../controllers/adminController/userController');
const docController = require('../controllers/adminController/docController');
const apsContorller = require('../controllers/adminController/appointmentController');
const dashController = require('../controllers/adminController/dashboardController');
const verifyToken = require('../middlewares/adminAuth');

router.post('/signin', adminController.adminLogin);

router.get('/dashboard', verifyToken, dashController.getInfo);

router.get('/users', verifyToken, userController.getUsers);
router.put('/users/blockStatus/:_id', verifyToken, userController.blockUser);

router.get('/docs', verifyToken, docController.getDocs);
router.put('/doc/blockStatus/:_id', verifyToken, docController.blockDoc);
router.put('/doc/approve/:_id', verifyToken, docController.approve);
router.delete('/doc/:_id', verifyToken, docController.deleteDoc);

router.get('/getAps', verifyToken, apsContorller.getAps);

module.exports = router;