import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, RotateCcw, Play, Settings, Package, Award, Target, Flame, Home, Car, Rocket, Heart, Castle, Plane, User, LogOut, Save } from 'lucide-react';

interface GameStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  totalBricks: number;
  sessionsPlayed: number;
  perfectRounds: number;
  tablesCompleted: Set<number>;
}

interface Question {
  multiplicand: number;
  multiplier: number;
  answer: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  bricksEarned: number;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface BrickEarned {
  id: string;
  color: string;
  size: 'small' | 'normal' | 'large';
  earnedFor: string;
  timestamp: Date;
}

interface BuildingModel {
  id: string;
  name: string;
  icon: React.ReactNode;
  bricksRequired: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  pattern: Array<Array<{ color: string; size: 'small' | 'normal' | 'large' }>>;
}

interface CompletedBuild {
  id: string;
  modelId: string;
  completedAt: Date;
  bricksUsed: number;
}

interface UserProfile {
  name: string;
  loginDate: Date;
  lastPlayDate: Date;
  totalPlayTime: number;
}

const LEGO_COLORS = [
  'bg-red-500',
  'bg-blue-500', 
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-lime-500'
];

const BUILDING_MODELS: BuildingModel[] = [
  {
    id: 'house',
    name: 'Cozy House',
    icon: <Home className="w-8 h-8" />,
    bricksRequired: 15,
    difficulty: 'easy',
    description: 'Build a simple house with a roof and door',
    pattern: [
      [{ color: 'bg-red-500', size: 'normal' }, { color: 'bg-red-500', size: 'normal' }, { color: 'bg-red-500', size: 'normal' }],
      [{ color: 'bg-yellow-500', size: 'normal' }, { color: 'bg-blue-500', size: 'small' }, { color: 'bg-yellow-500', size: 'normal' }],
      [{ color: 'bg-yellow-500', size: 'normal' }, { color: 'bg-green-500', size: 'normal' }, { color: 'bg-yellow-500', size: 'normal' }],
      [{ color: 'bg-yellow-500', size: 'large' }, { color: 'bg-yellow-500', size: 'large' }, { color: 'bg-yellow-500', size: 'large' }]
    ]
  },
  {
    id: 'car',
    name: 'Race Car',
    icon: <Car className="w-8 h-8" />,
    bricksRequired: 12,
    difficulty: 'easy',
    description: 'Build a speedy race car',
    pattern: [
      [{ color: 'bg-red-500', size: 'normal' }, { color: 'bg-red-500', size: 'normal' }, { color: 'bg-red-500', size: 'normal' }],
      [{ color: 'bg-blue-500', size: 'small' }, { color: 'bg-red-500', size: 'large' }, { color: 'bg-blue-500', size: 'small' }],
      [{ color: 'bg-gray-800', size: 'small' }, { color: 'bg-red-500', size: 'normal' }, { color: 'bg-gray-800', size: 'small' }]
    ]
  },
  {
    id: 'rocket',
    name: 'Space Rocket',
    icon: <Rocket className="w-8 h-8" />,
    bricksRequired: 20,
    difficulty: 'medium',
    description: 'Build a rocket to explore space',
    pattern: [
      [{ color: 'bg-red-500', size: 'small' }],
      [{ color: 'bg-white', size: 'normal' }],
      [{ color: 'bg-white', size: 'normal' }],
      [{ color: 'bg-blue-500', size: 'large' }],
      [{ color: 'bg-blue-500', size: 'large' }],
      [{ color: 'bg-orange-500', size: 'normal' }, { color: 'bg-orange-500', size: 'normal' }]
    ]
  },
  {
    id: 'castle',
    name: 'Magic Castle',
    icon: <Castle className="w-8 h-8" />,
    bricksRequired: 35,
    difficulty: 'hard',
    description: 'Build a magnificent castle with towers',
    pattern: [
      [{ color: 'bg-blue-500', size: 'small' }, { color: 'bg-gray-500', size: 'small' }, { color: 'bg-gray-500', size: 'small' }, { color: 'bg-blue-500', size: 'small' }],
      [{ color: 'bg-gray-500', size: 'normal' }, { color: 'bg-yellow-500', size: 'small' }, { color: 'bg-yellow-500', size: 'small' }, { color: 'bg-gray-500', size: 'normal' }],
      [{ color: 'bg-gray-500', size: 'normal' }, { color: 'bg-brown-500', size: 'normal' }, { color: 'bg-brown-500', size: 'normal' }, { color: 'bg-gray-500', size: 'normal' }],
      [{ color: 'bg-gray-500', size: 'large' }, { color: 'bg-gray-500', size: 'large' }, { color: 'bg-gray-500', size: 'large' }, { color: 'bg-gray-500', size: 'large' }]
    ]
  },
  {
    id: 'plane',
    name: 'Airplane',
    icon: <Plane className="w-8 h-8" />,
    bricksRequired: 18,
    difficulty: 'medium',
    description: 'Build an airplane ready for takeoff',
    pattern: [
      [{ color: 'bg-blue-500', size: 'normal' }, { color: 'bg-blue-500', size: 'normal' }, { color: 'bg-blue-500', size: 'normal' }],
      [{ color: 'bg-white', size: 'large' }, { color: 'bg-blue-500', size: 'large' }, { color: 'bg-white', size: 'large' }],
      [{ color: 'bg-blue-500', size: 'normal' }, { color: 'bg-blue-500', size: 'normal' }, { color: 'bg-blue-500', size: 'normal' }]
    ]
  },
  {
    id: 'dog',
    name: 'Friendly Dog',
    icon: <Heart className="w-8 h-8" />,
    bricksRequired: 10,
    difficulty: 'easy',
    description: 'Build a cute puppy friend',
    pattern: [
      [{ color: 'bg-brown-500', size: 'small' }, { color: 'bg-brown-500', size: 'small' }],
      [{ color: 'bg-brown-500', size: 'normal' }, { color: 'bg-brown-500', size: 'normal' }],
      [{ color: 'bg-brown-500', size: 'large' }],
      [{ color: 'bg-brown-500', size: 'small' }, { color: 'bg-brown-500', size: 'small' }, { color: 'bg-brown-500', size: 'small' }, { color: 'bg-brown-500', size: 'small' }]
    ]
  }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loginName, setLoginName] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [gameMode, setGameMode] = useState<'menu' | 'practice' | 'quiz' | 'challenge' | 'collection' | 'builder'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    totalBricks: 0,
    sessionsPlayed: 0,
    perfectRounds: 0,
    tablesCompleted: new Set()
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [bricksEarned, setBricksEarned] = useState<BrickEarned[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [questionsInRound, setQuestionsInRound] = useState(0);
  const [correctInRound, setCorrectInRound] = useState(0);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [completedBuilds, setCompletedBuilds] = useState<CompletedBuild[]>([]);
  const [selectedModel, setSelectedModel] = useState<BuildingModel | null>(null);
  const [buildingInProgress, setBuildingInProgress] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  // Load data from localStorage on app start
  useEffect(() => {
    loadUserData();
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(() => {
        saveUserData();
      }, 30000); // Save every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isLoggedIn, stats, bricksEarned, achievements, completedBuilds]);

  const loadUserData = () => {
    const savedProfile = localStorage.getItem('legoMathProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile({
        ...profile,
        loginDate: new Date(profile.loginDate),
        lastPlayDate: new Date(profile.lastPlayDate)
      });
      setIsLoggedIn(true);
      
      // Load game data
      const savedStats = localStorage.getItem('legoMathStats');
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats({
          ...parsedStats,
          tablesCompleted: new Set(parsedStats.tablesCompleted)
        });
      }

      const savedBricks = localStorage.getItem('legoMathBricks');
      if (savedBricks) {
        const parsedBricks = JSON.parse(savedBricks);
        setBricksEarned(parsedBricks.map((brick: any) => ({
          ...brick,
          timestamp: new Date(brick.timestamp)
        })));
      }

      const savedAchievements = localStorage.getItem('legoMathAchievements');
      if (savedAchievements) {
        setAchievements(JSON.parse(savedAchievements));
      } else {
        initializeAchievements();
      }

      const savedBuilds = localStorage.getItem('legoMathBuilds');
      if (savedBuilds) {
        const parsedBuilds = JSON.parse(savedBuilds);
        setCompletedBuilds(parsedBuilds.map((build: any) => ({
          ...build,
          completedAt: new Date(build.completedAt)
        })));
      }

      const savedTables = localStorage.getItem('legoMathSelectedTables');
      if (savedTables) {
        setSelectedTables(JSON.parse(savedTables));
      }
    }
  };

  const saveUserData = () => {
    if (!isLoggedIn || !userProfile) return;

    // Update last play date
    const updatedProfile = {
      ...userProfile,
      lastPlayDate: new Date()
    };
    setUserProfile(updatedProfile);

    // Save all data to localStorage
    localStorage.setItem('legoMathProfile', JSON.stringify(updatedProfile));
    localStorage.setItem('legoMathStats', JSON.stringify({
      ...stats,
      tablesCompleted: Array.from(stats.tablesCompleted)
    }));
    localStorage.setItem('legoMathBricks', JSON.stringify(bricksEarned));
    localStorage.setItem('legoMathAchievements', JSON.stringify(achievements));
    localStorage.setItem('legoMathBuilds', JSON.stringify(completedBuilds));
    localStorage.setItem('legoMathSelectedTables', JSON.stringify(selectedTables));
    
    setLastSaveTime(new Date());
  };

  const handleLogin = () => {
    if (!loginName.trim()) return;

    const newProfile: UserProfile = {
      name: loginName.trim(),
      loginDate: new Date(),
      lastPlayDate: new Date(),
      totalPlayTime: 0
    };

    setUserProfile(newProfile);
    setIsLoggedIn(true);
    setShowLoginForm(false);
    initializeAchievements();
    saveUserData();
  };

  const handleLogout = () => {
    saveUserData(); // Save before logout
    setIsLoggedIn(false);
    setUserProfile(null);
    setGameMode('menu');
    // Clear all game state
    setStats({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      totalBricks: 0,
      sessionsPlayed: 0,
      perfectRounds: 0,
      tablesCompleted: new Set()
    });
    setBricksEarned([]);
    setAchievements([]);
    setCompletedBuilds([]);
    setSelectedTables([]);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to delete all progress? This cannot be undone!')) {
      localStorage.removeItem('legoMathProfile');
      localStorage.removeItem('legoMathStats');
      localStorage.removeItem('legoMathBricks');
      localStorage.removeItem('legoMathAchievements');
      localStorage.removeItem('legoMathBuilds');
      localStorage.removeItem('legoMathSelectedTables');
      handleLogout();
    }
  };

  // Initialize achievements
  const initializeAchievements = () => {
    const initialAchievements: Achievement[] = [
      {
        id: 'first_correct',
        name: 'First Success',
        description: 'Answer your first question correctly',
        icon: '🎯',
        bricksEarned: 1,
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'streak_5',
        name: 'Hot Streak',
        description: 'Get 5 answers correct in a row',
        icon: '🔥',
        bricksEarned: 3,
        unlocked: false,
        progress: 0,
        maxProgress: 5
      },
      {
        id: 'streak_10',
        name: 'Super Streak',
        description: 'Get 10 answers correct in a row',
        icon: '⚡',
        bricksEarned: 5,
        unlocked: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'perfect_round',
        name: 'Perfect Round',
        description: 'Answer 10 questions with no mistakes',
        icon: '💎',
        bricksEarned: 4,
        unlocked: false,
        progress: 0,
        maxProgress: 10
      },
      {
        id: 'table_master_2',
        name: '2 Times Master',
        description: 'Master the 2 times table',
        icon: '🏆',
        bricksEarned: 2,
        unlocked: false,
        progress: 0,
        maxProgress: 12
      },
      {
        id: 'table_master_5',
        name: '5 Times Master',
        description: 'Master the 5 times table',
        icon: '🏆',
        bricksEarned: 2,
        unlocked: false,
        progress: 0,
        maxProgress: 12
      },
      {
        id: 'table_master_10',
        name: '10 Times Master',
        description: 'Master the 10 times table',
        icon: '🏆',
        bricksEarned: 2,
        unlocked: false,
        progress: 0,
        maxProgress: 12
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Answer 50 questions correctly',
        icon: '🚀',
        bricksEarned: 6,
        unlocked: false,
        progress: 0,
        maxProgress: 50
      },
      {
        id: 'brick_collector',
        name: 'Brick Collector',
        description: 'Collect 25 bricks',
        icon: '🧱',
        bricksEarned: 3,
        unlocked: false,
        progress: 0,
        maxProgress: 25
      },
      {
        id: 'math_champion',
        name: 'Math Champion',
        description: 'Answer 100 questions correctly',
        icon: '👑',
        bricksEarned: 10,
        unlocked: false,
        progress: 0,
        maxProgress: 100
      },
      {
        id: 'master_builder',
        name: 'Master Builder',
        description: 'Complete 5 different building projects',
        icon: '🏗️',
        bricksEarned: 8,
        unlocked: false,
        progress: 0,
        maxProgress: 5
      }
    ];
    setAchievements(initialAchievements);
  };

  const generateQuestion = (): Question => {
    const tables = selectedTables.length > 0 ? selectedTables : [1,2,3,4,5,6,7,8,9,10,11,12];
    const multiplicand = tables[Math.floor(Math.random() * tables.length)];
    const multiplier = Math.floor(Math.random() * 12) + 1;
    return {
      multiplicand,
      multiplier,
      answer: multiplicand * multiplier
    };
  };

  const addBrick = (reason: string, size: 'small' | 'normal' | 'large' = 'normal') => {
    const newBrick: BrickEarned = {
      id: Date.now().toString(),
      color: LEGO_COLORS[Math.floor(Math.random() * LEGO_COLORS.length)],
      size,
      earnedFor: reason,
      timestamp: new Date()
    };
    setBricksEarned(prev => [...prev, newBrick]);
    setStats(prev => ({ ...prev, totalBricks: prev.totalBricks + 1 }));
  };

  const checkAchievements = (newStats: GameStats) => {
    setAchievements(prev => prev.map(achievement => {
      let newProgress = achievement.progress;
      let unlocked = achievement.unlocked;

      switch (achievement.id) {
        case 'first_correct':
          newProgress = Math.min(newStats.correct, 1);
          break;
        case 'streak_5':
          newProgress = Math.min(newStats.streak, 5);
          break;
        case 'streak_10':
          newProgress = Math.min(newStats.streak, 10);
          break;
        case 'perfect_round':
          newProgress = questionsInRound >= 10 && correctInRound === questionsInRound ? 10 : 0;
          break;
        case 'speed_demon':
          newProgress = Math.min(newStats.correct, 50);
          break;
        case 'brick_collector':
          newProgress = Math.min(newStats.totalBricks, 25);
          break;
        case 'math_champion':
          newProgress = Math.min(newStats.correct, 100);
          break;
        case 'master_builder':
          newProgress = Math.min(completedBuilds.length, 5);
          break;
        case 'table_master_2':
        case 'table_master_5':
        case 'table_master_10':
          const tableNum = parseInt(achievement.id.split('_')[2]);
          newProgress = newStats.tablesCompleted.has(tableNum) ? 12 : 0;
          break;
      }

      if (newProgress >= achievement.maxProgress && !unlocked) {
        unlocked = true;
        // Award bricks for achievement
        for (let i = 0; i < achievement.bricksEarned; i++) {
          setTimeout(() => addBrick(`Achievement: ${achievement.name}`, 'large'), i * 200);
        }
        setNewAchievement(achievement);
        setTimeout(() => setNewAchievement(null), 3000);
      }

      return { ...achievement, progress: newProgress, unlocked };
    }));
  };

  const startGame = (mode: 'practice' | 'quiz' | 'challenge') => {
    setGameMode(mode);
    setCurrentQuestion(generateQuestion());
    setUserAnswer('');
    setFeedback(null);
    setShowAnswer(false);
    setQuestionsInRound(0);
    setCorrectInRound(0);
    if (mode === 'quiz' || mode === 'challenge') {
      setStats(prev => ({ 
        ...prev, 
        correct: 0, 
        incorrect: 0, 
        streak: 0,
        sessionsPlayed: prev.sessionsPlayed + 1
      }));
    }
  };

  const checkAnswer = () => {
    if (!currentQuestion) return;
    
    const isCorrect = parseInt(userAnswer) === currentQuestion.answer;
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setQuestionsInRound(prev => prev + 1);
    
    if (isCorrect) {
      setCorrectInRound(prev => prev + 1);
      const newStats = {
        ...stats,
        correct: stats.correct + 1,
        streak: stats.streak + 1,
        bestStreak: Math.max(stats.bestStreak, stats.streak + 1),
        totalBricks: stats.totalBricks + 1
      };
      setStats(newStats);
      
      // Add brick for correct answer
      addBrick(`Correct: ${currentQuestion.multiplicand} × ${currentQuestion.multiplier}`);
      
      // Check for table mastery
      const newTablesCompleted = new Set(stats.tablesCompleted);
      // Simple logic: if they get 5 questions right for a table, mark as completed
      if (stats.streak >= 5) {
        newTablesCompleted.add(currentQuestion.multiplicand);
        setStats(prev => ({ ...prev, tablesCompleted: newTablesCompleted }));
      }
      
      checkAchievements({ ...newStats, tablesCompleted: newTablesCompleted });
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1, streak: 0 }));
    }
    
    setTimeout(() => {
      setCurrentQuestion(generateQuestion());
      setUserAnswer('');
      setFeedback(null);
      setShowAnswer(false);
    }, 1500);
  };

  const revealAnswer = () => {
    setShowAnswer(true);
  };

  const resetStats = () => {
    setStats({
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      totalBricks: 0,
      sessionsPlayed: 0,
      perfectRounds: 0,
      tablesCompleted: new Set()
    });
    setBricksEarned([]);
    setCompletedBuilds([]);
    setAchievements(prev => prev.map(a => ({ ...a, unlocked: false, progress: 0 })));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer && !feedback) {
      checkAnswer();
    }
  };

  const toggleTable = (table: number) => {
    setSelectedTables(prev => 
      prev.includes(table) 
        ? prev.filter(t => t !== table)
        : [...prev, table]
    );
  };

  const buildModel = (model: BuildingModel) => {
    if (stats.totalBricks < model.bricksRequired) {
      alert(`You need ${model.bricksRequired} bricks to build this! You have ${stats.totalBricks} bricks.`);
      return;
    }

    setBuildingInProgress(true);
    
    // Simulate building process
    setTimeout(() => {
      const newBuild: CompletedBuild = {
        id: Date.now().toString(),
        modelId: model.id,
        completedAt: new Date(),
        bricksUsed: model.bricksRequired
      };
      
      setCompletedBuilds(prev => [...prev, newBuild]);
      setStats(prev => ({ ...prev, totalBricks: prev.totalBricks - model.bricksRequired }));
      
      // Remove used bricks from collection
      setBricksEarned(prev => prev.slice(0, -model.bricksRequired));
      
      // Award bonus bricks for completing build
      const bonusBricks = Math.floor(model.bricksRequired * 0.2);
      for (let i = 0; i < bonusBricks; i++) {
        setTimeout(() => addBrick(`Building Bonus: ${model.name}`, 'large'), i * 100);
      }
      
      setBuildingInProgress(false);
      setSelectedModel(null);
      
      // Check achievements
      checkAchievements(stats);
      
      alert(`🎉 Congratulations! You built a ${model.name}! You earned ${bonusBricks} bonus bricks!`);
    }, 2000);
  };

  useEffect(() => {
    if (gameMode === 'practice' && !currentQuestion) {
      setCurrentQuestion(generateQuestion());
    }
  }, [gameMode, selectedTables]);

  const LegoBrick = ({ color, size = 'normal', className = '' }: { 
    color: string; 
    size?: 'small' | 'normal' | 'large';
    className?: string;
  }) => {
    const sizeClasses = {
      small: 'w-6 h-4',
      normal: 'w-8 h-6',
      large: 'w-12 h-8'
    };
    
    const studCount = {
      small: 1,
      normal: 2,
      large: 4
    };
    
    return (
      <div className={`${color} ${sizeClasses[size]} rounded-lg shadow-lg relative border-2 border-white/20 ${className}`}>
        <div className={`absolute inset-1 grid ${studCount[size] === 1 ? 'grid-cols-1' : studCount[size] === 2 ? 'grid-cols-2' : 'grid-cols-2'} gap-1`}>
          {Array.from({ length: studCount[size] }).map((_, i) => (
            <div key={i} className="bg-white/30 rounded-full"></div>
          ))}
        </div>
      </div>
    );
  };

  const BrickStack = ({ count }: { count: number }) => (
    <div className="flex flex-col-reverse items-center space-y-reverse space-y-1">
      {Array.from({ length: Math.min(count, 10) }).map((_, i) => (
        <LegoBrick key={i} color={LEGO_COLORS[i % LEGO_COLORS.length]} />
      ))}
      {count > 10 && (
        <div className="text-white font-bold text-sm bg-black/50 rounded px-2 py-1">
          +{count - 10}
        </div>
      )}
    </div>
  );

  const ModelPattern = ({ pattern }: { pattern: BuildingModel['pattern'] }) => (
    <div className="flex flex-col items-center space-y-1">
      {pattern.map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-1">
          {row.map((brick, brickIndex) => (
            <LegoBrick 
              key={brickIndex} 
              color={brick.color} 
              size={brick.size}
              className="transform scale-75"
            />
          ))}
        </div>
      ))}
    </div>
  );

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🧱 LEGO Math Master 🧱
            </h1>
            <p className="text-xl text-white/90">Build your multiplication skills, one brick at a time!</p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            {!showLoginForm ? (
              <div className="text-center">
                <User className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back!</h2>
                <p className="text-gray-600 mb-6">Ready to continue your Lego math adventure?</p>
                
                <div className="space-y-4">
                  <button
                    onClick={() => setShowLoginForm(true)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
                  >
                    Start Playing
                  </button>
                  
                  {localStorage.getItem('legoMathProfile') && (
                    <button
                      onClick={loadUserData}
                      className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
                    >
                      Continue Previous Game
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">What's your name?</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                    autoFocus
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleLogin}
                      disabled={!loginName.trim()}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
                    >
                      Let's Play!
                    </button>
                    <button
                      onClick={() => setShowLoginForm(false)}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold text-lg transition-colors shadow-lg"
                    >
                      Back
                    </button>
                  </div>
                </div>
              </div>
            )}

            {localStorage.getItem('legoMathProfile') && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={clearAllData}
                  className="w-full text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear All Saved Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'builder') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => setGameMode('menu')}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              ← Back to Menu
            </button>
            <h1 className="text-4xl font-bold text-white">🏗️ Lego Builder Workshop 🏗️</h1>
            <div className="text-white text-right">
              <div className="text-2xl font-bold">{stats.totalBricks}</div>
              <div className="text-sm">Available Bricks</div>
            </div>
          </div>

          {selectedModel ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Building: {selectedModel.name}</h2>
              <div className="mb-6">
                <ModelPattern pattern={selectedModel.pattern} />
              </div>
              <p className="text-gray-600 mb-6">{selectedModel.description}</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => buildModel(selectedModel)}
                  disabled={buildingInProgress || stats.totalBricks < selectedModel.bricksRequired}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-colors shadow-lg"
                >
                  {buildingInProgress ? '🔨 Building...' : `Build Now (${selectedModel.bricksRequired} bricks)`}
                </button>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-colors shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Available Models */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  🧱 Available Models
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {BUILDING_MODELS.map(model => (
                    <div 
                      key={model.id}
                      onClick={() => setSelectedModel(model)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-105 ${
                        stats.totalBricks >= model.bricksRequired
                          ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{model.icon}</div>
                          <div>
                            <h3 className={`font-bold ${stats.totalBricks >= model.bricksRequired ? 'text-green-800' : 'text-gray-600'}`}>
                              {model.name}
                            </h3>
                            <p className="text-sm text-gray-600">{model.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                model.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                                model.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-red-200 text-red-800'
                              }`}>
                                {model.difficulty.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${stats.totalBricks >= model.bricksRequired ? 'text-green-600' : 'text-red-600'}`}>
                            {model.bricksRequired} 🧱
                          </div>
                          {stats.totalBricks >= model.bricksRequired ? (
                            <div className="text-green-600 text-sm">✓ Can Build</div>
                          ) : (
                            <div className="text-red-600 text-sm">Need {model.bricksRequired - stats.totalBricks} more</div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <ModelPattern pattern={model.pattern} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Builds */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  🏆 My Completed Builds
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {completedBuilds.map(build => {
                    const model = BUILDING_MODELS.find(m => m.id === build.modelId);
                    return (
                      <div key={build.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">{model?.icon}</div>
                          <div>
                            <div className="font-bold text-gray-800">{model?.name}</div>
                            <div className="text-xs text-gray-500">
                              Built on {build.completedAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          Used {build.bricksUsed} bricks
                        </div>
                      </div>
                    );
                  })}
                  {completedBuilds.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No builds completed yet!</p>
                      <p className="text-sm">Start building your first model!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Building Tips */}
          <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
              🎯 Building Tips
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-2">📚</div>
                <h3 className="font-bold text-blue-800">Practice More</h3>
                <p className="text-sm text-blue-600">Answer multiplication questions to earn more bricks!</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl mb-2">🏗️</div>
                <h3 className="font-bold text-green-800">Start Small</h3>
                <p className="text-sm text-green-600">Begin with easy models and work your way up!</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-2">🎁</div>
                <h3 className="font-bold text-purple-800">Bonus Bricks</h3>
                <p className="text-sm text-purple-600">Complete builds to earn bonus bricks!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'collection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-600 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button 
              onClick={() => setGameMode('menu')}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              ← Back to Menu
            </button>
            <h1 className="text-4xl font-bold text-white">🧱 My Brick Collection 🧱</h1>
            <div className="text-white text-right">
              <div className="text-2xl font-bold">{stats.totalBricks}</div>
              <div className="text-sm">Total Bricks</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Achievements Section */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
                Achievements
              </h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      achievement.unlocked 
                        ? 'bg-yellow-50 border-yellow-300 shadow-lg' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{achievement.icon}</span>
                        <div>
                          <h3 className={`font-bold ${achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'}`}>
                            {achievement.name}
                          </h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${achievement.unlocked ? 'text-yellow-600' : 'text-gray-400'}`}>
                          +{achievement.bricksEarned} 🧱
                        </div>
                        {achievement.unlocked && <div className="text-green-600 text-sm">✓ Unlocked</div>}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          achievement.unlocked ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {achievement.progress}/{achievement.maxProgress}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brick Collection Section */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <Package className="w-6 h-6 mr-2 text-blue-600" />
                Recent Bricks Earned
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {bricksEarned.slice(-20).reverse().map(brick => (
                  <div key={brick.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <LegoBrick color={brick.color} size={brick.size} className="mr-3" />
                      <div>
                        <div className="font-medium text-gray-800">{brick.earnedFor}</div>
                        <div className="text-xs text-gray-500">
                          {brick.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {brick.size} brick
                    </div>
                  </div>
                ))}
                {bricksEarned.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No bricks earned yet!</p>
                    <p className="text-sm">Start playing to collect your first brick!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Brick Display Area */}
          <div className="mt-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🏗️ Your Brick Tower 🏗️
            </h2>
            <div className="flex justify-center items-end space-x-2 min-h-32">
              {Array.from({ length: Math.min(Math.ceil(stats.totalBricks / 5), 10) }).map((_, stackIndex) => {
                const bricksInStack = Math.min(5, Math.max(0, stats.totalBricks - stackIndex * 5));
                return (
                  <div key={stackIndex} className="flex flex-col-reverse items-center space-y-reverse space-y-1">
                    {Array.from({ length: bricksInStack }).map((_, brickIndex) => {
                      const brickData = bricksEarned[stackIndex * 5 + brickIndex];
                      return (
                        <LegoBrick 
                          key={brickIndex} 
                          color={brickData?.color || LEGO_COLORS[brickIndex % LEGO_COLORS.length]}
                          size={brickData?.size || 'normal'}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
            {stats.totalBricks > 50 && (
              <div className="text-center mt-4 text-gray-600">
                <p className="font-bold">Amazing! You have {stats.totalBricks} bricks!</p>
                <p className="text-sm">Only showing the first 50 bricks in your tower</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header with User Info */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-white">
              <h2 className="text-2xl font-bold">Welcome back, {userProfile?.name}! 👋</h2>
              <p className="text-white/80">
                Last played: {userProfile?.lastPlayDate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {lastSaveTime && (
                <div className="text-white/80 text-sm flex items-center">
                  <Save className="w-4 h-4 mr-1" />
                  Saved {lastSaveTime.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={saveUserData}
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Progress
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-red-600/80 transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🧱 LEGO Math Master 🧱
            </h1>
            <p className="text-xl text-white/90 mb-8">Build your multiplication skills, one brick at a time!</p>
            
            <div className="flex justify-center space-x-4 mb-8">
              <BrickStack count={3} />
              <BrickStack count={5} />
              <BrickStack count={2} />
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div 
              onClick={() => startGame('practice')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer hover:scale-105 transition-transform shadow-2xl hover:shadow-blue-500/25"
            >
              <div className="text-center">
                <Play className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Practice Mode</h3>
                <p className="text-gray-600">Learn at your own pace with instant feedback</p>
              </div>
            </div>

            <div 
              onClick={() => startGame('quiz')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer hover:scale-105 transition-transform shadow-2xl hover:shadow-green-500/25"
            >
              <div className="text-center">
                <Star className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Quick Quiz</h3>
                <p className="text-gray-600">Test your knowledge with random questions</p>
              </div>
            </div>

            <div 
              onClick={() => startGame('challenge')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer hover:scale-105 transition-transform shadow-2xl hover:shadow-red-500/25"
            >
              <div className="text-center">
                <Trophy className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Challenge Mode</h3>
                <p className="text-gray-600">Beat your best streak!</p>
              </div>
            </div>

            <div 
              onClick={() => setGameMode('collection')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer hover:scale-105 transition-transform shadow-2xl hover:shadow-purple-500/25"
            >
              <div className="text-center">
                <Package className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">My Collection</h3>
                <p className="text-gray-600">View all your earned bricks and achievements</p>
              </div>
            </div>

            <div 
              onClick={() => setGameMode('builder')}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 cursor-pointer hover:scale-105 transition-transform shadow-2xl hover:shadow-orange-500/25"
            >
              <div className="text-center">
                <Home className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Builder Workshop</h3>
                <p className="text-gray-600">Use your bricks to build amazing models!</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Your Progress</h3>
              <button 
                onClick={resetStats}
                className="text-gray-500 hover:text-gray-700"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.bestStreak}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalBricks}</div>
                <div className="text-sm text-gray-600">Total Bricks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{achievements.filter(a => a.unlocked).length}</div>
                <div className="text-sm text-gray-600">Achievements</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-teal-600">{completedBuilds.length}</div>
                <div className="text-sm text-gray-600">Builds</div>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Table Selection</h3>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            {showSettings && (
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(table => (
                  <button
                    key={table}
                    onClick={() => toggleTable(table)}
                    className={`p-2 rounded-lg font-bold transition-colors ${
                      selectedTables.includes(table) || selectedTables.length === 0
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {table}
                  </button>
                ))}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              {selectedTables.length === 0 ? 'All tables selected' : `${selectedTables.length} table(s) selected`}
            </p>
          </div>
        </div>

        {/* Achievement Notification */}
        {newAchievement && (
          <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 p-4 rounded-lg shadow-lg animate-bounce z-50">
            <div className="flex items-center">
              <span className="text-2xl mr-2">{newAchievement.icon}</span>
              <div>
                <div className="font-bold">Achievement Unlocked!</div>
                <div className="text-sm">{newAchievement.name}</div>
                <div className="text-xs">+{newAchievement.bricksEarned} bricks earned!</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => setGameMode('menu')}
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
          >
            ← Back to Menu
          </button>
          <div className="text-white text-center">
            <div className="text-lg font-bold capitalize">{gameMode} Mode</div>
            <div className="flex items-center space-x-4 mt-1">
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Streak: {stats.streak}
              </span>
              <span>Score: {stats.correct}/{stats.correct + stats.incorrect}</span>
              <span className="flex items-center">
                <Package className="w-4 h-4 mr-1" />
                Bricks: {stats.totalBricks}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setGameMode('collection')}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Collection
            </button>
            <button 
              onClick={() => setGameMode('builder')}
              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              Builder
            </button>
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-12 shadow-2xl text-center">
            <div className="mb-8">
              <div className="text-8xl font-bold text-gray-800 mb-4">
                {currentQuestion.multiplicand} × {currentQuestion.multiplier} = ?
              </div>
              
              {feedback === 'correct' && (
                <div className="animate-bounce text-6xl">🎉</div>
              )}
              
              {feedback === 'incorrect' && (
                <div className="animate-pulse text-6xl">😅</div>
              )}
            </div>

            <div className="space-y-6">
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-32 h-16 text-4xl font-bold text-center border-4 border-blue-300 rounded-2xl focus:border-blue-500 focus:outline-none"
                placeholder="?"
                disabled={feedback !== null}
              />

              <div className="flex justify-center space-x-4">
                <button
                  onClick={checkAnswer}
                  disabled={!userAnswer || feedback !== null}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-colors shadow-lg"
                >
                  Check Answer
                </button>
                
                {gameMode === 'practice' && (
                  <button
                    onClick={revealAnswer}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-xl transition-colors shadow-lg"
                  >
                    Show Answer
                  </button>
                )}
              </div>

              {showAnswer && (
                <div className="text-4xl font-bold text-blue-600 animate-pulse">
                  Answer: {currentQuestion.answer}
                </div>
              )}

              {feedback && (
                <div className={`text-2xl font-bold ${feedback === 'correct' ? 'text-green-600' : 'text-red-600'}`}>
                  {feedback === 'correct' ? '🎉 Correct! Well done! +1 Brick!' : `😅 Oops! The answer was ${currentQuestion.answer}`}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <BrickStack count={stats.streak} />
        </div>
      </div>

      {/* Achievement Notification */}
      {newAchievement && (
        <div className="fixed top-4 right-4 bg-yellow-400 text-yellow-900 p-4 rounded-lg shadow-lg animate-bounce z-50">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{newAchievement.icon}</span>
            <div>
              <div className="font-bold">Achievement Unlocked!</div>
              <div className="text-sm">{newAchievement.name}</div>
              <div className="text-xs">+{newAchievement.bricksEarned} bricks earned!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

export default App