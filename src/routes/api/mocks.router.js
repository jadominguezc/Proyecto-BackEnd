const { Router } = require("express");
const mockingController = require("../../controllers/mockingController");

const router = Router();

router.get("/mockingusers", mockingController.generateMockingData);

router.post("/generateData", mockingController.generateAndInsertData);

module.exports = router;
