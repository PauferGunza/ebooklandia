import React, { useState } from 'react';
import { SparklesIcon } from './icons';

export type DesignTemplate = 'clássico' | 'moderno' | 'acadêmico';

interface TopicInputFormProps {
  onSubmit: (topic: string, numChapters: number, design: DesignTemplate) => void;
  disabled: boolean;
}

const designOptions: { id: DesignTemplate; label: string }[] = [
    { id: 'clássico', label: 'Clássico' },
    { id: 'moderno', label: 'Moderno' },
    { id: 'acadêmico', label: 'Acadêmico' },
];

export const TopicInputForm: React.FC<TopicInputFormProps> = ({ onSubmit, disabled }) => {
  const [topic, setTopic] = useState('');
  const [numChapters, setNumChapters] = useState(4);
  const [design, setDesign] = useState<DesignTemplate>('moderno');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !disabled) {
      onSubmit(topic.trim(), numChapters, design);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="p-2 bg-white border border-slate-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="ex: Guia para iniciantes em jardinagem interna"
          className="w-full h-24 sm:min-h-[60px] p-3 resize-none bg-transparent focus:outline-none text-slate-700 placeholder-slate-400 text-lg"
          disabled={disabled}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        <div>
          <label htmlFor="chapters" className="block text-sm font-medium text-slate-700 mb-2">Número de Capítulos</label>
          <select 
            id="chapters" 
            value={numChapters} 
            onChange={(e) => setNumChapters(Number(e.target.value))}
            disabled={disabled}
            className="w-full p-3 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value={3}>3 Capítulos (Curto)</option>
            <option value={4}>4 Capítulos (Padrão)</option>
            <option value={5}>5 Capítulos (Detalhado)</option>
            <option value={6}>6 Capítulos (Aprofundado)</option>
            <option value={7}>7 Capítulos (Extensivo)</option>
          </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Estilo do Design</label>
           <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
             {designOptions.map((option) => (
                <button
                    type="button"
                    key={option.id}
                    onClick={() => setDesign(option.id)}
                    disabled={disabled}
                    className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${
                        design === option.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'bg-transparent text-slate-600 hover:bg-white/60'
                    }`}
                >
                    {option.label}
                </button>
             ))}
           </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled || !topic.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
      >
        <SparklesIcon className="w-6 h-6" />
        <span className="text-lg">Gerar Ebook Completo</span>
      </button>
    </form>
  );
};