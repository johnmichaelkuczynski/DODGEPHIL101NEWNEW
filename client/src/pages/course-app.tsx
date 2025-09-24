import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LivingBook from "./living-book";
import Syllabus from "./course/syllabus";
import Modules from "./course/modules";
import Analytics from "./course/practice-center";
import MyGrades from "./course/my-grades";
import { TutorMe } from "./course/tutor-me";
import { Diagnostics } from "./course/diagnostics";


interface CourseAppProps {
  defaultTab?: string;
}

export default function CourseApp({ defaultTab = "living-book" }: CourseAppProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [openLivingBookSection, setOpenLivingBookSection] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [selectedAIModel, setSelectedAIModel] = useState("deepseek");
  const [selectedAssignmentTab, setSelectedAssignmentTab] = useState<string | null>(null);

  // Handle navigation to Living Book from other tabs
  const handleNavigateToLivingBook = (sectionId?: string) => {
    setActiveTab("living-book");
    if (sectionId) {
      setOpenLivingBookSection(sectionId);
      // Clear the section after a delay to avoid repeated navigation
      setTimeout(() => {
        setOpenLivingBookSection(null);
      }, 2000);
    }
  };

  // Handle navigation to homework/assignments
  const handleNavigateToHomework = (weekNumber: number, assignmentType: string) => {
    console.log('Navigation called:', { weekNumber, assignmentType });
    
    setActiveTab("modules");
    
    // If it's midterm or final, navigate to correct week and tab
    if (assignmentType === "midterm") {
      console.log('Navigating to midterm - setting week 4 and practice-quiz tab');
      setSelectedWeek(4); // Midterm is in Week 4
      setSelectedAssignmentTab("practice-quiz"); // Open practice quiz tab for midterm
    } else if (assignmentType === "final") {
      console.log('Navigating to final - setting week 6 and practice-quiz tab');
      setSelectedWeek(6); // Final is in Week 6
      setSelectedAssignmentTab("practice-quiz"); // Open practice quiz tab for final
    } else {
      console.log('Regular assignment navigation:', assignmentType);
      setSelectedWeek(weekNumber); // Navigate to specific week module
      // Set the specific assignment tab to open
      if (assignmentType === "discussion") {
        setSelectedAssignmentTab("discussion");
      } else if (assignmentType === "essay") {
        setSelectedAssignmentTab("essay");
      } else if (assignmentType === "practice-homework") {
        setSelectedAssignmentTab("practice-homework");
      } else if (assignmentType === "homework") {
        setSelectedAssignmentTab("homework");
      } else if (assignmentType === "practice-quiz") {
        setSelectedAssignmentTab("practice-quiz");
      } else if (assignmentType === "quiz") {
        setSelectedAssignmentTab("quiz");
      } else {
        setSelectedAssignmentTab(null);
      }
      // Clear the assignment tab after navigation for regular assignments only
      setTimeout(() => {
        setSelectedAssignmentTab(null);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-background p-0 h-12">
          <TabsTrigger 
            value="living-book" 
            className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Living Book
          </TabsTrigger>
          <TabsTrigger 
            value="syllabus"
            className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Syllabus
          </TabsTrigger>
          <TabsTrigger 
            value="modules"
            className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Modules
          </TabsTrigger>
          <TabsTrigger 
            value="practice"
            className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="tutor"
            className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Tutor Me
          </TabsTrigger>
          <TabsTrigger 
            value="diagnostics"
            className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Diagnostics
          </TabsTrigger>
          <TabsTrigger 
            value="grades"
            className="px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            My Grades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="living-book" className="h-full m-0 p-0">
          <LivingBook openSection={openLivingBookSection} />
        </TabsContent>

        <TabsContent value="syllabus" className="h-full m-0 p-0">
          <Syllabus 
            onNavigateToLivingBook={handleNavigateToLivingBook} 
            onNavigateToHomework={handleNavigateToHomework}
          />
        </TabsContent>

        <TabsContent value="modules" className="h-full m-0 p-0">
          <Modules 
            onNavigateToLivingBook={handleNavigateToLivingBook}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            selectedAssignmentTab={selectedAssignmentTab}
          />
        </TabsContent>

        <TabsContent value="practice" className="h-full m-0 p-0">
          <Analytics />
        </TabsContent>

        <TabsContent value="tutor" className="h-full m-0 p-0">
          <TutorMe selectedAIModel={selectedAIModel} />
        </TabsContent>

        <TabsContent value="diagnostics" className="h-full m-0 p-0">
          <Diagnostics selectedAIModel={selectedAIModel} />
        </TabsContent>

        <TabsContent value="grades" className="h-full m-0 p-0">
          <MyGrades />
        </TabsContent>
      </Tabs>
    </div>
  );
}