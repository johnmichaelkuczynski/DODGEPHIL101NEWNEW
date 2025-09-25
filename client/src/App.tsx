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
      <Route path="/">
        <CourseApp />
      </Route>
      <Route path="/course">
        <CourseApp />
      </Route>
      <Route path="/course/:tab">
        {(params) => <CourseApp defaultTab={params.tab} />}
      </Route>
      <Route path="/diagnostics">
        <CourseApp defaultTab="diagnostics" />
      </Route>
      <Route path="/final-exam">
        <FinalExamPage />
      </Route>
      <Route>
        <NotFound />
      </Route>
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
