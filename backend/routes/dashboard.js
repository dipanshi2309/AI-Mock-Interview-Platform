const express = require('express');
const router = express.Router();
const { db } = require('../db');
const auth = require('../middleware/auth');

// @route   GET api/dashboard/stats
// @desc    Retrieve aggregated stats for dashboard visualization
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const history = await db.interviews.findByUser(req.user.id);
    const completed = history.filter(i => i.status === 'completed');

    if (completed.length === 0) {
      return res.json({
        totalInterviews: 0,
        averageScore: 0,
        topicPerformance: {},
        scoreHistory: [],
        areasForImprovement: []
      });
    }

    // Calculate overall average score
    const totalScore = completed.reduce((sum, item) => sum + item.overallScore, 0);
    const averageScore = Math.round(totalScore / completed.length);

    // Group by Topic
    const topicsMap = {};
    completed.forEach(item => {
      const topic = item.topic.toUpperCase();
      if (!topicsMap[topic]) {
        topicsMap[topic] = { total: 0, count: 0 };
      }
      topicsMap[topic].total += item.overallScore;
      topicsMap[topic].count += 1;
    });

    const topicPerformance = {};
    Object.keys(topicsMap).forEach(topic => {
      topicPerformance[topic] = Math.round(topicsMap[topic].total / topicsMap[topic].count);
    });

    // Score History (chronological order)
    const scoreHistory = completed
      .map(item => ({
        topic: item.topic,
        score: item.overallScore,
        date: item.createdAt
      }))
      .reverse();

    // Compile constructive recommendations
    const recommendations = [];
    completed.forEach(item => {
      if (item.feedback && Array.isArray(item.feedback)) {
        item.feedback.forEach(f => {
          if (f.score < 7 && f.tips) {
            // Find parent question context
            const question = item.questions.find(q => q.id === f.questionId);
            const questionText = question ? question.questionText : 'General Question';
            recommendations.push({
              topic: item.topic,
              score: f.score,
              question: questionText,
              tip: f.tips
            });
          }
        });
      }
    });

    // Limit to latest 5 recommendations for neat UI presentation
    const uniqueRecommendations = [];
    const seenTips = new Set();
    for (const rec of recommendations) {
      if (!seenTips.has(rec.tip)) {
        seenTips.add(rec.tip);
        uniqueRecommendations.push(rec);
      }
      if (uniqueRecommendations.length >= 5) break;
    }

    res.json({
      totalInterviews: completed.length,
      averageScore,
      topicPerformance,
      scoreHistory,
      areasForImprovement: uniqueRecommendations
    });
  } catch (err) {
    console.error('Error fetching dashboard statistics:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
