import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ExamQuestion {
  id: string;
  question: string;
  choices?: string[];
  correctAnswer?: string;
  modelAnswer?: string;
  points: number;
}

interface ExamData {
  mcQuestions: ExamQuestion[];
  saQuestions: ExamQuestion[];
  essayQuestions: ExamQuestion[];
  success: boolean;
}

export default function FinalExamPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [error, setError] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<'deepseek' | 'openai' | 'anthropic'>('deepseek');
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [examStarted, setExamStarted] = useState(false);

  // Don't auto-generate - let user choose model first

  const generateExam = async () => {
    setIsGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiModel: selectedModel,
          studyGuideType: 'final',
          timestamp: Date.now() // For unique generation
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('EXAM DEBUG - Full API response:', data);
        console.log('EXAM DEBUG - MC Questions:', data.mcQuestions);
        console.log('EXAM DEBUG - First MC Question:', data.mcQuestions?.[0]);
        console.log('EXAM DEBUG - First MC Choices:', data.mcQuestions?.[0]?.choices);
        setExamData(data);
        // Auto-start the exam when generated so users can immediately answer questions
        setExamStarted(true);
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to generate:', error);
      setError('Failed to generate exam. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate total points
  const totalPoints = examData ? 
    (examData.mcQuestions?.length * 2) + 
    (examData.saQuestions?.length * 5) + 
    (examData.essayQuestions?.length * 15) : 0;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Philosophy 101 Final Exam
            {examData && <Badge variant="secondary" className="text-green-600">
              <CheckCircle className="w-4 h-4 mr-1" />
              Generated Successfully
            </Badge>}
          </CardTitle>
          {examData && (
            <div className="text-sm text-gray-600">
              Total Points: {totalPoints} | 
              MC: {examData.mcQuestions?.length || 0} questions | 
              SA: {examData.saQuestions?.length || 0} questions | 
              Essay: {examData.essayQuestions?.length || 0} questions
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isGenerating && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              <span className="text-lg">Generating Final Exam...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!examData && !isGenerating && !error && (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select AI Model:</label>
                <Select value={selectedModel} onValueChange={(value: 'deepseek' | 'openai' | 'anthropic') => setSelectedModel(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deepseek">ZHI 1 (DeepSeek)</SelectItem>
                    <SelectItem value="openai">ZHI 2 (OpenAI)</SelectItem>
                    <SelectItem value="anthropic">ZHI 3 (Anthropic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={generateExam} 
                className="w-full"
              >
                Generate Final Exam
              </Button>
            </div>
          )}
          
          {examData && (
            <div className="space-y-6">
              <div className="flex gap-4 mb-6">
                <Button 
                  onClick={() => { 
                    setExamData(null); 
                    setAnswers({});
                    setExamStarted(false);
                    generateExam(); 
                  }}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New Exam
                </Button>
                {!examStarted && (
                  <Button 
                    onClick={() => {
                      console.log('EXAM DEBUG - Starting exam, setting examStarted to true');
                      setExamStarted(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    Start Exam
                  </Button>
                )}
                {examStarted && (
                  <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded">
                    ✅ Exam Started - You can now answer questions below
                  </div>
                )}
              </div>

              {/* Multiple Choice Section */}
              {examData.mcQuestions && examData.mcQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Multiple Choice Questions ({examData.mcQuestions.length} × 2 pts)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {examData.mcQuestions.map((q, index) => (
                      <div key={q.id} className="border-l-4 border-blue-500 pl-4">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        <div className="mt-2 space-y-1">
                          {q.choices?.map((choice, i) => (
                            examStarted ? (
                              <label key={i} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                <input 
                                  type="radio" 
                                  name={q.id}
                                  value={choice}
                                  checked={answers[q.id] === choice}
                                  onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                                  className="text-blue-600"
                                />
                                <span className="text-sm">{String.fromCharCode(65 + i)}. {choice}</span>
                              </label>
                            ) : (
                              <div key={i} className="text-sm p-2 rounded bg-gray-50">
                                {String.fromCharCode(65 + i)}. {choice}
                              </div>
                            )
                          ))}
                          {!q.choices && (
                            <div className="text-red-600 text-sm">DEBUG: No choices found for this question</div>
                          )}
                          {examStarted && !q.choices && (
                            <div className="mt-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                              <input 
                                type="text"
                                placeholder="Enter your answer..."
                                value={answers[q.id] || ''}
                                onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                                className="w-full p-2 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Short Answer Section */}
              {examData.saQuestions && examData.saQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Short Answer Questions ({examData.saQuestions.length} × 5 pts)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {examData.saQuestions.map((q, index) => (
                      <div key={q.id} className="border-l-4 border-orange-500 pl-4">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        {examStarted && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer:</label>
                            <textarea 
                              placeholder="Type your answer here..."
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                              className="w-full p-3 border border-gray-300 rounded min-h-[100px]"
                              rows={4}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Essay Section */}
              {examData.essayQuestions && examData.essayQuestions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Essay Questions ({examData.essayQuestions.length} × 15 pts)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {examData.essayQuestions.map((q, index) => (
                      <div key={q.id} className="border-l-4 border-purple-500 pl-4">
                        <p className="font-medium">{index + 1}. {q.question}</p>
                        {examStarted && (
                          <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Essay:</label>
                            <textarea 
                              placeholder="Write your essay here..."
                              value={answers[q.id] || ''}
                              onChange={(e) => setAnswers(prev => ({...prev, [q.id]: e.target.value}))}
                              className="w-full p-3 border border-gray-300 rounded min-h-[200px]"
                              rows={8}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Submit Section */}
              {examStarted && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          alert('Exam submitted successfully! (Feature in development)');
                        }}
                      >
                        Submit Final Exam
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const confirmation = confirm('Are you sure you want to restart? All answers will be lost.');
                          if (confirmation) {
                            setAnswers({});
                            setExamStarted(false);
                          }
                        }}
                      >
                        Restart Exam
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}