const Faculty = require("../models/Faculty");

const createFaculty = async (req, res) => {
  try {
    const { name, email, department, year, extraFields = {} } = req.body;

    if (!name || !email || !department || !year) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    const existing = await Faculty.findOne({ email });
    if (existing) {
      return res.status(400).json({
        message: "Faculty already exists",
      });
    }

    const faculty = await Faculty.create({
      name,
      email,
      department,
      year,
      extraFields,
    });

    res.status(201).json(faculty);
  } catch (err) {
    console.error("CREATE FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ createdAt: -1 });
    res.json(faculty);
  } catch (err) {
    console.error("FETCH FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteColumn = async (req, res) => {
  try {
    const { columnName } = req.params;

    if (!columnName) {
      return res.status(400).json({
        message: "Column name is required",
      });
    }

    await Faculty.updateMany(
      {},
      { $unset: { [`extraFields.${columnName}`]: "" } }
    );

    res.json({
      message: `Column '${columnName}' deleted successfully`,
    });
  } catch (err) {
    console.error("DELETE COLUMN ERROR:", err);
    res.status(500).json({ message: "Failed to delete column" });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const updated = await Faculty.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    const deleted = await Faculty.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    res.json({ message: "Faculty deleted successfully" });
  } catch (err) {
    console.error("DELETE FACULTY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFacultyCount = async (req, res) => {
  try {
    const count = await Faculty.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("COUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getFacultyYearCount = async (req, res) => {
  try {
    const data = await Faculty.aggregate([
      {
        $group: {
          _id: "$year",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      "1st": 0,
      "2nd": 0,
      "3rd": 0,
      "4th": 0,
    };

    data.forEach((item) => {
      if (result[item._id] !== undefined) {
        result[item._id] = item.count;
      }
    });

    res.json(result);
  } catch (err) {
    console.error("YEAR COUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createFaculty,
  getAllFaculty,
  deleteColumn,
  updateFaculty,
  deleteFaculty,
  getFacultyCount,
  getFacultyYearCount
};
