import { AITool, ResearchPaper, Course, NewsArticle } from '../types'

// AI Tools Data
export const aiTools: AITool[] = [
  {
    id: '1',
    name: 'ChatGPT',
    description: 'Advanced conversational AI powered by GPT-4, capable of understanding and generating human-like text for various applications.',
    category: 'Language Models',
    subcategory: 'Conversational AI',
    pricing: 'freemium',
    priceRange: '$0-20/month',
    rating: 4.8,
    reviewCount: 15420,
    features: [
      'Natural language processing',
      'Code generation',
      'Creative writing',
      'Question answering',
      'Language translation',
      'Text summarization'
    ],
    website: 'https://chat.openai.com',
    logo: '/logos/chatgpt.png',
    tags: ['NLP', 'GPT', 'Conversational AI', 'OpenAI'],
    createdAt: new Date('2022-11-30'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'TensorFlow',
    description: 'Open-source machine learning framework for building and deploying ML models across platforms.',
    category: 'Machine Learning',
    subcategory: 'Framework',
    pricing: 'free',
    rating: 4.6,
    reviewCount: 8930,
    features: [
      'Neural networks',
      'Deep learning',
      'Model deployment',
      'Cross-platform support',
      'Visualization tools',
      'Production ready'
    ],
    website: 'https://tensorflow.org',
    logo: '/logos/tensorflow.png',
    tags: ['Machine Learning', 'Deep Learning', 'Google', 'Open Source'],
    createdAt: new Date('2015-11-09'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Midjourney',
    description: 'AI-powered image generation tool that creates stunning artwork from text descriptions.',
    category: 'Image Generation',
    subcategory: 'Art Creation',
    pricing: 'paid',
    priceRange: '$10-60/month',
    rating: 4.7,
    reviewCount: 12350,
    features: [
      'Text-to-image generation',
      'High-quality artwork',
      'Style variations',
      'Upscaling',
      'Community gallery',
      'Discord integration'
    ],
    website: 'https://midjourney.com',
    logo: '/logos/midjourney.png',
    tags: ['Image Generation', 'Art', 'Creative AI', 'Discord'],
    createdAt: new Date('2022-07-12'),
    updatedAt: new Date('2024-01-12')
  },
  {
    id: '4',
    name: 'GitHub Copilot',
    description: 'AI pair programmer that helps you write code faster with intelligent suggestions.',
    category: 'Development',
    subcategory: 'Code Assistant',
    pricing: 'paid',
    priceRange: '$10-19/month',
    rating: 4.5,
    reviewCount: 9870,
    features: [
      'Code completion',
      'Function generation',
      'Multiple languages',
      'IDE integration',
      'Context awareness',
      'Documentation generation'
    ],
    website: 'https://github.com/features/copilot',
    logo: '/logos/copilot.png',
    tags: ['Code Assistant', 'GitHub', 'Programming', 'AI'],
    createdAt: new Date('2021-06-29'),
    updatedAt: new Date('2024-01-08')
  },
  {
    id: '5',
    name: 'Stable Diffusion',
    description: 'Open-source text-to-image model that generates detailed images from text descriptions.',
    category: 'Image Generation',
    subcategory: 'Text-to-Image',
    pricing: 'free',
    rating: 4.4,
    reviewCount: 7650,
    features: [
      'Text-to-image generation',
      'Open source',
      'Customizable models',
      'Local deployment',
      'High resolution output',
      'Style transfer'
    ],
    website: 'https://stability.ai',
    logo: '/logos/stable-diffusion.png',
    tags: ['Image Generation', 'Open Source', 'Stability AI', 'Diffusion'],
    createdAt: new Date('2022-08-22'),
    updatedAt: new Date('2024-01-05')
  }
]

// Research Papers Data
export const researchPapers: ResearchPaper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
    category: 'Natural Language Processing',
    publishedDate: new Date('2017-06-12'),
    citationCount: 45230,
    arxivId: '1706.03762',
    tags: ['Transformer', 'Attention', 'NLP', 'Neural Networks']
  },
  {
    id: '2',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder...',
    category: 'Natural Language Processing',
    publishedDate: new Date('2018-10-11'),
    citationCount: 38920,
    arxivId: '1810.04805',
    tags: ['BERT', 'Language Model', 'Pre-training', 'Bidirectional']
  },
  {
    id: '3',
    title: 'GPT-3: Language Models are Few-Shot Learners',
    authors: ['Tom B. Brown', 'Benjamin Mann', 'Nick Ryder', 'Melanie Subbiah'],
    abstract: 'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training...',
    category: 'Natural Language Processing',
    publishedDate: new Date('2020-05-28'),
    citationCount: 28450,
    arxivId: '2005.14165',
    tags: ['GPT-3', 'Few-shot Learning', 'Language Model', 'OpenAI']
  },
  {
    id: '4',
    title: 'Diffusion Models Beat GANs on Image Synthesis',
    authors: ['Prafulla Dhariwal', 'Alex Nichol'],
    abstract: 'We show that diffusion models can achieve image sample quality superior to the current state-of-the-art...',
    category: 'Computer Vision',
    publishedDate: new Date('2021-05-11'),
    citationCount: 12890,
    arxivId: '2105.05233',
    tags: ['Diffusion Models', 'Image Synthesis', 'GANs', 'Computer Vision']
  }
]

// News Articles Data
export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'OpenAI Announces GPT-4 Turbo with Enhanced Capabilities',
    summary: 'OpenAI releases GPT-4 Turbo with improved performance, longer context window, and reduced costs.',
    content: 'OpenAI has announced the release of GPT-4 Turbo, featuring significant improvements...',
    author: 'Sarah Chen',
    publishedDate: new Date('2024-01-15'),
    category: 'AI News',
    tags: ['OpenAI', 'GPT-4', 'Language Models', 'AI'],
    imageUrl: '/news/gpt4-turbo.jpg',
    sourceUrl: 'https://openai.com/blog/gpt-4-turbo',
    readTime: 5
  },
  {
    id: '2',
    title: 'Google Introduces Gemini: A New Era of AI Models',
    summary: 'Google unveils Gemini, its most capable AI model designed to be multimodal from the ground up.',
    content: 'Google has introduced Gemini, a new family of AI models that represents a significant leap...',
    author: 'Michael Rodriguez',
    publishedDate: new Date('2024-01-12'),
    category: 'AI News',
    tags: ['Google', 'Gemini', 'Multimodal AI', 'AI Models'],
    imageUrl: '/news/gemini.jpg',
    sourceUrl: 'https://blog.google/technology/ai/google-gemini-ai',
    readTime: 7
  },
  {
    id: '3',
    title: 'Meta Releases Code Llama: AI Assistant for Programming',
    summary: 'Meta open-sources Code Llama, a specialized version of Llama 2 designed for code generation.',
    content: 'Meta has released Code Llama, an AI model specifically trained for programming tasks...',
    author: 'Emily Watson',
    publishedDate: new Date('2024-01-10'),
    category: 'Development',
    tags: ['Meta', 'Code Llama', 'Programming', 'Open Source'],
    imageUrl: '/news/code-llama.jpg',
    sourceUrl: 'https://ai.meta.com/blog/code-llama-large-language-model-coding',
    readTime: 6
  },
  {
    id: '4',
    title: 'AI Safety Summit 2024: Global Leaders Discuss AI Governance',
    summary: 'World leaders and AI experts gather to discuss the future of AI safety and regulation.',
    content: 'The AI Safety Summit 2024 brought together government officials, researchers, and industry leaders...',
    author: 'David Kim',
    publishedDate: new Date('2024-01-08'),
    category: 'AI Policy',
    tags: ['AI Safety', 'Governance', 'Policy', 'Summit'],
    imageUrl: '/news/ai-safety-summit.jpg',
    sourceUrl: 'https://aisafetysummit.gov.uk',
    readTime: 8
  }
]

// Courses Data
export const courses: Course[] = [
  {
    id: '1',
    title: 'Machine Learning Fundamentals',
    description: 'Learn the basics of machine learning with hands-on projects and real-world applications.',
    instructor: 'Dr. Andrew Ng',
    level: 'beginner',
    duration: '6 weeks',
    rating: 4.8,
    enrollmentCount: 125000,
    price: 49,
    isFree: false,
    thumbnail: '/courses/ml-fundamentals.jpg',
    category: 'Machine Learning',
    skills: ['Python', 'Scikit-learn', 'Data Analysis', 'Statistics'],
    modules: [
      {
        id: '1',
        title: 'Introduction to Machine Learning',
        description: 'Overview of ML concepts and applications',
        duration: '2 hours',
        lessons: [
          { id: '1', title: 'What is Machine Learning?', type: 'video', duration: '15 min' },
          { id: '2', title: 'Types of ML Algorithms', type: 'video', duration: '20 min' },
          { id: '3', title: 'ML Applications Quiz', type: 'quiz' }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Deep Learning with PyTorch',
    description: 'Master deep learning concepts and build neural networks using PyTorch framework.',
    instructor: 'Prof. Fei-Fei Li',
    level: 'intermediate',
    duration: '8 weeks',
    rating: 4.7,
    enrollmentCount: 89000,
    price: 79,
    isFree: false,
    thumbnail: '/courses/pytorch-deep-learning.jpg',
    category: 'Deep Learning',
    skills: ['PyTorch', 'Neural Networks', 'Computer Vision', 'NLP'],
    modules: [
      {
        id: '1',
        title: 'PyTorch Basics',
        description: 'Getting started with PyTorch',
        duration: '3 hours',
        lessons: [
          { id: '1', title: 'Installing PyTorch', type: 'video', duration: '10 min' },
          { id: '2', title: 'Tensors and Operations', type: 'video', duration: '25 min' },
          { id: '3', title: 'Building Your First Model', type: 'exercise' }
        ]
      }
    ]
  }
]

// Categories
export const toolCategories = [
  'Language Models',
  'Machine Learning',
  'Image Generation',
  'Development',
  'Computer Vision',
  'Natural Language Processing',
  'Audio Processing',
  'Data Analysis',
  'Automation',
  'Robotics'
]

export const paperCategories = [
  'Natural Language Processing',
  'Computer Vision',
  'Machine Learning',
  'Deep Learning',
  'Reinforcement Learning',
  'AI Safety',
  'Robotics',
  'Speech Recognition',
  'Generative AI',
  'Multimodal AI'
]

export const courseCategories = [
  'Machine Learning',
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Data Science',
  'AI Ethics',
  'Robotics',
  'Programming',
  'Mathematics',
  'Statistics'
]

export const newsCategories = [
  'AI News',
  'Research',
  'Industry',
  'Policy',
  'Technology',
  'Startups',
  'Investment',
  'Ethics',
  'Education',
  'Career'
]