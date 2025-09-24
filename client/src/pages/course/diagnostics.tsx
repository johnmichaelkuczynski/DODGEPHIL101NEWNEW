import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Brain, TrendingUp, TrendingDown, Target, History, AlertTriangle, Settings, BarChart3, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface DiagnosticQuestion {
  id: string;
  type: 'mcq' | 'short';
  stem: string;
  options?: { key: string; text: string }[];
  answer_key?: string;
  model_answer?: string;
  concept_tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
}

interface SessionStats {
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  averageTime: number;
  performanceTrend: Array<{
    correct: boolean;
    topic: string;
    difficulty: string;
    timeSpent: number;
  }>;
  topicsProgress: Record<string, {
    correct: number;
    attempted: number;
  }>;
}

interface DiagnosticAnswer {
  id: number;
  questionData: {
    stem: string;
    type: 'mcq' | 'short';
    options?: Record<string, string>;
    answer_key?: string;
    model_answer?: string;
    concept_tags?: string[];
    difficulty?: string;
    points?: number;
  };
  studentAnswer: string;
  verdict: string;
  score: number;
  rationale: string;
  isContested: boolean;
  contestReason?: string;
  contestedScore?: number;
  contestedRationale?: string;
  createdAt: string;
}

interface DiagnosticsProps {
  selectedAIModel: string;
}

export function Diagnostics({ selectedAIModel }: DiagnosticsProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState<DiagnosticQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correct: boolean;
    explanation: string;
    score?: number;
    weightedScore?: number;
  } | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalQuestions: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
    averageTime: 0,
    performanceTrend: [],
    topicsProgress: {}
  });

  // User control settings
  const [userDifficulty, setUserDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | 'adaptive'>('adaptive');
  const [userTopic, setUserTopic] = useState<string>('any');
  const [showReport, setShowReport] = useState(false);

  // Review and contestation state
  const [answerHistory, setAnswerHistory] = useState<DiagnosticAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<DiagnosticAnswer | null>(null);
  const [contestReason, setContestReason] = useState('');
  const [isContesting, setIsContesting] = useState(false);
  const [currentTab, setCurrentTab] = useState('practice');

  // Available topics for selection
  const availableTopics = [
    'any', 'Allegory of the Cave', 'Ring of Gyges', 'Problem of Evil', 
    'Frankfurt on Bullshit', 'Euthyphro Dilemma', 'Mind-Body Problem',
    'Free Will vs Determinism', 'Categorical Imperative', 'Virtue Ethics'
  ];

  // Generate first question on component mount and load history
  useEffect(() => {
    // Only start when user is authenticated
    if (isAuthenticated && user) {
      generateNextQuestion();
      loadAnswerHistory();
    }
  }, [isAuthenticated, user]);

  // Load answer history for review
  const loadAnswerHistory = async () => {
    try {
      const response = await fetch('/api/diagnostics/history', {
        credentials: 'include'
      });
      if (response.ok) {
        const history = await response.json();
        console.log('Loaded answer history:', history);
        setAnswerHistory(history);
      } else {
        console.error('Failed to load history, status:', response.status);
      }
    } catch (error) {
      console.error('Failed to load answer history:', error);
    }
  };

  // Reset answer ONLY when new question loads (not during grading)
  useEffect(() => {
    if (currentQuestion && !showResult && !isLoading) {
      setUserAnswer('');
    }
  }, [currentQuestion]);

  const generateNextQuestion = async () => {
    setIsLoading(true);
    setShowResult(false);
    // Don't clear answer here - only clear when new question loads
    setQuestionStartTime(Date.now());

    try {
      // Build session history from our stats for LLM context
      const session_history = sessionStats.performanceTrend.slice(-5).map(item => ({
        stem: `Previous question about ${item.topic}`,
        answer: item.correct ? 'Correct response' : 'Incorrect response', 
        verdict: item.correct ? 'correct' : 'incorrect'
      }));

      // Use user-selected difficulty or adaptive difficulty
      let level = userDifficulty;
      if (userDifficulty === 'adaptive') {
        const accuracy = sessionStats.totalQuestions > 0 ? 
          sessionStats.correctAnswers / sessionStats.totalQuestions : 0;
        
        level = 'beginner';
        if (accuracy > 0.75) level = 'advanced';
        else if (accuracy > 0.5) level = 'intermediate';
      }

      const response = await fetch('/api/diagnostics/new-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          subject: 'Philosophy 101',
          topic: userTopic === 'any' ? null : userTopic,
          level: level,
          session_history: session_history,
          model: selectedAIModel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate question');
      }

      const questionData = await response.json();
      
      // Normalize the LLM response to our UI format
      const normalized: DiagnosticQuestion = {
        id: `q_${Date.now()}`,
        type: questionData.type, // 'mcq' or 'short'
        stem: questionData.stem,
        options: questionData.options ? Object.entries(questionData.options).map(([key, text]) => ({key, text: text as string})) : undefined,
        answer_key: questionData.answer_key,
        model_answer: questionData.model_answer,
        concept_tags: questionData.concept_tags || ['Philosophy'],
        difficulty: questionData.difficulty || 'intermediate',
        points: questionData.points || 5
      };
      
      setCurrentQuestion(normalized);
    } catch (error) {
      console.error('Error generating diagnostic question:', error);
      // NO FALLBACK - Display error if LLM generation fails
      setCurrentQuestion(null);
      setLastResult({
        correct: false,
        explanation: "LLM generation failed—no fallback to static questions. Fresh questions must be generated from course text only.",
        score: 0
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;

    setIsLoading(true);
    const responseTime = Date.now() - questionStartTime;

    try {
      // NEW GRADING API CONTRACT - LLM ONLY
      const requestBody = currentQuestion.type === 'mcq' ? {
        type: 'mcq',
        stem: currentQuestion.stem,
        options: currentQuestion.options ? 
          Object.fromEntries(currentQuestion.options.map(opt => [opt.key, opt.text])) : {},
        answer_key: currentQuestion.answer_key,
        student_answer: userAnswer,
        model: selectedAIModel
      } : {
        type: 'short',
        stem: currentQuestion.stem,
        model_answer: currentQuestion.model_answer,
        student_answer: userAnswer,
        model: selectedAIModel
      };

      const response = await fetch('/api/diagnostics/grade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to grade answer');
      }

      const result = await response.json();
      const isCorrect = result.verdict === 'correct';
      
      // Calculate weighted score based on difficulty
      const difficultyMultiplier = {
        'beginner': 1.0,
        'intermediate': 1.5, 
        'advanced': 2.0
      };
      const baseScore = result.score || (isCorrect ? 1 : 0);
      const weightedScore = baseScore * (difficultyMultiplier[currentQuestion.difficulty] || 1.0);
      
      setLastResult({
        correct: isCorrect,
        explanation: result.rationale,
        score: baseScore,
        weightedScore: weightedScore
      });

      // Update session statistics
      const newPerformanceItem = {
        correct: isCorrect,
        topic: currentQuestion.concept_tags[0] || 'Philosophy',
        difficulty: currentQuestion.difficulty,
        timeSpent: responseTime
      };

      const newStats: SessionStats = {
        totalQuestions: sessionStats.totalQuestions + 1,
        correctAnswers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
        currentStreak: isCorrect ? sessionStats.currentStreak + 1 : 0,
        bestStreak: Math.max(sessionStats.bestStreak, isCorrect ? sessionStats.currentStreak + 1 : sessionStats.currentStreak),
        averageTime: Math.round((sessionStats.averageTime * sessionStats.totalQuestions + responseTime) / (sessionStats.totalQuestions + 1)),
        performanceTrend: [...sessionStats.performanceTrend, newPerformanceItem].slice(-20), // Keep last 20
        topicsProgress: {
          ...sessionStats.topicsProgress,
          [newPerformanceItem.topic]: {
            correct: (sessionStats.topicsProgress[newPerformanceItem.topic]?.correct || 0) + (isCorrect ? 1 : 0),
            attempted: (sessionStats.topicsProgress[newPerformanceItem.topic]?.attempted || 0) + 1
          }
        }
      };

      setSessionStats(newStats);
      setShowResult(true);

      // AUTO-GENERATE NEXT QUESTION after 3 seconds
      setTimeout(() => {
        generateNextQuestion();
      }, 3000);

      // Reload history to include new answer
      loadAnswerHistory();

    } catch (error) {
      console.error('Error submitting answer:', error);
      setLastResult({
        correct: false,
        explanation: 'Error processing your answer. Please try again.'
      });
      setShowResult(true);
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    setSessionStats({
      totalQuestions: 0,
      correctAnswers: 0,
      currentStreak: 0,
      bestStreak: 0,
      averageTime: 0,
      performanceTrend: [],
      topicsProgress: {}
    });
    setLastResult(null);
    setShowResult(false);
    generateNextQuestion();
  };

  // Contest a grade
  const contestGrade = async (answerId: number, reason: string) => {
    setIsContesting(true);
    try {
      const response = await fetch('/api/diagnostics/contest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        body: JSON.stringify({
          answerId,
          contestReason: reason,
          model: selectedAIModel,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update answer history with contestation result
        setAnswerHistory(prev => prev.map(answer => 
          answer.id === answerId 
            ? { 
                ...answer, 
                isContested: true, 
                contestReason: reason,
                contestedScore: result.newScore,
                contestedRationale: result.rationale 
              }
            : answer
        ));

        setSelectedAnswer(null);
        setContestReason('');
        
        alert(`Contestation ${result.verdict === 'contest_accepted' ? 'accepted' : 'denied'}. ${result.rationale}`);
      }
    } catch (error) {
      console.error('Failed to contest grade:', error);
      alert('Failed to submit contestation. Please try again.');
    } finally {
      setIsContesting(false);
    }
  };

  const accuracy = sessionStats.totalQuestions > 0 ? 
    Math.round((sessionStats.correctAnswers / sessionStats.totalQuestions) * 100) : 0;

  // Generate comprehensive performance report
  const generatePerformanceReport = () => {
    const report = {
      overview: {
        totalQuestions: sessionStats.totalQuestions,
        correctAnswers: sessionStats.correctAnswers,
        accuracy: accuracy,
        currentStreak: sessionStats.currentStreak,
        bestStreak: sessionStats.bestStreak,
        averageTime: Math.round(sessionStats.averageTime / 1000)
      },
      difficultyBreakdown: calculateDifficultyBreakdown(),
      topicAnalysis: sessionStats.topicsProgress,
      recentTrend: sessionStats.performanceTrend.slice(-10),
      recommendations: generateRecommendations()
    };
    
    return report;
  };

  const calculateDifficultyBreakdown = () => {
    const breakdown = { beginner: { total: 0, correct: 0 }, intermediate: { total: 0, correct: 0 }, advanced: { total: 0, correct: 0 } };
    sessionStats.performanceTrend.forEach(item => {
      if (breakdown[item.difficulty]) {
        breakdown[item.difficulty].total++;
        if (item.correct) breakdown[item.difficulty].correct++;
      }
    });
    return breakdown;
  };

  const generateRecommendations = () => {
    const recommendations = [];
    if (accuracy < 50) {
      recommendations.push("Focus on fundamental concepts before advancing to harder topics");
    } else if (accuracy > 80) {
      recommendations.push("Ready for advanced-level questions and complex philosophical arguments");
    }
    
    const weakTopics = Object.entries(sessionStats.topicsProgress)
      .filter(([_, progress]) => progress.attempted > 2 && (progress.correct / progress.attempted) < 0.5)
      .map(([topic, _]) => topic);
    
    if (weakTopics.length > 0) {
      recommendations.push(`Consider reviewing: ${weakTopics.join(', ')}`);
    }
    
    return recommendations;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Adaptive Diagnostics</h1>
        </div>
        
        <p className="text-muted-foreground mb-6">
          Personalized philosophy assessment focusing on conceptual understanding, critical thinking, and philosophical reasoning skills.
        </p>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Review Previous Questions</TabsTrigger>
            <TabsTrigger value="practice">Practice New Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="practice">
            {/* User Controls */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Question Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty-select">Difficulty Level</Label>
                    <Select value={userDifficulty} onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'adaptive') => setUserDifficulty(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adaptive">Adaptive (Recommended)</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="topic-select">Topic Focus</Label>
                    <Select value={userTopic} onValueChange={setUserTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTopics.map(topic => (
                          <SelectItem key={topic} value={topic}>
                            {topic === 'any' ? 'Any Topic' : topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      onClick={() => setShowReport(!showReport)} 
                      variant="outline" 
                      className="w-full"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {showReport ? 'Hide Report' : 'Performance Report'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Question Area */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Question {sessionStats.totalQuestions + 1}
                  </CardTitle>
                  {currentQuestion && (
                    <div className="flex gap-2">
                      <Badge variant="outline">{currentQuestion.concept_tags[0]}</Badge>
                      <Badge variant={
                        currentQuestion.difficulty === 'advanced' ? 'destructive' :
                        currentQuestion.difficulty === 'intermediate' ? 'default' : 'secondary'
                      }>
                        {currentQuestion.difficulty}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardDescription>
                  {currentQuestion && `${currentQuestion.points} points • ${currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && !currentQuestion ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading question...</span>
                  </div>
                ) : currentQuestion ? (
                  <div className="space-y-4">
                    <p className="text-lg font-medium leading-relaxed">
                      {currentQuestion.stem}
                    </p>

                    {!showResult && (
                      <div className="space-y-4">
                        {currentQuestion.type === 'mcq' && currentQuestion.options ? (
                          <RadioGroup value={userAnswer} onValueChange={setUserAnswer} disabled={isLoading}>
                            {currentQuestion.options.map((option) => (
                              <div key={option.key} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.key} id={option.key} disabled={isLoading} />
                                <Label htmlFor={option.key} className={`flex-1 ${isLoading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                                  <span className="font-medium">{option.key}.</span> {option.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        ) : (
                          <Textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Provide your philosophical analysis and reasoning here..."
                            className="min-h-[120px]"
                            disabled={isLoading}
                          />
                        )}

                        <Button 
                          onClick={submitAnswer} 
                          disabled={!userAnswer.trim() || isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Grading...
                            </>
                          ) : (
                            'Submit Answer'
                          )}
                        </Button>
                      </div>
                    )}

                    {showResult && lastResult && (
                      <div className="space-y-4 pt-4 border-t">
                        <div className={`p-4 rounded-lg ${lastResult.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            {lastResult.correct ? (
                              <div className="flex items-center text-green-700">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span className="font-semibold">Correct!</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-700">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                <span className="font-semibold">Incorrect</span>
                              </div>
                            )}
                            {lastResult.score !== undefined && (
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  Base Score: {Math.round(lastResult.score * 100)}%
                                </Badge>
                                {lastResult.weightedScore !== undefined && (
                                  <Badge variant="secondary">
                                    Weighted: {lastResult.weightedScore.toFixed(1)} pts
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed">
                            {lastResult.explanation}
                          </p>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading next question...
                            </div>
                          ) : (
                            "Next question loading automatically in 3 seconds..."
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p>No question available. Please try again.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {sessionStats.correctAnswers}
                    </div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                    <div className="text-xs text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {accuracy}%
                    </div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current Streak</span>
                    <span>{sessionStats.currentStreak}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Best Streak</span>
                    <span>{sessionStats.bestStreak}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Time</span>
                    <span>{Math.round(sessionStats.averageTime / 1000)}s</span>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-2">Overall Progress</div>
                  <Progress value={accuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topic Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(sessionStats.topicsProgress).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(sessionStats.topicsProgress).map(([topic, progress]) => (
                      <div key={topic}>
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{topic}</span>
                          <span>{progress.correct}/{progress.attempted}</span>
                        </div>
                        <Progress 
                          value={progress.attempted > 0 ? (progress.correct / progress.attempted) * 100 : 0} 
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No topics attempted yet
                  </p>
                )}
              </CardContent>
            </Card>

            {sessionStats.totalQuestions > 0 && (
              <Button 
                onClick={resetSession} 
                variant="outline" 
                className="w-full"
              >
                Reset Session
              </Button>
            )}
          </div>
        </div>

        {/* Performance Report Modal */}
        {showReport && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comprehensive Performance Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const report = generatePerformanceReport();
                return (
                  <div className="space-y-6">
                    {/* Overview */}
                    <div>
                      <h3 className="font-semibold mb-3">Session Overview</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{report.overview.totalQuestions}</div>
                          <div className="text-sm text-muted-foreground">Questions</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{report.overview.accuracy}%</div>
                          <div className="text-sm text-muted-foreground">Accuracy</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{report.overview.currentStreak}</div>
                          <div className="text-sm text-muted-foreground">Current Streak</div>
                        </div>
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold">{report.overview.averageTime}s</div>
                          <div className="text-sm text-muted-foreground">Avg Time</div>
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Breakdown */}
                    <div>
                      <h3 className="font-semibold mb-3">Performance by Difficulty</h3>
                      <div className="space-y-2">
                        {Object.entries(report.difficultyBreakdown).map(([difficulty, stats]) => (
                          <div key={difficulty} className="flex items-center justify-between p-2 bg-muted rounded">
                            <span className="capitalize font-medium">{difficulty}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">
                                {stats.correct}/{stats.total} correct
                              </span>
                              <div className="w-24 bg-background rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: stats.total > 0 ? `${(stats.correct / stats.total) * 100}%` : '0%' }}
                                />
                              </div>
                              <span className="text-sm font-semibold">
                                {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {report.recommendations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Recommendations</h3>
                        <div className="space-y-2">
                          {report.recommendations.map((rec, index) => (
                            <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <p className="text-sm">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => {
                        const reportData = JSON.stringify(report, null, 2);
                        const blob = new Blob([reportData], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `philosophy-diagnostics-report-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Full Report
                    </Button>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
          </TabsContent>

          <TabsContent value="history">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Answer History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Answer History
                  </CardTitle>
                  <CardDescription>
                    Review your previous diagnostic answers and contest grades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {answerHistory.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {answerHistory.map((answer) => (
                        <div key={answer.id} className="border rounded-lg p-4">
                          <div className="font-medium text-sm mb-2">
                            <strong>Question:</strong> {answer.questionData?.stem || 'Question text not available'}
                          </div>
                          {answer.questionData?.type === 'mcq' && answer.questionData?.options && (
                            <div className="text-xs text-muted-foreground mb-2">
                              <strong>Options:</strong>
                              <ul className="ml-4 mt-1">
                                {Object.entries(answer.questionData.options).map(([key, value]) => (
                                  <li key={key} className={answer.questionData?.answer_key === key ? 'font-semibold text-green-600' : ''}>
                                    {key}: {value as string}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground mb-2">
                            <strong>Your Answer:</strong> {answer.studentAnswer}
                          </div>
                          {answer.questionData?.type === 'mcq' && answer.questionData?.answer_key && (
                            <div className="text-sm text-muted-foreground mb-2">
                              <strong>Correct Answer:</strong> {answer.questionData.answer_key}
                            </div>
                          )}
                          {answer.questionData?.model_answer && (
                            <div className="text-sm text-muted-foreground mb-2">
                              <strong>Model Answer:</strong> {answer.questionData.model_answer}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant={answer.verdict === 'correct' ? 'default' : 'secondary'}>
                                {answer.isContested && answer.contestedScore !== undefined 
                                  ? `${(answer.contestedScore * 100).toFixed(0)}%` 
                                  : `${(answer.score * 100).toFixed(0)}%`}
                              </Badge>
                              {answer.isContested && (
                                <Badge variant="outline">Contested</Badge>
                              )}
                            </div>
                            {!answer.isContested && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedAnswer(answer)}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Contest
                              </Button>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            {answer.isContested && answer.contestedRationale 
                              ? answer.contestedRationale 
                              : answer.rationale}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="mb-4">No diagnostic answers yet.</p>
                      <Button onClick={() => setCurrentTab('practice')} variant="outline">
                        Start Practice Questions
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contestation Form */}
              {selectedAnswer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contest Grade</CardTitle>
                    <CardDescription>
                      Explain why you believe your answer deserves a higher grade
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Question</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedAnswer.questionData.stem}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Your Answer</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedAnswer.studentAnswer}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Current Grade & Feedback</Label>
                        <div className="mt-1">
                          <Badge variant="secondary">
                            {(selectedAnswer.score * 100).toFixed(0)}%
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedAnswer.rationale}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="contest-reason">Why do you think this grade is unfair?</Label>
                        <Textarea
                          id="contest-reason"
                          placeholder="Explain your philosophical reasoning and why you believe your answer demonstrates understanding of the concept..."
                          value={contestReason}
                          onChange={(e) => setContestReason(e.target.value)}
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => contestGrade(selectedAnswer.id, contestReason)}
                          disabled={!contestReason.trim() || isContesting}
                          className="flex-1"
                        >
                          {isContesting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Reviewing...
                            </>
                          ) : (
                            'Submit Contest'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedAnswer(null);
                            setContestReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}