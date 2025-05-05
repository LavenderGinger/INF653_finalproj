const express = require('express');
const router = express.Router();
const controller = require('../../controllers/statesController');
const verifyState = require('../../middleware/verifyState');

router.get('/', controller.getAllStates);
router.get('/:state', verifyState, controller.getState);
router.get('/:state/funfact', verifyState, controller.getRandomFunFact);
router.get('/:state/capital', verifyState, controller.getStateField('capital'));
router.get('/:state/nickname', verifyState, controller.getStateField('nickname'));
router.get('/:state/population', verifyState, controller.getStateField('population'));
router.get('/:state/admission', verifyState, controller.getStateField('admission'));

router.post('/:state/funfact', verifyState, controller.addFunFacts);
router.patch('/:state/funfact', verifyState, controller.updateFunFact);
router.delete('/:state/funfact', verifyState, controller.deleteFunFact);

module.exports = router;