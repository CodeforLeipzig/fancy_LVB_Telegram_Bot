# fancy_LVB_Telegram_Bot

[![Build Status](https://travis-ci.org/eisc/fancy_LVB_Telegram_Bot.png?branch=master)][![Coverage Status](https://coveralls.io/repos/github/eisc/fancy_LVB_Telegram_Bot/badge.svg?branch=master)](https://coveralls.io/github/eisc/fancy_LVB_Telegram_Bot?branch=master)

## TODOs

* Fahrplandaten einfügen
* Haltestelle per Eingabe anfragen (-> Ausgabe: nächsten Abfahrten an der Haltestelle)
* nächstgelegenen Haltestellen per Standort anfragen
* nächstgelegenen Haltestellen auf Karte anzeigen

## Start der Anwendung

### Telegram Bot anlegen

* BotFather als Kontakt in Telegram hinzufügen
* mit /newbot einen neuen Bot anlegen, name und username festlegen
* im geclonten Git repository config/config.js anlegen mit Inhalt

```javascript
exports.TELEGRAM_TOKEN = "<vom BotFather generierter Access-Token für den eben angelegten neuen Bot>"
```

### Start ohne Docker

* Node.js installieren, z.B. so wie [hier](https://blog.pm2.io/2018-02-19/Installing-Node-js-with-NVM/) beschrieben
* `npm install`
* config/maps.js anpassen so dass die public/maps/ Ressourcen mit ihren absoluten Pfaden adressiert werden
* `npm run start`

### Start mit Docker

```bash
docker build -t fancy_lvb_bot
docker run -v /etc/localtime:/etc/localtime:ro -v /etc/timezone:/etc/timezone:ro --restart=always --name fancylvbbot -d fancy_lvb_bot:latest
```

## Test-Ausführung

* ohne Code coverage: `npm run test`
* mit Code coverage: `npm run test-with-coverage` - unter coverage/lcov-report/index.html findet man dann den Testabdeckungsreport
