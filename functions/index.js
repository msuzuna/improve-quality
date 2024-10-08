const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

exports.getWeatherInformation = onRequest(async (request, response) => {
  const prefectureEn = request.query.prefecture;
  const api = process.env.WEATHER_API_KEY;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${prefectureEn},JP&appid=${api}&units=metric&lang=ja`;
  const data = await fetch(url);
  const json = await data.json();
  logger.info("天気情報取得", { structuredData: true });
  response.set("Access-Control-Allow-Headers", "Origin, Methods");
  response.set(
    "Access-Control-Allow-Origin",
    "https://improve-quality.web.app",
  );
  response.set("Access-Control-Allow-Methods", "GET");
  if (data.ok) {
    response.send({ data: json, ok: true });
  } else {
    response.send({ ok: false });
  }
  response.end();
});

exports.getMovieInformation = onRequest(async (request, response) => {
  const page = typeof request.query.page === "number" ? request.query.page : 1;
  const api = process.env.MOVIE_API_KEY;
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${api}&language=ja&region=JP&page=${page}`;
  const data = await fetch(url);
  const json = await data.json();
  logger.info("映画情報取得", { structuredData: true });
  response.set("Access-Control-Allow-Headers", "Origin, Methods");
  response.set(
    "Access-Control-Allow-Origin",
    "https://improve-quality.web.app",
  );
  response.set("Access-Control-Allow-Methods", "GET");
  if (data.ok) {
    response.send({ data: json, ok: true });
  } else {
    response.send({ ok: false });
  }
  response.end();
});
