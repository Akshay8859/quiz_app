const express=require('express');
const router=express.Router();
const {
    showQusestion,
    checkAnswer,
    showAllPlayers,
    showAnswer,
    getQuestion,
    getCollections,
}=require("../controllers/game");
router.route('/question').post(showQusestion);
router.route('/checkAnswer').post(checkAnswer)
router.route('/showAnswer').post(showAnswer);
router.route('/players').post(showAllPlayers);
router.post('/questions',getQuestion)
router.get('/collections',getCollections)
module.exports=router;