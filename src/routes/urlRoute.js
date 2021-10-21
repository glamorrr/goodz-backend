const { Router } = require('express');
const urlController = require('../controllers/urlController');

const router = Router();

router.get('/:url', urlController.url_get);

module.exports = router;
