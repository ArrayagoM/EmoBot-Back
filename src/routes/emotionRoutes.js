const express = require('express');
const router = express.Router();
const { saveEmotion } = require('../controller/emotionController');

router.post('/emotion', saveEmotion);

module.exports = router;
 