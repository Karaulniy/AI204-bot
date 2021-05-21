const TelegramApi = require('node-telegram-bot-api')
const token = '1733794096:AAE3dU1jdBIChCi_F6mer-V2doVl_hWvrVA'
const bot = new TelegramApi(token, {polling: true})

const {gameOptions, againOptions} = require('./options')

const chats = {}

const startGame = async (chatId) =>
{
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 1 до 9, твоя задача отгадать её )')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай!', gameOptions)
}





const start = () =>
{
    bot.setMyCommands([
        {command: '/start', description: 'Начало'},
        {command: '/info', description: 'Инфо'},
        {command: '/game', description: 'Игра'}
    ])


    bot.on('message', async msg => 
    {
        const text = msg.text;
        const chatId = msg.chat.id;
        

        if (text === "/start")
        {
            await bot.sendMessage(chatId, `Привет, ${msg.from.first_name}!\nПодробнее: /help`)
            return bot.sendSticker(chatId, 'CAACAgIAAxkBAAEBU1xgqAghCHfLlZEL6wbrcw6orBqMOQAC_Q4AApxKMEmwBe9QJkoKPx8E')
        }

        if (text == "/info")
        {
            return bot.sendMessage(chatId, `Тебя зовут - ${msg.from.first_name}!`)
        }

        if (text == '/game')
        {
            return startGame(chatId);
        }



        return bot.sendMessage(chatId, `Я тебя не понимаю :(`)
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if(data == '/again')
        {
            return startGame(chatId); 
        }
        if(data == chats[chatId]){
            return await bot.sendMessage(chatId, `Поздравляю! Ты отгадал цифру ${chats[chatId]}`, againOptions)
        }
        else
        {
            return await bot.sendMessage(chatId, `Ты не угадал... Я загадал число ${chats[chatId]} :(`, againOptions)
        }
        bot.sendMessage(chatId, `Ты выбрал цифру: ${data}`)
    })
}

start()