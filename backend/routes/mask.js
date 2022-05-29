const router = require("express").Router();
const maskController = require("../controllers/mask");

// GET /mask/getAll
router.get("/getAll", maskController.getAllMask);

// POST /mask/update
router.post("/update", maskController.updateMask);

// GET /mask/getUser
router.get("/getUser", maskController.getUserMask);

// POST /mask/updateUser
router.post("/updateUser", maskController.updateUserMask);

module.exports = router;
