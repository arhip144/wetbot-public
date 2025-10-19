<div align="center">

# 💰 WETBOT

**Мощный экономический бот для Discord с уникальной системой и тонкой настройкой**

[![Node.js Version](https://img.shields.io/badge/Node.js-22.12.0+-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?logo=mongodb)](https://mongodb.com)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[Установка](#-установка) • [Использование](#-использование) • [Конфигурация](#-конфигурация) • [Разработка](#-разработка)

</div>

## ✨ О проекте

**WETBOT** — это продвинутый экономический бот для Discord, который предлагает богатый функционал для создания увлекательной экономики на вашем сервере. От базовых операций с валютой до сложных систем с настраиваемыми параметрами — WETBOT предоставляет полный контроль над виртуальной экономикой.

### 🎯 Ключевые особенности

- 💸 **Гибкая экономическая система** с настраиваемой валютой
- ⚙️ **Тонкая настройка** всех аспектов экономики
- 📊 **Подробная статистика** и аналитика
- 🎮 **Миниигры** и активность для заработка
- 🔧 **Административные инструменты** для полного контроля
- 📈 **Система лидеров** и таблицы рекордов

## 🛠 Технологический стек

- **🌐 Backend:** [Node.js](https://nodejs.org/) (v22.12.0+)
- **💾 Database:** [MongoDB](https://mongodb.com)
- **📦 Package Manager:** npm
- **🐍 Discord API:** [Discord.js](https://discord.js.org)

## 🚀 Быстрый старт

### 📋 Предварительные требования

Перед установкой убедитесь, что у вас установлены:

- [Node.js](https://nodejs.org/) версии 22.12.0 или выше
- [npm](https://npmjs.com/) (обычно идет с Node.js)
- [MongoDB](https://mongodb.com) (локально или облачная версия)
- [Discord Application](https://discord.com/developers/applications) с ботом

### ⚡ Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/arhip144/wetbot-public.git
   cd wetbot-public
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**
   
   Создайте файл `.env` в корневой директории и добавьте:
   ```env
   discordToken=your_discord_bot_token_here
   mongoDB_SRV=your_mongodb_connection_string_here
   errorWebhook=your_discord_webhook_url_for_errors
   ```

4. **Откройте файл конфигурации**

   Перейдите в папку `config` и откройте файл `botconfig.js` любым текстовым редактором.

5. **Установите ваш Discord ID**

   Найдите поле `ownerId` и замените значение на ID вашего Discord аккаунта:
   ```javascript
   module.exports = {
     discord: {
        ownerId: "123456789012345678", // ← Замените на ваш Discord ID
     }
     // ... другие настройки
   }

6. **Запустите бота**
   ```bash
   npm start
   ```

## 📖 Использование

### 🎯 Основные команды

```bash
# Запуск бота в продакшн режиме
npm start
```

### 🎯 Регистрация slash-команд

    В любом канале напишите !reg - бот зарегистрирует slash-команду /reg.

    После этого можете использовать slash-команду /reg для регистрации всех остальных команд

    Команды владельца регистрируются отдельно командой /reg:
    /reg command_name: editor guild_id: ID вашего домашнего сервера
    /reg command_name: eval guild_id: ID вашего домашнего сервера
    /reg command_name: unreg guild_id: ID вашего домашнего сервера
    /reg command_name: reload-cache guild_id: ID вашего домашнего сервера

### 🗃️ Документация

    https://docs.wetbot.space/

## ⚙️ Конфигурация

### 🔑 Переменные окружения (.env)

| Переменная | Описание | Обязательная |
|------------|-----------|--------------|
| `discordToken` | Токен вашего Discord бота | ✅ |
| `mongoDB_SRV` | Connection string для MongoDB | ✅ |
| `errorWebhook` | Webhook URL для отправки ошибок | ✅ |

### 🗄 Настройка базы данных

Бот автоматически создаст необходимые коллекции в MongoDB при первом запуске. Убедитесь, что ваша строка подключения включает права на чтение и запись.

## 🛠 Разработка

### 📁 Структура проекта

```
wetbot-public/
├── slash-commands/    # Папка с командами бота
├── interactions/      # Дополнительные обработчики кнопок
├── classes/           # Классы 
├── events/            # Обработчики событий Discord
├── schemas/           # Модели MongoDB
├── modules/           # Независимые модули
├── config/            # Конфигурационные файлы
└── package.json       # Зависимости и скрипты
```

### 🔧 Добавление новых команд

1. Создайте файл в папке `slash-commands/`
2. Экспортируйте объект команды:
   ```javascript
   module.exports = {
     name: 'имя_команды',
     description: 'Описание команды',
     dmPermission: false, // Запуск команды в личных сообщениях бота
     group: `general`, // Группа команд в /help
     cooldowns: new Collection(),
     run: async (client, interaction) => {
       // Логика команды
     }
   }
   ```

## 🤝 Вклад в проект

Мы приветствуем вклады в развитие WETBOT! 

1. Сделайте форк репозитория
2. Создайте feature ветку (`git checkout -b feature/AmazingFeature`)
3. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
4. Запушьте в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией GPL v3. Подробнее см. в файле [LICENSE](LICENSE).

## 📞 Поддержка

- 🐛 **Сообщить о баге:** [Issues](https://github.com/arhip144/wetbot-public/issues)
- 💡 **Предложить фичу:** [Issues](https://github.com/arhip144/wetbot-public/issues)
- 📧 **Контакты:** [GitHub Profile](https://github.com/arhip144)

## ⭐ Благодарности

Спасибо всем, кто вкладывается в развитие проекта! Особенная благодарность:

- Tipheret за перевод бота на испанский язык
- MongoDB за надежную базу данных
- Всем тестерам и пользователям бота

---

<div align="center">

### 💙 Если вам нравится проект, не забудьте поставить звезду! ⭐

</div>