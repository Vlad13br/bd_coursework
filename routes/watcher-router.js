const express = require("express");
const router = express.Router();
const WatcherController = require("../controllers/watcher-controller");
const { isAdmin } = require("../middlewares/auth");

router.post(
  "/watchers/:id",
  isAdmin,
  WatcherController.createWatcher
);

router.get("/watchers", WatcherController.getAllWatchers);

router.get("/watchers/:id", WatcherController.getWatcherById);

router.put("/watchers/:id", isAdmin, WatcherController.updateWatcher);

router.patch(
  "/watchers/discount/:id",
  isAdmin,
  WatcherController.updateDiscount
);

module.exports = router;
