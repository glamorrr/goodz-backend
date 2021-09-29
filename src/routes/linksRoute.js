const { Router } = require('express');
const linksController = require('../controllers/linksController');
const verifyAuth = require('../middlewares/verifyAuth');

const router = Router();

router.post('/', verifyAuth, linksController.links_post);

module.exports = router;
