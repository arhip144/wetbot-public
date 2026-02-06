class ProfileMemoryAnalyzer {
    static analyze(client, sampleSize = 50) {
        const profiles = Array.from(client.cache.profiles.values());
        const sample = profiles.slice(0, Math.min(sampleSize, profiles.length));
        
        console.log(`📊 Анализ памяти для ${sample.length} профилей...`);
        
        const results = {
            totalProfiles: profiles.length,
            sampleSize: sample.length,
            sizes: [],
            propertyCounts: []
        };
        
        // Анализируем каждый профиль в выборке
        for (let i = 0; i < sample.length; i++) {
            const profile = sample[i];
            const analysis = this.analyzeSingleProfile(profile);
            
            results.sizes.push(analysis.sizeMB);
            results.propertyCounts.push(analysis.propertyCount);
            
            if ((i + 1) % 10 === 0) {
                console.log(`✅ Обработано: ${i + 1}/${sample.length}`);
                
                // Принудительная сборка мусора (если доступно)
                if (global.gc) {
                    global.gc();
                    console.log('🧹 Сборка мусора выполнена');
                }
            }
        }
        
        return this.calculateResults(results);
    }
    
    static analyzeSingleProfile(profile) {
        let propertyCount = 0;
        let stringLength = 0;
        
        // Быстрый подсчет свойств
        for (const key in profile) {
            if (key.startsWith('_')) {
                propertyCount++;
                
                const value = profile[key];
                if (typeof value === 'string') {
                    stringLength += value.length;
                }
            }
        }
        
        // Формула оценки: базовый размер + свойства + строки
        const baseSize = 100; // Базовый размер объекта
        const perProperty = 50; // ~50 bytes на свойство
        const perChar = 2; // 2 bytes на символ строки
        
        const estimatedBytes = baseSize + (propertyCount * perProperty) + (stringLength * perChar);
        const sizeMB = estimatedBytes / (1024 * 1024);
        
        return {
            sizeMB: sizeMB,
            propertyCount: propertyCount,
            stringLength: stringLength
        };
    }
    
    static calculateResults(results) {
        const sizes = results.sizes;
        const totalSize = sizes.reduce((sum, size) => sum + size, 0);
        const averageSize = totalSize / sizes.length;
        const estimatedTotalMB = averageSize * results.totalProfiles;
        
        console.log('\n══════════════════════════════════════');
        console.log('📊 РЕЗУЛЬТАТЫ АНАЛИЗА ПАМЯТИ');
        console.log('══════════════════════════════════════');
        console.log(`👥 Всего профилей: ${results.totalProfiles}`);
        console.log(`🔍 Размер выборки: ${results.sampleSize}`);
        console.log(`📏 Средний размер: ${averageSize.toFixed(4)} MB`);
        console.log(`📈 Максимальный: ${Math.max(...sizes).toFixed(4)} MB`);
        console.log(`📉 Минимальный: ${Math.min(...sizes).toFixed(4)} MB`);
        console.log(`📊 Среднее свойств: ${(results.propertyCounts.reduce((a, b) => a + b, 0) / results.propertyCounts.length).toFixed(0)}`);
        console.log(`💾 Общая оценка: ${estimatedTotalMB.toFixed(2)} MB`);
        console.log('══════════════════════════════════════\n');
        
        // Оценка для разных масштабов
        console.log('📈 ПРОГНОЗ ДЛЯ МАСШТАБИРОВАНИЯ:');
        console.log(`   1,000 профилей: ${(averageSize * 1000).toFixed(2)} MB`);
        console.log(`   10,000 профилей: ${(averageSize * 10000).toFixed(2)} MB`);
        console.log(`   100,000 профилей: ${(averageSize * 100000).toFixed(2)} MB`);
        console.log(`   1,000,000 профилей: ${(averageSize * 1000000).toFixed(2)} MB`);
        
        return {
            totalProfiles: results.totalProfiles,
            sampleSize: results.sampleSize,
            averageSizeMB: averageSize,
            estimatedTotalMB: estimatedTotalMB,
            maxSizeMB: Math.max(...sizes),
            minSizeMB: Math.min(...sizes),
            avgProperties: results.propertyCounts.reduce((a, b) => a + b, 0) / results.propertyCounts.length
        };
    }
}
module.exports = ProfileMemoryAnalyzer