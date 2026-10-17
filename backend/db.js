const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let isMock = false;

// In-Memory Database Stores (Fallback)
const memoryDb = {
  users: [],
  interviews: [],
  questions: []
};

// Auto-increment ID generator for mock store
const generateId = () => Math.random().toString(36).substring(2, 15);

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview';
  try {
    console.log('Attempting to connect to MongoDB...');
    // Set a timeout of 3 seconds for connection attempts so it doesn't hang the app
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB connected successfully!');
    isMock = false;
  } catch (error) {
    console.warn('\n=========================================');
    console.warn('WARNING: MongoDB connection failed.');
    console.warn('Reason:', error.message);
    console.warn('FALLBACK: Starting backend with In-Memory Database.');
    console.warn('Note: Registered users and session data will reset on server restart.');
    console.warn('=========================================\n');
    isMock = true;
  }
};

// Define Mongoose Schema & Models if connected
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  difficulty: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  questions: [{
    id: Number,
    questionText: String,
    sampleAnswer: String
  }],
  answers: [String],
  feedback: [{
    questionId: Number,
    score: Number,
    evaluation: String,
    tips: String
  }],
  overallScore: { type: Number, default: 0 },
  overallFeedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
const InterviewModel = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);

// Unified Database Access Layer
const db = {
  getIsMock: () => isMock,
  
  users: {
    create: async (userData) => {
      if (!isMock) {
        const user = new UserModel(userData);
        return await user.save();
      } else {
        const existing = memoryDb.users.find(u => u.email === userData.email);
        if (existing) {
          throw new Error('User already exists');
        }
        const newUser = {
          _id: generateId(),
          ...userData,
          createdAt: new Date()
        };
        memoryDb.users.push(newUser);
        return newUser;
      }
    },
    findByEmail: async (email) => {
      if (!isMock) {
        return await UserModel.findOne({ email });
      } else {
        const user = memoryDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        return user || null;
      }
    },
    findById: async (id) => {
      if (!isMock) {
        return await UserModel.findById(id);
      } else {
        const user = memoryDb.users.find(u => u._id === id);
        return user || null;
      }
    }
  },

  interviews: {
    create: async (interviewData) => {
      if (!isMock) {
        const interview = new InterviewModel(interviewData);
        return await interview.save();
      } else {
        const newInterview = {
          _id: generateId(),
          ...interviewData,
          status: interviewData.status || 'pending',
          answers: interviewData.answers || [],
          feedback: interviewData.feedback || [],
          overallScore: interviewData.overallScore || 0,
          createdAt: new Date()
        };
        memoryDb.interviews.push(newInterview);
        return newInterview;
      }
    },
    findById: async (id) => {
      if (!isMock) {
        return await InterviewModel.findById(id);
      } else {
        const interview = memoryDb.interviews.find(i => i._id === id);
        return interview || null;
      }
    },
    findByUser: async (userId) => {
      if (!isMock) {
        return await InterviewModel.find({ userId }).sort({ createdAt: -1 });
      } else {
        return memoryDb.interviews
          .filter(i => i.userId === userId)
          .sort((a, b) => b.createdAt - a.createdAt);
      }
    },
    update: async (id, updateData) => {
      if (!isMock) {
        return await InterviewModel.findByIdAndUpdate(id, updateData, { new: true });
      } else {
        const index = memoryDb.interviews.findIndex(i => i._id === id);
        if (index === -1) throw new Error('Interview not found');
        memoryDb.interviews[index] = {
          ...memoryDb.interviews[index],
          ...updateData
        };
        return memoryDb.interviews[index];
      }
    }
  }
};

module.exports = {
  connectDB,
  db
};
