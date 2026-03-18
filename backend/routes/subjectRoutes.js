const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");

/* \u2795 ADD SUBJECT */
router.post("/add", subjectController.addSubject);

/* \ud83d\udcce ADD / UPDATE MATERIAL LINK FOR SUBJECT */
router.put("/material/:id", subjectController.updateMaterialLink);

/* \ud83d\udce5 GET SUBJECTS BY YEAR */
router.get("/:year", subjectController.getSubjectsByYear);

/* \u274c DELETE SUBJECT */
router.delete("/:id", subjectController.deleteSubject);

module.exports = router;