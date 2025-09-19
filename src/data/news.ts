import { NewsArticle } from '@/types'

export const newsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'OpenAI Announces GPT-5: Revolutionary Breakthrough in AI Reasoning',
    summary: 'OpenAI unveils GPT-5 with unprecedented reasoning capabilities, multimodal understanding, and improved safety measures.',
    content: 'In a groundbreaking announcement today, OpenAI revealed GPT-5, the latest iteration of their flagship language model. The new model demonstrates remarkable improvements in logical reasoning, mathematical problem-solving, and multimodal understanding. Key features include enhanced safety protocols, reduced hallucinations, and the ability to process video, audio, and text simultaneously. Early benchmarks show GPT-5 outperforming its predecessor by 40% on reasoning tasks and achieving near-human performance on complex mathematical proofs.',
    author: 'Sarah Johnson',
    publishedDate: new Date('2024-01-15'),
    category: 'Product Launch',
    tags: ['OpenAI', 'GPT-5', 'Language Models', 'AI Safety'],
    imageUrl: '/images/news/gpt5-announcement.jpg',
    sourceUrl: 'https://openai.com/blog/gpt-5-announcement',
    readTime: 5
  },
  {
    id: '2',
    title: 'Google DeepMind Achieves Breakthrough in Protein Folding with AlphaFold 3',
    summary: 'AlphaFold 3 can now predict protein interactions with DNA, RNA, and small molecules with unprecedented accuracy.',
    content: 'Google DeepMind has announced AlphaFold 3, a revolutionary AI system that extends beyond protein structure prediction to model interactions between proteins and other biological molecules. This breakthrough could accelerate drug discovery and our understanding of cellular processes. The system can predict how proteins interact with DNA, RNA, and various small molecules, opening new possibilities for targeted therapies and personalized medicine. Researchers worldwide will have free access to the AlphaFold Server for non-commercial use.',
    author: 'Dr. Michael Chen',
    publishedDate: new Date('2024-01-12'),
    category: 'Research',
    tags: ['Google DeepMind', 'AlphaFold', 'Protein Folding', 'Drug Discovery'],
    imageUrl: '/images/news/alphafold3.jpg',
    sourceUrl: 'https://deepmind.google/discover/blog/alphafold-3-predicts-the-structure-and-interactions-of-all-of-lifes-molecules/',
    readTime: 7
  },
  {
    id: '3',
    title: 'Meta Releases Llama 3: Open-Source AI Model Rivals GPT-4',
    summary: 'Meta\'s latest open-source language model demonstrates competitive performance with leading proprietary models.',
    content: 'Meta has released Llama 3, their most advanced open-source language model to date. Available in 8B and 70B parameter versions, Llama 3 shows remarkable performance improvements over its predecessors. The model excels in reasoning, code generation, and multilingual tasks, often matching or exceeding GPT-4 performance on various benchmarks. Meta emphasizes their commitment to open-source AI development, providing researchers and developers with powerful tools for innovation. The release includes comprehensive safety evaluations and responsible AI guidelines.',
    author: 'Alex Rodriguez',
    publishedDate: new Date('2024-01-10'),
    category: 'Open Source',
    tags: ['Meta', 'Llama 3', 'Open Source', 'Language Models'],
    imageUrl: '/images/news/llama3-release.jpg',
    sourceUrl: 'https://ai.meta.com/blog/meta-llama-3/',
    readTime: 6
  },
  {
    id: '4',
    title: 'NVIDIA Unveils H200 GPU: 2x Faster AI Training Performance',
    summary: 'The new H200 Tensor Core GPU delivers unprecedented performance for large-scale AI model training and inference.',
    content: 'NVIDIA has announced the H200 Tensor Core GPU, specifically designed for AI workloads. The new chip offers 2x faster training performance compared to the previous generation, with 141GB of HBM3e memory and 4.8TB/s memory bandwidth. The H200 is optimized for transformer models and large language model training, featuring enhanced Transformer Engine capabilities. Major cloud providers including AWS, Google Cloud, and Microsoft Azure have already committed to deploying H200-powered instances. This advancement is expected to significantly reduce the time and cost of training large AI models.',
    author: 'Jennifer Liu',
    publishedDate: new Date('2024-01-08'),
    category: 'Hardware',
    tags: ['NVIDIA', 'H200', 'GPU', 'AI Hardware', 'Performance'],
    imageUrl: '/images/news/nvidia-h200.jpg',
    sourceUrl: 'https://nvidianews.nvidia.com/news/nvidia-h200-tensor-core-gpu',
    readTime: 4
  },
  {
    id: '5',
    title: 'EU AI Act Comes into Effect: New Regulations for AI Development',
    summary: 'The European Union\'s comprehensive AI legislation sets new standards for AI safety and transparency.',
    content: 'The European Union\'s AI Act has officially come into effect, establishing the world\'s first comprehensive legal framework for artificial intelligence. The legislation categorizes AI systems by risk level and imposes strict requirements for high-risk applications. Companies developing AI systems must ensure transparency, human oversight, and robust testing procedures. The act particularly focuses on biometric identification, critical infrastructure, and AI systems used in education and employment. Non-compliance can result in fines up to 7% of global annual revenue. The legislation is expected to influence AI governance worldwide.',
    author: 'Dr. Emma Thompson',
    publishedDate: new Date('2024-01-05'),
    category: 'Regulation',
    tags: ['EU AI Act', 'Regulation', 'AI Governance', 'Compliance'],
    imageUrl: '/images/news/eu-ai-act.jpg',
    sourceUrl: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai',
    readTime: 8
  },
  {
    id: '6',
    title: 'Anthropic\'s Claude 3 Achieves Human-Level Performance on Complex Reasoning Tasks',
    summary: 'Claude 3 demonstrates remarkable capabilities in mathematical reasoning, code generation, and creative writing.',
    content: 'Anthropic has released Claude 3, their most capable AI assistant to date. The model shows human-level performance on graduate-level reasoning tasks, advanced mathematics, and complex code generation. Claude 3 features improved safety measures, reduced harmful outputs, and better alignment with human values. The model is available in three variants: Haiku for speed, Sonnet for balance, and Opus for maximum capability. Anthropic emphasizes their constitutional AI approach, which trains models to be helpful, harmless, and honest through a combination of supervised learning and reinforcement learning from human feedback.',
    author: 'David Park',
    publishedDate: new Date('2024-01-03'),
    category: 'Product Launch',
    tags: ['Anthropic', 'Claude 3', 'AI Safety', 'Constitutional AI'],
    imageUrl: '/images/news/claude3-launch.jpg',
    sourceUrl: 'https://www.anthropic.com/news/claude-3-family',
    readTime: 6
  },
  {
    id: '7',
    title: 'Microsoft Copilot Integration Transforms Enterprise Productivity',
    summary: 'Microsoft reports 70% productivity gains in enterprises using AI-powered Copilot across Office applications.',
    content: 'Microsoft has released comprehensive data showing significant productivity improvements in enterprises using Copilot AI assistants. The study, covering over 10,000 organizations, reveals that employees using Copilot complete tasks 70% faster on average. Key improvements include automated document generation, intelligent email composition, and enhanced data analysis in Excel. Microsoft is expanding Copilot integration across all Office applications and introducing new features for specialized industries. The company also announced Copilot Studio, allowing organizations to create custom AI assistants tailored to their specific workflows and data.',
    author: 'Rachel Green',
    publishedDate: new Date('2024-01-01'),
    category: 'Enterprise',
    tags: ['Microsoft', 'Copilot', 'Enterprise AI', 'Productivity'],
    imageUrl: '/images/news/microsoft-copilot.jpg',
    sourceUrl: 'https://blogs.microsoft.com/blog/2024/01/01/copilot-enterprise-productivity/',
    readTime: 5
  },
  {
    id: '8',
    title: 'Breakthrough in Quantum-AI Hybrid Computing Achieved by IBM',
    summary: 'IBM demonstrates quantum advantage in machine learning tasks using their new quantum-classical hybrid approach.',
    content: 'IBM Research has achieved a significant milestone in quantum-AI hybrid computing, demonstrating quantum advantage in specific machine learning tasks. Their new approach combines quantum processors with classical AI accelerators to solve optimization problems that are intractable for classical computers alone. The breakthrough involves quantum approximate optimization algorithms (QAOA) enhanced with machine learning techniques. Early applications show promise in drug discovery, financial modeling, and supply chain optimization. IBM plans to make this technology available through their quantum cloud platform, enabling researchers worldwide to explore quantum-enhanced AI applications.',
    author: 'Dr. Kevin Zhang',
    publishedDate: new Date('2023-12-28'),
    category: 'Research',
    tags: ['IBM', 'Quantum Computing', 'Hybrid AI', 'Quantum Advantage'],
    imageUrl: '/images/news/ibm-quantum-ai.jpg',
    sourceUrl: 'https://research.ibm.com/blog/quantum-ai-hybrid-computing',
    readTime: 7
  }
]

export const newsCategories = [
  'Product Launch',
  'Research',
  'Open Source',
  'Hardware',
  'Regulation',
  'Enterprise',
  'Funding',
  'Partnerships'
]