import { Router } from "express";
import { generateMockingData, generateAndInsertData } from "../../controllers/mockingController.js";

const router = Router();

router.get("/mockingusers", generateMockingData);

router.post("/generateData", generateAndInsertData);

export default router;
