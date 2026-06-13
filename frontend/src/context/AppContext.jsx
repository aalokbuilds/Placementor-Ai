import { createContext, useContext, useState, useEffect } from "react";



const AppContext = createContext(null);



export function AppProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });


  const [resumeId, setResumeId] = useState(() => {
    return localStorage.getItem("resumeId")
      ? JSON.parse(localStorage.getItem("resumeId"))
      : null;
  });


  const [resumeData, setResumeData] = useState(() => {
    return localStorage.getItem("resumeData")
      ? JSON.parse(localStorage.getItem("resumeData"))
      : null;
  });


  const [targetRole, setTargetRole] = useState(() => {
    return localStorage.getItem("targetRole") || "";
  });


  const [skillGap, setSkillGap] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [readiness, setReadiness] = useState(null);


  const reset = () => {
    setResumeId(null);
    setResumeData(null);
    setTargetRole("");
    setSkillGap(null);
    setRoadmap(null);
    setReadiness(null);

    localStorage.removeItem("resumeId");
    localStorage.removeItem("resumeData");
    localStorage.removeItem("targetRole");
  };


  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);


  useEffect(() => {
    localStorage.setItem("resumeId", JSON.stringify(resumeId));
  }, [resumeId]);


  useEffect(() => {
    localStorage.setItem("resumeData", JSON.stringify(resumeData));
  }, [resumeData]);


  useEffect(() => {
    localStorage.setItem("targetRole", targetRole);
  }, [targetRole]);


  return (
    <AppContext.Provider
      value={{
        darkMode, setDarkMode,
        resumeId, setResumeId,
        resumeData, setResumeData,
        targetRole, setTargetRole,
        skillGap, setSkillGap,
        roadmap, setRoadmap,
        readiness, setReadiness,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}



export const useApp = () => useContext(AppContext);