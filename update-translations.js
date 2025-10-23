const fs = require('fs');
const path = require('path');

// Конфигурация
const config = {
  jsFilesDir: './', // Папка с JS файлами
  langFile: './config/lang.json', // Файл с переводами
  textIdPatterns: [
    /textId:\s*"([^"]+)"/g,    // textId: "текст"
    /textId:\s*'([^']+)'/g,    // textId: 'текст'
    /textId:\s*`([^`]+)`/g     // textId: `текст`
  ]
};

// Чтение и парсинг lang.json
function readLangFile() {
  try {
    const data = fs.readFileSync(config.langFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Ошибка чтения lang.json:', error.message);
    return { translations: {} };
  }
}

// Поиск всех JS файлов в директории
function findJsFiles(dir) {
  const files = [];
  
  function traverseDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  traverseDirectory(dir);
  return files;
}

// Извлечение textId из JS файлов
function extractTextIdsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const textIds = new Set();
  
  config.textIdPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      textIds.add(match[1]);
    }
  });
  
  return Array.from(textIds);
}

// Получение всех textId из JS файлов
function getAllTextIdsFromJsFiles() {
  console.log('🔍 Поиск JS файлов...');
  const jsFiles = findJsFiles(config.jsFilesDir);
  console.log(`📁 Найдено ${jsFiles.length} JS файлов`);
  
  console.log('🔍 Извлечение textId из JS файлов...');
  const allTextIds = new Set();
  
  for (const file of jsFiles) {
    const textIds = extractTextIdsFromFile(file);
    textIds.forEach(id => allTextIds.add(id));
  }
  
  console.log(`📝 Найдено ${allTextIds.size} уникальных textId в JS файлах`);
  return allTextIds;
}

// Функция для добавления отсутствующих переводов
function addMissingTranslations(langData, jsTextIds) {
  const existingTranslations = langData.translations || {};
  const missingTextIds = Array.from(jsTextIds).filter(textId => 
    !existingTranslations[textId]
  );
  
  console.log(`❌ Отсутствует в lang.json: ${missingTextIds.length} textId`);
  
  if (missingTextIds.length === 0) {
    console.log('✅ Все textId уже присутствуют в lang.json');
    return 0;
  }
  
  // Добавление отсутствующих textId
  missingTextIds.forEach(textId => {
    existingTranslations[textId] = {
      "en-US": "",
      "uk": "",
      "es-ES": "",
      "ru": textId
    };
    console.log(`➕ Добавлен: "${textId}"`);
  });
  
  langData.translations = existingTranslations;
  return missingTextIds.length;
}

// Функция для удаления устаревших переводов
function removeObsoleteTranslations(langData, jsTextIds) {
  const existingTranslations = langData.translations || {};
  const obsoleteTextIds = Object.keys(existingTranslations).filter(textId => 
    !jsTextIds.has(textId)
  );
  
  console.log(`🗑️  Устаревших переводов в lang.json: ${obsoleteTextIds.length}`);
  
  if (obsoleteTextIds.length === 0) {
    console.log('✅ Устаревших переводов не найдено');
    return 0;
  }
  
  // Удаление устаревших textId
  obsoleteTextIds.forEach(textId => {
    delete existingTranslations[textId];
    console.log(`➖ Удален: "${textId}"`);
  });
  
  langData.translations = existingTranslations;
  return obsoleteTextIds.length;
}

// Сохранение файла
function saveLangFile(langData) {
  fs.writeFileSync(config.langFile, JSON.stringify(langData, null, 2), 'utf8');
  console.log(`💾 Файл ${config.langFile} сохранен`);
}

// Основная функция - добавление отсутствующих переводов
async function updateTranslations() {
  try {
    console.log('🔄 ЗАПУСК ОБНОВЛЕНИЯ ПЕРЕВОДОВ (добавление отсутствующих)');
    console.log('========================================');
    
    const jsTextIds = getAllTextIdsFromJsFiles();
    const langData = readLangFile();
    
    const addedCount = addMissingTranslations(langData, jsTextIds);
    
    if (addedCount > 0) {
      saveLangFile(langData);
      console.log(`✅ Добавлено новых переводов: ${addedCount}`);
    } else {
      console.log('✅ Изменений не требуется');
    }
  } catch (error) {
    console.error('❌ Ошибка при обновлении переводов:', error);
    throw error;
  }
}

// Функция для очистки устаревших переводов
async function cleanTranslations() {
  try {
    console.log('🔄 ЗАПУСК ОЧИСТКИ ПЕРЕВОДОВ (удаление устаревших)');
    console.log('========================================');
    
    const jsTextIds = getAllTextIdsFromJsFiles();
    const langData = readLangFile();
    
    const removedCount = removeObsoleteTranslations(langData, jsTextIds);
    
    if (removedCount > 0) {
      saveLangFile(langData);
      console.log(`✅ Удалено устаревших переводов: ${removedCount}`);
    } else {
      console.log('✅ Устаревших переводов не найдено');
    }
  } catch (error) {
    console.error('❌ Ошибка при очистке переводов:', error);
    throw error;
  }
}

// Полная синхронизация
async function syncTranslations() {
  try {
    console.log('🔄 ЗАПУСК ПОЛНОЙ СИНХРОНИЗАЦИИ ПЕРЕВОДОВ');
    console.log('========================================');
    
    const jsTextIds = getAllTextIdsFromJsFiles();
    const langData = readLangFile();
    
    const addedCount = addMissingTranslations(langData, jsTextIds);
    const removedCount = removeObsoleteTranslations(langData, jsTextIds);
    
    if (addedCount > 0 || removedCount > 0) {
      saveLangFile(langData);
      console.log(`✅ Синхронизация завершена: добавлено ${addedCount}, удалено ${removedCount}`);
    } else {
      console.log('✅ Изменений не требуется - переводы уже синхронизированы');
    }
  } catch (error) {
    console.error('❌ Ошибка при синхронизации переводов:', error);
    throw error;
  }
}

// Функция для показа статистики
async function showStatistics() {
  try {
    console.log('📊 СТАТИСТИКА ПЕРЕВОДОВ');
    console.log('========================================');
    
    const jsTextIds = getAllTextIdsFromJsFiles();
    const langData = readLangFile();
    const existingTranslations = langData.translations || {};
    
    const missingCount = Array.from(jsTextIds).filter(textId => !existingTranslations[textId]).length;
    const obsoleteCount = Object.keys(existingTranslations).filter(textId => !jsTextIds.has(textId)).length;
    
    console.log(`📁 JS файлы: ${findJsFiles(config.jsFilesDir).length} файлов`);
    console.log(`🔤 TextId в JS: ${jsTextIds.size}`);
    console.log(`📖 Переводов в lang.json: ${Object.keys(existingTranslations).length}`);
    console.log(`❌ Отсутствующих переводов: ${missingCount}`);
    console.log(`🗑️  Устаревших переводов: ${obsoleteCount}`);
    console.log('========================================');
  } catch (error) {
    console.error('❌ Ошибка при получении статистики:', error);
    throw error;
  }
}

// Обработка аргументов командной строки
async function handleCommandLineArgs() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case '--add':
      case '-a':
        await updateTranslations();
        break;
      
      case '--clean':
      case '-c':
        await cleanTranslations();
        break;
      
      case '--sync':
      case '-s':
        await syncTranslations();
        break;
      
      case '--stats':
      case '-st':
        await showStatistics();
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
🎯 Использование: node update-translations.js [КОМАНДА]

Команды:
  --add, -a     - Добавить отсутствующие переводы
  --clean, -c   - Удалить устаревшие переводы
  --sync, -s    - Полная синхронизация (добавить + удалить)
  --stats, -st  - Показать статистику
  --help, -h    - Показать эту справку

Примеры:
  node update-translations.js --add
  node update-translations.js --clean
  node update-translations.js --sync
  node update-translations.js --stats
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

// Экспорт функций для использования в других модулях
module.exports = {
  updateTranslations,
  cleanTranslations,
  syncTranslations,
  showStatistics
};