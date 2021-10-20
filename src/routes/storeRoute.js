const { Router } = require('express');
const storeController = require('../controllers/storeController');
const verifyAuth = require('../middlewares/verifyAuth');

const router = Router();

router.put('/is_credit', verifyAuth, storeController.store_is_credit_put);

module.exports = router;
