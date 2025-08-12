import 'dotenv/config';
import mongoose from 'mongoose';
import { importGuardianNews } from '../services/importGuardian.js';

(async () => {
  try {
    if (!process.env.GUARDIAN_API_KEY) {
      throw new Error('GUARDIAN_API_KEY não configurada no .env');
    }
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não configurada no .env');
    }

    console.log('Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado. Importando notícias...');

    const result = await importGuardianNews();
    console.log(`Importação concluída: ${result.imported} novos, ${result.updated} atualizados`);
  } catch (err) {
    console.error('Erro na importação:', err.message);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Desconectado do MongoDB.');
    } catch {}
  }
})();