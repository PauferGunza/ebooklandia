import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { TopicInputForm, DesignTemplate } from './components/TopicInputForm';
import { EbookDisplay } from './components/EbookDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { generateEbook, generateEbookCover, continueEbook } from './services/geminiService';
import { MagicWandIcon } from './components/icons';

type AppState = 'idle' | 'loading' | 'success' | 'error';
export interface Ebook {
  title: string;
  markdownContent: string;
  coverImageUrl: string;
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);

  const handleGenerateEbook = useCallback(async (topic: string, numChapters: number, design: DesignTemplate) => {
    setAppState('loading');
    setError(null);
    setEbook(null);
    try {
      // Passo 1: Gerar conteúdo de texto e prompt da capa
      const ebookData = await generateEbook(topic, numChapters);
      if (!ebookData || !ebookData.content || !ebookData.cover_prompt) {
        throw new Error("A IA não retornou o conteúdo esperado. Tente novamente.");
      }

      // Passo 2: Gerar a imagem da capa
      const coverImageBase64 = await generateEbookCover(ebookData.cover_prompt);
      const coverImageUrl = `data:image/png;base64,${coverImageBase64}`;

      setEbook({
        title: ebookData.title,
        markdownContent: ebookData.content,
        coverImageUrl: coverImageUrl
      });
      setAppState('success');

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      setAppState('error');
    }
  }, []);

  const handleContinueEbook = async () => {
    if (!ebook) return;

    setIsContinuing(true);
    setError(null);
    try {
      const newContent = await continueEbook(ebook.markdownContent);
      setEbook(prevEbook => {
        if (!prevEbook) return null;
        return {
          ...prevEbook,
          markdownContent: `${prevEbook.markdownContent}\n\n${newContent}`
        };
      });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? `Falha ao continuar: ${err.message}` : 'Ocorreu um erro desconhecido ao adicionar conteúdo.');
    } finally {
      setIsContinuing(false);
    }
  };

  const handleReset = () => {
    setAppState('idle');
    setEbook(null);
    setError(null);
    setIsContinuing(false);
  };

  const renderContent = () => {
    switch (appState) {
      case 'loading':
        return <LoadingSpinner />;
      case 'success':
        return ebook && <EbookDisplay ebook={ebook} onReset={handleReset} onContinue={handleContinueEbook} isContinuing={isContinuing} error={error} />;
      case 'error':
        return (
          <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 mb-4">A Geração Falhou</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="w-full max-w-3xl mx-auto text-center">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <MagicWandIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">Gere um Ebook com IA</h1>
            <p className="text-lg text-slate-600 mb-8">
              Forneça um tópico, personalize o tamanho e o estilo, e nossa IA criará um ebook completo com capa para você.
            </p>
            <TopicInputForm onSubmit={handleGenerateEbook} disabled={false} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;