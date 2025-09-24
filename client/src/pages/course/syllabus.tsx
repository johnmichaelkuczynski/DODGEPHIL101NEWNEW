import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface SyllabusProps {
  onNavigateToLivingBook: (sectionId?: string) => void;
  onNavigateToHomework?: (weekNumber: number, assignmentType: string) => void;
}

interface WeeklyTopic {
  week: number;
  title: string;
  livingBookSection: string;
  assignments: Assignment[];
}

interface Assignment {
  type: "homework" | "quiz" | "midterm" | "final";
  title: string;
  dueDate: Date;
  points: number;
  status: "completed" | "overdue" | "not-due";
}

export default function Syllabus({ onNavigateToLivingBook, onNavigateToHomework }: SyllabusProps) {
  const { user } = useAuth();
  const [weeklyTopics, setWeeklyTopics] = useState<WeeklyTopic[]>([]);

  useEffect(() => {
    // Generate syllabus based on the 6-week course structure
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDate.getDay()); // Start of current week

    const topics: WeeklyTopic[] = [
      {
        week: 1,
        title: "Introduction to Philosophy and Epistemology",
        livingBookSection: "section-1",
        assignments: [
          {
            type: "homework",
            title: "Discussion 1: Branches of Philosophy",
            dueDate: new Date(startDate.getTime() + 4 * 24 * 60 * 60 * 1000), // Thursday of week 1
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Essay 1: The Allegory of the Cave",
            dueDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000), // End of week 1
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Practice Homework 1",
            dueDate: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000), // Friday of week 1
            points: 25,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Homework 1",
            dueDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000), // End of week 1
            points: 50,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Practice Quiz 1",
            dueDate: new Date(startDate.getTime() + 5 * 24 * 60 * 60 * 1000), // Friday of week 1
            points: 25,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Quiz 1",
            dueDate: new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000), // End of week 1
            points: 50,
            status: "not-due"
          }
        ]
      },
      {
        week: 2,
        title: "Truth, Lying, and Skepticism",
        livingBookSection: "section-2",
        assignments: [
          {
            type: "homework",
            title: "Discussion 2: Truth-telling, Lying, Bullshit",
            dueDate: new Date(startDate.getTime() + 11 * 24 * 60 * 60 * 1000), // Thursday of week 2
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Essay 2: Skepticism",
            dueDate: new Date(startDate.getTime() + 13 * 24 * 60 * 60 * 1000), // End of week 2
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Practice Homework 2",
            dueDate: new Date(startDate.getTime() + 12 * 24 * 60 * 60 * 1000), // Friday of week 2
            points: 25,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Homework 2",
            dueDate: new Date(startDate.getTime() + 13 * 24 * 60 * 60 * 1000), // End of week 2
            points: 50,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Practice Quiz 2",
            dueDate: new Date(startDate.getTime() + 12 * 24 * 60 * 60 * 1000), // Friday of week 2
            points: 25,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Quiz 2",
            dueDate: new Date(startDate.getTime() + 13 * 24 * 60 * 60 * 1000), // End of week 2
            points: 50,
            status: "not-due"
          }
        ]
      },
      {
        week: 3,
        title: "Knowledge and Gettier Problems",
        livingBookSection: "section-3",
        assignments: [
          {
            type: "homework",
            title: "Discussion 3: Gettier Cases",
            dueDate: new Date(startDate.getTime() + 18 * 24 * 60 * 60 * 1000), // Thursday of week 3
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Essay 3: Gettier Problems",
            dueDate: new Date(startDate.getTime() + 20 * 24 * 60 * 60 * 1000), // End of week 3
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Practice Homework 3",
            dueDate: new Date(startDate.getTime() + 19 * 24 * 60 * 60 * 1000), // Friday of week 3
            points: 25,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Homework 3",
            dueDate: new Date(startDate.getTime() + 20 * 24 * 60 * 60 * 1000), // End of week 3
            points: 50,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Practice Quiz 3",
            dueDate: new Date(startDate.getTime() + 19 * 24 * 60 * 60 * 1000), // Friday of week 3
            points: 25,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Quiz 3",
            dueDate: new Date(startDate.getTime() + 20 * 24 * 60 * 60 * 1000), // End of week 3
            points: 50,
            status: "not-due"
          }
        ]
      },
      {
        week: 4,
        title: "Mind-Body Dualism and Divine Command Theory",
        livingBookSection: "section-4",
        assignments: [
          {
            type: "homework",
            title: "Discussion 4: Mind/Body Dualism",
            dueDate: new Date(startDate.getTime() + 25 * 24 * 60 * 60 * 1000), // Thursday of week 4
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Essay 4: The Euthyphro Dilemma",
            dueDate: new Date(startDate.getTime() + 27 * 24 * 60 * 60 * 1000), // End of week 4
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Practice Homework 4",
            dueDate: new Date(startDate.getTime() + 26 * 24 * 60 * 60 * 1000), // Friday of week 4
            points: 25,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Homework 4",
            dueDate: new Date(startDate.getTime() + 27 * 24 * 60 * 60 * 1000), // End of week 4
            points: 50,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Practice Quiz 4",
            dueDate: new Date(startDate.getTime() + 26 * 24 * 60 * 60 * 1000), // Friday of week 4
            points: 25,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Quiz 4",
            dueDate: new Date(startDate.getTime() + 27 * 24 * 60 * 60 * 1000), // End of week 4
            points: 50,
            status: "not-due"
          },
          {
            type: "midterm",
            title: "Practice Midterm",
            dueDate: new Date(startDate.getTime() + 27.5 * 24 * 60 * 60 * 1000), // Saturday of week 4
            points: 75,
            status: "not-due"
          },
          {
            type: "midterm",
            title: "Midterm Exam",
            dueDate: new Date(startDate.getTime() + 28 * 24 * 60 * 60 * 1000), // Monday of week 5
            points: 100,
            status: "not-due"
          }
        ]
      },
      {
        week: 5,
        title: "Ethics and Moral Philosophy",
        livingBookSection: "section-5",
        assignments: [
          {
            type: "homework",
            title: "Discussion 5: The Problem of Evil",
            dueDate: new Date(startDate.getTime() + 32 * 24 * 60 * 60 * 1000), // Thursday of week 5
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Term Paper Outline Assignment",
            dueDate: new Date(startDate.getTime() + 34 * 24 * 60 * 60 * 1000), // End of week 5
            points: 100,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Practice Homework 5",
            dueDate: new Date(startDate.getTime() + 33 * 24 * 60 * 60 * 1000), // Friday of week 5
            points: 25,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Homework 5",
            dueDate: new Date(startDate.getTime() + 34 * 24 * 60 * 60 * 1000), // End of week 5
            points: 50,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Practice Quiz 5",
            dueDate: new Date(startDate.getTime() + 33 * 24 * 60 * 60 * 1000), // Friday of week 5
            points: 25,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Quiz 5",
            dueDate: new Date(startDate.getTime() + 34 * 24 * 60 * 60 * 1000), // End of week 5
            points: 50,
            status: "not-due"
          }
        ]
      },
      {
        week: 6,
        title: "Final Projects and Moral Responsibility",
        livingBookSection: "section-6",
        assignments: [
          {
            type: "homework",
            title: "Discussion 6: Moral Responsibility",
            dueDate: new Date(startDate.getTime() + 39 * 24 * 60 * 60 * 1000), // Thursday of week 6
            points: 50,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Term Paper Assignment",
            dueDate: new Date(startDate.getTime() + 41 * 24 * 60 * 60 * 1000), // End of week 6
            points: 100,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Practice Homework 6",
            dueDate: new Date(startDate.getTime() + 40 * 24 * 60 * 60 * 1000), // Friday of week 6
            points: 25,
            status: "not-due"
          },
          {
            type: "homework",
            title: "Homework 6",
            dueDate: new Date(startDate.getTime() + 41 * 24 * 60 * 60 * 1000), // End of week 6
            points: 50,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Practice Quiz 6",
            dueDate: new Date(startDate.getTime() + 40 * 24 * 60 * 60 * 1000), // Friday of week 6
            points: 25,
            status: "not-due"
          },
          {
            type: "quiz",
            title: "Quiz 6",
            dueDate: new Date(startDate.getTime() + 41 * 24 * 60 * 60 * 1000), // End of week 6
            points: 50,
            status: "not-due"
          },
          {
            type: "final",
            title: "Final Exam",
            dueDate: new Date(startDate.getTime() + 43 * 24 * 60 * 60 * 1000), // Wednesday of week 7
            points: 150,
            status: "not-due"
          }
        ]
      }
    ];

    // Update assignment status based on current date
    topics.forEach(topic => {
      topic.assignments.forEach(assignment => {
        if (assignment.dueDate < currentDate) {
          assignment.status = "overdue";
        } else {
          assignment.status = "not-due";
        }
      });
    });

    setWeeklyTopics(topics);
  }, []);

  const getStatusBadge = (status: Assignment["status"], assignmentTitle?: string) => {
    // Suppress overdue status for practice assignments
    const isPractice = assignmentTitle?.toLowerCase().includes('practice');
    
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-100 text-green-800">✅ Completed</Badge>;
      case "overdue":
        // Don't show overdue for practice assignments
        if (isPractice) {
          return <Badge variant="outline" className="text-orange-600 border-orange-300">📝 Practice</Badge>;
        }
        return <Badge variant="destructive">❗ Overdue</Badge>;
      case "not-due":
        if (isPractice) {
          return <Badge variant="outline" className="text-orange-600 border-orange-300">📝 Practice</Badge>;
        }
        return <Badge variant="secondary">⏳ Not Yet Due</Badge>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Course Syllabus</h1>
        <p className="text-lg text-muted-foreground">
          Introduction to Philosophy - 6 Week Course
        </p>
      </div>

      <div className="grid gap-6">
        {weeklyTopics.map((topic) => (
          <Card key={topic.week} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Week {topic.week}: {topic.title}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateToLivingBook(topic.livingBookSection)}
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>View in Living Book</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-muted-foreground">ASSIGNMENTS DUE THIS WEEK:</h4>
                {topic.assignments.map((assignment, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (assignment.type === "homework" && onNavigateToHomework) {
                        // Determine specific assignment type based on title
                        if (assignment.title.toLowerCase().includes('discussion')) {
                          onNavigateToHomework(topic.week, "discussion");
                        } else if (assignment.title.toLowerCase().includes('essay') || assignment.title.toLowerCase().includes('paper')) {
                          onNavigateToHomework(topic.week, "essay");
                        } else if (assignment.title.toLowerCase().includes('practice homework')) {
                          onNavigateToHomework(topic.week, "practice-homework");
                        } else if (assignment.title.toLowerCase().includes('homework')) {
                          onNavigateToHomework(topic.week, "homework");
                        } else {
                          onNavigateToHomework(topic.week, assignment.type);
                        }
                      } else if (assignment.type === "quiz" && onNavigateToHomework) {
                        // Determine if this is Practice Quiz or Quiz based on title
                        if (assignment.title.toLowerCase().includes('practice quiz')) {
                          onNavigateToHomework(topic.week, "practice-quiz");
                        } else {
                          onNavigateToHomework(topic.week, "quiz");
                        }
                      } else if (assignment.type === "midterm" && onNavigateToHomework) {
                        console.log('Syllabus: Clicking midterm, calling navigation with:', topic.week, "midterm");
                        onNavigateToHomework(topic.week, "midterm");
                      } else if (assignment.type === "final" && onNavigateToHomework) {
                        console.log('Syllabus: Clicking final, calling navigation with:', topic.week, "final");
                        onNavigateToHomework(topic.week, "final");
                      }
                    }}
                  >
                    <div className="flex-1">
                      <h5 className="font-medium text-blue-600 hover:text-blue-800">{assignment.title}</h5>
                      <p className="text-sm text-muted-foreground">
                        Due: {assignment.dueDate.toLocaleDateString()} at 11:59 PM
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium">{assignment.points} pts</span>
                      {getStatusBadge(assignment.status, assignment.title)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Grading Scale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">Discussions</h4>
              <p className="text-xl font-bold text-blue-600">19%</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">Essays</h4>
              <p className="text-xl font-bold text-green-600">13%</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">Homeworks</h4>
              <p className="text-xl font-bold text-purple-600">19%</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">Quizzes</h4>
              <p className="text-xl font-bold text-cyan-600">19%</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">Midterm</h4>
              <p className="text-xl font-bold text-orange-600">6%</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">Term Papers</h4>
              <p className="text-xl font-bold text-indigo-600">13%</p>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <h4 className="font-semibold text-sm">Final Exam</h4>
              <p className="text-xl font-bold text-red-600">10%</p>
            </div>
            <div className="text-center p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-semibold text-sm">Total</h4>
              <p className="text-xl font-bold text-gray-600">99%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}