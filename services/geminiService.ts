import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface EbookStructure {
    title: string;
    content: string;
    cover_prompt: string;
}

export async function generateEbook(topic: string, numChapters: number): Promise<EbookStructure> {
    const model = "gemini-2.5-flash";
    const systemInstruction = `Você é um autor mestre e um estrategista de conteúdo, especializado em criar mini-ebooks que são impossíveis de parar de ler. Seu estilo é cativante, persuasivo e usa gatilhos mentais para manter o leitor engajado.

Sua tarefa é gerar um mini-ebook completo e bem estruturado a partir do tópico do usuário. A saída DEVE ser um objeto JSON.

**Estrutura do Ebook:**
1.  **Título (H1):** Crie um título magnético e atraente.
2.  **Introdução (H2):** Comece com um gancho forte. Apresente o problema ou a promessa e diga ao leitor exatamente o que ele aprenderá.
3.  **Capítulos (H2):** Gere exatamente ${numChapters} capítulos. Cada capítulo deve explorar um sub-tópico de forma aprofundada.
4.  **Conteúdo do Capítulo:** Cada capítulo DEVE conter entre 4 a 5 parágrafos de conteúdo rico e detalhado. Use storytelling, analogias e exemplos práticos. Formate termos chave com **negrito** e use *itálico* para ênfase.
5.  **Conclusão (H2):** Recapitule os pontos principais de forma poderosa e termine com uma chamada para ação ou um pensamento inspirador.

**Formato de Saída OBRIGATÓRIO:**
Você DEVE responder com um único objeto JSON contendo três chaves: "title", "content" e "cover_prompt".
-   "title": Uma string com o título do ebook.
-   "content": Uma única string contendo todo o ebook em formato Markdown, seguindo a estrutura acima (Tudo, da H1 do título até o final da conclusão).
-   "cover_prompt": Uma string contendo um prompt descritivo e artístico para um modelo de IA de geração de imagem criar uma capa para este ebook. O prompt deve ser em inglês, vívido e detalhado. Exemplo: "A minimalist digital art of a brain with glowing neural networks, symbolizing creativity and intelligence, on a dark blue background, cinematic lighting."

Não inclua NENHUM texto ou formatação fora do objeto JSON. A resposta deve ser apenas o JSON.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            cover_prompt: { type: Type.STRING },
        },
        required: ['title', 'content', 'cover_prompt']
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Gere um ebook sobre o tópico: "${topic}"`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
                topP: 0.95,
                topK: 64
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as EbookStructure;

    } catch (error) {
        console.error("Error generating content with Gemini API:", error);
        throw new Error("Falha ao gerar o conteúdo do ebook. A IA pode ter retornado um formato inesperado. Verifique a configuração da API e tente novamente.");
    }
}

export async function generateEbookCover(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '3:4',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("A API de imagem não retornou nenhuma imagem.");
        }
        
        return response.generatedImages[0].image.imageBytes;
    } catch (error) {
        console.error("Error generating image with Gemini API:", error);
        throw new Error("Falha ao gerar a capa do ebook. O serviço de imagem pode estar indisponível.");
    }
}

export async function continueEbook(existingContent: string): Promise<string> {
    const model = "gemini-2.5-flash";
    const systemInstruction = `Você é um autor mestre encarregado de continuar um ebook. O usuário fornecerá o conteúdo existente. Sua tarefa é analisar o último capítulo e o tom geral do texto, e então escrever o **próximo capítulo** que segue logicamente.

**Regras:**
1.  Comece o novo conteúdo DIRETAMENTE com um título de capítulo em Markdown (ex: \`## Título do Novo Capítulo\`).
2.  Mantenha o mesmo estilo, tom e profundidade do conteúdo existente.
3.  O novo capítulo deve conter de 4 a 5 parágrafos de conteúdo rico.
4.  **NÃO** inclua um título principal (H1), introdução, ou conclusão. Apenas o próximo capítulo.
5.  **NÃO** repita o conteúdo que já foi escrito.
6.  Sua saída deve ser uma única string de texto em formato Markdown, contendo apenas o novo capítulo.`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: `Aqui está o conteúdo atual do ebook. Continue de onde parou:\n\n${existingContent}`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.75,
                topP: 0.95,
                topK: 64,
            }
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error continuing ebook with Gemini API:", error);
        throw new Error("Falha ao adicionar novo conteúdo ao ebook.");
    }
}