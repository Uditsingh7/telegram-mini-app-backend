const express = require('express');
const { getAllTasks, createTask, claimTask } = require('../controllers/taskController');
const router = express.Router();

router.get('/', getAllTasks);
router.post('/', createTask);
router.post('/claim-task', claimTask);

module.exports = router;
