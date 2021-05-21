const TelegramApi = require('node-telegram-bot-api')
const token = '1733794096:AAE3dU1jdBIChCi_F6mer-V2doVl_hWvrVA'
const bot = new TelegramApi(token, {polling: true})

const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "141.8.192.151",
    user: "f0512274_AI205bot",
    database: "f0512274_AI205bot",
    password: "myprog123"
  })

  connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });



const {gameOptions, againOptions} = require('./options');

const chats = {}

const startGame = async (chatId) =>
{
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 1 до 9, твоя задача отгадать её )')
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = randomNumber;
    await bot.sendMessage(chatId, 'Отгадывай!', gameOptions)
}

/*
const change_answ = async (userId, action) =>
{
    var right_answ;
    var wrong_answ;
    connection.query('SELECT right_answ,wrong_answ FROM users WHERE userTGid = ?', userId, function (error, results, fields) {
                
        right_answ = results[0].right_answ;
        wrong_answ = results[0].wrong_answ; 
      });

    if(action == "right")
    {
        right_answ++;

        connection.query(`INSERT INTO users(right_answ) VALUES('${right_answ}')`, function(err, results) {
            if(err) console.log(err);
            console.log(results);
        }); 
    }
    else if (action == "wrond")
    {
        wrongt_answ++;

        connection.query(`INSERT INTO users(wrong_answ) VALUES('${wrong_answ}')`, function(err, results) {
            if(err) console.log(err);
            console.log(results);
        });
    }
}
*/

const regUser = async (userId, user_name, chatId) =>
{
    const sql = `INSERT INTO users(userTGid, user_name, chatId) VALUES('${userId}', '${user_name}', '${chatId}')`;
    connection.query(sql, function(err, results) {
        if(err) console.log(err);
        console.log(results);
    }); 

    bot.sendMessage(chatId,`Ваш аккаунт не был найден в БД бота!\nВы зарегистрированы :)`)
    bot.sendMessage(chatId, `Привет, ${user_name}!\nПодробнее: /help`)
    return bot.sendSticker(chatId, 'CAACAgIAAxkBAAEBU1xgqAghCHfLlZEL6wbrcw6orBqMOQAC_Q4AApxKMEmwBe9QJkoKPx8E')
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
        const userId = msg.from.id;
        
        try
        {
            if (text === "/start")
            {
                connection.query('SELECT * FROM users WHERE userTGid = ?', userId, function (error, results, fields) {
                    
                    if (results.length != 0)
                    {
                        if(results[0].userTGid == userId) {
                            bot.sendMessage(chatId, `Привет, ${msg.from.first_name}!\nПодробнее: /help`)
                            return bot.sendSticker(chatId, 'CAACAgIAAxkBAAEBU1xgqAghCHfLlZEL6wbrcw6orBqMOQAC_Q4AApxKMEmwBe9QJkoKPx8E')
                        }
                        else
                        {
                            return regUser(userId, msg.from.first_name, chatId);
                        }
                    }
                    else 
                    {
                        return regUser(userId, msg.from.first_name, chatId);
                    }
                  });

                  return 0;
            }

            if (text == "/info")
            {
                connection.query('SELECT right_answ,wrong_answ FROM users WHERE userTGid = ?', userId, function (error, results, fields) {
                    
                    return bot.sendMessage(chatId, `Тебя зовут - ${msg.from.first_name}!\nПравильных ответов: ${results[0].right_answ}\nНеправильных ответов: ${results[0].wrong_answ}`)
                  });
                
            }

            if (text == '/game')
            {
                return startGame(chatId);
            }




            return bot.sendMessage(chatId, "Я не понимаю тебя :(")
        }
        catch (e)
        {
            return bot.sendMessage(chatId, `пс... В боте произошла ошибка:\n${e}`)
        }
        
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        const userId = msg.from.id;

        if(data == '/again')
        {
            return startGame(chatId); 
        }
        if(data == chats[chatId]){

            //change_answ(userId, "right")

            return await bot.sendMessage(chatId, `Поздравляю! Ты отгадал цифру ${chats[chatId]}`, againOptions)
        }
        else
        {
            //change_answ(userId, "wrong")
            return await bot.sendMessage(chatId, `Ты не угадал... Я загадал число ${chats[chatId]} :(`, againOptions)
        }
    })
}

start()