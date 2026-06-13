import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle, ChevronRight, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import { uploadResume, analyzeResume } from "../utils/api";
import ScoreCard from "../components/ScoreCard";
import SkillTag from "../components/SkillTag";
import LoadingSkeleton from "../components/LoadingSkeleton";


const TARGET_ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Data Analyst", "Data Scientist",
  "ML Engineer", "DevOps Engineer", "Product Manager", "UI/UX Designer",
];


export default function ResumePage() {
  const {
    setResumeId,
    setResumeData,
    setTargetRole,
    targetRole,
    reset,
  } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState("upload"); // upload | analyzing | done
  const [localData, setLocalData] = useState(null);


  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setStep("analyzing");
    try {
      const { data: uploaded } = await uploadResume(file);
      toast.loading("Analyzing your resume with AI...", { id: "analyze" });
      const { data: analysis } = await analyzeResume(uploaded.resume_id);
      toast.success("Analysis complete!", { id: "analyze" });
      setResumeId(uploaded.resume_id);
      setResumeData(analysis);
      setLocalData(analysis);
      setStep("done");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Upload failed. Check the API is running.", { id: "analyze" });
      setStep("upload");
    }
  }, [setResumeId, setResumeData]);


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
  });


  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 fade-in">
      <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Resume Analysis</h1>


      {/* Upload zone */}
      {step === "upload" && (
        <div
          {...getRootProps()}
          className="card p-12 text-center cursor-pointer border-dashed transition-colors"
          style={{ borderColor: isDragActive ? "var(--brand)" : "var(--border)", background: isDragActive ? "var(--bg-tertiary)" : "var(--bg-primary)" }}
        >
          <input {...getInputProps()} />
          <Upload size={36} className="mx-auto mb-4" style={{ color: "var(--brand)" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {isDragActive ? "Drop your resume here" : "Drag & drop your resume"}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>PDF format · max 5MB</p>
          <button className="btn-primary mt-5">Browse Files</button>
        </div>
      )}


      {/* Analyzing skeleton */}
      {step === "analyzing" && (
        <div className="card p-8 space-y-6">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="animate-spin" style={{ color: "var(--brand)" }} />
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>Analysing your resume…</p>
          </div>
          <LoadingSkeleton rows={6} />
        </div>
      )}


      {/* Results */}
      {step === "done" && localData && (
        <>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={18} style={{ color: "#22c55e" }} />
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>Analysis complete</span>
            <button
              className="ml-auto btn-secondary text-xs px-3 py-1"
              onClick={() => {
                reset();
                setLocalData(null);
                setStep("upload");
              }}
            >
              Upload new resume
            </button>
          </div>


          {/* Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScoreCard label="Resume Score" score={localData.resume_score} color="#6366f1" sublabel="Overall quality and impact" />
            <ScoreCard label="ATS Compatibility" score={localData.ats_score} color="#10b981" sublabel="Parsed by applicant tracking systems" />
          </div>


          {/* Summary */}
          <div className="card p-5">
            <p className="label mb-2">Summary</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{localData.summary}</p>
          </div>


          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="label mb-3">Strengths</p>
              <ul className="space-y-2">
                {localData.strengths?.map((s, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "#22c55e" }}>✓</span>{s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <p className="label mb-3">Weaknesses</p>
              <ul className="space-y-2">
                {localData.weaknesses?.map((w, i) => (
                  <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color: "#ef4444" }}>✗</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>


          {/* Skills */}
          <div className="card p-5">
            <p className="label mb-3">Extracted Skills</p>
            <div className="mb-3">
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Technical</p>
              <div className="flex flex-wrap gap-2">
                {localData.technical_skills?.map((s) => <SkillTag key={s} label={s} variant="neutral" />)}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {localData.soft_skills?.map((s) => <SkillTag key={s} label={s} variant="soft" />)}
              </div>
            </div>
          </div>


          {/* Suggestions */}
          <div className="card p-5">
            <p className="label mb-3">Improvement Suggestions</p>
            <ol className="space-y-2">
              {localData.suggestions?.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span className="font-bold flex-shrink-0" style={{ color: "var(--brand)" }}>{i + 1}.</span>{s}
                </li>
              ))}
            </ol>
          </div>


          {/* Target role */}
          <div className="card p-5">
            <p className="label mb-3">Select Target Role</p>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="mb-4"
            >
              <option value="">— choose a role —</option>
              {TARGET_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              className="btn-primary flex items-center gap-2"
              disabled={!targetRole}
              onClick={() => navigate("/dashboard")}
            >
              Continue to Dashboard <ChevronRight size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}