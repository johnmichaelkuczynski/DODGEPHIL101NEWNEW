import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface GradeEntry {
  id: number;
  assignment: string;
  type: "discussion" | "essay" | "homework" | "quiz" | "midterm" | "final" | "practice";
  week?: number;
  points: number;
  maxPoints: number;
  percentage: number;
  submittedAt?: Date;
  dueDate: Date;
  isLate: boolean;
  gptZeroScore?: number;
  status: "graded" | "pending" | "not-submitted";
  isPractice?: boolean;
}

export default function MyGrades() {
  const { user } = useAuth();
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [finalGrade, setFinalGrade] = useState<number>(0);

  // Filter out practice assignments for scoring
  const isGradedAssignment = (assignment: string) => {
    return !assignment.toLowerCase().includes('practice');
  };

  useEffect(() => {
    // Mock grade data based on new 1,550 point system
    const mockGrades: GradeEntry[] = [
      // Discussions (6 × 50 pts = 300 pts)
      {
        id: 1,
        assignment: "Discussion 1: Branches of Philosophy",
        type: "discussion",
        week: 1,
        points: 45,
        maxPoints: 50,
        percentage: 90,
        submittedAt: new Date("2025-01-15T23:30:00"),
        dueDate: new Date("2025-01-15T23:59:00"),
        isLate: false,
        gptZeroScore: 15,
        status: "graded"
      },
      {
        id: 2,
        assignment: "Discussion 2: Truth-telling, Lying, Bullshit",
        type: "discussion",
        week: 2,
        points: 0,
        maxPoints: 50,
        percentage: 0,
        submittedAt: new Date("2025-01-23T08:00:00"),
        dueDate: new Date("2025-01-22T23:59:00"),
        isLate: true,
        gptZeroScore: 85,
        status: "graded"
      },
      // Essays (4 × 50 pts = 200 pts)
      {
        id: 3,
        assignment: "Essay 1: The Allegory of the Cave",
        type: "essay",
        week: 1,
        points: 0,
        maxPoints: 50,
        percentage: 0,
        dueDate: new Date("2025-01-29T23:59:00"),
        isLate: false,
        status: "not-submitted"
      },
      // Homeworks (6 × 50 pts = 300 pts)
      {
        id: 4,
        assignment: "Homework 1",
        type: "homework",
        week: 1,
        points: 48,
        maxPoints: 50,
        percentage: 96,
        submittedAt: new Date("2025-01-20T22:15:00"),
        dueDate: new Date("2025-01-20T23:59:00"),
        isLate: false,
        gptZeroScore: 12,
        status: "graded"
      },
      // Practice assignments (excluded from grading)
      {
        id: 5,
        assignment: "Practice Homework 1",
        type: "practice",
        week: 1,
        points: 25,
        maxPoints: 25,
        percentage: 100,
        isPractice: true,
        submittedAt: new Date("2025-01-19T18:30:00"),
        dueDate: new Date("2025-01-19T23:59:00"),
        isLate: false,
        status: "graded"
      },
      // Quizzes (6 × 50 pts = 300 pts)
      {
        id: 6,
        assignment: "Quiz 1",
        type: "quiz",
        week: 1,
        points: 47,
        maxPoints: 50,
        percentage: 94,
        submittedAt: new Date("2025-01-22T19:45:00"),
        dueDate: new Date("2025-01-22T23:59:00"),
        isLate: false,
        gptZeroScore: 8,
        status: "graded"
      },
      // Practice Quiz (excluded from grading)
      {
        id: 7,
        assignment: "Practice Quiz 1",
        type: "practice",
        week: 1,
        points: 23,
        maxPoints: 25,
        percentage: 92,
        isPractice: true,
        submittedAt: new Date("2025-01-21T20:30:00"),
        dueDate: new Date("2025-01-21T23:59:00"),
        isLate: false,
        status: "graded"
      }
    ];

    setGrades(mockGrades);

    // Filter out practice assignments for grade calculation
    const gradedAssignments = mockGrades.filter(g => 
      !g.assignment.toLowerCase().includes('practice') && 
      !g.isPractice &&
      g.status === "graded"
    );

    // Calculate weighted grade based on categories
    const discussionGrades = gradedAssignments.filter(g => g.type === "discussion");
    const essayGrades = gradedAssignments.filter(g => g.type === "essay");
    const homeworkGrades = gradedAssignments.filter(g => g.type === "homework");
    const quizGrades = gradedAssignments.filter(g => g.type === "quiz");
    const midtermGrade = gradedAssignments.find(g => g.type === "midterm");
    const termPaperOutline = gradedAssignments.find(g => g.assignment.toLowerCase().includes("outline"));
    const termPaperFinal = gradedAssignments.find(g => g.assignment.toLowerCase().includes("term paper") && !g.assignment.toLowerCase().includes("outline"));
    const finalExamGrade = gradedAssignments.find(g => g.type === "final");

    // Calculate averages for each category
    const discussionAvg = discussionGrades.length > 0 ? discussionGrades.reduce((sum, g) => sum + g.percentage, 0) / discussionGrades.length : 0;
    const essayAvg = essayGrades.length > 0 ? essayGrades.reduce((sum, g) => sum + g.percentage, 0) / essayGrades.length : 0;
    const homeworkAvg = homeworkGrades.length > 0 ? homeworkGrades.reduce((sum, g) => sum + g.percentage, 0) / homeworkGrades.length : 0;
    const quizAvg = quizGrades.length > 0 ? quizGrades.reduce((sum, g) => sum + g.percentage, 0) / quizGrades.length : 0;
    
    // Term paper combined average (outline + final)
    const termPaperGrades = [termPaperOutline, termPaperFinal].filter(Boolean);
    const termPaperAvg = termPaperGrades.length > 0 ? termPaperGrades.reduce((sum, g) => sum + g.percentage, 0) / termPaperGrades.length : 0;

    // Apply weighted grading scale
    const calculatedGrade = 
      (discussionAvg * 0.19) +      // Discussions: 19%
      (essayAvg * 0.13) +           // Essays: 13%
      (homeworkAvg * 0.19) +        // Homeworks: 19%
      (quizAvg * 0.19) +            // Quizzes: 19%
      ((midtermGrade?.percentage || 0) * 0.06) +  // Midterm: 6%
      (termPaperAvg * 0.13) +       // Term Papers: 13%
      ((finalExamGrade?.percentage || 0) * 0.10); // Final Exam: 10%
    
    setFinalGrade(calculatedGrade);
  }, []);

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 70) return "text-yellow-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A";
    if (percentage >= 80) return "B";
    if (percentage >= 70) return "C";
    if (percentage >= 60) return "D";
    return "F";
  };

  const getStatusBadge = (grade: GradeEntry) => {
    if (grade.status === "not-submitted") {
      return <Badge variant="destructive">Not Submitted</Badge>;
    }
    if (grade.isLate) {
      return <Badge variant="destructive">Late Submission</Badge>;
    }
    if (grade.gptZeroScore && grade.gptZeroScore > 50) {
      return <Badge variant="destructive">AI Detection</Badge>;
    }
    if (grade.status === "pending") {
      return <Badge variant="secondary">Pending Review</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Graded</Badge>;
  };

  const getWarningIcon = (grade: GradeEntry) => {
    if (grade.status === "not-submitted" || grade.isLate || (grade.gptZeroScore && grade.gptZeroScore > 50)) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
    if (grade.status === "graded") {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Grades</h1>
        <p className="text-lg text-muted-foreground">
          Track your progress throughout the course
        </p>
      </div>

      {/* Current Grade Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getGradeColor(finalGrade)}>
                {finalGrade.toFixed(1)}% ({getGradeLetter(finalGrade)})
              </span>
            </div>
            <Progress value={finalGrade} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter(g => g.type === "discussion" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length > 0
                ? (grades.filter(g => g.type === "discussion" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded")
                    .reduce((sum, g) => sum + g.percentage, 0) / 
                    grades.filter(g => g.type === "discussion" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length).toFixed(1)
                : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weight: 19%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Essays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter(g => g.type === "essay" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length > 0
                ? (grades.filter(g => g.type === "essay" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded")
                    .reduce((sum, g) => sum + g.percentage, 0) / 
                    grades.filter(g => g.type === "essay" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length).toFixed(1)
                : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weight: 13%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Homeworks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter(g => g.type === "homework" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length > 0
                ? (grades.filter(g => g.type === "homework" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded")
                    .reduce((sum, g) => sum + g.percentage, 0) / 
                    grades.filter(g => g.type === "homework" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length).toFixed(1)
                : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weight: 19%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter(g => g.type === "quiz" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length > 0
                ? (grades.filter(g => g.type === "quiz" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded")
                    .reduce((sum, g) => sum + g.percentage, 0) / 
                    grades.filter(g => g.type === "quiz" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded").length).toFixed(1)
                : "0.0"}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weight: 19%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Midterm Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const midterm = grades.find(g => g.type === "midterm" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded");
                return midterm ? midterm.percentage.toFixed(1) : "0.0";
              })()}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weight: 6%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Term Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const outline = grades.find(g => g.assignment.toLowerCase().includes("outline") && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded");
                const final = grades.find(g => g.assignment.toLowerCase().includes("term paper") && !g.assignment.toLowerCase().includes("outline") && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded");
                const termPaperGrades = [outline, final].filter(Boolean);
                return termPaperGrades.length > 0 ? (termPaperGrades.reduce((sum, g) => sum + g.percentage, 0) / termPaperGrades.length).toFixed(1) : "0.0";
              })()}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weight: 13%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Final Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const finalExam = grades.find(g => g.type === "final" && !g.assignment.toLowerCase().includes('practice') && !g.isPractice && g.status === "graded");
                return finalExam ? finalExam.percentage.toFixed(1) : "0.0";
              })()}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weight: 10%</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Grades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Assignment Grades</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grades.map((grade) => {
              const isPractice = grade.assignment.toLowerCase().includes('practice') || grade.isPractice;
              return (
                <div 
                  key={grade.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isPractice ? 'bg-muted/30 border-dashed' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getWarningIcon(grade)}
                    <div>
                      <h4 className={`font-medium ${isPractice ? 'text-muted-foreground' : ''}`}>
                        {grade.assignment}
                        {isPractice && <span className="ml-2 text-xs text-orange-600">(Practice - Not Graded)</span>}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Due: {grade.dueDate.toLocaleDateString()}</span>
                        {grade.submittedAt && (
                          <span>Submitted: {grade.submittedAt.toLocaleDateString()}</span>
                        )}
                        {grade.gptZeroScore !== undefined && !isPractice && (
                          <span className={grade.gptZeroScore > 50 ? "text-red-600" : "text-green-600"}>
                            AI Score: {grade.gptZeroScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`font-medium ${isPractice ? 'text-muted-foreground' : ''}`}>
                        <span className={isPractice ? 'text-muted-foreground' : getGradeColor(grade.percentage)}>
                          {grade.points}/{grade.maxPoints}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isPractice ? 'Practice' : `${grade.percentage.toFixed(1)}%`}
                      </div>
                    </div>
                    {!isPractice && getStatusBadge(grade)}
                    {isPractice && <Badge variant="outline" className="text-orange-600 border-orange-300">Practice</Badge>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Grading Policies */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Grading System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-blue-600">Grade Weight Distribution</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Discussions:</span>
                  <span>19%</span>
                </div>
                <div className="flex justify-between">
                  <span>Essays:</span>
                  <span>13%</span>
                </div>
                <div className="flex justify-between">
                  <span>Homeworks:</span>
                  <span>19%</span>
                </div>
                <div className="flex justify-between">
                  <span>Quizzes:</span>
                  <span>19%</span>
                </div>
                <div className="flex justify-between">
                  <span>Midterm Exam:</span>
                  <span>6%</span>
                </div>
                <div className="flex justify-between">
                  <span>Term Papers:</span>
                  <span>13%</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Exam:</span>
                  <span>10%</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t">
                  <span>Total:</span>
                  <span>99%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-orange-600">Practice Assignments</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Not Counted in Grade:</strong> Practice assignments are for learning only</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>No Overdue Status:</strong> Practice items never show as late</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                  <span><strong>Unlimited Attempts:</strong> Retake as many times as needed</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-red-600">Automatic Zero Policies</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Late Submission:</strong> Graded assignments submitted after due date = 0 points</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>AI Detection:</strong> GPTZero score above 50% = 0 points</span>
                </li>
              </ul>
              
              <h4 className="font-semibold mb-2 mt-4 text-green-600">Grade Scale</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>A:</span>
                  <span>90-100%</span>
                </div>
                <div className="flex justify-between">
                  <span>B:</span>
                  <span>80-89%</span>
                </div>
                <div className="flex justify-between">
                  <span>C:</span>
                  <span>70-79%</span>
                </div>
                <div className="flex justify-between">
                  <span>D:</span>
                  <span>60-69%</span>
                </div>
                <div className="flex justify-between">
                  <span>F:</span>
                  <span>Below 60%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}