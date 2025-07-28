const express = require('express');
const router = express.Router();
// Get all admins
router.get('/all', require('../controllers/adminController').getAllAdmins);
const {
  loginAdmin,
  startElection,
  endElection,
  getElectionStatus,
  addAdmin,
  editAdmin,
} = require('../controllers/adminController');


// Admin management
router.post('/add', addAdmin); // POST /api/admin/add
router.put('/edit/:id', editAdmin); // PUT /api/admin/edit/:id

router.post('/login', loginAdmin);
router.post('/start', startElection);
router.post('/end', endElection);
router.get('/status', getElectionStatus);

module.exports = router;
