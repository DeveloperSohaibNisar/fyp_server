import NoteSchema from "../models/note.js";

export const uploadNote = async (req, res) => {
  try {
    if (!req.body.name) throw new Error(`Name must be provided`);
    const linesCount = req.body.linesCount;
    const content = req.body.content;

    const newNote = new NoteSchema({
      name: req.body.name,
      userId: req.userData._id,
    });

    if (linesCount) newNote.linesCount = linesCount;
    if (content) newNote.content = content;

    const snapshot = await newNote.save();
    res.status(200).json(snapshot);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateNote = async (req, res) => {
  try {
    if (!req.body.newNote) throw new Error(`Note must be provided`);

    const newNote = req.body.newNote;

    const note = await NoteSchema.findById(newNote._id);

    note.name = newNote.name;
    note.linesCount = newNote.linesCount;
    note.content = newNote.content;

    const snapshot = await note.save();
    res.status(200).json(snapshot);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const perPage = 10;
    if (!req.params.page) throw new Error(`Invalid Request`);

    const page = req.params.page;

    const result = await NoteSchema.find({ userId: req.userData._id })
      .limit(perPage)
      .skip(perPage * page)
      .sort({ updatedAt: -1 });
    return res.status(200).json(result);
  } catch (err) {
    if (err.message) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
