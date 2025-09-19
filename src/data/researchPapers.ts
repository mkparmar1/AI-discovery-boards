import { ResearchPaper } from '@/types'

export const researchPapers: ResearchPaper[] = [
  {
    id: '1',
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit'],
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
    category: 'Deep Learning',
    publishedDate: new Date('2017-06-12'),
    citationCount: 85420,
    arxivId: '1706.03762',
    doi: '10.48550/arXiv.1706.03762',
    pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
    tags: ['Transformer', 'Attention Mechanism', 'NLP', 'Neural Networks'],
    venue: 'NeurIPS 2017'
  },
  {
    id: '2',
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
    abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.',
    category: 'Natural Language Processing',
    publishedDate: new Date('2018-10-11'),
    citationCount: 67890,
    arxivId: '1810.04805',
    doi: '10.48550/arXiv.1810.04805',
    pdfUrl: 'https://arxiv.org/pdf/1810.04805.pdf',
    tags: ['BERT', 'Pre-training', 'Bidirectional', 'Language Model'],
    venue: 'NAACL 2019'
  },
  {
    id: '3',
    title: 'Generative Adversarial Networks',
    authors: ['Ian J. Goodfellow', 'Jean Pouget-Abadie', 'Mehdi Mirza', 'Bing Xu'],
    abstract: 'We propose a new framework for estimating generative models via an adversarial process, in which we simultaneously train two models: a generative model G that captures the data distribution, and a discriminative model D that estimates the probability that a sample came from the training data rather than G.',
    category: 'Generative Models',
    publishedDate: new Date('2014-06-10'),
    citationCount: 45670,
    arxivId: '1406.2661',
    doi: '10.48550/arXiv.1406.2661',
    pdfUrl: 'https://arxiv.org/pdf/1406.2661.pdf',
    tags: ['GAN', 'Generative Models', 'Adversarial Training', 'Deep Learning'],
    venue: 'NeurIPS 2014'
  },
  {
    id: '4',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.',
    category: 'Computer Vision',
    publishedDate: new Date('2015-12-10'),
    citationCount: 156780,
    arxivId: '1512.03385',
    doi: '10.48550/arXiv.1512.03385',
    pdfUrl: 'https://arxiv.org/pdf/1512.03385.pdf',
    tags: ['ResNet', 'Residual Learning', 'Image Recognition', 'CNN'],
    venue: 'CVPR 2016'
  },
  {
    id: '5',
    title: 'Language Models are Few-Shot Learners',
    authors: ['Tom B. Brown', 'Benjamin Mann', 'Nick Ryder', 'Melanie Subbiah'],
    abstract: 'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples.',
    category: 'Natural Language Processing',
    publishedDate: new Date('2020-05-28'),
    citationCount: 34560,
    arxivId: '2005.14165',
    doi: '10.48550/arXiv.2005.14165',
    pdfUrl: 'https://arxiv.org/pdf/2005.14165.pdf',
    tags: ['GPT-3', 'Few-Shot Learning', 'Language Models', 'In-Context Learning'],
    venue: 'NeurIPS 2020'
  },
  {
    id: '6',
    title: 'Denoising Diffusion Probabilistic Models',
    authors: ['Jonathan Ho', 'Ajay Jain', 'Pieter Abbeel'],
    abstract: 'We present high quality image synthesis results using diffusion probabilistic models, a class of latent variable models inspired by considerations from nonequilibrium thermodynamics. Our best results are obtained by training on a weighted variational bound designed according to a novel connection between diffusion probabilistic models and denoising score matching with Langevin dynamics.',
    category: 'Generative Models',
    publishedDate: new Date('2020-06-19'),
    citationCount: 12890,
    arxivId: '2006.11239',
    doi: '10.48550/arXiv.2006.11239',
    pdfUrl: 'https://arxiv.org/pdf/2006.11239.pdf',
    tags: ['Diffusion Models', 'Image Synthesis', 'Generative Models', 'Denoising'],
    venue: 'NeurIPS 2020'
  },
  {
    id: '7',
    title: 'An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale',
    authors: ['Alexey Dosovitskiy', 'Lucas Beyer', 'Alexander Kolesnikov', 'Dirk Weissenborn'],
    abstract: 'While the Transformer architecture has become the de-facto standard for natural language processing tasks, its applications to computer vision remain limited. In vision, attention is either applied in conjunction with convolutional networks, or used to replace certain components of convolutional networks while keeping their overall structure intact.',
    category: 'Computer Vision',
    publishedDate: new Date('2020-10-22'),
    citationCount: 28450,
    arxivId: '2010.11929',
    doi: '10.48550/arXiv.2010.11929',
    pdfUrl: 'https://arxiv.org/pdf/2010.11929.pdf',
    tags: ['Vision Transformer', 'ViT', 'Image Recognition', 'Transformer'],
    venue: 'ICLR 2021'
  },
  {
    id: '8',
    title: 'Training language models to follow instructions with human feedback',
    authors: ['Long Ouyang', 'Jeff Wu', 'Xu Jiang', 'Diogo Almeida'],
    abstract: 'Making language models bigger does not inherently make them better at following a user\'s intent. For example, large language models can generate outputs that are untruthful, toxic, or simply not helpful to the user. In other words, these models are not aligned with their users.',
    category: 'AI Safety',
    publishedDate: new Date('2022-03-04'),
    citationCount: 8970,
    arxivId: '2203.02155',
    doi: '10.48550/arXiv.2203.02155',
    pdfUrl: 'https://arxiv.org/pdf/2203.02155.pdf',
    tags: ['RLHF', 'Instruction Following', 'Human Feedback', 'AI Alignment'],
    venue: 'NeurIPS 2022'
  }
]

export const paperCategories = [
  'Deep Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Generative Models',
  'Reinforcement Learning',
  'AI Safety',
  'Machine Learning Theory',
  'Robotics'
]