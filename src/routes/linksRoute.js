const { Router } = require('express');
const linksController = require('../controllers/linksController');
const verifyAuth = require('../middlewares/verifyAuth');

const router = Router();

router.post('/', verifyAuth, linksController.links_post);
router.put('/:id/position', verifyAuth, linksController.links_position_put);

module.exports = router;
