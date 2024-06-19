const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.getWeatherInformation = onRequest(async (request, response) => {
  const prefectureEn = request.query.prefecture;
  const api = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${prefectureEn},JP&appid=${api}&units=metric&lang=ja`;
  const data = await fetch(url);
  const json = await data.json();
  logger.info("天気情報取得", { structuredData: true });
  response.set("Access-Control-Allow-Headers", "*");
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "GET");
  response.send(json);
  response.end();
});
