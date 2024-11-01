import { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Question from './components/Question';
import { extractTextFromPDF } from './utils/pdfUtils';
import { generateQuestions, evaluateAnswer, type FeedbackResponse } from './utils/geminiUtils';

function App() {
  const [pdfContent, setPdfContent] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const handleGenerateQuestions = async (text: string, count: number) => {
    try {
      const generatedQuestions = await generateQuestions(text, count);
      setQuestions(prevQuestions => [...prevQuestions, ...generatedQuestions]);
    } catch (err) {
      setError('Une erreur s\'est produite lors de la génération des questions. Veuillez réessayer.');
      console.error(err);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      setError('');
      
      const text = await extractTextFromPDF(file);
      setPdfContent(text);
      
      await handleGenerateQuestions(text, questionCount);
    } catch (err) {
      setError('Erreur lors de l\'importation du fichier. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (question: string, answer: string): Promise<FeedbackResponse> => {
    try {
      return await evaluateAnswer(question, answer, pdfContent);
    } catch (err) {
      console.error('Error evaluating answer:', err);
      return {
        isCorrect: false,
        feedback: 'Une erreur s\'est produite lors de l\'évaluation de votre réponse. Veuillez réessayer.',
        improvement: 'Assurez-vous que votre réponse est claire et concise.'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apprentissage interactif
          </h1>
          <p className="text-gray-600">
            Importer un PDF et notre IA générera des questions interactives pour vous aider à apprendre plus rapidement.
          </p>
        </div>

        {!questions.length && (
          <div className="space-y-6">
            <div className="w-full max-w-xs mx-auto">
              <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de questions à générer
              </label>
              <input
                type="number"
                id="questionCount"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyse du fichier et génération de questions...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md mb-6 flex justify-between items-center">
              <p className="text-blue-700">
                {questions.length} questions générées à partir de votre fichier PDF
              </p>
              <button
                onClick={async () => {
                  setLoading(true);
                  await handleGenerateQuestions(pdfContent, questionCount);
                  setLoading(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Générer plus</span>
              </button>
            </div>
            
            {questions.map((question, index) => (
              <Question
                key={index}
                question={question}
                onAnswer={(answer) => handleAnswer(question, answer)}
              />
            ))}
            
            <button
              onClick={() => {
                setQuestions([]);
                setPdfContent('');
              }}
              className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Importer un autre PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;