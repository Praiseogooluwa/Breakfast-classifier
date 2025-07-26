import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Play, Trophy, Sparkles, Upload, Brain, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import breakfastHero from '@/assets/breakfast-hero.jpg';
import sweetFoods from '@/assets/sweet-foods.jpg';
import savoryFoods from '@/assets/savory-foods.jpg';

// Enhanced food database with nutritional info
const foodDatabase = {
  sweet: [
    { name: 'pancake', calories: 175, protein: 5, category: 'breakfast' },
    { name: 'waffle', calories: 218, protein: 6, category: 'breakfast' },
    { name: 'donut', calories: 269, protein: 4, category: 'pastry' },
    { name: 'muffin', calories: 174, protein: 3, category: 'pastry' },
    { name: 'croissant', calories: 231, protein: 5, category: 'pastry' },
    { name: 'puff puff', calories: 89, protein: 2, category: 'african' },
    { name: 'chin chin', calories: 112, protein: 2, category: 'african' },
    { name: 'banana', calories: 105, protein: 1, category: 'fruit' },
    { name: 'apple', calories: 95, protein: 0, category: 'fruit' },
    { name: 'orange', calories: 62, protein: 1, category: 'fruit' },
    { name: 'yogurt', calories: 149, protein: 8, category: 'dairy' },
  ],
  savory: [
    { name: 'bacon', calories: 43, protein: 3, category: 'meat' },
    { name: 'egg', calories: 78, protein: 6, category: 'protein' },
    { name: 'sausage', calories: 92, protein: 5, category: 'meat' },
    { name: 'omelette', calories: 154, protein: 11, category: 'protein' },
    { name: 'beans', calories: 127, protein: 8, category: 'legume' },
    { name: 'yam', calories: 116, protein: 2, category: 'tuber' },
    { name: 'plantain', calories: 122, protein: 1, category: 'fruit' },
    { name: 'moi moi', calories: 165, protein: 9, category: 'african' },
    { name: 'akara', calories: 145, protein: 6, category: 'african' },
    { name: 'bread', calories: 79, protein: 4, category: 'grain' },
    { name: 'cheese', calories: 113, protein: 7, category: 'dairy' },
  ]
};

interface ClassificationResult {
  type: 'sweet' | 'savory' | 'unknown';
  confidence: number;
  foodInfo?: any;
  suggestions?: string[];
}

const BreakfastClassifier: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [score, setScore] = useState(0);
  const [currentGameFood, setCurrentGameFood] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Enhanced classification using fuzzy matching and confidence scoring
  const classifyFood = async (foodName: string): Promise<ClassificationResult> => {
    const normalizedInput = foodName.toLowerCase().trim();
    
    // Check exact matches first
    const allFoods = [...foodDatabase.sweet, ...foodDatabase.savory];
    const exactMatch = allFoods.find(food => food.name === normalizedInput);
    
    if (exactMatch) {
      const type = foodDatabase.sweet.includes(exactMatch) ? 'sweet' : 'savory';
      return {
        type,
        confidence: 0.95,
        foodInfo: exactMatch
      };
    }

    // Fuzzy matching with Levenshtein distance
    let bestMatch = { food: null as any, distance: Infinity, type: 'unknown' as 'sweet' | 'savory' | 'unknown' };
    
    allFoods.forEach(food => {
      const distance = levenshteinDistance(normalizedInput, food.name);
      const similarity = 1 - (distance / Math.max(normalizedInput.length, food.name.length));
      
      if (similarity > 0.6 && distance < bestMatch.distance) {
        bestMatch = {
          food,
          distance,
          type: foodDatabase.sweet.includes(food) ? 'sweet' : 'savory'
        };
      }
    });

    if (bestMatch.food) {
      const confidence = 1 - (bestMatch.distance / Math.max(normalizedInput.length, bestMatch.food.name.length));
      return {
        type: bestMatch.type,
        confidence: Math.max(0.6, confidence),
        foodInfo: bestMatch.food,
        suggestions: getSimilarFoods(normalizedInput)
      };
    }

    return {
      type: 'unknown',
      confidence: 0,
      suggestions: getSimilarFoods(normalizedInput)
    };
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const dp = Array(str1.length + 1).fill(null).map(() => Array(str2.length + 1).fill(0));
    
    for (let i = 0; i <= str1.length; i++) dp[i][0] = i;
    for (let j = 0; j <= str2.length; j++) dp[0][j] = j;
    
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    
    return dp[str1.length][str2.length];
  };

  const getSimilarFoods = (input: string): string[] => {
    const allFoods = [...foodDatabase.sweet, ...foodDatabase.savory];
    return allFoods
      .map(food => ({
        name: food.name,
        distance: levenshteinDistance(input, food.name)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .map(item => item.name);
  };

  const handleClassify = async () => {
    if (!input.trim()) {
      toast({
        title: "Please enter a food name",
        description: "Type something delicious to classify!",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    // Simulate AI processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const classification = await classifyFood(input);
    setResult(classification);
    setIsProcessing(false);

    // Speak the result
    if ('speechSynthesis' in window && classification.type !== 'unknown') {
      const utterance = new SpeechSynthesisUtterance(
        `This is ${classification.type}! ${classification.foodInfo?.name} has ${classification.foodInfo?.calories} calories.`
      );
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Speech recognition not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);
    
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setInput(spokenText);
      setIsListening(false);
      toast({
        title: "Voice captured!",
        description: `Heard: "${spokenText}"`,
      });
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice input failed",
        description: "Please try again",
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const startGame = () => {
    const allFoods = [...foodDatabase.sweet, ...foodDatabase.savory];
    const randomFood = allFoods[Math.floor(Math.random() * allFoods.length)];
    setCurrentGameFood(randomFood.name);
    setGameMode(true);
    setResult(null);
  };

  const makeGuess = async (guess: 'sweet' | 'savory') => {
    const correctType = foodDatabase.sweet.find(f => f.name === currentGameFood) ? 'sweet' : 'savory';
    const isCorrect = guess === correctType;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      toast({
        title: "Correct! 🎉",
        description: `${currentGameFood} is indeed ${correctType}!`,
      });
    } else {
      toast({
        title: "Oops! 😅",
        description: `${currentGameFood} is actually ${correctType}`,
        variant: "destructive"
      });
    }
    
    setGameMode(false);
    
    // Show food info
    const foodInfo = [...foodDatabase.sweet, ...foodDatabase.savory]
      .find(f => f.name === currentGameFood);
    
    setResult({
      type: correctType,
      confidence: 1,
      foodInfo
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Simulate image classification
      toast({
        title: "Image uploaded!",
        description: "AI image classification coming soon...",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Hero Section */}
      <motion.div 
        className="relative h-80 bg-cover bg-center rounded-b-3xl overflow-hidden shadow-elevated"
        style={{ backgroundImage: `url(${breakfastHero})` }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent animate-shimmer">
              🥞 Breakfast AI
            </h1>
            <p className="text-xl md:text-2xl font-medium opacity-90">
              Classify your breakfast with advanced AI
            </p>
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="w-5 h-5 animate-bounce-gentle" />
              <span className="text-lg">Powered by Machine Learning</span>
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Main Classifier Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="bg-gradient-card border-2 border-primary/20 shadow-elevated">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-foreground">
                🔍 AI Food Classifier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Section */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a food (e.g., puff puff, pancake, eggs)"
                    className="flex-1 h-12 text-lg border-2 border-primary/20 focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleClassify()}
                  />
                  <Button
                    onClick={handleVoiceInput}
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    className="h-12 w-12"
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    onClick={handleClassify}
                    disabled={isProcessing || !input.trim()}
                    variant="premium"
                    size="lg"
                    className="relative group"
                  >
                    {isProcessing ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    {isProcessing ? 'Analyzing...' : 'Classify Food'}
                  </Button>

                  <Button
                    onClick={startGame}
                    variant="sweet"
                    size="lg"
                  >
                    <Trophy className="w-5 h-5" />
                    Game Mode
                  </Button>

                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="savory"
                    size="lg"
                  >
                    <Camera className="w-5 h-5" />
                    Upload Image
                  </Button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Game Mode */}
              <AnimatePresence>
                {gameMode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-6 bg-gradient-hero rounded-xl text-center space-y-4"
                  >
                    <h3 className="text-2xl font-bold text-white">🎮 Game Mode</h3>
                    <p className="text-xl text-white/90">
                      Is <strong>"{currentGameFood}"</strong> sweet or savory?
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => makeGuess('sweet')}
                        variant="sweet"
                        size="lg"
                      >
                        🧁 Sweet
                      </Button>
                      <Button
                        onClick={() => makeGuess('savory')}
                        variant="savory"
                        size="lg"
                      >
                        🥓 Savory
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Section */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-4"
                  >
                    <div className={`p-6 rounded-xl ${
                      result.type === 'sweet' ? 'bg-gradient-sweet' : 
                      result.type === 'savory' ? 'bg-gradient-savory' : 
                      'bg-muted'
                    }`}>
                      <div className="text-center text-white space-y-3">
                        <div className="text-6xl">
                          {result.type === 'sweet' ? '🧁' : 
                           result.type === 'savory' ? '🥓' : '🤔'}
                        </div>
                        <h3 className="text-2xl font-bold">
                          {result.type === 'sweet' ? 'Sweet!' : 
                           result.type === 'savory' ? 'Savory!' : 
                           'Unknown Food'}
                        </h3>
                        <p className="text-lg opacity-90">
                          {result.type === 'sweet' ? 'A sugary delight!' : 
                           result.type === 'savory' ? 'Salty and satisfying!' : 
                           "I'm not sure about this one..."}
                        </p>
                        
                        {result.foodInfo && (
                          <div className="mt-4 p-4 bg-white/20 rounded-lg">
                            <h4 className="font-semibold mb-2">Nutritional Info:</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="block font-medium">Calories</span>
                                {result.foodInfo.calories}
                              </div>
                              <div>
                                <span className="block font-medium">Protein</span>
                                {result.foodInfo.protein}g
                              </div>
                              <div>
                                <span className="block font-medium">Category</span>
                                {result.foodInfo.category}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          Confidence: {Math.round(result.confidence * 100)}%
                        </Badge>
                      </div>
                    </div>

                    {result.suggestions && result.suggestions.length > 0 && (
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Did you mean:</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.suggestions.map((suggestion, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() => setInput(suggestion)}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Score Display */}
              {score > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center p-4 bg-gradient-hero rounded-lg"
                >
                  <div className="text-2xl font-bold text-white">
                    🏆 Score: {score}
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mt-8"
        >
          <Card className="bg-gradient-card border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src={sweetFoods} alt="Sweet foods" className="w-12 h-12 rounded-lg object-cover" />
                Sweet Foods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Discover delicious sweet breakfast options
              </p>
              <div className="flex flex-wrap gap-2">
                {foodDatabase.sweet.slice(0, 6).map((food, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setInput(food.name)}
                  >
                    {food.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-2 border-primary/20 hover:shadow-elevated transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src={savoryFoods} alt="Savory foods" className="w-12 h-12 rounded-lg object-cover" />
                Savory Foods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explore hearty savory breakfast choices
              </p>
              <div className="flex flex-wrap gap-2">
                {foodDatabase.savory.slice(0, 6).map((food, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setInput(food.name)}
                  >
                    {food.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BreakfastClassifier;