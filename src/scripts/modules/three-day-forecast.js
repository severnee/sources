const { daysChartBuilder } = require('./charts.js') // Функции для построения графиков

module.exports.threeDayForecastBuilder = async () => {
  try {
    let response = await fetch('https://services.swpc.noaa.gov/text/3-day-forecast.txt') // Запрос трехдневного прогноза
    let textForecast = await response.text() // Ответ в текстовом формате
    let resultForecast = threeDayTablesFiller(textForecast) // Обработка прогнозов

    daysChartBuilder(resultForecast) // Рендер графика
  } catch (error) {
    console.log(error)
  }
}

function threeDayTablesFiller(data) {
  const startOfForecastTable = new RegExp('(00-03UT)', 'g') // Находит начало таблицы с KP-индексами
  const endOfForecastTable = new RegExp('Rationale', 'g') // Находит конец таблицы
  const extraSignatures = new RegExp('[(]G[1-5][)]', 'g') // Находит лишние подписи, как «(G1)». Они дополнительно классифицируют силу геомагнитного шторма, но из-за них меняется число символов внутри response.text(), поэтому удаляем

  const indexOfStart = data.search(startOfForecastTable)
  const indexOfEnd = data.search(endOfForecastTable)
  let crudeForecast = data.slice(indexOfStart, indexOfEnd) // Вырезаем таблицу из response.text()

  if (crudeForecast.includes('G')) {
    crudeForecast = crudeForecast.replaceAll(extraSignatures, '    ') // Пробелы нужны, чтобы удалить элемент без сдвига
  }

  const arrayFromTextForecast = crudeForecast // Создаём массив из таблицы для удобства
    .split(' ')
    .filter(item => item !== '')

  const indexOfLastElementOfTable = 32 // Индекс последнего нужного элемента в массиве из таблицы прогноза
  const resultForecast = arrayFromTextForecast
    .slice(0, indexOfLastElementOfTable) // Вырезаем только те данные, что нужны для формирования прогноза

  const firstDayChartData = new Array()
  const secondDayChartData = new Array()
  const thirdDayChartData = new Array()

  for (let i = 1; i < 30; i += 4) {
    firstDayChartData.push(Number(resultForecast[i]))
  }

  for (let j = 2; j < 31; j += 4) {
    secondDayChartData.push(Number(resultForecast[j]))
  }

  for (let c = 3; c < 32; c += 4) {
    thirdDayChartData.push(Number(resultForecast[c]))
  }

  return { firstDayChartData, secondDayChartData, thirdDayChartData } // Возвращаем готовые прогнозы по дням для графиков
}