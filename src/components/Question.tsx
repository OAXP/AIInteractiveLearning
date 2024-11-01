import React, { useState } from 'react';
import { CheckCircle, XCircle, BookOpen } from 'lucide-react';
import type { FeedbackResponse } from '../utils/geminiUtils';

interface QuestionProps {
  question: string;
  onAnswer: (answer: string) => Promise<FeedbackResponse>;
}

export default function Question({ question, onAnswer }: QuestionProps) {
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    setIsSubmitting(true);
    const response = await onAnswer(answer);
    setFeedback(response);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{question}</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Type your answer here..."
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !answer.trim()}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Vérification...' : 'Soumettre la réponse'}
        </button>
      </form>

      {feedback && (
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-md flex items-start space-x-3
            ${feedback.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            {feedback.isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="space-y-2">
              <p className={feedback.isCorrect ? 'text-green-700' : 'text-red-700'}>
                {feedback.feedback}
              </p>
              {feedback.improvement && (
                <div className="flex items-start space-x-2 mt-2 pt-2 border-t border-gray-200">
                  <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700">
                    {feedback.improvement}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}