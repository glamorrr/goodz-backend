const { Router } = require('express');
const itemsController = require('../controllers/itemsController');

const router = Router();

router.post('/', itemsController.items_post);
router.put('/:id', itemsController.items_put);

module.exports = router;
