import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import ResumePage from "./pages/ResumePage";
import DashboardPage from "./pages/DashboardPage";
import RoadmapPage from "./pages/RoadmapPage";
import InterviewPage from "./pages/InterviewPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div style={{ minHeight: "100vh", background: "var(--bg-secondary)" }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/"          element={<LandingPage />} />
              <Route path="/resume"    element={<ResumePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/roadmap"   element={<RoadmapPage />} />
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/chat"      element={<ChatPage />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--bg-primary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              fontSize: "14px",
            },
          }}
        />
      </BrowserRouter>
    </AppProvider>
  );
}
