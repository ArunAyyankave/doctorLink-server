const router = require('express').Router();
const doctorController = require('../controllers/doctorController/doctorSignin');
const docProfile = require('../controllers/doctorController/doctorProfile');
const verifyToken = require('../middlewares/managerAuth');


router.post('/signin', doctorController.signin);
router.post('/completeprofile', verifyToken, docProfile.completeprofile);
router.post('/addSlot', verifyToken, docProfile.addSlot);
router.get('/getSlots', verifyToken, docProfile.getSlots);
router.get('/getAps', verifyToken, docProfile.getAps);
router.get('/dashboard', verifyToken, docProfile.getInfo);

module.exports = router;