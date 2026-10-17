import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { InterviewSession } from './InterviewSession';
import { AlertCircle, ArrowLeft } from 'lucide-react';

// Default Product Manager Session Questions (matching user's mockup image)
const defaultPMSession = {
  _id: 'default-pm-session-101',
  topic: 'Product Manager',
  difficulty: 'Intermediate',
  status: 'pending',
  questions: [
    {
      id: 1,
      questionText: "Sarah, thank you for joining. Let's discuss your experience handling challenging product launches. Describe a specific launch and the difficulties you overcame.",
      sampleAnswer: "The answer should cover: 1) Context of the product launch. 2) Challenge (timeline, scope, or alignment). 3) Actions taken (data-driven decisions, user testing, stakeholder compromise). 4) Results (quantifiable success metrics, revenue growth, or user engagement)."
    },
    {
      id: 2,
      questionText: "How do you prioritize features on a product roadmap when dealing with competing stakeholder demands and limited engineering resources?",
      sampleAnswer: "Look for prioritization frameworks like RICE (Reach, Impact, Confidence, Effort) or Kano model. Candidate should explain balancing user impact, business value, engineering constraints, and negotiating with stakeholders."
    },
    {
      id: 3,
      questionText: "Describe a time when a product you launched failed or did not meet expectations. What did you learn and how did you pivot?",
      sampleAnswer: "Shows transparency and ownership. Ideal response covers root cause analysis (e.g. market fit, bad telemetry), retro actions, modifications based on post-launch analytics, and eventual pivot results."
    },
    {
      id: 4,
      questionText: "How do you define, track, and measure success metrics for a newly released consumer-facing product feature?",
      sampleAnswer: "Covers AARRR framework (Acquisition, Activation, Retention, Referral, Revenue). Explains setting up event tracking, product analytics funnels, and comparing performance against target KPIs."
    }
  ],
  answers: [],
  feedback: [],
  overallScore: 0,
  overallFeedback: ''
};

export const InterviewSessionWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInterview = async () => {
      if (!id) {
        // No ID (visiting root '/') -> Load default Product Manager mockup workspace immediately
        setInterview({ ...defaultPMSession });
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/interviews/${id}`);
        setInterview(res.data);
      } catch (err) {
        console.warn('API error, falling back to local PM mock:', err.message);
        // Fallback to local session if backend server is unreachable
        setInterview({ ...defaultPMSession });
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  const handleCompleted = (completedInterview) => {
    setInterview(completedInterview);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#ff6b00]/20 border-t-[#ff6b00] rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-semibold">Initializing Interview Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <InterviewSession interview={interview} onCompleted={handleCompleted} />
    </div>
  );
};
