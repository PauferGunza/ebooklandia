import React, { useRef } from 'react';
import { ArrowPathIcon, DownloadIcon, PlusCircleIcon } from './icons';
import { Ebook } from '../App';
import { DesignTemplate } from './TopicInputForm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface EbookDisplayProps {
  ebook: Ebook;
  onReset: () => void;
  onContinue: () => void;
  isContinuing: boolean;
  error: string | null;
}

// A simple Markdown parser component
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  const formattedLines = lines.map((line, index) => {
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-4xl md:text-5xl font-bold mt-10 mb-6 text-slate-900 border-b-2 pb-4">{line.substring(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-2xl md:text-3xl font-semibold mt-8 mb-4 text-slate-800">{line.substring(3)}</h2>;
    }
    if (line.trim() === '') {
      return null;
    }

    const createMarkup = (text: string) => {
        const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>');
        const italized = bolded.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        return { __html: italized };
    };

    return <p key={index} className="text-base md:text-lg mb-4" dangerouslySetInnerHTML={createMarkup(line)} />;
  });

  return <div className="ebook-content">{formattedLines}</div>;
};

const DownloadButtons: React.FC<{ ebook: Ebook, contentRef: React.RefObject<HTMLDivElement> }> = ({ ebook, contentRef }) => {
    
    const handleDownload = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const onDownloadMD = () => {
        const blob = new Blob([ebook.markdownContent], { type: 'text/markdown;charset=utf-8' });
        handleDownload(blob, `${ebook.title}.md`);
    };

    const onDownloadTXT = () => {
        const text = ebook.markdownContent.replace(/#+\s/g, '').replace(/[\*_]/g, '');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        handleDownload(blob, `${ebook.title}.txt`);
    };

    const onDownloadPDF = async () => {
        if (!contentRef.current) return;
        
        const canvas = await html2canvas(contentRef.current, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${ebook.title}.pdf`);
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button onClick={onDownloadPDF} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors">
                <DownloadIcon className="w-5 h-5" /> Baixar PDF
            </button>
            <button onClick={onDownloadMD} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                <DownloadIcon className="w-5 h-5" /> Baixar .MD
            </button>
            <button onClick={onDownloadTXT} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors">
                <DownloadIcon className="w-5 h-5" /> Baixar .TXT
            </button>
        </div>
    )
}

const ContinueError: React.FC<{ message: string }> = ({ message }) => (
    <div className="mt-4 p-3 text-center bg-red-50 text-red-700 border border-red-200 rounded-lg">
        {message}
    </div>
);


export const EbookDisplay: React.FC<EbookDisplayProps> = ({ ebook, onReset, onContinue, isContinuing, error }) => {
  const { coverImageUrl, markdownContent } = ebook;
  const contentRef = useRef<HTMLDivElement>(null);
  
  // A UI não tem uma seleção de tema, então vamos definir um padrão
  const design: DesignTemplate = 'moderno'; 
  const themeClass = `theme-${design}`;


  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
       <div ref={contentRef} className={`${themeClass} bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-slate-200/50`}>
        {coverImageUrl && (
          <div className="mb-10 aspect-[3/4] max-w-sm mx-auto rounded-lg overflow-hidden shadow-2xl">
            <img src={coverImageUrl} alt={`Capa para ${ebook.title}`} className="w-full h-full object-cover" />
          </div>
        )}
        <MarkdownRenderer content={markdownContent} />
      </div>
      
      <DownloadButtons ebook={ebook} contentRef={contentRef} />
      
      {error && <ContinueError message={error} />}

      <div className="text-center mt-8 space-y-4 sm:space-y-0 sm:flex sm:flex-row-reverse sm:justify-center sm:gap-4">
        <button
          onClick={onContinue}
          disabled={isContinuing}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-wait"
        >
          <PlusCircleIcon className={`w-5 h-5 ${isContinuing ? 'animate-spin' : ''}`} />
          {isContinuing ? 'Adicionando conteúdo...' : 'Continuar de onde parou'}
        </button>
        <button
          onClick={onReset}
          className="w-full sm:w-auto flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Criar Outro Ebook
        </button>
      </div>
    </div>
  );
};