import Post from "../models/Post.js";
import slugify from "slugify";

export async function importGuardianNews() {
  if (!process.env.GUARDIAN_API_KEY) {
    throw new Error("GUARDIAN_API_KEY não configurada no .env");
  }

  const url = `https://content.guardianapis.com/search?show-fields=thumbnail,trailText,body,byline&order-by=newest&page-size=20&api-key=${process.env.GUARDIAN_API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.response || !data.response.results) {
      throw new Error("Resposta da API inválida");
    }

    let imported = 0;
    let updated = 0;

    for (const item of data.response.results) {
      try {
        const slug = slugify(item.webTitle, { lower: true, strict: true });
        
        // Verificar se já existe
        const existingPost = await Post.findOne({ slug });
        
        if (existingPost) {
          // Atualizar post existente
          await Post.findByIdAndUpdate(existingPost._id, {
            titulo: item.webTitle,
            imagem: item.fields?.thumbnail || '/public/images/landscape.jpg',
            categoria: item.sectionName || 'Geral',
            conteudo: item.fields?.body || item.fields?.trailText || '',
            autor: item.fields?.byline || 'The Guardian',
            updatedAt: new Date()
          });
          updated++;
        } else {
          // Criar novo post
          await Post.create({
            titulo: item.webTitle,
            imagem: item.fields?.thumbnail || '/public/images/landscape.jpg',
            categoria: item.sectionName || 'Geral',
            conteudo: item.fields?.body || item.fields?.trailText || '',
            autor: item.fields?.byline || 'The Guardian',
            slug,
            views: 0
          });
          imported++;
        }
      } catch (itemError) {
        console.error(`Erro ao processar item: ${item.webTitle}`, itemError);
      }
    }

    return { imported, updated };
  } catch (error) {
    console.error("Erro na importação:", error);
    throw error;
  }
} 