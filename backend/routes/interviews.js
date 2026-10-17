const express = require('express');
const router = express.Router();
const { db } = require('../db');
const auth = require('../middleware/auth');
const aiService = require('../services/aiService');

// @route   POST api/interviews/start
// @desc    Initiate an interview session and generate questions
// @access  Private
router.post('/start', auth, async (req, res) => {
  const { topic, difficulty, questionCount } = req.body;

  if (!topic || !difficulty) {
    return res.status(400).json({ msg: 'Please provide topic and difficulty level' });
  }

  const count = parseInt(questionCount) || 4;

  try {
    console.log(`Generating ${count} questions for topic: ${topic}, level: ${difficulty}`);
    const questions = await aiService.generateQuestions(topic, difficulty, count);

    const interview = await db.interviews.create({
      userId: req.user.id,
      topic,
      difficulty,
      status: 'pending',
      questions,
      answers: [],
      feedback: [],
      overallScore: 0,
      overallFeedback: ''
    });

    res.json(interview);
  } catch (err) {
    console.error('Error starting interview session:', err.message);
    res.status(500).send('Failed to start interview and generate questions');
  }
});

// @route   POST api/interviews/:id/submit
// @desc    Submit answers for evaluation and calculate scoring
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  const { answers } = req.body;
  const interviewId = req.params.id;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ msg: 'Answers must be sent as an array' });
  }

  try {
    const interview = await db.interviews.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ msg: 'Interview session not found' });
    }

    // Verify ownership
    if (interview.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ msg: 'User unauthorized to submit this session' });
    }

    if (interview.status === 'completed') {
      return res.status(400).json({ msg: 'Interview has already been submitted and evaluated' });
    }

    console.log(`Evaluating answers for interview: ${interviewId}`);
    const evaluation = await aiService.evaluateAnswers(interview.questions, answers);

    const updatedInterview = await db.interviews.update(interviewId, {
      status: 'completed',
      answers,
      feedback: evaluation.feedback,
      overallScore: evaluation.overallScore,
      overallFeedback: evaluation.overallFeedback
    });

    res.json(updatedInterview);
  } catch (err) {
    console.error('Error submitting interview evaluation:', err.message);
    res.status(500).send('Failed to evaluate answers');
  }
});

// @route   GET api/interviews/history
// @desc    Get user interview history
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    const history = await db.interviews.findByUser(req.user.id);
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/interviews/:id
// @desc    Get interview session details by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const interview = await db.interviews.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ msg: 'Interview session not found' });
    }

    // Verify ownership
    if (interview.userId.toString() !== req.user.id.toString()) {
      return res.status(401).json({ msg: 'User unauthorized to access this session' });
    }

    res.json(interview);
  } catch (err) {
    console.error('Error fetching interview details:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
