const { Router } = require('express');
const headerController = require('../controllers/headerController');

const router = Router();

router.post('/', headerController.header_post);

module.exports = router;
