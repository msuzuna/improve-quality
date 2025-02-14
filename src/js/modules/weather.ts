import { cityData } from "../data/city.js";
import { fetchData } from "./fetch.js";

/**
 * 天気APIを利用して現在の天気を取得し、ブラウザに表示させる関数
 */
export const weather = async () => {
  type WeatherJson = {
    id: string;
    main: string;
    description: string;
    icon: string;
  };
  type MainJson = { temp: number; temp_min: number; temp_max: number };
  type WeatherApiJson = {
    weather: WeatherJson[];
    main: MainJson;
    name: string;
  };

  type WeatherData = {
    areaDescription: string;
    iconURL: string;
    description: string;
    temp: number;
    temp_min: number;
    temp_max: number;
  };

  type areaData = { key: string; list: string[] };
  type prefectureList = { name: string; ja: string; region: string }[];
  type prefectureData = {
    key: string;
    prefectureList: prefectureList;
  };

  const deleteBlockArea = (dataKey: string, dataValue: string) => {
    const blockElement = document.querySelector(`[${dataKey}="${dataValue}"]`);
    if (!(blockElement instanceof HTMLMenuElement)) return;
    blockElement.innerHTML = "";
  };

  const createSelectBlock = (areaData: areaData) => {
    const { key, list } = areaData;
    const listElement = document.querySelector(`[data-weather-list=${key}]`);
    if (!(listElement instanceof HTMLMenuElement)) return;

    const fragment = new DocumentFragment();

    list?.forEach((listItem) => {
      const id = window.crypto.randomUUID();
      const li = document.createElement("li");
      const input = document.createElement("input");
      const label = document.createElement("label");
      li.classList.add("input-wrap");
      input.type = "radio";
      input.name = key;
      input.value = listItem;
      input.id = id;
      label.htmlFor = id;
      label.innerText = listItem;
      li.appendChild(input);
      li.appendChild(label);
      fragment.append(li);
    });

    listElement.append(fragment);
  };

  const updatePrefectureBlock = (
    regionData: areaData,
    prefectureRowData: prefectureData
  ) => {
    const { key: regionKey } = regionData;
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    const regionInputs = document.getElementsByName(regionKey);

    const getMatchList = (
      regionName: string,
      prefectureList: prefectureList
    ) => {
      const matchList = prefectureList
        .filter((prefecture) => prefecture.region === regionName)
        .map((item) => item.ja);
      return matchList;
    };

    const formatPrefectureData = (
      prefectureRowData: prefectureData,
      matchList: string[]
    ) => {
      const { key } = prefectureRowData;
      const formatData = {
        key: key,
        list: matchList,
      };
      return formatData;
    };

    regionInputs?.forEach((input) => {
      input.addEventListener("change", (event) => {
        const targetInput = event.target;
        if (!(targetInput instanceof HTMLInputElement)) return;
        const regionName = targetInput.value;
        if (regionName === "") return;

        const prefectureNameList = getMatchList(regionName, prefectureList);
        const prefectureData = formatPrefectureData(
          prefectureRowData,
          prefectureNameList
        );
        deleteBlockArea("data-weather-list", prefectureKey);
        createSelectBlock(prefectureData);
      });
    });
  };

  const switchActiveRequestButton = (
    regionData: areaData,
    prefectureRowData: prefectureData
  ) => {
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

  const updateResultBlock = (prefectureRowData: prefectureData) => {
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    const dataKey = "result";
    const requestButton = document.querySelector("[data-weather-request]");
    if (!(requestButton instanceof HTMLButtonElement)) return;

    const getPrefectureEn = (
      prefectureJa: string,
      prefectureList: prefectureList
    ) => {
      const prefectureEn = prefectureList.find(
        (prefecture) => prefecture.ja === prefectureJa
      )?.name;
      return prefectureEn;
    };

    const formatWeatherData = (data: WeatherApiJson) => {
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
    const updateResultBlock = (weatherData: WeatherData, dataValue: string) => {
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
      const data: WeatherApiJson = await fetchData(url);
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

  const { region: regionData, prefecture: prefectureRowData } = cityData;

  createSelectBlock(regionData);
  updatePrefectureBlock(regionData, prefectureRowData);
  switchActiveRequestButton(regionData, prefectureRowData);
  updateResultBlock(prefectureRowData);
};
