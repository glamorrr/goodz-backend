const { Router } = require('express');
const catalogController = require('../controllers/catalogController');

const router = Router();

router.get('/', catalogController.catalog_get);

module.exports = router;
