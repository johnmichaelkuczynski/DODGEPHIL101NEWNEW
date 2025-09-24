import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BookOpen, FileText, GraduationCap, Trophy, BarChart3, Target, Clock, Brain, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface PracticeAttempt {
  id: number;
  practiceType: string;
  weekNumber?: number;
  score: number;
  completedAt: string;
}

export default function Analytics() {
  const { user } = useAuth();

  // Fetch real practice attempts from database
  const { data: practiceAttempts = [], isLoading } = useQuery<PracticeAttempt[]>({
    queryKey: ['/api/practice-attempts'],
    enabled: !!user,
  });

  // Calculate comprehensive analytics
  const totalSessions = practiceAttempts.length;
  const averageScore = totalSessions > 0 
    ? Math.round(practiceAttempts.reduce((sum: number, attempt: PracticeAttempt) => sum + (attempt.score || 0), 0) / totalSessions)
    : 0;
  
  // Performance by type
  const performanceByType = practiceAttempts.reduce((acc, attempt) => {
    const type = attempt.practiceType;
    if (!acc[type]) {
      acc[type] = { total: 0, count: 0, attempts: [] };
    }
    acc[type].total += attempt.score;
    acc[type].count += 1;
    acc[type].attempts.push(attempt);
    return acc;
  }, {} as Record<string, { total: number; count: number; attempts: PracticeAttempt[] }>);

  // Performance by week
  const performanceByWeek = practiceAttempts.reduce((acc, attempt) => {
    if (attempt.weekNumber) {
      const week = attempt.weekNumber;
      if (!acc[week]) {
        acc[week] = { total: 0, count: 0, attempts: [] };
      }
      acc[week].total += attempt.score;
      acc[week].count += 1;
      acc[week].attempts.push(attempt);
    }
    return acc;
  }, {} as Record<number, { total: number; count: number; attempts: PracticeAttempt[] }>);

  // Recent performance trend (last 5 attempts)
  const recentAttempts = practiceAttempts.slice(-5);
  const trendDirection = recentAttempts.length >= 2 
    ? recentAttempts[recentAttempts.length - 1].score > recentAttempts[0].score 
      ? 'up' : 'down'
    : 'neutral';

  // Identify strengths and weaknesses
  const typeAverages = Object.entries(performanceByType).map(([type, data]) => ({
    type,
    average: Math.round(data.total / data.count),
    count: data.count
  })).sort((a, b) => b.average - a.average);

  const weakAreas = typeAverages.filter(t => t.average < 70);
  const strongAreas = typeAverages.filter(t => t.average >= 80);

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Loading your performance data...
          </p>
        </div>
      </div>
    );
  }

  if (totalSessions === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Learning Analytics</h1>
          <p className="text-lg text-muted-foreground">
            Your comprehensive performance insights and learning progress
          </p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Practice Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete some practice assignments to see your learning analytics and performance insights here.
            </p>
            <p className="text-sm text-muted-foreground">
              Visit the Modules tab to start practicing homework, quizzes, and tests.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Learning Analytics</h1>
        <p className="text-lg text-muted-foreground">
          Your comprehensive performance insights and learning progress
        </p>
      </div>

      <div className="space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-3xl font-bold">{totalSessions}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold">{averageScore}%</p>
                </div>
                <Target className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trend</p>
                  <p className="text-lg font-bold flex items-center">
                    {trendDirection === 'up' ? (
                      <>
                        <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                        Improving
                      </>
                    ) : trendDirection === 'down' ? (
                      <>
                        <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                        Declining
                      </>
                    ) : (
                      <>
                        <BarChart3 className="h-5 w-5 text-gray-500 mr-1" />
                        Stable
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between space-y-0">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Strong Areas</p>
                  <p className="text-3xl font-bold">{strongAreas.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Performance by Practice Type</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(performanceByType).map(([type, data]) => {
                const average = Math.round(data.total / data.count);
                const getColor = (score: number) => {
                  if (score >= 80) return "bg-green-500";
                  if (score >= 60) return "bg-yellow-500";
                  return "bg-red-500";
                };
                
                return (
                  <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {type === 'homework' && <BookOpen className="h-5 w-5 text-blue-500" />}
                      {type === 'quiz' && <FileText className="h-5 w-5 text-purple-500" />}
                      {type === 'test' && <GraduationCap className="h-5 w-5 text-orange-500" />}
                      {(type === 'midterm' || type === 'final') && <Trophy className="h-5 w-5 text-yellow-500" />}
                      <div>
                        <h4 className="font-medium capitalize">{type}</h4>
                        <p className="text-sm text-muted-foreground">{data.count} attempts</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32">
                        <Progress value={average} className="h-2" />
                      </div>
                      <Badge className={`${getColor(average)} text-white`}>
                        {average}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Your Strengths</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {strongAreas.length > 0 ? (
                <div className="space-y-3">
                  {strongAreas.map((area) => (
                    <div key={area.type} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize text-green-800 dark:text-green-200">
                          {area.type}
                        </h4>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {area.count} attempts
                        </p>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        {area.average}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-2" />
                  <p>No strong areas identified yet.</p>
                  <p className="text-sm">Complete more practice to identify your strengths!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Areas for Improvement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weakAreas.length > 0 ? (
                <div className="space-y-3">
                  {weakAreas.map((area) => (
                    <div key={area.type} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize text-yellow-800 dark:text-yellow-200">
                          {area.type}
                        </h4>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {area.count} attempts - Focus here!
                        </p>
                      </div>
                      <Badge className="bg-yellow-500 text-white">
                        {area.average}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Great job! No weak areas identified.</p>
                  <p className="text-sm">You're performing well across all practice types!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        {Object.keys(performanceByWeek).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Weekly Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(performanceByWeek)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([week, data]) => {
                    const average = Math.round(data.total / data.count);
                    const getColor = (score: number) => {
                      if (score >= 80) return "text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
                      if (score >= 60) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
                      return "text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
                    };
                    
                    return (
                      <div key={week} className={`p-4 border rounded-lg ${getColor(average)}`}>
                        <h4 className="font-medium">Week {week}</h4>
                        <p className="text-2xl font-bold">{average}%</p>
                        <p className="text-sm">{data.count} attempts</p>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Practice Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {practiceAttempts.slice().reverse().slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {attempt.practiceType === 'homework' && <BookOpen className="h-5 w-5 text-blue-500" />}
                    {attempt.practiceType === 'quiz' && <FileText className="h-5 w-5 text-purple-500" />}
                    {attempt.practiceType === 'test' && <GraduationCap className="h-5 w-5 text-orange-500" />}
                    <div>
                      <h4 className="font-medium capitalize">
                        {attempt.practiceType}
                        {attempt.weekNumber && ` - Week ${attempt.weekNumber}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={attempt.score >= 80 ? "default" : attempt.score >= 60 ? "secondary" : "destructive"}>
                    {attempt.score}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}