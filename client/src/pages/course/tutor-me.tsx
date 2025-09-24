import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send, Bot, User, Keyboard, X, CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
// Removed ObjectUploader import - using simple file input instead

interface TutorMessage {
  id: string;
  type: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  hasQuestion?: boolean;
  questionId?: string;
  questionText?: string;
  questionType?: 'text_input' | 'multiple_choice';
  questionOptions?: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number;
  feedback?: string;
  isCorrect?: boolean;
  difficultyLevel?: string;
  quizScore?: number;

}

interface TutorMeProps {
  selectedAIModel: string;
}

const philosophicalHelpers = [
  { symbol: '∴', name: 'therefore', description: 'Therefore (conclusion)' },
  { symbol: '∵', name: 'because', description: 'Because (reason)' },
  { symbol: '≠', name: 'not equal', description: 'Not equal to' },
];

export function TutorMe({ selectedAIModel }: TutorMeProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHelperTools, setShowHelperTools] = useState(false);
  const [currentQuestionAnswer, setCurrentQuestionAnswer] = useState<string | number>("");
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState<string>('standard');
  const [recentScores, setRecentScores] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      const welcomeMessage: TutorMessage = {
        id: 'welcome',
        type: 'tutor',
        content: "Hi! I'm your philosophy tutor. I specialize in helping you explore philosophical concepts, develop critical thinking skills, and understand complex philosophical arguments. What philosophical topic would you like to discuss today?",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = inputText.substring(0, start) + symbol + inputText.substring(end);
      setInputText(newText);
      
      // Set cursor position after the inserted symbol
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
        textarea.focus();
      }, 0);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const userMessage: TutorMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          conversationHistory: messages.slice(-12), // Last 12 messages for better memory
          model: selectedAIModel,
          currentDifficulty: difficultyLevel,
          recentPerformance: recentScores.slice(-3) // Last 3 quiz scores for adaptive difficulty
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get tutor response');
      }

      const data = await response.json();
      
      // Ensure interactive questions are properly formatted
      const tutorMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        content: data.content,
        timestamp: new Date(),
        hasQuestion: data.hasQuestion || false,
        questionId: data.questionId || `q_${Date.now()}`,
        questionText: data.questionText,
        questionType: data.questionType || 'multiple_choice',
        questionOptions: data.questionOptions,
        correctAnswer: data.correctAnswer,
        difficultyLevel: data.difficultyLevel || difficultyLevel
      };

      setMessages(prev => [...prev, tutorMessage]);
      
      // Reset current answer for new question
      if (tutorMessage.hasQuestion) {
        setCurrentQuestionAnswer("");
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: TutorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tutor',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitQuestionAnswer = async (questionId: string, correctAnswer: string | number) => {
    // Allow 0 as a valid answer (option A in multiple choice)
    if (currentQuestionAnswer === null || currentQuestionAnswer === undefined || 
        (typeof currentQuestionAnswer === 'string' && currentQuestionAnswer.trim() === '')) return;

    setEvaluatingAnswer(true);

    try {
      // Find the question text from the messages
      const questionMessage = messages.find(msg => msg.questionId === questionId);
      const questionText = questionMessage?.questionText || '';
      
      const response = await fetch('/api/tutor-evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          userAnswer: currentQuestionAnswer,
          correctAnswer,
          model: selectedAIModel,
          questionText
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate answer');
      }

      const data = await response.json();
      
      // Calculate quiz score (0-100)
      const quizScore = data.isCorrect ? 100 : 0;
      
      // Update recent scores for difficulty adjustment
      const updatedScores = [...recentScores, quizScore].slice(-5); // Keep last 5 scores
      setRecentScores(updatedScores);
      
      // Adjust difficulty based on recent performance
      const avgScore = updatedScores.reduce((a, b) => a + b, 0) / updatedScores.length;
      let newDifficulty = difficultyLevel;
      
      if (updatedScores.length >= 3) {
        if (avgScore >= 80 && difficultyLevel !== 'advanced') {
          newDifficulty = difficultyLevel === 'beginner' ? 'intermediate' : 'advanced';
        } else if (avgScore <= 40 && difficultyLevel !== 'beginner') {
          newDifficulty = difficultyLevel === 'advanced' ? 'intermediate' : 'beginner';
        }
        
        if (newDifficulty !== difficultyLevel) {
          setDifficultyLevel(newDifficulty);
        }
      }
      
      // Update the message with the user's answer and feedback
      setMessages(prev => prev.map(msg => 
        msg.questionId === questionId ? {
          ...msg,
          userAnswer: currentQuestionAnswer,
          feedback: data.feedback,
          isCorrect: data.isCorrect,
          quizScore
        } : msg
      ));

      // Add follow-up tutor response
      const followUpMessage: TutorMessage = {
        id: Date.now().toString(),
        type: 'tutor',
        content: data.followUp,
        timestamp: new Date(),
        hasQuestion: data.hasNextQuestion,
        questionId: data.nextQuestionId,
        questionText: data.nextQuestionText,
        questionType: data.nextQuestionType,
        questionOptions: data.nextQuestionOptions,
        correctAnswer: data.nextCorrectAnswer,
        difficultyLevel: newDifficulty
      };

      setMessages(prev => [...prev, followUpMessage]);
      setCurrentQuestionAnswer("");
      
    } catch (error) {
      console.error('Error evaluating answer:', error);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputText.trim() !== "") {
        sendMessage();
      }
    }
  };



  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tutor Me</h1>
        <p className="text-muted-foreground mb-2">
          Get personalized tutoring in philosophy. Ask questions, explore concepts, and learn at your own pace.
        </p>

      </div>

      <Card className="h-[700px] flex flex-col">
          <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Philosophy Tutor</span>
            <Badge variant="outline">{selectedAIModel.toUpperCase()}</Badge>
            <Badge variant={difficultyLevel === 'advanced' ? 'destructive' : difficultyLevel === 'intermediate' ? 'default' : 'secondary'}>
              {difficultyLevel.toUpperCase()}
            </Badge>
            {recentScores.length > 0 && (
              <Badge variant="outline">
                Avg: {Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)}%
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'tutor' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Optional Practice Question */}
                    {(message.hasQuestion && message.questionText) && (
                      <details className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <summary className="cursor-pointer text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 mb-3">
                          📝 Optional practice question (click to expand)
                        </summary>
                        <div className="font-medium mb-3 text-gray-800 dark:text-gray-200">{message.questionText}</div>
                        
                        {message.questionType === 'multiple_choice' && message.questionOptions ? (
                          <div className="space-y-2">
                            {message.questionOptions.map((option, index) => {
                              // Clean option text - remove existing letter prefixes like "A)", "B)", etc.
                              // Also fix truncation by being more careful with regex
                              let cleanOption = option.trim();
                              
                              // Remove letter prefixes but preserve the actual content
                              cleanOption = cleanOption.replace(/^[A-Z]\)\s*/, '');
                              cleanOption = cleanOption.replace(/^[A-Z]\s+/, '');
                              cleanOption = cleanOption.replace(/^[a-z]\)\s*/, '');
                              
                              // Ensure we don't accidentally cut off the first character
                              if (cleanOption.length === 0) {
                                cleanOption = option; // Fallback to original if cleaning went wrong
                              }
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => setCurrentQuestionAnswer(index)}
                                  className={`w-full text-left p-2 rounded border ${
                                    currentQuestionAnswer === index
                                      ? 'bg-blue-100 border-blue-500 dark:bg-blue-900/20'
                                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                  } ${message.userAnswer !== undefined ? 'pointer-events-none' : ''}`}
                                  disabled={message.userAnswer !== undefined || evaluatingAnswer}
                                >
                                  {String.fromCharCode(65 + index)}) {cleanOption}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              value={currentQuestionAnswer as string}
                              onChange={(e) => setCurrentQuestionAnswer(e.target.value)}
                              placeholder="Enter your philosophical analysis..."
                              disabled={message.userAnswer !== undefined || evaluatingAnswer}
                              className="font-mono"
                            />
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowHelperTools(!showHelperTools)}
                                className="flex items-center space-x-1 text-xs"
                              >
                                <Keyboard className="w-3 h-3" />
                                <span>Helper Tools</span>
                              </Button>
                            </div>
                            
                            {/* Helper Tools */}
                            {showHelperTools && (
                              <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Quick reasoning helpers:
                                </div>
                                <div className="flex gap-2 justify-center">
                                  {philosophicalHelpers.map((helper) => (
                                    <Button
                                      key={helper.symbol}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setCurrentQuestionAnswer(prev => prev + helper.symbol);
                                      }}
                                      className="text-sm"
                                      title={helper.description}
                                    >
                                      {helper.symbol} {helper.name}
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {message.userAnswer === undefined && (
                          <Button
                            onClick={() => submitQuestionAnswer(message.questionId!, message.correctAnswer!)}
                            disabled={evaluatingAnswer || (currentQuestionAnswer === null || currentQuestionAnswer === undefined || 
                              (typeof currentQuestionAnswer === 'string' && currentQuestionAnswer.trim() === ''))}
                            className="mt-3"
                          >
                            {evaluatingAnswer ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Evaluating...
                              </>
                            ) : (
                              'Submit Answer'
                            )}
                          </Button>
                        )}
                        
                        {/* Show feedback after answer */}
                        {message.userAnswer !== undefined && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              {message.isCorrect ? (
                                <Badge className="bg-green-500">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Correct! ({message.quizScore || 100}%)
                                </Badge>
                              ) : (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Incorrect ({message.quizScore || 0}%)
                                </Badge>
                              )}
                              {message.difficultyLevel && (
                                <Badge variant="outline" className="text-xs">
                                  {message.difficultyLevel}
                                </Badge>
                              )}
                            </div>
                            {message.feedback && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {message.feedback}
                              </div>
                            )}
                          </div>
                        )}
                      </details>
                    )}
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <Separator />
          
          {/* Input Area */}
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHelperTools(!showHelperTools)}
                  className="flex items-center space-x-1 text-xs"
                >
                  <Keyboard className="w-3 h-3" />
                  <span>Helper Tools</span>
                </Button>

                
                {showHelperTools && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHelperTools(false)}
                    className="flex items-center space-x-1 text-xs"
                  >
                    <X className="w-3 h-3" />
                    <span>Hide</span>
                  </Button>
                )}
              </div>
              
              {/* Helper Tools */}
              {showHelperTools && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quick reasoning helpers:
                  </div>
                  <div className="flex gap-2 justify-center">
                    {philosophicalHelpers.map((helper) => (
                      <Button
                        key={helper.symbol}
                        variant="outline"
                        size="sm"
                        onClick={() => insertSymbol(helper.symbol)}
                        className="text-sm"
                        title={helper.description}
                      >
                        {helper.symbol} {helper.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask me anything about philosophy! Try: 'Explain Plato's Cave allegory' or 'What is the trolley problem and its significance?' (Press Enter to send, Shift+Enter for new line)"
                  className="min-h-[80px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}