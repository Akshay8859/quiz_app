const express=require('express');
const router=express.Router();
const {getToken,checkToken}=require('../controllers/auth');
const authenticationMiddleware=require('../middleware/auth');
router.post('/getToken',getToken);
router.get('/checkToken',authenticationMiddleware,checkToken);
module.exports=router;