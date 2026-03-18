const Subject = require("../models/Subject");

/* \u2795 ADD SUBJECT */
const addSubject = async (req, res) => {
  try {
    const { subjectName, subjectCode, department, year } = req.body;

    // \u2705 VALIDATION
    if (!subjectName || !subjectCode || !department || !year) {
      return res.status(400).json({
        message:
          "All fields are required (subjectName, subjectCode, department, year)",
      });
    }

    // \u2705 CHECK DUPLICATE SUBJECT CODE
    const existing = await Subject.findOne({ subjectCode });
    if (existing) {
      return res.status(409).json({
        message: "Subject with this code already exists",
      });
    }

    const subject = new Subject({
      subjectName,
      subjectCode,
      department,
      year,
    });

    await subject.save();

    res.status(201).json({
      message: "Subject added successfully",
      subject,
    });
  } catch (err) {
    console.error("ADD SUBJECT ERROR \u274c", err);
    res.status(500).json({ message: err.message });
  }
};

/* \ud83d\udcce ADD / UPDATE MATERIAL LINK FOR SUBJECT */
const updateMaterialLink = async (req, res) => {
  try {
    const { materialLink } = req.body;

    if (!materialLink) {
      return res.status(400).json({ message: "Material link is required" });
    }

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { materialLink },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({
      message: "Material link updated successfully",
      subject,
    });
  } catch (err) {
    console.error("UPDATE MATERIAL LINK ERROR \u274c", err);
    res.status(500).json({ message: err.message });
  }
};

/* \ud83d\udce5 GET SUBJECTS BY YEAR */
const getSubjectsByYear = async (req, res) => {
  try {
    const year = decodeURIComponent(req.params.year);

    const subjects = await Subject.find({ year });

    res.status(200).json(subjects);
  } catch (err) {
    console.error("FETCH SUBJECTS ERROR \u274c", err);
    res.status(500).json({ message: err.message });
  }
};

/* \u274c DELETE SUBJECT */
const deleteSubject = async (req, res) => {
  try {
    const deleted = await Subject.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (err) {
    console.error("DELETE SUBJECT ERROR \u274c", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addSubject,
  updateMaterialLink,
  getSubjectsByYear,
  deleteSubject
};
