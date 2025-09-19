import { Course, Lesson } from '@/types'

const createLessons = (count: number, type: 'video' | 'text' | 'quiz' | 'exercise' = 'video'): Lesson[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `lesson-${i + 1}`,
    title: `Lesson ${i + 1}: ${type === 'video' ? 'Video Tutorial' : type === 'quiz' ? 'Knowledge Check' : type === 'exercise' ? 'Hands-on Exercise' : 'Reading Material'}`,
    type,
    duration: type === 'video' ? `${Math.floor(Math.random() * 20) + 5} min` : type === 'quiz' ? '10 min' : type === 'exercise' ? '30 min' : '15 min',
    completed: false
  }))
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    description: 'A comprehensive introduction to machine learning concepts, algorithms, and practical applications. Perfect for beginners looking to enter the field of AI.',
    instructor: 'Dr. Sarah Chen',
    level: 'beginner',
    duration: '8 weeks',
    rating: 4.8,
    enrollmentCount: 15420,
    price: 0,
    isFree: true,
    thumbnail: '/images/courses/ml-fundamentals.jpg',
    category: 'Machine Learning',
    skills: ['Python', 'Scikit-learn', 'Data Analysis', 'Statistics'],
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to Machine Learning',
        description: 'Understanding the basics of ML and its applications',
        duration: '2 weeks',
        lessons: createLessons(6, 'video')
      },
      {
        id: 'module-2',
        title: 'Supervised Learning',
        description: 'Classification and regression algorithms',
        duration: '3 weeks',
        lessons: [...createLessons(8, 'video'), ...createLessons(2, 'exercise')]
      },
      {
        id: 'module-3',
        title: 'Unsupervised Learning',
        description: 'Clustering and dimensionality reduction',
        duration: '2 weeks',
        lessons: [...createLessons(5, 'video'), ...createLessons(1, 'quiz')]
      },
      {
        id: 'module-4',
        title: 'Model Evaluation and Deployment',
        description: 'Testing, validating, and deploying ML models',
        duration: '1 week',
        lessons: [...createLessons(4, 'video'), ...createLessons(2, 'exercise')]
      }
    ]
  },
  {
    id: '2',
    title: 'Deep Learning with PyTorch',
    description: 'Master deep learning concepts and build neural networks using PyTorch. Covers CNNs, RNNs, and advanced architectures.',
    instructor: 'Prof. Michael Rodriguez',
    level: 'intermediate',
    duration: '12 weeks',
    rating: 4.9,
    enrollmentCount: 8930,
    price: 199,
    isFree: false,
    thumbnail: '/images/courses/pytorch-deep-learning.jpg',
    category: 'Deep Learning',
    skills: ['PyTorch', 'Neural Networks', 'CNN', 'RNN', 'GPU Computing'],
    modules: [
      {
        id: 'module-1',
        title: 'PyTorch Fundamentals',
        description: 'Getting started with PyTorch tensors and operations',
        duration: '2 weeks',
        lessons: createLessons(8, 'video')
      },
      {
        id: 'module-2',
        title: 'Neural Network Basics',
        description: 'Building your first neural networks',
        duration: '3 weeks',
        lessons: [...createLessons(10, 'video'), ...createLessons(3, 'exercise')]
      },
      {
        id: 'module-3',
        title: 'Convolutional Neural Networks',
        description: 'Image classification and computer vision',
        duration: '4 weeks',
        lessons: [...createLessons(12, 'video'), ...createLessons(4, 'exercise')]
      },
      {
        id: 'module-4',
        title: 'Recurrent Neural Networks',
        description: 'Sequence modeling and NLP applications',
        duration: '3 weeks',
        lessons: [...createLessons(9, 'video'), ...createLessons(2, 'exercise')]
      }
    ]
  },
  {
    id: '3',
    title: 'Natural Language Processing with Transformers',
    description: 'Learn state-of-the-art NLP techniques using transformer models like BERT, GPT, and T5. Includes hands-on projects.',
    instructor: 'Dr. Emily Watson',
    level: 'advanced',
    duration: '10 weeks',
    rating: 4.7,
    enrollmentCount: 5670,
    price: 299,
    isFree: false,
    thumbnail: '/images/courses/nlp-transformers.jpg',
    category: 'Natural Language Processing',
    skills: ['Transformers', 'BERT', 'GPT', 'Hugging Face', 'Text Processing'],
    modules: [
      {
        id: 'module-1',
        title: 'NLP Foundations',
        description: 'Text preprocessing and traditional NLP methods',
        duration: '2 weeks',
        lessons: createLessons(7, 'video')
      },
      {
        id: 'module-2',
        title: 'Transformer Architecture',
        description: 'Understanding attention mechanisms and transformers',
        duration: '3 weeks',
        lessons: [...createLessons(11, 'video'), ...createLessons(2, 'exercise')]
      },
      {
        id: 'module-3',
        title: 'Pre-trained Models',
        description: 'Working with BERT, GPT, and other pre-trained models',
        duration: '3 weeks',
        lessons: [...createLessons(10, 'video'), ...createLessons(3, 'exercise')]
      },
      {
        id: 'module-4',
        title: 'Advanced Applications',
        description: 'Fine-tuning and building NLP applications',
        duration: '2 weeks',
        lessons: [...createLessons(6, 'video'), ...createLessons(2, 'exercise')]
      }
    ]
  },
  {
    id: '4',
    title: 'Computer Vision Essentials',
    description: 'Comprehensive course on computer vision techniques, from basic image processing to advanced deep learning models.',
    instructor: 'Dr. James Liu',
    level: 'intermediate',
    duration: '9 weeks',
    rating: 4.6,
    enrollmentCount: 7240,
    price: 149,
    isFree: false,
    thumbnail: '/images/courses/computer-vision.jpg',
    category: 'Computer Vision',
    skills: ['OpenCV', 'Image Processing', 'Object Detection', 'CNN', 'YOLO'],
    modules: [
      {
        id: 'module-1',
        title: 'Image Processing Basics',
        description: 'Fundamental image operations and filters',
        duration: '2 weeks',
        lessons: createLessons(8, 'video')
      },
      {
        id: 'module-2',
        title: 'Feature Detection',
        description: 'Edge detection, corner detection, and feature matching',
        duration: '2 weeks',
        lessons: [...createLessons(7, 'video'), ...createLessons(2, 'exercise')]
      },
      {
        id: 'module-3',
        title: 'Deep Learning for Vision',
        description: 'CNNs for image classification and object detection',
        duration: '4 weeks',
        lessons: [...createLessons(14, 'video'), ...createLessons(4, 'exercise')]
      },
      {
        id: 'module-4',
        title: 'Advanced Applications',
        description: 'Semantic segmentation, face recognition, and more',
        duration: '1 week',
        lessons: [...createLessons(5, 'video'), ...createLessons(1, 'exercise')]
      }
    ]
  },
  {
    id: '5',
    title: 'AI Ethics and Responsible AI',
    description: 'Understanding the ethical implications of AI systems and how to build responsible AI applications.',
    instructor: 'Prof. Angela Davis',
    level: 'beginner',
    duration: '6 weeks',
    rating: 4.8,
    enrollmentCount: 12350,
    price: 0,
    isFree: true,
    thumbnail: '/images/courses/ai-ethics.jpg',
    category: 'AI Ethics',
    skills: ['Ethics', 'Bias Detection', 'Fairness', 'Transparency', 'Governance'],
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to AI Ethics',
        description: 'Why ethics matter in AI development',
        duration: '1 week',
        lessons: createLessons(4, 'video')
      },
      {
        id: 'module-2',
        title: 'Bias and Fairness',
        description: 'Identifying and mitigating bias in AI systems',
        duration: '2 weeks',
        lessons: [...createLessons(8, 'video'), ...createLessons(2, 'quiz')]
      },
      {
        id: 'module-3',
        title: 'Transparency and Explainability',
        description: 'Making AI systems interpretable and transparent',
        duration: '2 weeks',
        lessons: [...createLessons(7, 'video'), ...createLessons(1, 'exercise')]
      },
      {
        id: 'module-4',
        title: 'Governance and Regulation',
        description: 'Legal and regulatory frameworks for AI',
        duration: '1 week',
        lessons: [...createLessons(5, 'video'), ...createLessons(1, 'quiz')]
      }
    ]
  },
  {
    id: '6',
    title: 'Reinforcement Learning Fundamentals',
    description: 'Learn the principles of reinforcement learning and build intelligent agents that can learn from interaction.',
    instructor: 'Dr. Robert Kim',
    level: 'advanced',
    duration: '11 weeks',
    rating: 4.5,
    enrollmentCount: 4890,
    price: 249,
    isFree: false,
    thumbnail: '/images/courses/reinforcement-learning.jpg',
    category: 'Reinforcement Learning',
    skills: ['Q-Learning', 'Policy Gradients', 'Deep RL', 'Multi-Agent Systems', 'Game Theory'],
    modules: [
      {
        id: 'module-1',
        title: 'RL Foundations',
        description: 'Markov Decision Processes and basic concepts',
        duration: '2 weeks',
        lessons: createLessons(8, 'video')
      },
      {
        id: 'module-2',
        title: 'Value-Based Methods',
        description: 'Q-Learning and temporal difference learning',
        duration: '3 weeks',
        lessons: [...createLessons(11, 'video'), ...createLessons(3, 'exercise')]
      },
      {
        id: 'module-3',
        title: 'Policy-Based Methods',
        description: 'Policy gradients and actor-critic methods',
        duration: '3 weeks',
        lessons: [...createLessons(12, 'video'), ...createLessons(3, 'exercise')]
      },
      {
        id: 'module-4',
        title: 'Deep Reinforcement Learning',
        description: 'DQN, PPO, and advanced deep RL algorithms',
        duration: '3 weeks',
        lessons: [...createLessons(10, 'video'), ...createLessons(4, 'exercise')]
      }
    ]
  }
]

export const courseCategories = [
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Reinforcement Learning',
  'AI Ethics',
  'Data Science',
  'MLOps'
]