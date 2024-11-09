const express = require('express');
const { getAllTasks, createTask } = require('../controllers/taskController');
const router = express.Router();

router.get('/', getAllTasks);
router.post('/', createTask);

module.exports = router;
