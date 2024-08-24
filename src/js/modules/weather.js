import { cityData } from "../data/city.js";
import { fetchData } from "./fetch.js";
import { createSelectBlock, updateSelectBlock } from "./selectBlock.js";

/**
 * @typedef {Object} WeatherJson
 * @property {string} id
 * @property {string} main
 * @property {string} description
 * @property {string} icon
 */

/**
 * @typedef {Object} MainJson
 * @property {number} temp
 * @property {number} temp_min
 * @property {number} temp_max
 */

/**
 * @typedef {Object} WeatherApiJson
 * @property {Array<WeatherJson>} weather
 * @property {MainJson} main
 * @property {string} name
 */

/**
 * 天気APIを利用して現在の天気を取得し、ブラウザに表示させる関数
 */
export const weather = async () => {
  /**
   * 天気を取得するボタンの活性非活性を切り替える関数
   * @param {{key: string, list: Array<string>}} regionData
   * @param {{key: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   */
  const switchActiveRequestButton = (regionData, prefectureRowData) => {
    const requestButton = document.querySelector("[data-weather-request]");
    if (!(requestButton instanceof HTMLButtonElement)) return;
    const { key: regionKey } = regionData;
    const { key: prefectureKey } = prefectureRowData;
    const regionInputs = document.getElementsByName(regionKey);

    regionInputs?.forEach((input) => {
      input.addEventListener("change", () => {
        const prefectureInputs = document.getElementsByName(prefectureKey);
        requestButton.disabled = true;
        prefectureInputs?.forEach((prefectureInput) => {
          prefectureInput.addEventListener("change", () => {
            requestButton.disabled = false;
          });
        });
      });
    });
  };

  /**
   * 天気データをもとにブラウザの天気情報を更新する関数
   * @param {{key: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   */
  const updateResultBlock = (prefectureRowData) => {
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    const dataKey = "result";
    const requestButton = document.querySelector("[data-weather-request]");
    if (!(requestButton instanceof HTMLButtonElement)) return;

    /**
     * 都道府県の日本語から英語を取得する関数
     * @param {string} prefectureJa
     * @param {Array<{name: string, ja:string, region: string}>} prefectureList
     */
    const getPrefectureEn = (prefectureJa, prefectureList) => {
      const prefectureEn = prefectureList.find(
        (prefecture) => prefecture.ja === prefectureJa
      )?.name;
      return prefectureEn;
    };

    /**
     * 天気情報を整形する関数
     * @param {WeatherApiJson} data
     */
    const formatWeatherData = (data) => {
      const { main, weather, name: areaName } = data;
      const { temp, temp_min, temp_max } = main;
      const { icon, description } = weather[0];
      const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      const weatherData = {
        areaDescription: `現在の${areaName}の天気`,
        iconURL,
        description,
        temp,
        temp_min,
        temp_max,
      };

      return weatherData;
    };

    /**
     * 天気の結果を表示させる関数
     * @param {{areaDescription: string, iconURL: string, description: string,  temp: number, temp_min: number, temp_max: number}} weatherData
     * @param {string} dataValue
     */
    const updateResultBlock = (weatherData, dataValue) => {
      const weatherResultElement = document.querySelector(
        `[data-weather-block=${dataValue}]`
      );
      if (!(weatherResultElement instanceof HTMLDivElement)) return;
      const dataResultKey = "data-weather-result";
      const resultElements = document.querySelectorAll(`[${dataResultKey}]`);
      resultElements.forEach((resultElement) => {
        const resultId = resultElement.getAttribute(dataResultKey);
        if (
          !(resultId === "areaDescription") &&
          !(resultId === "iconURL") &&
          !(resultId === "description") &&
          !(resultId === "temp") &&
          !(resultId === "temp_min") &&
          !(resultId === "temp_max")
        )
          return;
        if (resultId === "iconURL") {
          if (!(resultElement instanceof HTMLImageElement)) return;
          resultElement.src = weatherData[resultId];
        } else {
          if (!(resultElement instanceof HTMLElement)) return;
          resultElement.innerText = `${weatherData[resultId]}`;
        }
      });

      weatherResultElement.hidden = false;
    };

    requestButton.addEventListener("click", async () => {
      const prefectureInputs = document.getElementsByName(prefectureKey);
      const checkedPrefectureInput = [...prefectureInputs].find((input) => {
        if (!(input instanceof HTMLInputElement)) return;
        return input.checked;
      });
      if (!(checkedPrefectureInput instanceof HTMLInputElement)) return;
      const checkedPrefectureValue = checkedPrefectureInput.value;
      const prefectureEn = getPrefectureEn(
        checkedPrefectureValue,
        prefectureList
      );
      const url = `https://getweatherinformation-afq4w33w3q-uc.a.run.app/?prefecture=${prefectureEn}`;
      /** @type {WeatherApiJson} */
      const data = await fetchData(url);
      const weatherData = formatWeatherData(data);
      const defaultBlock = document.querySelector(
        "[data-weather-block=default]"
      );
      updateResultBlock(weatherData, dataKey);
      if (defaultBlock instanceof HTMLDivElement) {
        defaultBlock.hidden = true;
      }
      prefectureInputs[0].focus();
    });
  };

  const dataKey = "weather";
  const { region: regionData, prefecture: prefectureRowData } = cityData;

  createSelectBlock(regionData);
  updatePrefectureBlock(regionData, prefectureRowData);
  switchActiveRequestButton(regionData, prefectureRowData);
  updateResultBlock(prefectureRowData);
};
