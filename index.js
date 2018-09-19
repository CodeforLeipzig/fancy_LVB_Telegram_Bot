const TelegramBot = require('node-telegram-bot-api')
// const departures = require('lvb').departures

let config = require('./config')
const token = config.TELEGRAM_TOKEN

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true})

let jmap = require('./maps.json')

let globalStations = []

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hallo ' + msg.from.first_name + '!\nIch helfe dir gerne bei den Abfahrtszeiten von Bussen und Bahnen der LVB.\nBei /help werden dir alle Funktionen dieses Bots aufgelistet.')
})

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hier eine Übersicht über alle Funkionen:\n\n• Mit /plan bekommst du den Liniennetzplan als PDF geschickt.\n• Mit /add kannst du eine Kurzwahlliste erstellen. Gib dazu einfach en Namen einer Haltestelle ein.\n• Mit /reset kannst du die Kurzwahlliste komplett löschen. Gibst du den Namen einer Haltestelle ein, dann löscht es nur diese aus der Liste.\n• Mit /onlocation kannst du mir deinen Standort senden und dir die 5 nächstgelegenen Haltestellen anzeigen lassen.\n• Bei /station wird dir der Standort einer Haltestelle angezeigt.')
})

bot.onText(/\/plan(\s*)(.*)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, 'Welchen Netzplan möchtest du haben?', {
    reply_markup: {
      inline_keyboard: [ [ {text: 'Gesamtnetz Leipzig', callback_data: '0'}, {text: 'Liniennetz Nacht', callback_data: '1'} ], [ {text: 'Stadtplan Leipzig', callback_data: '2'}, {text: 'Tarifzonenplan MDV', callback_data: '3'} ]
      ]
    }
  })
  bot.on('callback_query', query => {
    bot.answerCallbackQuery(query.id)
    bot.sendChatAction(msg.chat.id, 'upload_document')
    bot.sendDocument(msg.chat.id, jmap[query.data].path, {
      caption: `*${jmap[query.data].title}*\n${jmap[query.data].description}`,
      parse_mode: 'Markdown'
    })
  })
})

bot.onText(/\/add(\s*)(.*)/, (msg, match) => {
  if (match[2] === '') {
    bot.sendMessage(msg.chat.id, 'Bitte gib eine Haltestelle ein.')
    return
  }
  globalStations.push(match[2])
  bot.sendMessage(msg.chat.id, `${match[2]} wurde hinzugefügt.`, {
    reply_markup: {
      keyboard: [globalStations],
      resize_keyboard: true
    }
  }
  )
})

bot.onText(/\/reset(\s*)(.*)/, (msg, match) => {
  let index = globalStations.indexOf(match[2])
  if (globalStations.length === 0) {
    bot.sendMessage(msg.chat.id, 'Liste ist bereits leer.')
    return
  }
  if (match[2]) {
    if (index === -1) {
      bot.sendMessage(msg.chat.id, `${match[2]} steht nicht auf der Liste`)
      return
    }
    globalStations.splice(index, 1)
    if (globalStations.length === 0) {
      bot.sendMessage(msg.chat.id, `${match[2]} wurde gelöscht.`, {
        reply_markup: {
          remove_keyboard: true
        }
      })
      return
    }
    bot.sendMessage(msg.chat.id, `${match[2]} wurde gelöscht.`, {
      reply_markup: {
        keyboard: [globalStations],
        resize_keyboard: true
      }
    })
  } else {
    bot.sendMessage(msg.chat.id, 'gesamte Liste löschen?', {
      reply_markup: {
        inline_keyboard: [ [ {text: 'JA  \u{1F44D}', callback_data: 'reset'}, {text: 'NEIN  \u{1F631}', callback_data: 'noreset'} ]
        ]
      }
    })
    bot.on('callback_query', query => {
      if (query.data === 'reset') {
        bot.answerCallbackQuery(query.id)
        globalStations.length = 0
        bot.sendMessage(query.message.chat.id, 'Liste wurde gelöscht', {
          reply_markup: {
            remove_keyboard: true
          }
        })
      } else {
        bot.answerCallbackQuery(query.id)
        bot.sendMessage(query.message.chat.id, 'Abbruch')
      }
    }
    )
  }
})

bot.onText(/\/onlocation/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Bitte schick mir deinen Standort.', {
    reply_markup: {
      keyboard: [ [ {text: 'Standort senden', request_location: true}, {text: 'Nein, lieber nicht.'} ] ],
      one_time_keyboard: true,
      resize_keyboard: true
      // Problem: Kurzwahlliste wird von diesem Keyboard überschrieben
    }
  })
})
bot.onText(/Nein, lieber nicht./, (msg) => {
  bot.sendMessage(msg.chat.id, 'Ok, dann nicht. Du kannst mit /station auch direkt nach einer Haltestelle suchen.', {
    reply_markup: {
      remove_keyboard: true
    }
  })
})
bot.on('location', (msg) => {
  console.log(msg.location)
  let {latitude, longitude} = msg.location
  bot.sendMessage(msg.chat.id, 'Danke.', {
    reply_markup: {
      remove_keyboard: true
    }
  })
  bot.sendMessage(msg.chat.id, 'Das sind die nächsten 5 Haltestellen:', {
    reply_markup: {
      inline_keyboard: [ [ {text: 'Haltestelle 1', callback_data: 'Haltestelle 1'}, {text: 'Haltestelle 2', callback_data: 'Haltestelle 2'} ]
      ]
    }
  })
  bot.on('callback_query', query => {
    if (query.data === 'Haltestelle 1') {
      bot.answerCallbackQuery(query.id)
      bot.sendVenue(msg.chat.id, 51.325209, 12.400980, `$(query.data) ist hier:`)
    }
  })
})

bot.onText(/\/station(\s*)(.*)/, (msg, match) => {
  if (match[2] === '') {
    bot.sendMessage(msg.chat.id, 'Bitte gib eine Haltestelle ein.')
    return
  }
  // let lat = lat.station
  // let lon = lon.station
  bot.sendVenue(msg.chat.id, 51.325209, 12.400980, `${match[2]}`, 'Linien:')
})
