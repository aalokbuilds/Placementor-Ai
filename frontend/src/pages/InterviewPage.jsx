import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, Send, RefreshCw, Star } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getInterviewQuestion, evaluateAnswer } from "../utils/api";
import toast from "react-hot-toast";
import LoadingSkeleton from "../components/LoadingSkeleton";

const QUESTION_TYPES = ["technical", "hr", "behavioral"];

export default function InterviewPage() {
  const { resumeId, targetRole } = useApp();
  const navigate = useNavigate();

  const [qType, setQType] = useState("technical");
  const [question, setQuestion] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [loadingF, setLoadingF] = useState(false);

  const fetchQuestion = async () => {
    if (!resumeId) return;
    setLoadingQ(true);
    setQuestion(null);
    setFeedback(null);
    setAnswer("");
    try {
      const { data } = await getInterviewQuestion(resumeId, targetRole || "Software Engineer", qType);
      setQuestion(data);
      setSessionId(data.session_id);
    } catch {
      toast.error("Could not fetch question.");
    } finally {
      setLoadingQ(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setLoadingF(true);
    try {
      const { data } = await evaluateAnswer(sessionId, answer, targetRole || "Software Engineer");
      setFeedback(data);
    } catch {
      toast.error("Could not evaluate answer.");
    } finally {
      setLoadingF(false);
    }
  };

  if (!resumeId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-lg mb-4" style={{ color: "var(--text-secondary)" }}>Upload a resume first.</p>
        <button className="btn-primary" onClick={() => navigate("/resume")}>Upload Resume</button>
      </div>
    );
  }

  const scoreColor = feedback?.score >= 70 ? "#22c55e" : feedback?.score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-5 fade-in">
      <div className="flex items-center gap-2">
        <Mic size={22} style={{ color: "var(--brand)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Mock Interview</h1>
      </div>

      {/* Controls */}
      <div className="card p-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {QUESTION_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setQType(t)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors"
              style={{
                background: qType === t ? "var(--brand)" : "var(--bg-tertiary)",
                color: qType === t ? "white" : "var(--text-secondary)",
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <button className="btn-primary flex items-center gap-2 ml-auto" onClick={fetchQuestion}>
          <RefreshCw size={14} />
          {question ? "New Question" : "Get Question"}
        </button>
      </div>

      {loadingQ && (
        <div className="card p-6">
          <LoadingSkeleton rows={3} />
        </div>
      )}

      {question && !loadingQ && (
        <div className="card p-5 space-y-4 fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex gap-2 mb-3">
                <span className="tag tag-blue capitalize">{question.type}</span>
                <span className={`tag ${question.difficulty === "hard" ? "tag-red" : question.difficulty === "medium" ? "tag-amber" : "tag-green"}`}>
                  {question.difficulty}
                </span>
                <span className="tag tag-purple">{question.topic}</span>
              </div>
              <p className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>{question.question}</p>
            </div>
          </div>

          {question.tips && (
            <p className="text-sm p-3 rounded-lg" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
              💡 {question.tips}
            </p>
          )}

          {!feedback && (
            <div className="space-y-3">
              <textarea
                rows={5}
                placeholder="Type your answer here…"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button
                className="btn-primary flex items-center gap-2"
                onClick={submitAnswer}
                disabled={!answer.trim() || loadingF}
              >
                {loadingF ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {loadingF ? "Evaluating…" : "Submit Answer"}
              </button>
            </div>
          )}
        </div>
      )}

      {loadingF && (
        <div className="card p-6">
          <p className="label mb-3">Evaluating your answer…</p>
          <LoadingSkeleton rows={5} />
        </div>
      )}

      {feedback && !loadingF && (
        <div className="card p-5 space-y-5 fade-in">
          <div className="flex items-center gap-3">
            <Star size={20} style={{ color: "#f59e0b" }} fill="#f59e0b" />
            <p className="section-title">Interview Feedback</p>
            <span className="ml-auto text-2xl font-bold" style={{ color: scoreColor }}>
              {feedback.score}<span className="text-sm font-normal" style={{ color: "var(--text-muted)" }}>/100</span>
            </span>
          </div>

          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feedback.overall_feedback}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="label mb-2">Strengths</p>
              <ul className="space-y-1">
                {feedback.strengths?.map((s, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "#22c55e" }}>✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="label mb-2">Weaknesses</p>
              <ul className="space-y-1">
                {feedback.weaknesses?.map((w, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "#ef4444" }}>✗</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <p className="label mb-2">Model Answer</p>
            <p className="text-sm p-3 rounded-lg leading-relaxed" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
              {feedback.improved_answer}
            </p>
          </div>

          <div>
            <p className="label mb-2">Suggestions</p>
            <ol className="space-y-1">
              {feedback.suggestions?.map((s, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--brand)" }} className="font-bold">{i + 1}.</span>{s}
                </li>
              ))}
            </ol>
          </div>

          <button className="btn-secondary" onClick={fetchQuestion}>Try another question</button>
        </div>
      )}
    </div>
  );
}
