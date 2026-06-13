import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { useApp } from "../context/AppContext";
import { getSkillGap } from "../utils/api";
import ScoreCard from "../components/ScoreCard";
import SkillTag from "../components/SkillTag";
import LoadingSkeleton from "../components/LoadingSkeleton";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const {
    resumeId,
    resumeData,
    targetRole,
    skillGap,
    setSkillGap,
    readiness,
    setReadiness,
  } = useApp();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resumeId || !targetRole || skillGap) return;

    setLoading(true);

    getSkillGap(resumeId, targetRole)
      .then((gapRes) => {
        const gap = gapRes.data;

        setSkillGap(gap);

        // Compute readiness locally
        const resumeScore = resumeData?.resume_score || 0;
        const atsScore = resumeData?.ats_score || 0;
        const skillMatch = gap.skill_match_percentage || 0;

        const score = Math.round(
          resumeScore * 0.35 +
            atsScore * 0.25 +
            skillMatch * 0.4
        );

        let level = "Needs Work";
        let color = "red";

        if (score >= 80) {
          level = "Placement Ready";
          color = "green";
        } else if (score >= 60) {
          level = "Nearly Ready";
          color = "amber";
        }

        setReadiness({
          score,
          level,
          color,
        });
      })
      .catch(() => {
        toast.error("Could not load skill gap data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    resumeId,
    targetRole,
    skillGap,
    resumeData,
    setSkillGap,
    setReadiness,
  ]);

  if (!resumeId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p
          className="text-lg mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          No resume uploaded yet.
        </p>

        <button
          className="btn-primary"
          onClick={() => navigate("/resume")}
        >
          Upload Resume
        </button>
      </div>
    );
  }

  const readinessColor =
    readiness?.color === "green"
      ? "#22c55e"
      : readiness?.color === "amber"
      ? "#f59e0b"
      : "#ef4444";

  const radarData = skillGap
    ? [
        {
          skill: "Resume",
          value: resumeData?.resume_score || 0,
        },
        {
          skill: "ATS",
          value: resumeData?.ats_score || 0,
        },
        {
          skill: "Skills",
          value: skillGap.skill_match_percentage || 0,
        },
        {
          skill: "Projects",
          value: Math.min(
            100,
            (resumeData?.projects?.length || 0) * 20
          ),
        },
        {
          skill: "Certs",
          value: Math.min(
            100,
            (resumeData?.certifications?.length || 0) * 25
          ),
        },
      ]
    : [];

  const barData = skillGap
    ? [
        {
          name: "Have",
          count: skillGap.existing_skills?.length || 0,
          fill: "#22c55e",
        },
        {
          name: "Missing",
          count: skillGap.missing_skills?.length || 0,
          fill: "#ef4444",
        },
        {
          name: "Priority",
          count: skillGap.high_priority?.length || 0,
          fill: "#f59e0b",
        },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Dashboard
          </h1>

          {targetRole && (
            <p
              className="text-sm mt-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              Target: {targetRole}
            </p>
          )}
        </div>

        {!targetRole && (
          <button
            className="btn-primary"
            onClick={() => navigate("/resume")}
          >
            Set Target Role
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreCard
          label="Resume Score"
          score={resumeData?.resume_score || 0}
          color="#6366f1"
        />

        <ScoreCard
          label="ATS Score"
          score={resumeData?.ats_score || 0}
          color="#10b981"
        />

        <ScoreCard
          label="Skill Match"
          score={skillGap?.skill_match_percentage || 0}
          color="#f59e0b"
        />

        <ScoreCard
          label="Placement Readiness"
          score={readiness?.score || 0}
          color={readinessColor}
          sublabel={readiness?.level}
        />
      </div>

      {loading && (
        <div className="card p-6">
          <p className="label mb-4">Analysing skill gaps…</p>
          <LoadingSkeleton rows={5} />
        </div>
      )}

      {skillGap && !loading && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="label mb-4">Skill Radar</p>

              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />

                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{
                      fontSize: 12,
                      fill: "var(--text-secondary)",
                    }}
                  />

                  <Radar
                    dataKey="value"
                    fill="#6366f1"
                    fillOpacity={0.3}
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <p className="label mb-4">Skill Gap Overview</p>

              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                  >
                    {barData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.fill}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="card p-5">
              <p className="label mb-3">Skills You Have</p>

              <div className="flex flex-wrap gap-2">
                {skillGap.existing_skills?.map((skill) => (
                  <SkillTag
                    key={skill}
                    label={skill}
                    variant="existing"
                  />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="label mb-3">Missing Skills</p>

              <div className="flex flex-wrap gap-2">
                {skillGap.missing_skills?.map((skill) => (
                  <SkillTag
                    key={skill}
                    label={skill}
                    variant="missing"
                  />
                ))}
              </div>
            </div>

            <div className="card p-5">
              <p className="label mb-3">High Priority</p>

              <div className="flex flex-wrap gap-2">
                {skillGap.high_priority?.map((skill) => (
                  <SkillTag
                    key={skill}
                    label={skill}
                    variant="priority"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="card p-5">
            <p className="label mb-2">
              Role Fit Assessment
            </p>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {skillGap.role_fit_summary}
            </p>
          </div>
        </>
      )}
    </div>
  );
}