from google import genai
import os
import json
import re
import time
from dotenv import load_dotenv
from fastapi import HTTPException



load_dotenv()



client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)



MODEL = "gemini-2.5-flash"



def generate_with_retry(prompt: str):
    max_retries = 3

    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model=MODEL,
                contents=prompt,
            )
            return response

        except Exception as e:
            print(f"Gemini attempt {attempt + 1} failed: {e}")

            # Last attempt failed
            if attempt == max_retries - 1:
                raise

            # Wait before retrying
            time.sleep(3)



def clean_json(text: str) -> str:
    """Strip markdown fences from Gemini JSON responses."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()



def generate_json(prompt: str) -> dict:
    """Helper function to call Gemini API and parse JSON response."""
    try:
        response = generate_with_retry(prompt)
        return json.loads(clean_json(response.text))
    except json.JSONDecodeError:
        print("Invalid Gemini JSON:")
        print(response.text)
        raise HTTPException(
            status_code=502,
            detail="AI returned malformed JSON."
        )
    except Exception as e:
        print("Gemini API error:", str(e))
        raise HTTPException(
            status_code=500,
            detail=f"Gemini API error: {str(e)}"
        )



def analyze_resume(resume_text: str) -> dict:
    prompt = f"""
You are an expert career coach and ATS specialist. Analyze the following resume and return a JSON object with EXACTLY this structure:



{{
  "resume_score": <integer 0-100>,
  "ats_score": <integer 0-100>,
  "summary": "<2-3 sentence professional summary>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "technical_skills": ["skill1", "skill2", ...],
  "soft_skills": ["skill1", "skill2", ...],
  "projects": ["project1", "project2", ...],
  "education": ["<degree, institution, year>", ...],
  "certifications": ["cert1", "cert2", ...],
  "experience": ["<role at company, duration>", ...]
}}



Resume:
{resume_text}



Return ONLY valid JSON. No markdown, no explanation.
"""
    return generate_json(prompt)



def detect_skill_gap(resume_text: str, target_role: str, current_skills: list) -> dict:
    prompt = f"""
You are a hiring expert for {target_role} positions. Given the candidate's skills and target role, return a JSON object:



{{
  "required_skills": ["skill1", "skill2", ...],
  "existing_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "high_priority": ["skill1", "skill2", ...],
  "skill_match_percentage": <integer 0-100>,
  "role_fit_summary": "<2 sentence assessment>"
}}



Target Role: {target_role}
Candidate's Current Skills: {', '.join(current_skills)}
Resume Excerpt: {resume_text[:2000]}



Return ONLY valid JSON.
"""
    return generate_json(prompt)



def generate_roadmap(resume_text: str, target_role: str, missing_skills: list) -> dict:
    prompt = f"""
Create a personalized career roadmap for someone targeting {target_role} with these missing skills: {', '.join(missing_skills[:10])}.



Return a JSON object:
{{
  "30_day": {{
    "goal": "<main goal>",
    "milestones": ["week 1: ...", "week 2: ...", "week 3: ...", "week 4: ..."],
    "projects": ["project1", "project2"],
    "certifications": ["cert1"]
  }},
  "60_day": {{
    "goal": "<main goal>",
    "milestones": ["week 5-6: ...", "week 7-8: ..."],
    "projects": ["project1"],
    "certifications": ["cert1"]
  }},
  "90_day": {{
    "goal": "<main goal>",
    "milestones": ["week 9-10: ...", "week 11-12: ..."],
    "projects": ["project1"],
    "certifications": ["cert1"]
  }},
  "courses": [
    {{"title": "Course Name", "platform": "Coursera/Udemy/etc", "url": "#", "priority": "high/medium"}},
    ...
  ],
  "internships": [
    {{"title": "Internship Title", "company": "Company Name", "skills": ["skill1"], "url": "#"}},
    ...
  ],
  "linkedin_tips": {{
    "headline": "<suggested headline>",
    "about": "<suggested about section>",
    "skills_to_add": ["skill1", "skill2"]
  }}
}}



Return ONLY valid JSON.
"""
    return generate_json(prompt)



def generate_interview_question(target_role: str, question_type: str, resume_text: str) -> dict:
    prompt = f"""
Generate ONE {question_type} interview question for a {target_role} candidate based on their background.



Resume snippet: {resume_text[:1000]}



Return JSON:
{{
  "question": "<the interview question>",
  "type": "{question_type}",
  "topic": "<topic area>",
  "difficulty": "easy/medium/hard",
  "tips": "<brief tip for answering>"
}}



Return ONLY valid JSON.
"""
    return generate_json(prompt)



def evaluate_interview_answer(question: str, answer: str, target_role: str) -> dict:
    prompt = f"""
Evaluate this interview answer for a {target_role} position.



Question: {question}
Answer: {answer}



Return JSON:
{{
  "score": <integer 0-100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "improved_answer": "<a model answer in 3-4 sentences>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "overall_feedback": "<2 sentence overall feedback>"
}}



Return ONLY valid JSON.
"""
    return generate_json(prompt)



def chat_with_mentor(message: str, context: str = "") -> str:
    prompt = f"""
You are Placementor AI, an expert career mentor and placement coach. You help students and professionals with:
- Resume improvement
- Career path guidance
- Interview preparation
- Skill development
- Job search strategies



{f'Context about the user: {context}' if context else ''}



User message: {message}



Respond in 2-4 sentences. Be specific, actionable, and encouraging. Do not use bullet points in your response.
"""
    response = generate_with_retry(prompt)
    return response.text.strip()



def compute_readiness_score(resume_score: float, ats_score: float, skill_match: float) -> dict:
    weighted = (resume_score * 0.35) + (ats_score * 0.25) + (skill_match * 0.40)
    score = round(weighted)
    if score >= 80:
        level = "Placement Ready"
        color = "green"
    elif score >= 60:
        level = "Nearly Ready"
        color = "amber"
    else:
        level = "Needs Work"
        color = "red"
    return {"score": score, "level": level, "color": color}