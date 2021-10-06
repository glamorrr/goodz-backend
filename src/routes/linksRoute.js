const { Router } = require('express');
const linksController = require('../controllers/linksController');

const router = Router();

router.get('/', linksController.links_get);
router.post('/', linksController.links_post);
router.put('/:id', linksController.links_put);
router.put('/:id/position', linksController.links_position_put);

module.exports = router;
