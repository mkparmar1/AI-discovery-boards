'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Video, Clock, Play } from 'lucide-react'

const TutorialsPage = () => {
  const tutorials = [
    {
      id: '1',
      title: 'Getting Started with Machine Learning',
      description: 'Learn the fundamentals of ML with Python and scikit-learn',
      duration: '45 min',
      level: 'Beginner',
      category: 'Machine Learning',
      thumbnail: '/tutorials/ml-basics.jpg'
    },
    {
      id: '2',
      title: 'Building Your First Neural Network',
      description: 'Create a neural network from scratch using TensorFlow',
      duration: '1h 20min',
      level: 'Intermediate',
      category: 'Deep Learning',
      thumbnail: '/tutorials/neural-network.jpg'
    },
    {
      id: '3',
      title: 'Natural Language Processing with Transformers',
      description: 'Understand and implement transformer models for NLP tasks',
      duration: '2h 15min',
      level: 'Advanced',
      category: 'NLP',
      thumbnail: '/tutorials/transformers.jpg'
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Video className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">AI Tutorials</h1>
        </div>
        <p className="text-lg text-muted-foreground mb-6">
          Step-by-step video tutorials to master AI concepts and implementations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map(tutorial => (
          <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center">
                <Play className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">{tutorial.title}</CardTitle>
              <CardDescription>
                {tutorial.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{tutorial.duration}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <Badge variant="outline" className="text-xs">
                  {tutorial.level}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {tutorial.category}
                </Badge>
              </div>

              <Button className="w-full">
                <Play className="mr-2 h-4 w-4" />
                Watch Tutorial
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TutorialsPage