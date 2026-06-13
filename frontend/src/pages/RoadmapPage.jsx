import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Map, BookOpen, Briefcase, Linkedin, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useApp } from "../context/AppContext";
import { generateRoadmap } from "../utils/api";
import LoadingSkeleton from "../components/LoadingSkeleton";
import toast from "react-hot-toast";

function PhaseCard({ phase, data }) {
  const [open, setOpen] = useState(phase === "30");
  const colors = { "30": "#6366f1", "60": "#f59e0b", "90": "#10b981" };
  const color = colors[phase];

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: color }}>
            {phase}
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{phase}-Day Plan</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{data?.goal}</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />}
      </button>

      {open && data && (
        <div className="px-5 pb-5 space-y-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div>
            <p className="label mt-4 mb-2">Weekly Milestones</p>
            <ol className="space-y-2">
              {data.milestones?.map((m, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: color }}>{i + 1}</span>
                  {m}
                </li>
              ))}
            </ol>
          </div>
          {data.projects?.length > 0 && (
            <div>
              <p className="label mb-2">Projects to Build</p>
              <ul className="space-y-1">
                {data.projects.map((p, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color }}>▸</span>{p}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.certifications?.length > 0 && (
            <div>
              <p className="label mb-2">Certifications</p>
              <ul className="space-y-1">
                {data.certifications.map((c, i) => (
                  <li key={i} className="text-sm flex gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span style={{ color }}>🏅</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const { resumeId, targetRole, skillGap, roadmap, setRoadmap } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resumeId || !targetRole || roadmap) return;
    setLoading(true);
    generateRoadmap(resumeId, targetRole, skillGap?.missing_skills || [])
      .then(({ data }) => setRoadmap(data))
      .catch(() => toast.error("Could not generate roadmap."))
      .finally(() => setLoading(false));
  }, [resumeId, targetRole, skillGap, roadmap, setRoadmap]);

  if (!resumeId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-lg mb-4" style={{ color: "var(--text-secondary)" }}>Upload a resume first.</p>
        <button className="btn-primary" onClick={() => navigate("/resume")}>Upload Resume</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 fade-in">
      <div className="flex items-center gap-2">
        <Map size={22} style={{ color: "var(--brand)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Career Roadmap</h1>
        {targetRole && <span className="tag tag-blue ml-auto">{targetRole}</span>}
      </div>

      {loading && (
        <div className="card p-6">
          <p className="label mb-4">Building your personalised roadmap…</p>
          <LoadingSkeleton rows={8} />
        </div>
      )}

      {roadmap && !loading && (
        <>
          {/* Phase cards */}
          <div className="space-y-3">
            {["30", "60", "90"].map((phase) => (
              <PhaseCard key={phase} phase={phase} data={roadmap[`${phase}_day`]} />
            ))}
          </div>

          {/* Courses */}
          {roadmap.courses?.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} style={{ color: "var(--brand)" }} />
                <p className="section-title">Recommended Courses</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmap.courses.map((c, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <p className="font-medium text-sm mb-0.5" style={{ color: "var(--text-primary)" }}>{c.title}</p>
                    <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>{c.platform}</p>
                    <span className={`tag ${c.priority === "high" ? "tag-red" : "tag-amber"}`}>{c.priority} priority</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Internships */}
          {roadmap.internships?.length > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} style={{ color: "var(--brand)" }} />
                <p className="section-title">Internship Opportunities</p>
              </div>
              <div className="space-y-3">
                {roadmap.internships.map((intern, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{intern.title}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{intern.company}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {intern.skills?.map((s) => <span key={s} className="tag tag-blue text-xs">{s}</span>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LinkedIn tips */}
          {roadmap.linkedin_tips && (
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Linkedin size={16} style={{ color: "#0077b5" }} />
                <p className="section-title">LinkedIn Profile Optimisation</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="label mb-1">Headline</p>
                  <p className="text-sm p-2 rounded" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                    {roadmap.linkedin_tips.headline}
                  </p>
                </div>
                <div>
                  <p className="label mb-1">About section</p>
                  <p className="text-sm p-2 rounded leading-relaxed" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                    {roadmap.linkedin_tips.about}
                  </p>
                </div>
                <div>
                  <p className="label mb-2">Skills to add</p>
                  <div className="flex flex-wrap gap-2">
                    {roadmap.linkedin_tips.skills_to_add?.map((s) => (
                      <span key={s} className="tag tag-blue">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
