require('dotenv').config()
const WEATHER_API_KEY = process.env.WEATHER_API_KEY

let fs = require('fs')
let got = require('got')
let qty = require('js-quantities')
let formatDistance = require('date-fns/formatDistance')

let WEATHER_DOMAIN = 'http://dataservice.accuweather.com'

const emojis = {
  1: '☀️',
  2: '☀️',
  3: '🌤',
  4: '🌤',
  5: '🌤',
  6: '🌥',
  7: '☁️',
  8: '☁️',
  11: '🌫',
  12: '🌧',
  13: '🌦',
  14: '🌦',
  15: '⛈',
  16: '⛈',
  17: '🌦',
  18: '🌧',
  19: '🌨',
  20: '🌨',
  21: '🌨',
  22: '❄️',
  23: '❄️',
  24: '🌧',
  25: '🌧',
  26: '🌧',
  29: '🌧',
  30: '🥵',
  31: '🥶',
  32: '💨',
}

// Cheap, janky way to have variable bubble width
dayBubbleWidths = {
  Monday: 235,
  Tuesday: 235,
  Wednesday: 260,
  Thursday: 245,
  Friday: 220,
  Saturday: 245,
  Sunday: 230,
}

const today = new Date()
const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(
  today
)

const psTime = formatDistance(new Date(2023, 1, 1), today, {
  addSuffix: false,
})

const PARIS_LOCATION_KEY = '623'
let url = `forecasts/v1/daily/1day/${PARIS_LOCATION_KEY}?apikey=${WEATHER_API_KEY}`

got(url, { 
  prefixUrl: WEATHER_DOMAIN,
  retry: {
    limit: 2
  }
})
.then((response) => {
  let json = JSON.parse(response.body)

  const degF = Math.round(json.DailyForecasts[0].Temperature.Maximum.Value)
  const degC = Math.round(qty(`${degF} tempF`).to('tempC').scalar)
  const icon = json.DailyForecasts[0].Day.Icon

  fs.readFile('template.svg', 'utf-8', (error, data) => {
    if (error) {
      console.error('Error reading template file:', error)
      return
    }

    data = data.replace('{degF}', degF)
    data = data.replace('{degC}', degC)
    data = data.replace('{weatherEmoji}', emojis[icon])
    data = data.replace('{todayDay}', todayDay)
    data = data.replace('{dayBubbleWidth}', dayBubbleWidths[todayDay])

    fs.writeFile('chat.svg', data, (err) => {
      if (err) {
        console.error('Error writing output file:', err)
        return
      }
      console.log('Successfully generated chat.svg')
    })
  })
})
.catch((err) => {
  console.error('Error fetching weather data:', err)
})
