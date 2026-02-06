class CronTranslator {
    constructor() {
        this.fields = [
            { name: 'минуту', values: Array.from({length: 60}, (_, i) => i) },
            { name: 'час', values: Array.from({length: 24}, (_, i) => i) },
            { name: 'день месяца', values: Array.from({length: 31}, (_, i) => i + 1) },
            { name: 'месяц', values: Array.from({length: 12}, (_, i) => i + 1) },
            { name: 'день недели', values: Array.from({length: 7}, (_, i) => i) }
        ];
        
        this.weekDays = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
        this.weekDaysAccusative = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
        this.weekDaysGenitive = ['воскресенья', 'понедельника', 'вторника', 'среды', 'четверга', 'пятницы', 'субботы'];
        this.months = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
        this.monthsGenitive = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        this.monthsPrepositional = ['январе', 'феврале', 'марте', 'апреле', 'мае', 'июне', 'июле', 'августе', 'сентябре', 'октябре', 'ноябре', 'декабре'];
        this.weekDaysWithArticle = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];
        this.weekDayArticles = ['каждое', 'каждый', 'каждый', 'каждую', 'каждый', 'каждую', 'каждую'];
    }

    translate(cronExpression) {
        let parts = cronExpression.trim().split(/\s+/);

        if (parts.length === 6) {
            parts = parts.slice(1);
        }

        if (parts.length !== 5) {
            return 'Неверный формат cron. Должно быть 5 полей: минуты часы день_месяца месяц день_недели';
        }

        try {
            const descriptions = parts.map((part, index) => 
                this.describeField(part, index)
            );

            return this.buildFinalDescription(descriptions, parts);
        } catch (error) {
            return `Ошибка в разборе cron: ${error.message}`;
        }
    }

    describeField(part, fieldIndex) {
        if (part === '*') {
            return {type: 'every', value: null};
        }

        // Обработка шага с начальным значением n/m
        if (part.includes('/')) {
            const [startStr, stepStr] = part.split('/');
            const step = parseInt(stepStr);
            
            if (startStr === '*') {
                return {type: 'step', value: step, fieldIndex};
            } else {
                const start = parseInt(startStr);
                return {type: 'step_start', start, step, fieldIndex};
            }
        }

        // Обработка диапазонов с шагом
        if (part.includes('-') && part.includes('/')) {
            const [range, stepPart] = part.split('/');
            const step = parseInt(stepPart);
            const [start, end] = range.split('-').map(x => parseInt(x));
            return {type: 'range_step', start, end, step, fieldIndex};
        }

        // Обработка диапазонов
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(x => parseInt(x));
            return {type: 'range', start, end, fieldIndex};
        }

        // Обработка списков
        if (part.includes(',')) {
            const values = part.split(',').map(x => parseInt(x));
            return {type: 'list', values, fieldIndex};
        }

        // Одиночное значение
        const value = parseInt(part);
        return {type: 'single', value, fieldIndex};
    }

    buildFinalDescription(descriptions, parts) {
         const [minuteDesc, hourDesc, dayDesc, monthDesc, weekDayDesc] = descriptions;
    
        // Проверяем, является ли это выполнением каждую минуту
        const isEveryMinute = minuteDesc.type === 'every' && 
                            hourDesc.type === 'every' && 
                            dayDesc.type === 'every' && 
                            monthDesc.type === 'every' && 
                            weekDayDesc.type === 'every';
        
        if (isEveryMinute) {
            return 'Выполняется каждую минуту';
        }
        
        // Проверяем, есть ли конкретные значения для дня месяца и месяца (годовое выполнение)
        const hasSpecificDayAndMonth = 
            (dayDesc.type === 'single' && monthDesc.type === 'single') ||
            (dayDesc.type === 'single' && monthDesc.type === 'list') ||
            (dayDesc.type === 'list' && monthDesc.type === 'single') ||
            (dayDesc.type === 'list' && monthDesc.type === 'list');

        if (hasSpecificDayAndMonth) {
            return this.buildYearlyDescription(descriptions);
        }

        // Если есть шаги с начальными значениями, строим сложное описание
        const hasStepStarts = [minuteDesc, hourDesc, dayDesc, monthDesc, weekDayDesc].some(
            desc => desc.type === 'step_start' || desc.type === 'range_step'
        );

        if (hasStepStarts) {
            return this.buildStepBasedDescription(descriptions);
        }

        // Остальная логика для обычных случаев...
        return this.buildStandardDescription(descriptions);
    }

    buildYearlyDescription(descriptions) {
        const [minuteDesc, hourDesc, dayDesc, monthDesc, weekDayDesc] = descriptions;
        const parts = [];

        // День месяца
        if (dayDesc.type === 'single') {
            parts.push(`${dayDesc.value}-го числа`);
        } else if (dayDesc.type === 'list') {
            const dayList = dayDesc.values.map(d => `${d}-го числа`).join(', ');
            parts.push(dayList);
        }

        // Месяц
        if (monthDesc.type === 'single') {
            parts.push(this.monthsGenitive[monthDesc.value - 1]);
        } else if (monthDesc.type === 'list') {
            const monthList = monthDesc.values.map(m => this.monthsGenitive[m - 1]).join(', ');
            parts.push(monthList);
        }

        // Время (добавляем в конец)
        const timeStr = this.formatTimeFromDescriptions(minuteDesc, hourDesc);
        if (timeStr) {
            parts.push(timeStr);
        } else {
            parts.push('в 00:00');
        }

        return `Выполняется каждый год ${parts.join(' ')}`;
    }

    buildStepBasedDescription(descriptions) {
        const [minuteDesc, hourDesc, dayDesc, monthDesc, weekDayDesc] = descriptions;
        const parts = [];

        // Минуты
        if (minuteDesc.type === 'range') {
            const startSuffix = this.getMinuteRangeSuffix(minuteDesc.start, false);
            const endSuffix = this.getMinuteRangeSuffix(minuteDesc.end, true);
            const preposition = this.getPreposition(minuteDesc.start);
            parts.push(`${preposition} ${minuteDesc.start}-${startSuffix} по ${minuteDesc.end}-${endSuffix} минуту`);
        } else if (minuteDesc.type === 'step_start') {
            parts.push(`${this.getStepWord(minuteDesc.step, 'минуты')} ${minuteDesc.step} ${this.getMinuteStepForm(minuteDesc.step)}, начиная с ${minuteDesc.start}-${this.getMinuteSuffix(minuteDesc.start)} минут каждого часа`);
        } else if (minuteDesc.type === 'step') {
            parts.push(`${this.getStepWord(minuteDesc.value, 'минуты')} ${minuteDesc.value} ${this.getMinuteStepForm(minuteDesc.value)}`);
        } else if (minuteDesc.type !== 'every') {
            parts.push(this.formatTimePart(minuteDesc));
        }

        // Часы
        if (hourDesc.type === 'range') {
            const start = hourDesc.start.toString().padStart(2, '0');
            const end = hourDesc.end.toString().padStart(2, '0');
            parts.push(`с ${start}:00 по ${end}:00`);
        } else if (hourDesc.type === 'step_start') {
            const hourStr = hourDesc.start.toString().padStart(2, '0');
            parts.push(`${this.getStepWord(hourDesc.step, 'часы')} ${hourDesc.step} ${this.getHourStepForm(hourDesc.step)}, начиная с ${hourStr}:00`);
        } else if (hourDesc.type === 'step') {
            parts.push(`${this.getStepWord(hourDesc.value, 'часы')} ${hourDesc.value} ${this.getHourStepForm(hourDesc.value)}`);
        } else if (hourDesc.type !== 'every') {
            parts.push(this.formatTimePart(hourDesc));
        }

        // Дни месяца
        if (dayDesc.type === 'range') {
            const startSuffix = this.getDayOfMonthSuffix(dayDesc.start, false);
            const endSuffix = this.getDayOfMonthSuffix(dayDesc.end, true);
            parts.push(`с ${dayDesc.start}-${startSuffix} по ${dayDesc.end}-${endSuffix} число`);
        } else if (dayDesc.type === 'step_start') {
            parts.push(`${this.getStepWord(dayDesc.step, 'дни')} ${dayDesc.step} дня, начиная с ${dayDesc.start}-го числа месяца`);
        } else if (dayDesc.type === 'step') {
            parts.push(`${this.getStepWord(dayDesc.value, 'дни')} ${dayDesc.value} дня`);
        } else if (dayDesc.type !== 'every') {
            parts.push(this.formatDatePart(dayDesc));
        }

        // Месяцы
        if (monthDesc.type === 'step_start') {
            parts.push(`${this.getStepWord(monthDesc.step, 'месяцы')} ${monthDesc.step} ${this.getMonthStepForm(monthDesc.step)}, с ${this.monthsGenitive[monthDesc.start - 1]} по ${this.months[11]}`);
        } else if (monthDesc.type === 'step') {
            parts.push(`${this.getStepWord(monthDesc.value, 'месяцы')} ${monthDesc.value} ${this.getMonthStepForm(monthDesc.value)}`);
        } else if (monthDesc.type !== 'every') {
            parts.push(this.formatDatePart(monthDesc));
        }

        // Дни недели
        if (weekDayDesc.type === 'step_start') {
            const preposition = this.getDayOfWeekPreposition(this.weekDaysGenitive[weekDayDesc.start])
            parts.push(`${this.getStepWord(weekDayDesc.step, 'дни')} ${weekDayDesc.step} дня недели, ${preposition} ${this.weekDaysGenitive[weekDayDesc.start]} по ${this.weekDaysAccusative[6]}`);
        } else if (weekDayDesc.type === 'step') {
            parts.push(`${this.getStepWord(weekDayDesc.value, 'дни')} ${weekDayDesc.value} дня недели`);
        } else if (weekDayDesc.type !== 'every') {
            parts.push(this.formatDatePart(weekDayDesc));
        }

        return `Выполняется ${parts.join(', ')}`;
    }

    // Метод для определения "каждый/каждые"
    getStepWord(step, fieldType) {
        if (step === 1) {
            switch (fieldType) {
                case 'минуты': return 'каждую';
                case 'часы': return 'каждый';
                case 'дни': return 'каждый';
                case 'месяцы': return 'каждый';
                default: return 'каждый';
            }
        }
        return 'каждые';
    }

    // Методы для правильного склонения
    getMinuteStepForm(step) {
        if (step === 1) return 'минуту';
        if (step >= 11 && step <= 14) return 'минут';
        const lastDigit = step % 10;
        if (lastDigit === 1) return 'минуту';
        if (lastDigit >= 2 && lastDigit <= 4) return 'минуты';
        return 'минут';
    }

    getHourStepForm(step) {
        if (step === 1) return 'час';
        if (step >= 11 && step <= 14) return 'часов';
        const lastDigit = step % 10;
        if (lastDigit === 1) return 'час';
        if (lastDigit >= 2 && lastDigit <= 4) return 'часа';
        return 'часов';
    }

    getMonthStepForm(step) {
        if (step === 1) return 'месяц';
        if (step >= 11 && step <= 14) return 'месяцев';
        const lastDigit = step % 10;
        if (lastDigit === 1) return 'месяц';
        if (lastDigit >= 2 && lastDigit <= 4) return 'месяца';
        return 'месяцев';
    }

    getMinuteSuffix(minute) {
        if (minute >= 11 && minute <= 14) return 'ти';
        const lastDigit = minute % 10;
        if (lastDigit === 1) return 'ой';
        if (lastDigit === 2) return 'х';
        if (lastDigit === 3) return 'х';
        if (lastDigit === 4) return 'х';
        return 'ти';
    }

    getMinuteRangeSuffix(minute, isEndOfRange = false) {
        if (isEndOfRange) {
            return 'ю';
        }
        
        if (minute >= 11 && minute <= 14) return 'ой';
        const lastDigit = minute % 10;
        if (lastDigit === 1) return 'ой';
        if (lastDigit === 2) return 'ой';
        if (lastDigit === 3) return 'й';
        if (lastDigit === 4) return 'ой';
        if (lastDigit === 5) return 'ой';
        if (lastDigit === 6) return 'ой';
        if (lastDigit === 7) return 'ой';
        if (lastDigit === 8) return 'ой';
        if (lastDigit === 9) return 'ой';
        return 'ой';
    }

    getDayOfMonthSuffix(day, isEndOfRange = false) {
        if (isEndOfRange) {
            if (day >= 11 && day <= 14) return 'ое';
            const lastDigit = day % 10;
            if (lastDigit === 1) return 'ое';
            if (lastDigit === 2) return 'ое';
            if (lastDigit === 3) return 'ье';
            if (lastDigit === 4) return 'ое';
            if (lastDigit === 5) return 'ое';
            if (lastDigit === 6) return 'ое';
            if (lastDigit === 7) return 'ое';
            if (lastDigit === 8) return 'ое';
            if (lastDigit === 9) return 'ое';
            return 'ое';
        }
        
        if (day >= 11 && day <= 14) return 'го';
        const lastDigit = day % 10;
        if (lastDigit === 1) return 'го';
        if (lastDigit === 2) return 'го';
        if (lastDigit === 3) return 'го';
        if (lastDigit === 4) return 'го';
        if (lastDigit === 5) return 'го';
        if (lastDigit === 6) return 'го';
        if (lastDigit === 7) return 'го';
        if (lastDigit === 8) return 'го';
        if (lastDigit === 9) return 'го';
        return 'го';
    }

    buildStandardDescription(descriptions) {
        const [minuteDesc, hourDesc, dayDesc, monthDesc, weekDayDesc] = descriptions;
        
        let result = 'Выполняется ';
        
        const timeStr = this.formatTimeFromDescriptions(minuteDesc, hourDesc);
        if (timeStr) {
            result += timeStr;
        }

        // Если все поля дня, месяца и дня недели - "каждый день"
        const isEveryDay = dayDesc.type === 'every' && monthDesc.type === 'every' && weekDayDesc.type === 'every';
        
        const dateParts = [];
        if (dayDesc.type !== 'every') dateParts.push(this.formatDatePart(dayDesc));
        if (monthDesc.type !== 'every') dateParts.push(this.formatDatePart(monthDesc));
        if (weekDayDesc.type !== 'every') dateParts.push(this.formatDatePart(weekDayDesc));

        if (dateParts.length > 0) {
            result += ' ' + dateParts.join(', ');
        } else if (isEveryDay && !timeStr) {
            // Добавляем "каждый день" только если нет информации о времени
            result += 'каждый день';
        } else if (isEveryDay && timeStr && !timeStr.includes('каждый час') && !timeStr.includes('каждую минуту')) {
            // Добавляем "каждый день" если есть время, но это не почасовое или поминутное выполнение
            result += ' каждый день';
        }

        return result;
    }

    formatTime(hours, minutes) {
        if (minutes === 0) {
            return `${hours.toString().padStart(2, '0')}:00`;
        }
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    formatTimeFromDescriptions(minuteDesc, hourDesc) {
        // Если все минуты и все часы - это каждую минуту
        if (minuteDesc.type === 'every' && hourDesc.type === 'every') {
            return 'каждую минуту';
        }
        // Если минуты 0 и каждый час - это почасовое выполнение
        if (minuteDesc.type === 'single' && minuteDesc.value === 0 && hourDesc.type === 'every') {
            return 'каждый час';
        }

        // Если минуты 0 и есть конкретные часы
        if (minuteDesc.type === 'single' && minuteDesc.value === 0) {
            if (hourDesc.type === 'list') {
                const hourList = hourDesc.values.map(h => `${h.toString().padStart(2, '0')}:00`).join(', ');
                return `в ${hourList}`;
            }
            if (hourDesc.type === 'single') {
                return `в ${this.formatTime(hourDesc.value, 0)}`;
            }
            if (hourDesc.type === 'range') {
                const start = hourDesc.start.toString().padStart(2, '0');
                const end = hourDesc.end.toString().padStart(2, '0');
                return `с ${start}:00 по ${end}:00 каждый час`;
            }
        }

        // Если все минуты и конкретный час
        if (minuteDesc.type === 'every' && hourDesc.type === 'single') {
            const hour = hourDesc.value.toString().padStart(2, '0');
            return `каждую минуту с ${hour}:00 по ${hour}:59`;
        }

        // Если все минуты и диапазон часов
        if (minuteDesc.type === 'every' && hourDesc.type === 'range') {
            const startHour = hourDesc.start.toString().padStart(2, '0');
            const endHour = hourDesc.end.toString().padStart(2, '0');
            return `каждую минуту с ${startHour}:00 по ${endHour}:59`;
        }

        // Если диапазон минут
        if (minuteDesc.type === 'range' && hourDesc.type === 'single') {
            const startSuffix = this.getMinuteRangeSuffix(minuteDesc.start, false);
            const endSuffix = this.getMinuteRangeSuffix(minuteDesc.end, true);
            const preposition = (minuteDesc.start === 2 || minuteDesc.start === 3) ? 'со' : 'с';
            return `${preposition} ${minuteDesc.start}-${startSuffix} по ${minuteDesc.end}-${endSuffix} минуту каждого часа в ${hourDesc.value.toString().padStart(2, '0')}:00`;
        }

        // Общий случай
        const timeParts = [];
        if (hourDesc.type !== 'every') timeParts.push(this.formatTimePart(hourDesc));
        if (minuteDesc.type !== 'every' && !(minuteDesc.type === 'single' && minuteDesc.value === 0)) {
            timeParts.push(this.formatTimePart(minuteDesc));
        }
        
        return timeParts.length > 0 ? `в ${timeParts.join(' ')}` : '';
    }

    getPreposition(number) {
        return (number === 2) ? 'со' : 'с';
    }

    getDayOfWeekPreposition(day) {
        return (day === "вторника" || day === "среды") ? 'со' : 'с';
    }

    formatTimePart(desc) {
        switch (desc.type) {
            case 'single':
                switch (desc.fieldIndex) {
                    case 0: // минуты
                        return `${desc.value} минут${this.getRussianPlural(desc.value, 'а', 'ы', '')}`;
                    case 1: // часы
                        return `${desc.value.toString().padStart(2, '0')}:00`;
                    default:
                        return desc.value.toString();
                }
            case 'range':
                if (desc.fieldIndex === 0) { // минуты
                    const startSuffix = this.getMinuteRangeSuffix(desc.start, false);
                    const endSuffix = this.getMinuteRangeSuffix(desc.end, true);
                    const preposition = this.getPreposition(desc.start);
                    return `${preposition} ${desc.start}-${startSuffix} по ${desc.end}-${endSuffix} минуту`;
                }
                if (desc.fieldIndex === 1) {
                    const start = desc.start.toString().padStart(2, '0');
                    const end = desc.end.toString().padStart(2, '0');
                    return `с ${start}:00 по ${end}:00`;
                }
                return `с ${desc.start} по ${desc.end}`;
            case 'list':
                const values = desc.values.map(v => 
                    desc.fieldIndex === 1 ? `${v.toString().padStart(2, '0')}:00` : v.toString()
                );
                return values.join(', ');
            case 'step':
                if (desc.fieldIndex === 0) {
                    return `${this.getStepWord(desc.value, 'минуты')} ${desc.value} ${this.getMinuteStepForm(desc.value)}`;
                }
                if (desc.fieldIndex === 1) {
                    return `${this.getStepWord(desc.value, 'часы')} ${desc.value} ${this.getHourStepForm(desc.value)}`;
                }
                return `${this.getStepWord(desc.value, '')} ${desc.value}`;
            case 'step_start':
                if (desc.fieldIndex === 0) {
                    return `${this.getStepWord(desc.step, 'минуты')} ${desc.step} ${this.getMinuteStepForm(desc.step)}, начиная с ${desc.start}-${this.getMinuteSuffix(desc.start)}`;
                }
                if (desc.fieldIndex === 1) {
                    return `${this.getStepWord(desc.step, 'часы')} ${desc.step} ${this.getHourStepForm(desc.step)}, начиная с ${desc.start.toString().padStart(2, '0')}:00`;
                }
                return `${this.getStepWord(desc.step, '')} ${desc.step}, начиная с ${desc.start}`;
            default:
                return '';
        }
    }

    formatDatePart(desc) {
        switch (desc.type) {
            case 'single':
                switch (desc.fieldIndex) {
                    case 2: // день месяца
                        return `${desc.value}-${this.getDayOfMonthSuffix(desc.value)} числа каждого месяца`;
                    case 3: // месяц
                        return `в ${this.monthsPrepositional[desc.value - 1]}`;
                    case 4: // день недели
                        return `${this.weekDayArticles[desc.value]} ${this.weekDaysWithArticle[desc.value]}`;
                    default:
                        return desc.value.toString();
                }
            case 'range':
                if (desc.fieldIndex === 2) { // дни месяца
                    const startSuffix = this.getDayOfMonthSuffix(desc.start, false);
                    const endSuffix = this.getDayOfMonthSuffix(desc.end, true);
                    const preposition = this.getPreposition(desc.start)
                    return `${preposition} ${desc.start}-${startSuffix} по ${desc.end}-${endSuffix} число`;
                }
                if (desc.fieldIndex === 4) { // дни недели
                    const startDay = this.weekDaysGenitive[desc.start];
                    const endDay = this.weekDaysAccusative[desc.end];
                    const preposition = this.getDayOfWeekPreposition(desc.start)
                    return `${preposition} ${startDay} по ${endDay}`;
                }
                return `с ${desc.start} по ${desc.end}`;
            case 'step':
                if (desc.fieldIndex === 2) {
                    return `${this.getStepWord(desc.value, 'дни')} ${desc.value} дня`;
                }
                if (desc.fieldIndex === 3) {
                    return `${this.getStepWord(desc.value, 'месяцы')} ${desc.value} ${this.getMonthStepForm(desc.value)}`;
                }
                if (desc.fieldIndex === 4) {
                    return `${this.getStepWord(desc.value, 'дни')} ${desc.value} дня недели`;
                }
                return `${this.getStepWord(desc.value, '')} ${desc.value}`;
            case 'step_start':
                if (desc.fieldIndex === 2) {
                    return `${this.getStepWord(desc.step, 'дни')} ${desc.step} дня, начиная с ${desc.start}-го числа`;
                }
                if (desc.fieldIndex === 3) {
                    return `${this.getStepWord(desc.step, 'месяцы')} ${desc.step} ${this.getMonthStepForm(desc.step)}, с ${this.monthsGenitive[desc.start - 1]} по ${this.months[11]}`;
                }
                if (desc.fieldIndex === 4) {
                    const preposition = this.getDayOfWeekPreposition(this.weekDaysGenitive[desc.start])
                    return `${this.getStepWord(desc.step, 'дни')} ${desc.step} дня недели, ${preposition} ${this.weekDaysGenitive[desc.start]} по ${this.weekDaysAccusative[6]}`;
                }
                return `${this.getStepWord(desc.step, '')} ${desc.step}, начиная с ${desc.start}`;
            case 'list':
                const values = desc.values.map(v => {
                    switch (desc.fieldIndex) {
                        case 2: return `${v} числа`;
                        case 3: return this.monthsGenitive[v - 1];
                        case 4: return this.weekDaysAccusative[v];
                        default: return v.toString();
                    }
                });
                return values.join(', ');
            default:
                return '';
        }
    }

    getRussianPlural(number, one, two, five) {
        number = Math.abs(number);
        if (number > 10 && number < 20) return five;
        
        const lastDigit = number % 10;
        if (lastDigit === 1) return one;
        if (lastDigit >= 2 && lastDigit <= 4) return two;
        return five;
    }
}

module.exports = CronTranslator;