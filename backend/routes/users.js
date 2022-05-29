const router = require("express").Router();
const usersController = require("../controllers/users");

// GET /users/account
router.get("/account", usersController.getUser);

// POST /users/account
router.post("/account", usersController.updateUser);

router.get("/isLogin", usersController.isLoggedIn);

router.post("/updateBalance", usersController.updateBalance);

router.post("/updateBalanceById", usersController.updateBalanceById);

// POST /users/entry
router.post("/entry", usersController.markEntry);

// POST /users/exit
router.post("/exit", usersController.markExit);

// POST /users/exit
router.post("/accountById", usersController.getUserById);

module.exports = router;
