import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import CourseApp from "@/pages/course-app";
import FinalExamPage from "@/pages/final-exam";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={CourseApp} />
      <Route path="/course" component={CourseApp} />
      <Route path="/course/:tab" component={CourseApp} />
      <Route path="/diagnostics" component={() => <CourseApp defaultTab="diagnostics" />} />
      <Route path="/final-exam" component={FinalExamPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
