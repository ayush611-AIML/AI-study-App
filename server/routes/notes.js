const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { authMiddleware } = require('../middleware/auth');
const { upload } = require('../services/storage');
const { extractText } = require('../services/aiClient');

// POST /notes - upload text, pdf, or image
router.post('/', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    const { title, text, sourceType } = req.body;
    const file = req.file;

    let detectedSourceType = sourceType || 'text';
    let extractedTextContent = '';
    let fileUrl = null;

    if (file) {
      const ext = file.originalname.split('.').pop().toLowerCase();
      detectedSourceType = ext === 'pdf' ? 'pdf' : 'image';
      fileUrl = `/uploads/${file.filename}`;

      // Call AI extractor on uploaded document/image
      extractedTextContent = await extractText({
        filePath: file.path,
        mimeType: file.mimetype,
      });
    } else if (text && text.trim().length > 0) {
      detectedSourceType = 'text';
      extractedTextContent = text.trim();
    } else {
      return res.status(400).json({
        error: 'Please provide either text or upload a PDF/image note file.',
      });
    }

    if (!extractedTextContent || extractedTextContent.length < 20) {
      return res.status(400).json({
        error: 'Could not extract sufficient text from the note. Please provide clearer content.',
      });
    }

    const note = new Note({
      userId: req.user.userId,
      title: title?.trim() || `Notes - ${new Date().toLocaleDateString()}`,
      sourceType: detectedSourceType,
      extractedText: extractedTextContent,
      fileUrl,
      createdAt: new Date(),
    });

    await note.save();

    res.status(201).json({
      message: 'Note uploaded and processed successfully.',
      note,
    });
  } catch (err) {
    next(err);
  }
});

// GET /notes - list all user notes
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const notes = await Note.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /notes/:id
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found.' });
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
