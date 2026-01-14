import { useState, useEffect } from 'react';
import { Gamepad2, Trophy, Star, Clock, Target, Shuffle, Brain, Zap, X, Check, RotateCcw } from 'lucide-react';

type GameType = 'quiz' | 'matching' | 'wordscramble' | 'memory' | 'typing' | null;

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface MatchingPair {
  id: number;
  term: string;
  definition: string;
}

export function GameHubPage() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  // Quiz Game State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResult, setShowQuizResult] = useState(false);

  // Matching Game State
  const [selectedTerms, setSelectedTerms] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [matchAttempts, setMatchAttempts] = useState(0);

  // Word Scramble State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [scrambleScore, setScrambleScore] = useState(0);
  const [scrambleHint, setScrambleHint] = useState(false);

  // Memory Game State
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedCards, setMatchedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);

  // Typing Game State
  const [typingText, setTypingText] = useState('');
  const [typingProgress, setTypingProgress] = useState(0);
  const [typingStartTime, setTypingStartTime] = useState<number | null>(null);
  const [typingWPM, setTypingWPM] = useState(0);

  // Quiz Questions
  const quizQuestions: QuizQuestion[] = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2
    },
    {
      question: "What is 2 + 2 × 3?",
      options: ["12", "8", "10", "14"],
      correctAnswer: 1
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: 1
    },
    {
      question: "What is the chemical symbol for water?",
      options: ["O2", "H2O", "CO2", "H2"],
      correctAnswer: 1
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      correctAnswer: 1
    }
  ];

  // Matching Pairs
  const matchingPairs: MatchingPair[] = [
    { id: 1, term: "Photosynthesis", definition: "Process plants use to make food" },
    { id: 2, term: "Mitochondria", definition: "Powerhouse of the cell" },
    { id: 3, term: "DNA", definition: "Genetic blueprint of life" },
    { id: 4, term: "Ecosystem", definition: "Community of living organisms" }
  ];

  // Word Scramble Words
  const scrambleWords = [
    { word: "EDUCATION", scrambled: "NOITACUDE", hint: "Learning process" },
    { word: "MATHEMATICS", scrambled: "SCITAMEHTAM", hint: "Study of numbers" },
    { word: "SCIENCE", scrambled: "ECNEICS", hint: "Study of natural world" },
    { word: "LITERATURE", scrambled: "ERUTARETIL", hint: "Written works" },
    { word: "GEOGRAPHY", scrambled: "YHPARGOED", hint: "Study of Earth" }
  ];

  // Memory Cards
  const memoryCards = [
    { id: 1, content: '🍎', pair: 1 },
    { id: 2, content: '🍎', pair: 1 },
    { id: 3, content: '🌟', pair: 2 },
    { id: 4, content: '🌟', pair: 2 },
    { id: 5, content: '🎨', pair: 3 },
    { id: 6, content: '🎨', pair: 3 },
    { id: 7, content: '📚', pair: 4 },
    { id: 8, content: '📚', pair: 4 },
    { id: 9, content: '🎵', pair: 5 },
    { id: 10, content: '🎵', pair: 5 },
    { id: 11, content: '⚡', pair: 6 },
    { id: 12, content: '⚡', pair: 6 }
  ];

  const [shuffledMemoryCards] = useState(() => 
    [...memoryCards].sort(() => Math.random() - 0.5)
  );

  // Typing Test Text
  const typingTestText = "The quick brown fox jumps over the lazy dog. Education is the most powerful weapon which you can use to change the world.";

  // Quiz Game Functions
  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    if (answerIndex === quizQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(quizScore + 1);
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowQuizResult(true);
      }
    }, 1000);
  };

  // Matching Game Functions
  const handleTermSelect = (id: number) => {
    if (matchedPairs.includes(id)) return;
    
    if (selectedTerms.length === 0) {
      setSelectedTerms([id]);
    } else if (selectedTerms.length === 1) {
      if (selectedTerms[0] === id) {
        setSelectedTerms([]);
        return;
      }
      
      const firstPair = matchingPairs.find(p => p.id === selectedTerms[0]);
      const secondPair = matchingPairs.find(p => p.id === id);
      
      setMatchAttempts(matchAttempts + 1);
      
      if (firstPair && secondPair && firstPair.id === secondPair.id) {
        setMatchedPairs([...matchedPairs, firstPair.id]);
        setSelectedTerms([]);
      } else {
        setTimeout(() => setSelectedTerms([]), 800);
      }
    }
  };

  // Word Scramble Functions
  const handleScrambleSubmit = () => {
    if (userGuess.toUpperCase() === scrambleWords[currentWordIndex].word) {
      setScrambleScore(scrambleScore + (scrambleHint ? 5 : 10));
      if (currentWordIndex < scrambleWords.length - 1) {
        setCurrentWordIndex(currentWordIndex + 1);
        setUserGuess('');
        setScrambleHint(false);
      } else {
        setShowQuizResult(true);
      }
    }
  };

  // Memory Game Functions
  useEffect(() => {
    if (flippedCards.length === 2) {
      setMemoryMoves(memoryMoves + 1);
      const [first, second] = flippedCards;
      const firstCard = shuffledMemoryCards[first];
      const secondCard = shuffledMemoryCards[second];

      if (firstCard.pair === secondCard.pair) {
        setMatchedCards([...matchedCards, first, second]);
        setFlippedCards([]);
      } else {
        setTimeout(() => setFlippedCards([]), 1000);
      }
    }
  }, [flippedCards]);

  const handleCardClick = (index: number) => {
    if (flippedCards.length < 2 && !flippedCards.includes(index) && !matchedCards.includes(index)) {
      setFlippedCards([...flippedCards, index]);
    }
  };

  // Typing Game Functions
  const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setTypingText(input);

    if (!typingStartTime) {
      setTypingStartTime(Date.now());
    }

    const correctChars = input.split('').filter((char, i) => char === typingTestText[i]).length;
    setTypingProgress((correctChars / typingTestText.length) * 100);

    if (input === typingTestText) {
      const timeElapsed = (Date.now() - (typingStartTime || Date.now())) / 1000 / 60;
      const words = typingTestText.split(' ').length;
      const wpm = Math.round(words / timeElapsed);
      setTypingWPM(wpm);
      setShowQuizResult(true);
    }
  };

  // Reset Game
  const resetGame = () => {
    setSelectedGame(null);
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowQuizResult(false);
    setSelectedTerms([]);
    setMatchedPairs([]);
    setMatchAttempts(0);
    setCurrentWordIndex(0);
    setUserGuess('');
    setScrambleScore(0);
    setScrambleHint(false);
    setFlippedCards([]);
    setMatchedCards([]);
    setMemoryMoves(0);
    setTypingText('');
    setTypingProgress(0);
    setTypingStartTime(null);
    setTypingWPM(0);
  };

  const games = [
    {
      id: 'quiz' as GameType,
      name: 'Quick Quiz',
      description: 'Test your knowledge with multiple choice questions',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      id: 'matching' as GameType,
      name: 'Match Pairs',
      description: 'Match terms with their correct definitions',
      icon: Target,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700'
    },
    {
      id: 'wordscramble' as GameType,
      name: 'Word Scramble',
      description: 'Unscramble letters to form the correct word',
      icon: Shuffle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700'
    },
    {
      id: 'memory' as GameType,
      name: 'Memory Match',
      description: 'Find matching pairs by remembering card positions',
      icon: Star,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700'
    },
    {
      id: 'typing' as GameType,
      name: 'Speed Typing',
      description: 'Test your typing speed and accuracy',
      icon: Zap,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700'
    }
  ];

  const renderGameContent = () => {
    if (!selectedGame) return null;

    switch (selectedGame) {
      case 'quiz':
        if (showQuizResult) {
          return (
            <div className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mb-6">
                <Trophy className="h-16 w-16 text-white" />
              </div>
              <h2 className="mb-4">Quiz Complete!</h2>
              <p className="text-3xl mb-4">
                Score: {quizScore} / {quizQuestions.length}
              </p>
              <p className="text-muted-foreground mb-8">
                You got {Math.round((quizScore / quizQuestions.length) * 100)}% correct!
              </p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Play Again
              </button>
            </div>
          );
        }

        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {quizQuestions.length}
              </span>
              <span className="text-sm">Score: {quizScore}</span>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border mb-6">
              <h3 className="mb-6">{quizQuestions[currentQuestionIndex].question}</h3>
              
              <div className="space-y-3">
                {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      selectedAnswer === index
                        ? index === quizQuestions[currentQuestionIndex].correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-border hover:border-primary hover:bg-blue-50'
                    } disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {selectedAnswer === index && (
                        index === quizQuestions[currentQuestionIndex].correctAnswer ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'matching':
        const allMatched = matchedPairs.length === matchingPairs.length;
        if (allMatched) {
          return (
            <div className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mb-6">
                <Trophy className="h-16 w-16 text-white" />
              </div>
              <h2 className="mb-4">Perfect Match!</h2>
              <p className="text-3xl mb-4">
                Completed in {matchAttempts} attempts
              </p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Play Again
              </button>
            </div>
          );
        }

        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">Attempts: {matchAttempts}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Terms */}
              <div className="space-y-3">
                <h3 className="text-center mb-4">Terms</h3>
                {matchingPairs.map(pair => (
                  <button
                    key={`term-${pair.id}`}
                    onClick={() => handleTermSelect(pair.id)}
                    disabled={matchedPairs.includes(pair.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      matchedPairs.includes(pair.id)
                        ? 'border-green-500 bg-green-50'
                        : selectedTerms.includes(pair.id)
                        ? 'border-primary bg-blue-50'
                        : 'border-border hover:border-primary'
                    } disabled:opacity-50`}
                  >
                    {pair.term}
                  </button>
                ))}
              </div>

              {/* Definitions */}
              <div className="space-y-3">
                <h3 className="text-center mb-4">Definitions</h3>
                {matchingPairs.sort(() => Math.random() - 0.5).map(pair => (
                  <button
                    key={`def-${pair.id}`}
                    onClick={() => handleTermSelect(pair.id)}
                    disabled={matchedPairs.includes(pair.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      matchedPairs.includes(pair.id)
                        ? 'border-green-500 bg-green-50'
                        : selectedTerms.includes(pair.id)
                        ? 'border-primary bg-blue-50'
                        : 'border-border hover:border-primary'
                    } disabled:opacity-50`}
                  >
                    {pair.definition}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'wordscramble':
        if (showQuizResult) {
          return (
            <div className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mb-6">
                <Trophy className="h-16 w-16 text-white" />
              </div>
              <h2 className="mb-4">Game Complete!</h2>
              <p className="text-3xl mb-4">Final Score: {scrambleScore}</p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Play Again
              </button>
            </div>
          );
        }

        return (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">
                Word {currentWordIndex + 1} of {scrambleWords.length}
              </p>
              <p className="text-2xl mt-2">Score: {scrambleScore}</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border text-center">
              <h3 className="mb-6">Unscramble this word:</h3>
              <p className="text-4xl tracking-widest mb-8 text-primary">
                {scrambleWords[currentWordIndex].scrambled}
              </p>

              {scrambleHint && (
                <p className="text-sm text-muted-foreground mb-4">
                  Hint: {scrambleWords[currentWordIndex].hint}
                </p>
              )}

              <input
                type="text"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleScrambleSubmit()}
                placeholder="Your answer..."
                className="w-full px-6 py-4 border-2 border-border rounded-xl text-center text-2xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setScrambleHint(true)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                >
                  Show Hint (-5 pts)
                </button>
                <button
                  onClick={handleScrambleSubmit}
                  className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        );

      case 'memory':
        const allCardsMatched = matchedCards.length === shuffledMemoryCards.length;
        if (allCardsMatched) {
          return (
            <div className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mb-6">
                <Trophy className="h-16 w-16 text-white" />
              </div>
              <h2 className="mb-4">Memory Master!</h2>
              <p className="text-3xl mb-4">Completed in {memoryMoves} moves</p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Play Again
              </button>
            </div>
          );
        }

        return (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
              <p className="text-sm text-muted-foreground">Moves: {memoryMoves}</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {shuffledMemoryCards.map((card, index) => (
                <button
                  key={index}
                  onClick={() => handleCardClick(index)}
                  disabled={flippedCards.includes(index) || matchedCards.includes(index)}
                  className={`aspect-square rounded-xl border-2 transition-all text-4xl ${
                    flippedCards.includes(index) || matchedCards.includes(index)
                      ? 'border-primary bg-blue-50'
                      : 'border-border bg-white hover:border-primary'
                  } disabled:cursor-default`}
                >
                  {flippedCards.includes(index) || matchedCards.includes(index) ? (
                    card.content
                  ) : (
                    <span className="text-2xl">❓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case 'typing':
        if (showQuizResult) {
          return (
            <div className="text-center py-12">
              <div className="inline-flex p-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mb-6">
                <Trophy className="h-16 w-16 text-white" />
              </div>
              <h2 className="mb-4">Typing Complete!</h2>
              <p className="text-3xl mb-4">{typingWPM} WPM</p>
              <p className="text-muted-foreground mb-8">Words Per Minute</p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
              >
                Try Again
              </button>
            </div>
          );
        }

        return (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm">{Math.round(typingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${typingProgress}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-border mb-6">
              <p className="text-lg mb-6 leading-relaxed text-muted-foreground">
                {typingTestText.split('').map((char, index) => (
                  <span
                    key={index}
                    className={
                      index < typingText.length
                        ? typingText[index] === char
                          ? 'text-green-600'
                          : 'text-red-600 bg-red-100'
                        : ''
                    }
                  >
                    {char}
                  </span>
                ))}
              </p>

              <input
                type="text"
                value={typingText}
                onChange={handleTypingInput}
                placeholder="Start typing..."
                className="w-full px-6 py-4 border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Type the text above as quickly and accurately as possible
            </p>
          </div>
        );
    }
  };

  if (selectedGame && gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-orange-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button
            onClick={resetGame}
            className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
            Back to Game Hub
          </button>

          {renderGameContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-orange-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-4">
            <Gamepad2 className="h-5 w-5 text-accent" />
            <span className="text-sm text-accent">Interactive Learning</span>
          </div>
          <h1 className="display-font text-5xl mb-4">Game Hub</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Make learning fun with interactive educational games. Challenge yourself and improve your knowledge!
          </p>
        </div>

        {/* Game Selection */}
        {!selectedGame && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {games.map((game) => {
                const Icon = game.icon;
                return (
                  <div
                    key={game.id}
                    className="bg-white rounded-2xl border border-border hover:border-primary hover:shadow-2xl transition-all overflow-hidden group cursor-pointer"
                    onClick={() => {
                      setSelectedGame(game.id);
                      setGameStarted(true);
                    }}
                  >
                    <div className={`h-32 bg-gradient-to-br ${game.color} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <Icon className="h-16 w-16 text-white" />
                    </div>
                    <div className="p-6">
                      <h3 className="mb-3">{game.name}</h3>
                      <p className="text-muted-foreground mb-4">{game.description}</p>
                      <button className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
                        Play Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-border text-center">
                <div className="inline-flex p-4 bg-blue-100 rounded-full mb-4">
                  <Gamepad2 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2">5 Games</h3>
                <p className="text-sm text-muted-foreground">Available to play</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-border text-center">
                <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                  <Trophy className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-2">Track Progress</h3>
                <p className="text-sm text-muted-foreground">Monitor your scores</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-border text-center">
                <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2">Learn & Play</h3>
                <p className="text-sm text-muted-foreground">Educational content</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
