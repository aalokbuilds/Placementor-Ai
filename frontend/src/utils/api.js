import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000",
  timeout: 60000,
});

// Resume
export const uploadResume = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/api/resume/upload", form);
};

export const analyzeResume = (resumeId) =>
  api.post(`/api/resume/${resumeId}/analyze`);

export const getResume = (resumeId) =>
  api.get(`/api/resume/${resumeId}`);

// Analysis
export const getSkillGap = (resumeId, targetRole) =>
  api.post("/api/analysis/skill-gap", { resume_id: resumeId, target_role: targetRole });

export const getReadinessScore = (resumeId, targetRole) =>
  api.post("/api/analysis/readiness", { resume_id: resumeId, target_role: targetRole });

// Roadmap
export const generateRoadmap = (resumeId, targetRole, missingSkills) =>
  api.post("/api/roadmap/generate", {
    resume_id: resumeId,
    target_role: targetRole,
    missing_skills: missingSkills,
  });

// Interview
export const getInterviewQuestion = (resumeId, targetRole, questionType) =>
  api.post("/api/interview/question", {
    resume_id: resumeId,
    target_role: targetRole,
    question_type: questionType,
  });

export const evaluateAnswer = (sessionId, answer, targetRole) =>
  api.post("/api/interview/evaluate", {
    session_id: sessionId,
    answer,
    target_role: targetRole,
  });

// Chat
export const sendChatMessage = (message, context = "") =>
  api.post("/api/chat/message", { message, context });
