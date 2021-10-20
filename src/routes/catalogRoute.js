const { Router } = require('express');
const catalogController = require('../controllers/catalogController');

const router = Router();

router.get('/', catalogController.catalog_get);
router.put('/:id/position', catalogController.catalog_position_put);

module.exports = router;
