const fs = require('fs');
const axios = require('axios');

// Конфигурация
const config = {
  langFile: './config/lang.json',
  targetLanguages: ['en-US', 'uk', 'es-ES', 'ru'], // Языки для перевода
  sourceLanguage: 'ru', // Исходный язык текстов
  batchSize: 10, // Количество запросов за раз
  delayBetweenBatches: 1000 // Задержка между пачками запросов (мс)
};

// Функция для перевода текста
async function translateText(text, targetLang, sourceLang = config.sourceLanguage) {
  try {
    // Используем бесплатный Google Translate API
    const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: sourceLang,
        tl: targetLang,
        dt: 't',
        q: text
      }
    });

    // Извлекаем переведенный текст из ответа
    const translatedText = response.data[0][0][0];
    return translatedText;
  } catch (error) {
    console.error(`❌ Ошибка перевода "${text}" на ${targetLang}:`, error.message);
    return null;
  }
}

// Задержка между запросами
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Чтение lang.json
function readLangFile() {
  try {
    const data = fs.readFileSync(config.langFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('❌ Ошибка чтения lang.json:', error.message);
    process.exit(1);
  }
}

// Поиск текстов с пустыми переводами
function findEmptyTranslations(langData) {
  const emptyTranslations = [];
  const translations = langData.translations || {};

  for (const [textId, translationsObj] of Object.entries(translations)) {
    for (const lang of config.targetLanguages) {
      // Ищем пустые строки в переводах
      if (translationsObj[lang] === "" || translationsObj[lang] === '""') {
        emptyTranslations.push({
          textId,
          lang,
          originalText: textId
        });
      }
    }
  }

  return emptyTranslations;
}

// Перевод пачки текстов
async function translateBatch(batch) {
  const results = [];

  for (const item of batch) {
    console.log(`🔤 Перевод "${item.originalText.substring(0, 50)}..." на ${item.lang}`);
    
    const translated = await translateText(item.originalText, item.lang);
    
    if (translated) {
      results.push({
        ...item,
        translatedText: translated
      });
      console.log(`✅ Переведено: "${translated.substring(0, 50)}..."`);
    } else {
      results.push({
        ...item,
        translatedText: "" // Оставляем пустую строку при ошибке
      });
      console.log(`❌ Ошибка перевода, оставлено пустым`);
    }

    // Небольшая задержка между запросами
    await sleep(200);
  }

  return results;
}

// Основная функция перевода
async function translateAll() {
  console.log('🚀 ЗАПУСК ПЕРЕВОДА ПУСТЫХ СТРОК');
  console.log('========================================');

  // Чтение файла
  const langData = readLangFile();
  const translations = langData.translations || {};

  // Поиск пустых переводов
  const emptyTranslations = findEmptyTranslations(langData);
  
  if (emptyTranslations.length === 0) {
    console.log('✅ Пустых переводов не найдено!');
    return;
  }

  console.log(`📝 Найдено пустых переводов: ${emptyTranslations.length}`);

  // Разбиваем на пачки для избежания лимитов
  const batches = [];
  for (let i = 0; i < emptyTranslations.length; i += config.batchSize) {
    batches.push(emptyTranslations.slice(i, i + config.batchSize));
  }

  let translatedCount = 0;
  let errorCount = 0;

  // Обрабатываем каждую пачку
  for (let i = 0; i < batches.length; i++) {
    console.log(`\n📦 Обработка пачки ${i + 1}/${batches.length}`);
    
    const batchResults = await translateBatch(batches[i]);
    
    // Обновляем переводы в данных
    for (const result of batchResults) {
      if (result.translatedText && result.translatedText !== "") {
        if (!translations[result.textId]) {
          translations[result.textId] = {};
        }
        translations[result.textId][result.lang] = result.translatedText;
        translatedCount++;
      } else {
        errorCount++;
      }
    }

    // Задержка между пачками
    if (i < batches.length - 1) {
      console.log(`⏳ Задержка ${config.delayBetweenBatches}мс...`);
      await sleep(config.delayBetweenBatches);
    }
  }

  // Сохранение результатов
  langData.translations = translations;
  fs.writeFileSync(config.langFile, JSON.stringify(langData, null, 2), 'utf8');

  console.log('\n========================================');
  console.log(`✅ ПЕРЕВОД ЗАВЕРШЕН!`);
  console.log(`📊 Успешно переведено: ${translatedCount}`);
  console.log(`❌ Ошибок перевода: ${errorCount}`);
  console.log(`💾 Файл сохранен: ${config.langFile}`);
}

// Функция для перевода пустых строк конкретного языка
async function translateSpecificLanguage(targetLang) {
  console.log(`🚀 ПЕРЕВОД ПУСТЫХ СТРОК НА ${targetLang}`);
  console.log('========================================');

  const langData = readLangFile();
  const translations = langData.translations || {};

  const emptyTranslations = [];
  for (const [textId, translationsObj] of Object.entries(translations)) {
    if (translationsObj[targetLang] === "" || translationsObj[targetLang] === '""') {
      emptyTranslations.push({
        textId,
        lang: targetLang,
        originalText: textId
      });
    }
  }

  if (emptyTranslations.length === 0) {
    console.log(`✅ Пустых переводов на ${targetLang} не найдено!`);
    return;
  }

  console.log(`📝 Найдено пустых переводов на ${targetLang}: ${emptyTranslations.length}`);

  const batches = [];
  for (let i = 0; i < emptyTranslations.length; i += config.batchSize) {
    batches.push(emptyTranslations.slice(i, i + config.batchSize));
  }

  let translatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < batches.length; i++) {
    console.log(`\n📦 Пачка ${i + 1}/${batches.length}`);
    
    const batchResults = await translateBatch(batches[i]);
    
    for (const result of batchResults) {
      if (result.translatedText && result.translatedText !== "") {
        if (!translations[result.textId]) {
          translations[result.textId] = {};
        }
        translations[result.textId][result.lang] = result.translatedText;
        translatedCount++;
      } else {
        errorCount++;
      }
    }

    if (i < batches.length - 1) {
      await sleep(config.delayBetweenBatches);
    }
  }

  langData.translations = translations;
  fs.writeFileSync(config.langFile, JSON.stringify(langData, null, 2), 'utf8');

  console.log('\n========================================');
  console.log(`✅ ПЕРЕВОД НА ${targetLang} ЗАВЕРШЕН!`);
  console.log(`📊 Успешно переведено: ${translatedCount}`);
  console.log(`❌ Ошибок перевода: ${errorCount}`);
}

// Функция для проверки статуса пустых переводов
function showEmptyTranslationsStatus() {
  console.log('📊 СТАТУС ПУСТЫХ ПЕРЕВОДОВ');
  console.log('========================================');

  const langData = readLangFile();
  const translations = langData.translations || {};

  const stats = {
    totalTexts: Object.keys(translations).length,
    emptyTranslations: 0,
    byLanguage: {}
  };

  for (const lang of config.targetLanguages) {
    stats.byLanguage[lang] = {
      empty: 0,
      total: 0
    };
  }

  for (const [textId, langTranslations] of Object.entries(translations)) {
    for (const lang of config.targetLanguages) {
      stats.byLanguage[lang].total++;
      if (langTranslations[lang] === "" || langTranslations[lang] === '""') {
        stats.byLanguage[lang].empty++;
        stats.emptyTranslations++;
      }
    }
  }

  console.log(`📝 Всего текстов: ${stats.totalTexts}`);
  console.log(`❌ Пустых переводов: ${stats.emptyTranslations}`);
  console.log('\n🌐 Пустые переводы по языкам:');
  
  for (const [lang, data] of Object.entries(stats.byLanguage)) {
    const percentage = ((data.empty / data.total) * 100).toFixed(1);
    console.log(`   ${lang}: ${data.empty} пустых из ${data.total} (${percentage}%)`);
  }

  // Показать примеры пустых переводов
  console.log('\n🔍 Примеры текстов с пустыми переводами:');
  let examplesShown = 0;
  for (const [textId, langTranslations] of Object.entries(translations)) {
    if (examplesShown >= 5) break;
    
    const emptyLangs = config.targetLanguages.filter(lang => 
      langTranslations[lang] === "" || langTranslations[lang] === '""'
    );
    
    if (emptyLangs.length > 0) {
      console.log(`   "${textId.substring(0, 50)}..." - пусто в: ${emptyLangs.join(', ')}`);
      examplesShown++;
    }
  }

  console.log('========================================');
}

// Функция для поиска всех текстов, которые полностью отсутствуют в переводе
function findMissingTranslations() {
  console.log('🔍 ПОИСК ПОЛНОСТЬЮ ОТСУТСТВУЮЩИХ ПЕРЕВОДОВ');
  console.log('========================================');

  const langData = readLangFile();
  const translations = langData.translations || {};

  const completelyMissing = [];

  for (const [textId, langTranslations] of Object.entries(translations)) {
    const missingLangs = config.targetLanguages.filter(lang => 
      !langTranslations[lang] || 
      langTranslations[lang] === "" || 
      langTranslations[lang] === '""'
    );

    if (missingLangs.length === config.targetLanguages.length) {
      completelyMissing.push(textId);
    }
  }

  if (completelyMissing.length === 0) {
    console.log('✅ Полностью отсутствующих переводов не найдено!');
    return;
  }

  console.log(`❌ Найдено текстов без переводов: ${completelyMissing.length}`);
  console.log('\n📋 Список:');
  completelyMissing.forEach((textId, index) => {
    console.log(`   ${index + 1}. "${textId.substring(0, 60)}..."`);
  });
  console.log('========================================');
}

// Обработка аргументов командной строки
async function handleCommandLineArgs() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case '--all':
      case '-a':
        await translateAll();
        break;
      
      case '--lang':
      case '-l':
        const targetLang = args[1];
        if (!targetLang) {
          console.log('❌ Укажите язык для перевода: --lang en-US');
          process.exit(1);
        }
        if (!config.targetLanguages.includes(targetLang)) {
          console.log(`❌ Неподдерживаемый язык. Доступные: ${config.targetLanguages.join(', ')}`);
          process.exit(1);
        }
        await translateSpecificLanguage(targetLang);
        break;
      
      case '--status':
      case '-s':
        showEmptyTranslationsStatus();
        break;
      
      case '--missing':
      case '-m':
        findMissingTranslations();
        break;
      
      case '--help':
      case '-h':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  }
}

// Показать справку
function showHelp() {
  console.log(`
🎯 ИСПОЛЬЗОВАНИЕ: node translate-lang.js [КОМАНДА]

Команды:
  --all, -a              - Перевести все пустые строки ("")
  --lang, -l [ЯЗЫК]      - Перевести пустые строки на конкретный язык
  --status, -s           - Показать статус пустых переводов
  --missing, -m          - Найти полностью отсутствующие переводы
  --help, -h             - Показать эту справку

Примеры:
  node translate-lang.js --all
  node translate-lang.js --lang en-US
  node translate-lang.js --lang uk
  node translate-lang.js --status
  node translate-lang.js --missing

Поддерживаемые языки:
  en-US - Английский
  uk    - Украинский
  es-ES - Испанский
  ru    - Русский
  `);
}

// Запуск
if (require.main === module) {
  if (process.argv.length <= 2) {
    showHelp();
  } else {
    handleCommandLineArgs();
  }
}

module.exports = {
  translateAll,
  translateSpecificLanguage,
  showEmptyTranslationsStatus,
  findMissingTranslations
};