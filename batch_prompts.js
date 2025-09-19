// Large batch of prompts (21-50) to add to data.ts

const batchPrompts = [
  {
    id: '21',
    title: 'Mental Health Support Assistant',
    prompt: 'Provide supportive guidance for [MENTAL_HEALTH_CONCERN]. Offer: 1) Validation and empathy 2) Coping strategies and techniques 3) Self-care recommendations 4) Professional resource suggestions 5) Crisis support information 6) Mindfulness exercises. Always encourage professional help when needed.',
    category: 'Mental Health',
    tags: ['mental health', 'support', 'wellness', 'coping'],
    description: 'Compassionate mental health support and guidance',
    useCase: 'Mental health support, wellness coaching, crisis intervention',
    difficulty: 'Intermediate',
    createdAt: '2024-02-04'
  },
  {
    id: '22',
    title: 'Real Estate Investment Analyzer',
    prompt: 'Analyze this real estate investment opportunity: [PROPERTY_DETAILS]. Evaluate: 1) Cash flow projections 2) Cap rate and ROI calculations 3) Market comparables 4) Neighborhood analysis 5) Risk factors 6) Exit strategies 7) Financing options. Provide investment recommendation.',
    category: 'Real Estate',
    tags: ['real estate', 'investment', 'analysis', 'ROI'],
    description: 'Comprehensive real estate investment analysis',
    useCase: 'Property investment, real estate analysis, portfolio planning',
    difficulty: 'Advanced',
    createdAt: '2024-02-05'
  },
  {
    id: '23',
    title: 'Recipe Creator & Nutritionist',
    prompt: 'Create a healthy recipe for [MEAL_TYPE] with these ingredients: [INGREDIENTS]. Include: 1) Step-by-step cooking instructions 2) Nutritional information per serving 3) Preparation and cooking time 4) Serving suggestions 5) Ingredient substitutions 6) Storage tips. Dietary requirements: [DIETARY_NEEDS].',
    category: 'Cooking',
    tags: ['recipes', 'nutrition', 'cooking', 'healthy eating'],
    description: 'Healthy recipe creation with nutritional analysis',
    useCase: 'Meal planning, healthy cooking, nutrition education',
    difficulty: 'Beginner',
    createdAt: '2024-02-06'
  },
  {
    id: '24',
    title: 'Brand Identity Designer',
    prompt: 'Develop a comprehensive brand identity for [BUSINESS/PRODUCT]. Create: 1) Brand positioning statement 2) Visual identity guidelines 3) Color palette with psychology 4) Typography recommendations 5) Logo concept descriptions 6) Brand voice and tone 7) Application examples. Target audience: [AUDIENCE].',
    category: 'Branding',
    tags: ['branding', 'identity', 'design', 'marketing'],
    description: 'Complete brand identity development and guidelines',
    useCase: 'Brand development, marketing strategy, business identity',
    difficulty: 'Advanced',
    createdAt: '2024-02-07'
  },
  {
    id: '25',
    title: 'Podcast Content Strategist',
    prompt: 'Develop a podcast strategy for [TOPIC/NICHE]. Include: 1) Show format and structure 2) Episode topics for first 10 episodes 3) Target audience analysis 4) Guest outreach strategy 5) Monetization options 6) Promotion and marketing plan 7) Equipment and software recommendations.',
    category: 'Content Creation',
    tags: ['podcast', 'content strategy', 'audio', 'media'],
    description: 'Comprehensive podcast planning and strategy',
    useCase: 'Podcast creation, content marketing, media production',
    difficulty: 'Intermediate',
    createdAt: '2024-02-08'
  }
];

// Export for easy copying
module.exports = batchPrompts;