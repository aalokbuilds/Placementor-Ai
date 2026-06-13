import { useNavigate } from "react-router-dom";
import { Zap, FileText, BarChart2, Map, Mic, MessageCircle, ArrowRight, Star } from "lucide-react";

const features = [
  { icon: FileText,       title: "AI Resume Analysis",      desc: "Get resume score, ATS compatibility, strengths, and actionable improvement suggestions." },
  { icon: BarChart2,      title: "Skill Gap Detection",     desc: "Compare your skills against target roles and see exactly what to learn next." },
  { icon: Map,            title: "Career Roadmap",          desc: "Personalized 30/60/90-day plans with milestones, projects, and certifications." },
  { icon: Mic,            title: "Mock Interview",          desc: "Practice HR and technical questions with AI-powered evaluation and feedback." },
  { icon: MessageCircle,  title: "AI Career Mentor",        desc: "Chat with your personal AI mentor for career advice, anytime." },
  { icon: Star,           title: "Placement Readiness",     desc: "Track your readiness score as you improve and get data-driven recommendations." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center fade-in">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6"
          style={{ background: "var(--bg-tertiary)", color: "var(--brand)" }}
        >
          <Zap size={14} fill="currentColor" />
          AI-Powered Career Coaching
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-5" style={{ color: "var(--text-primary)" }}>
          Land your dream job<br />
          <span style={{ color: "var(--brand)" }}>faster with AI guidance</span>
        </h1>

        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Upload your resume, identify skill gaps, generate a personalized roadmap, and practice interviews — all in one place.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button className="btn-primary flex items-center gap-2 text-base px-6 py-2.5" onClick={() => navigate("/resume")}>
            Get Started — Upload Resume <ArrowRight size={16} />
          </button>
          <button className="btn-secondary text-base px-6 py-2.5" onClick={() => navigate("/dashboard")}>
            View Dashboard
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: "var(--text-primary)" }}>
          Everything you need to get placed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 hover:shadow-md transition-shadow">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: "var(--bg-tertiary)", color: "var(--brand)" }}
              >
                <Icon size={18} />
              </div>
              <h3 className="font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo steps */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--text-primary)" }}>
          How it works
        </h2>
        <ol className="space-y-4">
          {[
            "Upload your resume (PDF).",
            "AI analyses it and gives you a score + ATS compatibility.",
            "Select your target role to detect skill gaps.",
            "Receive a personalized 30/60/90-day career roadmap.",
            "Practice mock interviews and get instant AI feedback.",
            "Chat with your AI mentor whenever you need guidance.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-4">
              <span
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold"
                style={{ background: "var(--brand)", color: "white" }}
              >
                {i + 1}
              </span>
              <p className="pt-0.5" style={{ color: "var(--text-secondary)" }}>{step}</p>
            </li>
          ))}
        </ol>
        <div className="text-center mt-10">
          <button className="btn-primary flex items-center gap-2 text-base px-8 py-3 mx-auto" onClick={() => navigate("/resume")}>
            Start now — it's free <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
