import { useState, useEffect } from "react";
import { apiClient } from "@/services/api-client";
import { 
  Plus, 
  Trash2, 
  GraduationCap, 
  Award, 
  ChevronRight, 
  X, 
  Calculator, 
  Sliders, 
  Sparkles,
  Target
} from "lucide-react";

const UG_GRADES = [
  { letter: "O", minPercent: 80, points: 10, label: "O (Outstanding, 80-100%)" },
  { letter: "A+", minPercent: 70, points: 9, label: "A+ (Excellent, 70-79%)" },
  { letter: "A", minPercent: 60, points: 8, label: "A (Very Good, 60-69%)" },
  { letter: "B+", minPercent: 55, points: 7, label: "B+ (Good, 55-59%)" },
  { letter: "B", minPercent: 50, points: 6, label: "B (Above Average, 50-54%)" },
  { letter: "C", minPercent: 45, points: 5, label: "C (Average, 45-49%)" },
  { letter: "P", minPercent: 40, points: 4, label: "P (Pass, 40-44%)" }
];

interface Semester {
  id: string;
  semester_number: number;
  academic_year: string;
  total_credits: number;
  sgpa: number | null;
  cgpa: number | null;
}

interface Subject {
  id: string;
  semester_id: string;
  name: string;
  course_code: string;
  credits: number;
  color: string;
  course_type: "THEORY" | "THEORY_PRACTICAL";
}

interface GradeComponent {
  id: string;
  component_name: string;
  max_marks: number;
  weight_percentage: number;
  obtained_marks: number | null;
}

interface SubjectSummary {
  subject_id: string;
  subject_name: string;
  course_code: string;
  credits: number;
  color: string;
  course_type: "THEORY" | "THEORY_PRACTICAL";
  components: GradeComponent[];
  calculated_percentage: number | null;
  total_weight_submitted: number;
}

interface CgpaGoal {
  id: string;
  current_cgpa: number;
  target_cgpa: number;
}

interface CgpaFeasibility {
  goal: CgpaGoal | null;
  remaining_semesters: number;
  required_average_sgpa: number | null;
  feasibility: "EASY" | "MEDIUM" | "HARD" | "IMPOSSIBLE" | "N/A";
  message: string;
}

export function GradesPage() {
  const [activeTab, setActiveTab] = useState<"history" | "predictor" | "simulator" | "planner">("history");
  
  // Data lists
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [subjectSummary, setSubjectSummary] = useState<SubjectSummary | null>(null);
  
  // CGPA Planner States
  const [goal, setGoal] = useState<CgpaFeasibility | null>(null);
  const [currentCgpaInput, setCurrentCgpaInput] = useState("8.0");
  const [targetCgpaInput, setTargetCgpaInput] = useState("8.5");
  const [remainingSemestersInput, setRemainingSemestersInput] = useState("4");

  // Modals & form states
  const [isAddingSemester, setIsAddingSemester] = useState(false);
  const [semNum, setSemNum] = useState(1);
  const [acadYear, setAcadYear] = useState("2025-2026");

  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [subName, setSubName] = useState("");
  const [subCode, setSubCode] = useState("");
  const [subCredits, setSubCredits] = useState("4");
  const [subColor, setSubColor] = useState("#38bdf8");
  const [subCourseType, setSubCourseType] = useState<"THEORY" | "THEORY_PRACTICAL">("THEORY");

  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [compName, setCompName] = useState("");
  const [compMaxMarks, setCompMaxMarks] = useState("100");
  const [compWeight, setCompWeight] = useState("20");

  const [recordingGradeCompId, setRecordingGradeCompId] = useState<string | null>(null);
  const [obtainedMarksInput, setObtainedMarksInput] = useState("");

  // Grade Predictor Target Grade State
  const [targetGradeGoal, setTargetGradeGoal] = useState<number>(60); // Target percentage (default to A)
  const [targetLetterGrade, setTargetLetterGrade] = useState<string>("A");

  // Simulator what-if grades
  const [simulatedGrades, setSimulatedGrades] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (selectedSemesterId) {
      fetchSubjects(selectedSemesterId);
    } else {
      setSubjects([]);
      setSelectedSubjectId("");
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchSubjectSummary(selectedSubjectId);
    } else {
      setSubjectSummary(null);
    }
  }, [selectedSubjectId]);

  useEffect(() => {
    if (activeTab === "planner") {
      fetchGoal();
    }
  }, [activeTab]);

  async function fetchSemesters() {
    try {
      const response = await apiClient.get<Semester[]>("/semesters");
      setSemesters(response.data);
      if (response.data.length > 0 && !selectedSemesterId) {
        setSelectedSemesterId(response.data[0].id);
      }
    } catch (err) {
      console.error("Error fetching semesters:", err);
    }
  }

  async function fetchSubjects(semId: string) {
    try {
      const response = await apiClient.get<Subject[]>(`/subjects?semester_id=${semId}`);
      setSubjects(response.data);
      if (response.data.length > 0) {
        setSelectedSubjectId(response.data[0].id);
      } else {
        setSelectedSubjectId("");
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  }

  async function fetchSubjectSummary(subId: string) {
    try {
      const response = await apiClient.get<SubjectSummary>(`/grades/subject/${subId}`);
      setSubjectSummary(response.data);
    } catch (err) {
      console.error("Error fetching grades summary:", err);
    }
  }

  async function fetchGoal() {
    try {
      const response = await apiClient.get<CgpaFeasibility>("/cgpa");
      setGoal(response.data);
      if (response.data.goal) {
        setCurrentCgpaInput(String(response.data.goal.current_cgpa));
        setTargetCgpaInput(String(response.data.goal.target_cgpa));
      }
      setRemainingSemestersInput(String(response.data.remaining_semesters));
    } catch (err) {
      console.error("Error fetching CGPA goal:", err);
    }
  }

  // Creations
  async function handleCreateSemester(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        semester_number: Number(semNum),
        academic_year: acadYear
      };
      const response = await apiClient.post<Semester>("/semesters", payload);
      setSemesters([...semesters, response.data]);
      setSelectedSemesterId(response.data.id);
      setIsAddingSemester(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not create semester");
    }
  }

  async function handleDeleteSemester(id: string) {
    if (!confirm("Delete this semester and all related courses/grades?")) return;
    try {
      await apiClient.delete(`/semesters/${id}`);
      setSemesters(semesters.filter(s => s.id !== id));
      if (selectedSemesterId === id) {
        setSelectedSemesterId("");
      }
    } catch (err) {
      console.error("Error deleting semester:", err);
    }
  }

  async function handleCreateSubject(e: React.FormEvent) {
    e.preventDefault();
    if (!subName.trim() || !subCode.trim() || !selectedSemesterId) return;
    try {
      const payload = {
        semester_id: selectedSemesterId,
        name: subName.trim(),
        course_code: subCode.trim(),
        credits: Number(subCredits),
        color: subColor,
        course_type: subCourseType
      };
      const response = await apiClient.post<Subject>("/subjects", payload);
      setSubjects([...subjects, response.data]);
      setSelectedSubjectId(response.data.id);
      setIsAddingSubject(false);
      // Reset
      setSubName("");
      setSubCode("");
      setSubCredits("4");
      setSubCourseType("THEORY");
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not create subject");
    }
  }

  async function handleDeleteSubject(id: string) {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await apiClient.delete(`/subjects/${id}`);
      setSubjects(subjects.filter(s => s.id !== id));
      if (selectedSubjectId === id) {
        setSelectedSubjectId("");
      }
    } catch (err) {
      console.error("Error deleting subject:", err);
    }
  }

  async function handleCreateComponent(e: React.FormEvent) {
    e.preventDefault();
    if (!compName.trim() || !selectedSubjectId) return;
    try {
      const payload = {
        subject_id: selectedSubjectId,
        component_name: compName.trim(),
        max_marks: Number(compMaxMarks),
        weight_percentage: Number(compWeight)
      };
      await apiClient.post("/grades/components", payload);
      fetchSubjectSummary(selectedSubjectId);
      setIsAddingComponent(false);
      setCompName("");
      setCompMaxMarks("100");
      setCompWeight("20");
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not add grade component");
    }
  }

  async function handleDeleteComponent(id: string) {
    if (!confirm("Delete this component and any obtained marks?")) return;
    try {
      await apiClient.delete(`/grades/components/${id}`);
      if (selectedSubjectId) {
        fetchSubjectSummary(selectedSubjectId);
      }
    } catch (err) {
      console.error("Error deleting component:", err);
    }
  }

  async function handleRecordGrade(e: React.FormEvent) {
    e.preventDefault();
    if (!recordingGradeCompId) return;
    try {
      await apiClient.post("/grades/record", {
        component_id: recordingGradeCompId,
        obtained_marks: Number(obtainedMarksInput)
      });
      if (selectedSubjectId) {
        fetchSubjectSummary(selectedSubjectId);
      }
      setRecordingGradeCompId(null);
      setObtainedMarksInput("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not record marks");
    }
  }

  async function handleSetGoal(e: React.FormEvent) {
    e.preventDefault();
    try {
      await apiClient.post("/cgpa", {
        current_cgpa: Number(currentCgpaInput),
        target_cgpa: Number(targetCgpaInput)
      });
      fetchGoal();
    } catch (err: any) {
      alert(err.response?.data?.message || "Could not set CGPA Goal");
    }
  }

  // Helper to map final score to letter grade
  const getLetterGradeFromPercent = (percent: number) => {
    if (percent >= 80) return "O";
    if (percent >= 70) return "A+";
    if (percent >= 60) return "A";
    if (percent >= 55) return "B+";
    if (percent >= 50) return "B";
    if (percent >= 45) return "C";
    if (percent >= 40) return "P";
    return "F";
  };

  // Helper for component passing marks
  const getMinPassing = (name: string) => {
    const nameUpper = name.toUpperCase();
    if (nameUpper.includes("CIE")) return 24;
    if (nameUpper.includes("ESE")) return 16;
    return 0;
  };

  // Helper to check component passing status
  const getComponentPassingInfo = (componentName: string, obtainedMarks: number | null) => {
    if (obtainedMarks === null) return { status: "PENDING", text: "" };
    const nameUpper = componentName.toUpperCase();
    if (nameUpper.includes("CIE")) {
      if (obtainedMarks < 24) return { status: "FAILED", text: "Failed (Min 24/60)" };
    } else if (nameUpper.includes("ESE")) {
      if (obtainedMarks < 16) return { status: "FAILED", text: "Failed (Min 16/40)" };
    }
    return { status: "PASSED", text: "" };
  };

  const getCourseStatus = (summary: SubjectSummary) => {
    let hasFailed = false;
    let hasPending = false;
    for (const c of summary.components) {
      if (c.obtained_marks === null) {
        hasPending = true;
      } else {
        const passing = getMinPassing(c.component_name);
        if (c.obtained_marks < passing) {
          hasFailed = true;
        }
      }
    }
    if (hasFailed) return "FAILED";
    if (!hasPending) return "PASSED";
    return "IN_PROGRESS";
  };

  const getCourseGrade = (summary: SubjectSummary) => {
    if (summary.calculated_percentage === null) return "N/A";
    
    // Check if any completed component has failed
    let hasFailedComponent = false;
    for (const c of summary.components) {
      if (c.obtained_marks !== null) {
        const passing = getMinPassing(c.component_name);
        if (c.obtained_marks < passing) {
          hasFailedComponent = true;
          break;
        }
      }
    }
    
    if (hasFailedComponent) return "F";
    return getLetterGradeFromPercent(summary.calculated_percentage);
  };

  // Predictor Calculation helper
  const getGradePrediction = () => {
    if (!subjectSummary || subjectSummary.components.length === 0) return null;
    
    // Check if the student has already failed any completed components
    let hasFailedComponent = false;
    let failedComponentName = "";
    let failedComponentMarks = 0;
    let failedComponentPassing = 0;

    for (const c of subjectSummary.components) {
      if (c.obtained_marks !== null) {
        const passing = getMinPassing(c.component_name);
        if (c.obtained_marks < passing) {
          hasFailedComponent = true;
          failedComponentName = c.component_name;
          failedComponentMarks = c.obtained_marks;
          failedComponentPassing = passing;
          break;
        }
      }
    }

    if (hasFailedComponent) {
      return {
        completed: true,
        status: "impossible" as const,
        passed: false,
        message: `Course Failed! You scored ${failedComponentMarks} on ${failedComponentName}, which is below the minimum passing marks of ${failedComponentPassing}.`
      };
    }

    // Earned weighted points
    let earned = 0;
    let submittedWeight = 0;
    const remainingComponents: GradeComponent[] = [];

    for (const c of subjectSummary.components) {
      if (c.obtained_marks !== null) {
        submittedWeight += c.weight_percentage;
        earned += (c.obtained_marks / c.max_marks) * c.weight_percentage;
      } else {
        remainingComponents.push(c);
      }
    }

    const remainingWeight = 100 - submittedWeight;

    // If all components are submitted
    if (remainingWeight === 0) {
      const achievedGrade = getLetterGradeFromPercent(earned);
      const targetGradeObj = UG_GRADES.find(g => g.letter === targetLetterGrade);
      const targetPoints = targetGradeObj?.points || 8;
      const achievedPoints = achievedGrade === "F" ? 0 : (UG_GRADES.find(g => g.letter === achievedGrade)?.points || 0);
      const passed = achievedPoints >= targetPoints && achievedGrade !== "F";

      return {
        completed: true,
        passed,
        score: earned,
        message: passed
          ? `Already achieved! You completed the course with ${earned.toFixed(1)}% (Grade ${achievedGrade}), meeting or exceeding your target of ${targetGradeGoal}% (Grade ${targetLetterGrade}).`
          : `Goal missed. You completed the course with ${earned.toFixed(1)}% (Grade ${achievedGrade}). Target was ${targetGradeGoal}% (Grade ${targetLetterGrade}).`
      };
    }

    // Goal calculation:
    // We want earned + Sum_over_remaining( (x_j / max_j) * w_j ) >= targetGradeGoal
    // Subject to x_j >= minPassing_j
    //
    // Let's first calculate the minimum points we will get from remaining components
    // if we just get the passing marks on all of them.
    let minRemainingPoints = 0;
    const remainingWithPassing = remainingComponents.map(c => {
      const minPass = getMinPassing(c.component_name);
      const minPassWeightContribution = (minPass / c.max_marks) * c.weight_percentage;
      minRemainingPoints += minPassWeightContribution;
      return {
        ...c,
        minPass,
        minPassWeightContribution
      };
    });

    const minOverallPercent = earned + minRemainingPoints;
    const minOverallGrade = getLetterGradeFromPercent(minOverallPercent);

    // If targetGradeGoal is below the minimum passing score or grade percentage,
    // the user MUST score the passing marks on remaining components to pass.
    const effectiveTargetPercent = Math.max(targetGradeGoal, minOverallPercent);
    const neededToHitGoal = effectiveTargetPercent - earned;
    const neededPercentage = (neededToHitGoal / remainingWeight) * 100;

    let message = "";
    let status: "achievable" | "impossible" | "achieved" = "achievable";

    if (neededPercentage <= 0) {
      status = "achieved";
      message = `Goal already secured! You have earned enough points (${earned.toFixed(1)}%) that you will hit your target of ${targetGradeGoal}% (Grade ${targetLetterGrade}) even if you get 0 marks on the remaining assignments. Note that you must still pass all remaining components to pass the course.`;
    } else if (neededPercentage > 100) {
      status = "impossible";
      message = `Goal impossible. To hit your target of ${targetGradeGoal}% (Grade ${targetLetterGrade}), you would need to average ${neededPercentage.toFixed(1)}% on remaining components, which exceeds 100%.`;
    } else {
      status = "achievable";
      if (effectiveTargetPercent > targetGradeGoal) {
        message = `To pass the course, you must score at least the minimum passing marks on all remaining components. This will secure a final score of ${minOverallPercent.toFixed(1)}% (Grade ${minOverallGrade}), which exceeds your target of ${targetGradeGoal}% (Grade ${targetLetterGrade}).`;
      } else {
        message = `To achieve your target of ${targetGradeGoal}% (Grade ${targetLetterGrade}), you must average at least ${neededPercentage.toFixed(1)}% on the remaining unsubmitted components (${remainingWeight}% of course weight).`;
      }
    }

    // Map the needed marks for each component
    const adjustedRemainingComponents = remainingWithPassing.map(c => {
      const neededPercentForComp = Math.max(neededPercentage, (c.minPass / c.max_marks) * 100);
      const neededScore = (neededPercentForComp / 100) * c.max_marks;
      return {
        ...c,
        neededScore,
        isPassingConstrained: neededPercentForComp > neededPercentage
      };
    });

    return {
      completed: false,
      status,
      neededPercentage,
      message,
      remainingComponents: adjustedRemainingComponents
    };
  };

  // Simulator helper: Calculate simulated semester GPA
  const getSimulatedGpa = () => {
    if (subjects.length === 0) return 0;
    
    let totalPoints = 0;
    let totalCredits = 0;

    for (const sub of subjects) {
      const gradeVal = simulatedGrades[sub.id] ?? 8; // Default to 8 (A)
      const credits = Number(sub.credits);
      totalPoints += credits * gradeVal;
      totalCredits += credits;
    }

    return totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  };

  const getSimulatedCgpa = (simulatedSgpa: number) => {
    if (semesters.length === 0) return 0;
    let sum = 0;
    let count = 0;

    for (const s of semesters) {
      if (s.id === selectedSemesterId) {
        sum += simulatedSgpa;
      } else if (s.sgpa !== null) {
        sum += Number(s.sgpa);
      } else {
        continue;
      }
      count++;
    }

    return count > 0 ? Number((sum / count).toFixed(2)) : simulatedSgpa;
  };

  const gradePredict = getGradePrediction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Records & GPA</h1>
          <p className="text-sm text-zinc-400 mt-1">Record semesters, grades, predict targets, and simulate GPA scores.</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-px">
        {[
          { id: "history", label: "Academic History", icon: GraduationCap },
          { id: "predictor", label: "Grade Predictor", icon: Calculator },
          { id: "simulator", label: "GPA Simulator", icon: Sliders },
          { id: "planner", label: "CGPA Planner", icon: Target }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition -mb-px ${
                activeTab === t.id
                  ? "border-sky-500 text-sky-400"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: ACADEMIC HISTORY --- */}
      {activeTab === "history" && (
        <div className="grid gap-6 md:grid-cols-4">
          
          {/* Semesters list sidebar */}
          <div className="md:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 space-y-4 backdrop-blur-md">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Semesters</h2>
              <button
                onClick={() => setIsAddingSemester(true)}
                className="text-zinc-400 hover:text-zinc-200"
                title="Add Semester"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-1">
              {semesters.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No semesters recorded.</p>
              ) : (
                semesters.map((s) => (
                  <div
                    key={s.id}
                    className={`flex group items-center justify-between px-3 py-2 text-sm rounded-xl transition ${
                      selectedSemesterId === s.id ? "bg-zinc-800 text-zinc-50" : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200"
                    }`}
                  >
                    <button
                      onClick={() => setSelectedSemesterId(s.id)}
                      className="flex-1 text-left"
                    >
                      Semester {s.semester_number}
                      <span className="text-[10px] text-zinc-500 block">{s.academic_year}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteSemester(s.id)}
                      className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Subjects and Grades main panel */}
          <div className="md:col-span-3 space-y-6">
            {selectedSemesterId ? (
              <>
                {/* Subjects headers row */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-zinc-200">Courses</h2>
                  <button
                    onClick={() => setIsAddingSubject(true)}
                    className="flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3 py-1.5 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:bg-zinc-750 transition"
                  >
                    <Plus size={14} /> Add Course
                  </button>
                </div>

                {/* Subjects tabs */}
                <div className="flex flex-wrap gap-2">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-zinc-500 p-2">No subjects added in this semester yet.</p>
                  ) : (
                    subjects.map((sub) => (
                      <div
                        key={sub.id}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold border transition ${
                          selectedSubjectId === sub.id
                            ? "bg-zinc-800 text-zinc-50 border-zinc-700"
                            : "bg-zinc-900/20 text-zinc-400 border-zinc-800 hover:bg-zinc-850 hover:text-zinc-200"
                        }`}
                      >
                        <button
                          onClick={() => setSelectedSubjectId(sub.id)}
                          className="flex items-center gap-2"
                        >
                          <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: sub.color }} />
                          {sub.name} ({sub.course_code})
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="text-zinc-500 hover:text-rose-400 ml-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Grade Components manager */}
                {selectedSubjectId && subjectSummary && (
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-zinc-100 text-base">{subjectSummary.subject_name} ({subjectSummary.course_code})</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{subjectSummary.credits} Credits</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Aggregate Grade</span>
                        <div className="flex items-center justify-end gap-2 mt-0.5">
                          {getCourseStatus(subjectSummary) === "FAILED" && (
                            <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                              Failed Course
                            </span>
                          )}
                          {getCourseStatus(subjectSummary) === "PASSED" && (
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                              Passed
                            </span>
                          )}
                          {subjectSummary.calculated_percentage !== null && (
                            <span className="text-[10px] bg-sky-500/15 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-full font-bold">
                              Grade: {getCourseGrade(subjectSummary)}
                            </span>
                          )}
                          <span className="text-xl font-black text-sky-400">
                            {subjectSummary.calculated_percentage !== null 
                              ? `${subjectSummary.calculated_percentage}%` 
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Components listing */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-zinc-500 px-1">
                        <span>Component Weight</span>
                        <span>Marks / Actions</span>
                      </div>

                      {subjectSummary.components.length === 0 ? (
                        <p className="text-sm text-zinc-500 text-center py-6">No evaluation components added (e.g. Quizzes, Exams).</p>
                      ) : (
                        subjectSummary.components.map((c) => {
                          const passingInfo = getComponentPassingInfo(c.component_name, c.obtained_marks);
                          const isPredefined = subjectSummary.course_type === "THEORY" || subjectSummary.course_type === "THEORY_PRACTICAL";
                          
                          return (
                            <div
                              key={c.id}
                              className="flex items-center justify-between gap-4 p-3 bg-zinc-950 border border-zinc-850 rounded-xl hover:bg-zinc-900/20 transition"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm text-zinc-100">{c.component_name}</h4>
                                  {passingInfo.status === "FAILED" && (
                                    <span className="text-[10px] bg-rose-500/15 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold animate-pulse">
                                      {passingInfo.text}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-400 mt-0.5">Weight: {c.weight_percentage}% • Max Marks: {c.max_marks}</p>
                              </div>

                              <div className="flex items-center gap-3">
                                {c.obtained_marks !== null ? (
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${passingInfo.status === "FAILED" ? "text-rose-400" : "text-zinc-200"}`}>
                                      {c.obtained_marks} / {c.max_marks}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setRecordingGradeCompId(c.id);
                                        setObtainedMarksInput(String(c.obtained_marks));
                                      }}
                                      className="text-zinc-500 hover:text-sky-400 transition"
                                      title="Edit Marks"
                                    >
                                      <Sliders size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setRecordingGradeCompId(c.id);
                                      setObtainedMarksInput("");
                                    }}
                                    className="rounded bg-sky-500 px-2 py-1 text-xs text-zinc-950 font-bold hover:bg-sky-400 transition"
                                  >
                                    Record Grade
                                  </button>
                                )}
                                
                                {!isPredefined && (
                                  <button
                                    onClick={() => handleDeleteComponent(c.id)}
                                    className="text-zinc-500 hover:text-rose-400 transition"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Add Component Trigger */}
                    {subjectSummary.total_weight_submitted < 100 && subjectSummary.course_type !== "THEORY" && subjectSummary.course_type !== "THEORY_PRACTICAL" && (
                      <button
                        onClick={() => setIsAddingComponent(true)}
                        className="w-full flex items-center justify-center gap-1.5 border border-dashed border-zinc-800 rounded-xl py-2.5 text-xs text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/10 transition"
                      >
                        <Plus size={14} /> Add Evaluation Component
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                <GraduationCap size={32} className="mb-2 text-zinc-600" />
                <p className="text-sm">Create a Semester in the sidebar to start logging grades.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 2: GRADE PREDICTOR --- */}
      {activeTab === "predictor" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-200">
              <Calculator size={18} className="text-sky-400" /> Grade Goal Predictor
            </h2>
            <p className="text-xs text-zinc-400">
              Select a course and enter your desired target percentage. The simulator predicts what you need to average on unsubmitted evaluations to succeed.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Course</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                >
                  <option value="">Choose Course...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.course_code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Letter Grade</label>
                <select
                  value={targetLetterGrade}
                  onChange={(e) => {
                    const letter = e.target.value;
                    setTargetLetterGrade(letter);
                    const mapped = UG_GRADES.find(g => g.letter === letter)?.minPercent || 60;
                    setTargetGradeGoal(mapped);
                  }}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                >
                  {UG_GRADES.map(g => (
                    <option key={g.letter} value={g.letter}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedSubjectId && gradePredict ? (
              <div className="pt-4 border-t border-zinc-800 space-y-4">
                {gradePredict.completed ? (
                  <div className={`p-4 rounded-xl border ${
                    gradePredict.passed 
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    {gradePredict.message}
                  </div>
                ) : (
                  <>
                    <div className={`p-4 rounded-xl border ${
                      gradePredict.status === "achieved"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : gradePredict.status === "impossible"
                        ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                    }`}>
                      {gradePredict.message}
                    </div>

                    {gradePredict.status === "achievable" && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-bold">Required Marks on Remaining Components</h4>
                        <div className="divide-y divide-zinc-800">
                          {gradePredict.remainingComponents.map(comp => (
                            <div key={comp.id} className="flex justify-between items-center py-2 text-xs">
                              <span>{comp.component_name} ({comp.weight_percentage}% weight)</span>
                              <div className="text-right">
                                <span className="font-semibold text-zinc-200 block">
                                  Need: {comp.neededScore.toFixed(1)} / {comp.max_marks} marks
                                </span>
                                {comp.isPassingConstrained && (
                                  <span className="text-[10px] text-amber-500 font-medium block">
                                    (Adjusted for min passing requirement)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-6">Select a course to view predictions.</p>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: GPA SIMULATOR --- */}
      {activeTab === "simulator" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-200">
              <Sliders size={18} className="text-sky-400" /> What-If Semester GPA Simulator
            </h2>
            <p className="text-xs text-zinc-400">
              Select estimated grades for each course in this semester to recalculate and simulate your resulting SGPA and overall CGPA.
            </p>

            {subjects.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">Configure courses first in Academic History.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between gap-4 p-3 bg-zinc-950 border border-zinc-850 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sub.color }} />
                        <span className="font-medium text-sm text-zinc-200">{sub.name} ({sub.credits} Credits)</span>
                      </div>
                      
                      <select
                        value={simulatedGrades[sub.id] ?? "8"}
                        onChange={(e) => setSimulatedGrades({...simulatedGrades, [sub.id]: Number(e.target.value)})}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 outline-none"
                      >
                        <option value="10">O (10.0)</option>
                        <option value="9">A+ (9.0)</option>
                        <option value="8">A (8.0)</option>
                        <option value="7">B+ (7.0)</option>
                        <option value="6">B (6.0)</option>
                        <option value="5">C (5.0)</option>
                        <option value="4">P (4.0)</option>
                        <option value="0">F (0.0)</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800 text-center">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Simulated SGPA</span>
                    <span className="text-2xl font-black text-sky-400">{getSimulatedGpa()}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Simulated CGPA</span>
                    <span className="text-2xl font-black text-emerald-400">{getSimulatedCgpa(getSimulatedGpa())}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: CGPA GOAL PLANNER --- */}
      {activeTab === "planner" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 backdrop-blur-md space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-200">
              <Target size={18} className="text-sky-400" /> CGPA Goal Planner
            </h2>

            <form onSubmit={handleSetGoal} className="grid grid-cols-3 gap-4 items-end bg-zinc-950/60 border border-zinc-850 p-4 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={currentCgpaInput}
                  onChange={(e) => setCurrentCgpaInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={targetCgpaInput}
                  onChange={(e) => setTargetCgpaInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Set CGPA Goal
              </button>
            </form>

            {goal && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Required average SGPA</span>
                    <span className="text-3xl font-black text-sky-400">
                      {goal.required_average_sgpa !== null ? goal.required_average_sgpa : "N/A"}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Feasibility</span>
                    <span className={`text-3xl font-black uppercase ${
                      goal.feasibility === "EASY" 
                        ? "text-emerald-400"
                        : goal.feasibility === "MEDIUM"
                        ? "text-amber-400"
                        : goal.feasibility === "HARD"
                        ? "text-rose-400"
                        : "text-rose-600 font-extrabold"
                    }`}>
                      {goal.feasibility}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 text-sm text-zinc-300">
                  <p>{goal.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD SEMESTER */}
      {isAddingSemester && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">Add Semester</h3>
              <button onClick={() => setIsAddingSemester(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSemester} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Semester Number</label>
                <input
                  type="number"
                  min="1"
                  value={semNum}
                  onChange={(e) => setSemNum(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Academic Year</label>
                <input
                  type="text"
                  placeholder="2025-2026"
                  value={acadYear}
                  onChange={(e) => setAcadYear(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Create Semester
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUBJECT */}
      {isAddingSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">Add Course</h3>
              <button onClick={() => setIsAddingSubject(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Course Name</label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Physics"
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Course Code</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="PHY101"
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Credits</label>
                  <input
                    type="number"
                    min="1"
                    value={subCredits}
                    onChange={(e) => setSubCredits(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Course Type</label>
                <select
                  value={subCourseType}
                  onChange={(e) => setSubCourseType(e.target.value as any)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                >
                  <option value="THEORY">Theory Only (100 Marks)</option>
                  <option value="THEORY_PRACTICAL">Theory + Practical (200 Marks)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Color Tag</label>
                <div className="flex gap-2.5 mt-2">
                  {["#38bdf8", "#a855f7", "#10b981", "#f59e0b", "#f43f5e", "#6366f1"].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSubColor(c)}
                      className={`h-6 w-6 rounded-full border transition ${subColor === c ? "scale-115 border-white" : "border-transparent"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Add Course
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD COMPONENT */}
      {isAddingComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">Add Component</h3>
              <button onClick={() => setIsAddingComponent(false)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateComponent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Component Name</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="Mid Semester Exam"
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    value={compMaxMarks}
                    onChange={(e) => setCompMaxMarks(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Weight (%)</label>
                  <input
                    type="number"
                    min="1"
                    max={100 - (subjectSummary?.total_weight_submitted || 0)}
                    value={compWeight}
                    onChange={(e) => setCompWeight(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Add Component
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD SCORE */}
      {recordingGradeCompId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">Record Score</h3>
              <button onClick={() => setRecordingGradeCompId(null)} className="text-zinc-400 hover:text-zinc-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleRecordGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Obtained Marks</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={subjectSummary?.components.find(c => c.id === recordingGradeCompId)?.max_marks}
                  value={obtainedMarksInput}
                  onChange={(e) => setObtainedMarksInput(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-50 outline-none focus:border-sky-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-sky-500 py-3 font-semibold text-zinc-950 hover:bg-sky-400 transition"
              >
                Submit Grade
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
