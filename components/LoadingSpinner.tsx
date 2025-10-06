import React from 'react';

const messages = [
  "Consultando as musas digitais...",
  "Elaborando um título magnético...",
  "Esboçando os capítulos com gatilhos mentais...",
  "Escrevendo um conteúdo vasto e viciante...",
  "Desenhando um prompt artístico para a capa...",
  "Gerando uma capa única com IA...",
  "Aplicando o design visual escolhido...",
  "Formatando os parágrafos finais...",
  "Compilando o seu ebook completo...",
];

export const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-blue-500 border-l-blue-500 rounded-full animate-spin"></div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mt-8">Gerando seu Ebook...</h2>
      <p className="text-slate-600 mt-2 transition-opacity duration-500 w-64">{message}</p>
    </div>
  );
};