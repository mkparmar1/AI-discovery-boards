import { ForumPost, Reply, User } from '@/types'

// Sample users for forum posts
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    joinedAt: '2023-01-15',
    preferences: {
      theme: 'light',
      notifications: true,
      newsletter: true
    }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'moderator',
    joinedAt: '2022-08-20',
    preferences: {
      theme: 'dark',
      notifications: true,
      newsletter: true
    }
  },
  {
    id: '3',
    name: 'Dr. Michael Rodriguez',
    email: 'm.rodriguez@university.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'expert',
    joinedAt: '2022-03-10',
    preferences: {
      theme: 'light',
      notifications: false,
      newsletter: true
    }
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.wilson@tech.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    joinedAt: '2023-06-05',
    preferences: {
      theme: 'dark',
      notifications: true,
      newsletter: false
    }
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david.kim@startup.io',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'user',
    joinedAt: '2023-09-12',
    preferences: {
      theme: 'light',
      notifications: true,
      newsletter: true
    }
  }
]

const createReplies = (postId: string, count: number): Reply[] => {
  const replies: Reply[] = []
  const users = sampleUsers.slice(1) // Exclude the first user for variety
  
  for (let i = 0; i < count; i++) {
    const user = users[i % users.length]
    const baseDate = new Date('2024-01-01')
    const replyDate = new Date(baseDate.getTime() + (i * 24 * 60 * 60 * 1000))
    
    replies.push({
      id: `${postId}-reply-${i + 1}`,
      content: getReplyContent(i),
      author: user,
      createdAt: replyDate.toISOString(),
      updatedAt: replyDate.toISOString(),
      likes: Math.floor(Math.random() * 20),
      parentId: i > 0 && Math.random() > 0.7 ? `${postId}-reply-${i}` : undefined
    })
  }
  
  return replies
}

const getReplyContent = (index: number): string => {
  const contents = [
    "Great question! I've been working with similar models and found that fine-tuning on domain-specific data really helps. Have you tried adjusting the learning rate?",
    "I had the same issue last month. The solution was to increase the batch size and use gradient accumulation. Here's a code snippet that worked for me: ```python\noptimizer = torch.optim.Adam(model.parameters(), lr=0.001)\n```",
    "This is a common problem in NLP. You might want to look into using pre-trained embeddings like Word2Vec or GloVe as a starting point.",
    "Thanks for sharing this! I've bookmarked it for later. The approach you described is similar to what we use at my company.",
    "Have you considered using transfer learning? It can significantly reduce training time and improve performance on smaller datasets.",
    "Interesting perspective! I disagree with point 3 though. In my experience, regularization techniques like dropout are still very effective.",
    "Could you share more details about your dataset? The preprocessing steps might be crucial for getting better results.",
    "This reminds me of a paper I read recently: 'Attention Is All You Need'. The transformer architecture might be worth exploring for your use case.",
    "I'm a beginner in this area, but this discussion is really helpful. Are there any good resources you'd recommend for learning more?",
    "Update: I tried the suggested approach and it worked! My model accuracy improved from 78% to 85%. Thanks everyone!"
  ]
  
  return contents[index % contents.length]
}

export const forumPosts: ForumPost[] = [
  {
    id: '1',
    title: 'Best practices for fine-tuning large language models?',
    content: `I'm working on fine-tuning a BERT model for sentiment analysis on customer reviews. I have about 50k labeled examples, but I'm struggling with overfitting.

Here's what I've tried so far:
- Reduced learning rate to 2e-5
- Added dropout layers
- Used early stopping

The model performs well on training data (95% accuracy) but only 78% on validation. Any suggestions for improving generalization?

Dataset details:
- 50,000 customer reviews
- 5-star rating system
- Average review length: 150 words
- Balanced across rating categories

I'm using PyTorch and Hugging Face Transformers. Any help would be appreciated!`,
    author: sampleUsers[0],
    category: 'Machine Learning',
    tags: ['NLP', 'BERT', 'Fine-tuning', 'Overfitting', 'PyTorch'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    views: 1247,
    likes: 23,
    replies: createReplies('1', 8),
    isPinned: true,
    isSolved: false
  },
  {
    id: '2',
    title: 'Computer Vision project showcase: Real-time object detection',
    content: `I just finished my computer vision project and wanted to share it with the community!

**Project Overview:**
Built a real-time object detection system using YOLOv8 that can identify and track multiple objects in video streams.

**Key Features:**
- Real-time processing (30+ FPS)
- Supports 80+ object classes
- Custom training pipeline
- Web interface for easy use

**Tech Stack:**
- YOLOv8 (Ultralytics)
- OpenCV for video processing
- FastAPI for the backend
- React for the frontend
- Docker for deployment

**Performance:**
- mAP@0.5: 0.89
- Inference time: ~33ms per frame
- Model size: 22MB

**Demo:** [GitHub Repository](https://github.com/example/object-detection)

Feel free to ask questions or suggest improvements! I'm planning to add support for custom object classes next.

**What I learned:**
- Data augmentation is crucial for robust performance
- Proper anchor box tuning significantly improves accuracy
- Edge optimization techniques for mobile deployment`,
    author: sampleUsers[1],
    category: 'Computer Vision',
    tags: ['YOLO', 'Object Detection', 'OpenCV', 'Real-time', 'Project Showcase'],
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-12T14:20:00Z',
    views: 892,
    likes: 45,
    replies: createReplies('2', 12),
    isPinned: false,
    isSolved: true
  },
  {
    id: '3',
    title: 'Career advice: Transitioning from software engineering to ML?',
    content: `I'm a software engineer with 5 years of experience in web development (React, Node.js, Python). I'm really interested in transitioning to machine learning but feeling overwhelmed by where to start.

**My background:**
- Strong programming skills (Python, JavaScript, SQL)
- Basic statistics knowledge
- No formal ML experience
- CS degree (graduated 2019)

**Questions:**
1. Should I pursue a master's degree or self-study?
2. What's the best learning path for someone with my background?
3. How important are ML certifications?
4. Should I start with a data analyst role first?
5. What projects should I build for my portfolio?

**My plan so far:**
- Complete Andrew Ng's ML course
- Build 3-4 ML projects
- Learn pandas, scikit-learn, TensorFlow
- Apply for ML engineer positions

Any advice from people who made similar transitions? What worked for you? What would you do differently?

Also, are there any companies known for hiring career changers into ML roles?`,
    author: sampleUsers[2],
    category: 'Career',
    tags: ['Career Change', 'Machine Learning', 'Software Engineering', 'Advice', 'Learning Path'],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    views: 2156,
    likes: 67,
    replies: createReplies('3', 15),
    isPinned: false,
    isSolved: false
  },
  {
    id: '4',
    title: 'Deep dive: Understanding transformer attention mechanisms',
    content: `I've been studying transformer architectures and want to share my understanding of attention mechanisms. This is both for my own learning and to help others who might be struggling with the concept.

## What is Attention?

Attention allows the model to focus on different parts of the input when producing each part of the output. Think of it like highlighting relevant words in a sentence when translating.

## Self-Attention vs Cross-Attention

**Self-Attention:** Each position in a sequence attends to all positions in the same sequence.
**Cross-Attention:** Positions in one sequence attend to positions in another sequence.

## The Math (Simplified)

```
Attention(Q, K, V) = softmax(QK^T / √d_k)V
```

Where:
- Q = Queries
- K = Keys  
- V = Values
- d_k = dimension of keys

## Multi-Head Attention

Instead of one attention function, we use multiple "heads" that can focus on different types of relationships.

## Practical Example

In the sentence "The cat sat on the mat", when processing "sat":
- High attention to "cat" (subject)
- Medium attention to "mat" (object)
- Low attention to "the" (less relevant)

## Code Example

```python
import torch
import torch.nn as nn

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
    def forward(self, query, key, value, mask=None):
        # Implementation details...
        pass
```

## Questions for Discussion

1. How does attention help with the vanishing gradient problem?
2. What are the computational trade-offs of multi-head attention?
3. How do positional encodings interact with attention?

Would love to hear your thoughts and any corrections to my understanding!`,
    author: sampleUsers[3],
    category: 'Deep Learning',
    tags: ['Transformers', 'Attention', 'Deep Learning', 'NLP', 'Tutorial'],
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-08T16:45:00Z',
    views: 1834,
    likes: 89,
    replies: createReplies('4', 18),
    isPinned: true,
    isSolved: false
  },
  {
    id: '5',
    title: 'Help needed: Model deployment on AWS SageMaker',
    content: `I'm trying to deploy my trained PyTorch model on AWS SageMaker but running into several issues. Hoping someone with experience can help!

**Model Details:**
- Custom PyTorch model for image classification
- Model size: ~200MB
- Input: 224x224 RGB images
- Output: 10 classes

**Issues I'm facing:**

1. **Inference script errors:** Getting import errors when SageMaker tries to load my model
2. **Container issues:** Custom dependencies not installing properly
3. **Endpoint configuration:** Not sure about instance types and scaling settings

**My current setup:**

```python
# inference.py
import torch
import torchvision.transforms as transforms
from PIL import Image

def model_fn(model_dir):
    model = torch.load(f'{model_dir}/model.pth')
    model.eval()
    return model

def input_fn(request_body, content_type):
    # Image preprocessing
    pass

def predict_fn(input_data, model):
    # Prediction logic
    pass
```

**Specific questions:**

1. What's the best way to handle custom dependencies?
2. Should I use SageMaker's built-in PyTorch container or create a custom one?
3. How do I optimize for cost vs performance?
4. Any tips for debugging deployment issues?

**Error logs:**
```
ModuleNotFoundError: No module named 'efficientnet_pytorch'
```

I've tried adding it to requirements.txt but still getting errors. Any help would be greatly appreciated!

**Budget constraints:** Looking for the most cost-effective solution for ~1000 predictions per day.`,
    author: sampleUsers[4],
    category: 'MLOps',
    tags: ['AWS', 'SageMaker', 'Deployment', 'PyTorch', 'Help Needed'],
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-05T11:30:00Z',
    views: 567,
    likes: 12,
    replies: createReplies('5', 6),
    isPinned: false,
    isSolved: false
  },
  {
    id: '6',
    title: 'Weekly AI News Discussion - January 2024',
    content: `Welcome to our weekly AI news discussion thread! Share and discuss the latest developments in AI and machine learning.

## This Week's Highlights

### 🔥 Major Announcements
- **OpenAI GPT-4 Turbo Updates:** New model with improved reasoning capabilities
- **Google Gemini Pro:** Now available via API with competitive pricing
- **Meta's Code Llama 2:** Enhanced code generation model released

### 📚 Research Papers
- "Mixture of Experts Meets Instruction Tuning" - Scaling insights
- "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks" - RAG improvements
- "Constitutional AI: Harmlessness from AI Feedback" - AI safety advances

### 🏢 Industry News
- Microsoft invests $10B more in OpenAI partnership
- NVIDIA announces new H200 GPUs for AI workloads
- Anthropic raises $450M Series C funding round

### 🛠️ Tools & Frameworks
- **LangChain 0.1.0:** Major release with breaking changes
- **Hugging Face Transformers 4.36:** New model architectures
- **MLflow 2.9:** Enhanced experiment tracking features

## Discussion Topics

1. **Impact of new GPT-4 Turbo on existing applications?**
2. **Thoughts on the current state of open-source vs proprietary models?**
3. **Best practices for RAG implementation in production?**
4. **Predictions for AI trends in 2024?**

## Community Spotlights

- Congratulations to @alex_chen for winning the monthly ML challenge!
- New study group forming for "Hands-On Machine Learning" book
- Upcoming virtual meetup: "AI Ethics in Practice" - Jan 20th

**Share your thoughts, ask questions, and let's discuss!**

Remember to:
- Keep discussions respectful and constructive
- Cite sources when sharing news
- Use spoiler tags for lengthy technical discussions
- Help newcomers feel welcome

What caught your attention this week? Any exciting projects you're working on?`,
    author: sampleUsers[1], // Moderator
    category: 'General Discussion',
    tags: ['Weekly Discussion', 'AI News', 'Community', 'GPT-4', 'Industry Updates'],
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-01T08:00:00Z',
    views: 3421,
    likes: 156,
    replies: createReplies('6', 25),
    isPinned: true,
    isSolved: false
  }
]

export const forumCategories = [
  'General Discussion',
  'Machine Learning',
  'Deep Learning',
  'Computer Vision',
  'Natural Language Processing',
  'MLOps',
  'Career',
  'Research',
  'Tools & Frameworks',
  'Project Showcase',
  'Help & Support'
] as const

export const popularTags = [
  'Python',
  'PyTorch',
  'TensorFlow',
  'NLP',
  'Computer Vision',
  'Deep Learning',
  'Machine Learning',
  'Data Science',
  'MLOps',
  'Career Advice',
  'Beginner Friendly',
  'Advanced',
  'Tutorial',
  'Project Showcase',
  'Help Needed',
  'Research Paper',
  'Industry News',
  'Open Source',
  'AWS',
  'Google Cloud',
  'Azure'
] as const

export { sampleUsers }