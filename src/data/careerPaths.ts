import { CareerPath, Skill, RoadmapStep } from '@/types'

const createSkills = (names: string[], category: 'technical' | 'soft' | 'domain', importance: 'essential' | 'recommended' | 'nice-to-have'): Skill[] => {
  return names.map((name, index) => ({
    id: `skill-${index + 1}`,
    name,
    category,
    importance,
    resources: [`Course: ${name} Fundamentals`, `Book: Mastering ${name}`, `Tutorial: ${name} in Practice`]
  }))
}

const createRoadmapSteps = (steps: Array<{title: string, description: string, duration: string, skills: string[]}>): RoadmapStep[] => {
  return steps.map((step, index) => ({
    id: `step-${index + 1}`,
    title: step.title,
    description: step.description,
    duration: step.duration,
    prerequisites: index === 0 ? [] : [`step-${index}`],
    resources: [
      `Online Course: ${step.title}`,
      `Documentation: ${step.title} Guide`,
      `Practice: ${step.title} Projects`
    ],
    skills: step.skills
  }))
}

export const careerPaths: CareerPath[] = [
  {
    id: '1',
    title: 'Machine Learning Engineer',
    description: 'Design, build, and deploy machine learning systems at scale. Focus on productionizing ML models and building robust ML infrastructure.',
    level: 'mid',
    averageSalary: '$120,000 - $180,000',
    skills: [
      ...createSkills(['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Docker', 'Kubernetes'], 'technical', 'essential'),
      ...createSkills(['SQL', 'Apache Spark', 'MLflow', 'Git', 'Linux'], 'technical', 'recommended'),
      ...createSkills(['Communication', 'Problem Solving', 'Teamwork'], 'soft', 'essential'),
      ...createSkills(['Statistics', 'Linear Algebra', 'Machine Learning Theory'], 'domain', 'essential')
    ],
    roadmap: createRoadmapSteps([
      {
        title: 'Programming Fundamentals',
        description: 'Master Python programming and software development basics',
        duration: '2-3 months',
        skills: ['Python', 'Git', 'Linux']
      },
      {
        title: 'Mathematics and Statistics',
        description: 'Build strong foundation in math concepts essential for ML',
        duration: '3-4 months',
        skills: ['Statistics', 'Linear Algebra', 'Calculus']
      },
      {
        title: 'Machine Learning Basics',
        description: 'Learn core ML algorithms and concepts',
        duration: '4-6 months',
        skills: ['Scikit-learn', 'Machine Learning Theory', 'Data Analysis']
      },
      {
        title: 'Deep Learning',
        description: 'Master neural networks and deep learning frameworks',
        duration: '4-6 months',
        skills: ['TensorFlow', 'PyTorch', 'Neural Networks']
      },
      {
        title: 'MLOps and Production',
        description: 'Learn to deploy and maintain ML systems in production',
        duration: '3-4 months',
        skills: ['Docker', 'Kubernetes', 'MLflow', 'Model Deployment']
      }
    ]),
    jobTitles: ['ML Engineer', 'Applied Scientist', 'AI Engineer', 'ML Platform Engineer'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Netflix', 'Uber', 'Airbnb']
  },
  {
    id: '2',
    title: 'Data Scientist',
    description: 'Extract insights from data using statistical analysis, machine learning, and data visualization to drive business decisions.',
    level: 'entry',
    averageSalary: '$95,000 - $150,000',
    skills: [
      ...createSkills(['Python', 'R', 'SQL', 'Pandas', 'NumPy', 'Matplotlib'], 'technical', 'essential'),
      ...createSkills(['Tableau', 'Power BI', 'Jupyter', 'Apache Spark'], 'technical', 'recommended'),
      ...createSkills(['Communication', 'Business Acumen', 'Critical Thinking'], 'soft', 'essential'),
      ...createSkills(['Statistics', 'Hypothesis Testing', 'A/B Testing', 'Business Intelligence'], 'domain', 'essential')
    ],
    roadmap: createRoadmapSteps([
      {
        title: 'Data Analysis Fundamentals',
        description: 'Learn data manipulation and basic statistical analysis',
        duration: '2-3 months',
        skills: ['Python', 'Pandas', 'NumPy', 'SQL']
      },
      {
        title: 'Statistics and Probability',
        description: 'Master statistical concepts and hypothesis testing',
        duration: '3-4 months',
        skills: ['Statistics', 'Hypothesis Testing', 'Probability']
      },
      {
        title: 'Data Visualization',
        description: 'Create compelling visualizations and dashboards',
        duration: '2-3 months',
        skills: ['Matplotlib', 'Seaborn', 'Tableau', 'Power BI']
      },
      {
        title: 'Machine Learning for Data Science',
        description: 'Apply ML techniques to solve business problems',
        duration: '4-5 months',
        skills: ['Scikit-learn', 'Feature Engineering', 'Model Selection']
      },
      {
        title: 'Business Intelligence',
        description: 'Learn to translate data insights into business value',
        duration: '2-3 months',
        skills: ['Business Acumen', 'A/B Testing', 'KPI Design']
      }
    ]),
    jobTitles: ['Data Scientist', 'Business Analyst', 'Data Analyst', 'Quantitative Analyst'],
    companies: ['Netflix', 'Spotify', 'LinkedIn', 'Airbnb', 'Zillow', 'Palantir', 'Databricks']
  },
  {
    id: '3',
    title: 'AI Research Scientist',
    description: 'Conduct cutting-edge research in artificial intelligence, develop new algorithms, and publish findings in top-tier conferences.',
    level: 'senior',
    averageSalary: '$150,000 - $300,000',
    skills: [
      ...createSkills(['Python', 'PyTorch', 'TensorFlow', 'JAX', 'CUDA'], 'technical', 'essential'),
      ...createSkills(['C++', 'Julia', 'Distributed Computing', 'High-Performance Computing'], 'technical', 'recommended'),
      ...createSkills(['Research Methodology', 'Academic Writing', 'Presentation Skills'], 'soft', 'essential'),
      ...createSkills(['Advanced Mathematics', 'Optimization Theory', 'Information Theory', 'Computational Complexity'], 'domain', 'essential')
    ],
    roadmap: createRoadmapSteps([
      {
        title: 'Advanced Mathematics',
        description: 'Master advanced mathematical concepts for AI research',
        duration: '6-12 months',
        skills: ['Linear Algebra', 'Calculus', 'Optimization Theory', 'Probability Theory']
      },
      {
        title: 'Deep Learning Theory',
        description: 'Understand theoretical foundations of deep learning',
        duration: '6-8 months',
        skills: ['Neural Network Theory', 'Backpropagation', 'Optimization Algorithms']
      },
      {
        title: 'Research Methodology',
        description: 'Learn how to conduct and publish AI research',
        duration: '4-6 months',
        skills: ['Experimental Design', 'Academic Writing', 'Peer Review Process']
      },
      {
        title: 'Specialized AI Areas',
        description: 'Develop expertise in specific AI research domains',
        duration: '12+ months',
        skills: ['Computer Vision', 'NLP', 'Reinforcement Learning', 'Generative Models']
      },
      {
        title: 'Publication and Collaboration',
        description: 'Build research portfolio and academic network',
        duration: 'Ongoing',
        skills: ['Paper Writing', 'Conference Presentations', 'Collaboration']
      }
    ]),
    jobTitles: ['Research Scientist', 'Principal Scientist', 'Research Engineer', 'Postdoctoral Researcher'],
    companies: ['OpenAI', 'DeepMind', 'Anthropic', 'Meta AI', 'Google Research', 'Microsoft Research', 'NVIDIA Research']
  },
  {
    id: '4',
    title: 'AI Product Manager',
    description: 'Lead the development of AI-powered products, bridging technical teams and business stakeholders to deliver impactful AI solutions.',
    level: 'mid',
    averageSalary: '$130,000 - $200,000',
    skills: [
      ...createSkills(['Product Strategy', 'Roadmap Planning', 'Agile/Scrum', 'Data Analysis'], 'technical', 'essential'),
      ...createSkills(['SQL', 'A/B Testing', 'Analytics Tools', 'Wireframing'], 'technical', 'recommended'),
      ...createSkills(['Leadership', 'Communication', 'Stakeholder Management', 'Strategic Thinking'], 'soft', 'essential'),
      ...createSkills(['AI/ML Fundamentals', 'Market Research', 'User Experience', 'Business Strategy'], 'domain', 'essential')
    ],
    roadmap: createRoadmapSteps([
      {
        title: 'Product Management Fundamentals',
        description: 'Learn core product management principles and frameworks',
        duration: '3-4 months',
        skills: ['Product Strategy', 'User Research', 'Market Analysis']
      },
      {
        title: 'AI/ML Understanding',
        description: 'Develop technical literacy in AI and machine learning',
        duration: '4-6 months',
        skills: ['Machine Learning Basics', 'AI Applications', 'Technical Communication']
      },
      {
        title: 'Data-Driven Decision Making',
        description: 'Master analytics and experimentation for product decisions',
        duration: '2-3 months',
        skills: ['A/B Testing', 'Analytics', 'KPI Design', 'SQL']
      },
      {
        title: 'AI Product Strategy',
        description: 'Learn to build and scale AI-powered products',
        duration: '4-6 months',
        skills: ['AI Product Design', 'Ethics in AI', 'Regulatory Compliance']
      },
      {
        title: 'Leadership and Execution',
        description: 'Develop skills to lead cross-functional AI teams',
        duration: '3-6 months',
        skills: ['Team Leadership', 'Stakeholder Management', 'Go-to-Market Strategy']
      }
    ]),
    jobTitles: ['AI Product Manager', 'ML Product Manager', 'Technical Product Manager', 'Senior Product Manager'],
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Tesla', 'Salesforce']
  },
  {
    id: '5',
    title: 'Computer Vision Engineer',
    description: 'Develop AI systems that can interpret and understand visual information from images and videos.',
    level: 'mid',
    averageSalary: '$110,000 - $170,000',
    skills: [
      ...createSkills(['Python', 'OpenCV', 'PyTorch', 'TensorFlow', 'CUDA'], 'technical', 'essential'),
      ...createSkills(['C++', 'ROS', 'PCL', 'Docker', 'Edge Deployment'], 'technical', 'recommended'),
      ...createSkills(['Problem Solving', 'Attention to Detail', 'Collaboration'], 'soft', 'essential'),
      ...createSkills(['Image Processing', 'Deep Learning', 'Computer Graphics', 'Linear Algebra'], 'domain', 'essential')
    ],
    roadmap: createRoadmapSteps([
      {
        title: 'Image Processing Fundamentals',
        description: 'Learn basic image operations and computer vision concepts',
        duration: '3-4 months',
        skills: ['OpenCV', 'Image Processing', 'Feature Detection']
      },
      {
        title: 'Machine Learning for Vision',
        description: 'Apply ML techniques to computer vision problems',
        duration: '4-5 months',
        skills: ['Scikit-learn', 'Traditional CV Algorithms', 'Feature Engineering']
      },
      {
        title: 'Deep Learning for Vision',
        description: 'Master CNNs and modern deep learning architectures',
        duration: '5-6 months',
        skills: ['PyTorch', 'TensorFlow', 'CNN Architectures', 'Transfer Learning']
      },
      {
        title: 'Advanced Computer Vision',
        description: 'Explore specialized CV applications and techniques',
        duration: '4-6 months',
        skills: ['Object Detection', 'Semantic Segmentation', 'Face Recognition', '3D Vision']
      },
      {
        title: 'Production and Optimization',
        description: 'Deploy CV models efficiently in production environments',
        duration: '3-4 months',
        skills: ['Model Optimization', 'Edge Deployment', 'Real-time Processing']
      }
    ]),
    jobTitles: ['Computer Vision Engineer', 'CV Research Engineer', 'Perception Engineer', 'Vision AI Developer'],
    companies: ['Tesla', 'Waymo', 'NVIDIA', 'Meta', 'Apple', 'Amazon', 'Snap']
  },
  {
    id: '6',
    title: 'NLP Engineer',
    description: 'Build systems that understand, interpret, and generate human language using advanced NLP and language model techniques.',
    level: 'mid',
    averageSalary: '$115,000 - $175,000',
    skills: [
      ...createSkills(['Python', 'Transformers', 'PyTorch', 'Hugging Face', 'spaCy'], 'technical', 'essential'),
      ...createSkills(['NLTK', 'Gensim', 'FastAPI', 'Docker', 'Cloud Platforms'], 'technical', 'recommended'),
      ...createSkills(['Analytical Thinking', 'Communication', 'Creativity'], 'soft', 'essential'),
      ...createSkills(['Linguistics', 'Information Retrieval', 'Text Mining', 'Language Models'], 'domain', 'essential')
    ],
    roadmap: createRoadmapSteps([
      {
        title: 'NLP Fundamentals',
        description: 'Learn basic text processing and traditional NLP techniques',
        duration: '3-4 months',
        skills: ['Text Preprocessing', 'Tokenization', 'POS Tagging', 'Named Entity Recognition']
      },
      {
        title: 'Machine Learning for NLP',
        description: 'Apply ML algorithms to text classification and analysis',
        duration: '4-5 months',
        skills: ['Text Classification', 'Sentiment Analysis', 'Topic Modeling', 'Feature Engineering']
      },
      {
        title: 'Deep Learning for NLP',
        description: 'Master neural networks for language understanding',
        duration: '5-6 months',
        skills: ['RNNs', 'LSTMs', 'Attention Mechanisms', 'Sequence-to-Sequence Models']
      },
      {
        title: 'Transformer Models',
        description: 'Work with state-of-the-art transformer architectures',
        duration: '4-6 months',
        skills: ['BERT', 'GPT', 'T5', 'Fine-tuning', 'Prompt Engineering']
      },
      {
        title: 'Advanced NLP Applications',
        description: 'Build complex NLP systems and applications',
        duration: '4-5 months',
        skills: ['Question Answering', 'Text Generation', 'Dialogue Systems', 'Information Extraction']
      }
    ]),
    jobTitles: ['NLP Engineer', 'Computational Linguist', 'Language AI Engineer', 'Conversational AI Developer'],
    companies: ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Amazon', 'Microsoft', 'Grammarly']
  }
]

export const careerLevels = ['entry', 'mid', 'senior', 'executive'] as const
export const skillCategories = ['technical', 'soft', 'domain'] as const
export const skillImportance = ['essential', 'recommended', 'nice-to-have'] as const