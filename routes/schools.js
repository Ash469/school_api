const express = require('express');
const router = express.Router();
const controller = require('../controllers/schoolsController');

router.post('/addSchool', controller.addSchool);
router.get('/listSchools', controller.listSchools);
router.delete('/deleteSchool/:id', controller.deleteSchool);

module.exports = router;
