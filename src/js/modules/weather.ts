import { cityData } from "../data/city.js";
import { fetchData } from "./fetch.js";

type WeatherJson = {
  id: string;
  main: string;
  description: string;
  icon: string;
};

type MainJson = {
  temp: number;
  temp_min: number;
  temp_max: number;
};

type WeatherApiJson = {
  weather: WeatherJson[];
  main: MainJson;
  name: string;
};

type Region = {
  key: string;
  list: string[];
};

type Prefecture = {
  name: string;
  ja: string;
  region: string;
};

type PrefectureRowData = {
  key: string;
  prefectureList: Prefecture[];
};

/**
 * 天気APIを利用して現在の天気を取得し、ブラウザに表示させる関数
 */
export const weather = async () => {
  /**
   * ブロックを削除する関数
   */
  const deleteBlockArea = (dataKey: string, dataValue: string) => {
    const blockElement = document.querySelector(`[${dataKey}="${dataValue}"]`);
    if (!(blockElement instanceof HTMLMenuElement)) return;
    blockElement.innerHTML = "";
  };

  /**
   * 地域ボタンのElementを作成する関数
   */
  const createSelectBlock = (areaData: Region) => {
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

  /**
   * 都道府県ボタンのElementを作成する関数
   */
  const updatePrefectureBlock = (
    regionData: Region,
    prefectureRowData: PrefectureRowData,
  ) => {
    const { key: regionKey } = regionData;
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    const regionInputs = document.getElementsByName(regionKey);

    /**
     * 地域に合致する都道府県の一覧を返す関数
     */
    const getMatchList = (regionName: string, prefectureList: Prefecture[]) => {
      const matchList = prefectureList
        .filter((prefecture) => prefecture.region === regionName)
        .map((item) => item.ja);
      return matchList;
    };

    /**
     * 都道県データを整形する関数

     */
    const formatPrefectureData = (
      prefectureRowData: PrefectureRowData,
      matchList: string[],
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
          prefectureNameList,
        );
        deleteBlockArea("data-weather-list", prefectureKey);
        createSelectBlock(prefectureData);
      });
    });
  };

  /**
   * 天気を取得するボタンの活性非活性を切り替える関数
   */
  const switchActiveRequestButton = (
    regionData: Region,
    prefectureRowData: PrefectureRowData,
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

  /**
   * 天気データをもとにブラウザの天気情報を更新する関数
   */
  const updateResultBlock = (prefectureRowData: PrefectureRowData) => {
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    const dataKey = "result";
    const requestButton = document.querySelector("[data-weather-request]");
    if (!(requestButton instanceof HTMLButtonElement)) return;

    /**
     * 都道府県の日本語から英語を取得する関数
     */
    const getPrefectureEn = (
      prefectureJa: string,
      prefectureList: Prefecture[],
    ) => {
      const prefectureEn = prefectureList.find(
        (prefecture) => prefecture.ja === prefectureJa,
      )?.name;
      return prefectureEn;
    };

    /**
     * 天気情報を整形する関数
     */
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

    /**
     * 天気の結果を表示させる関数
     */
    const updateResultBlock = (
      weatherData: WeatherJson & MainJson,
      dataValue: string,
    ) => {
      const weatherResultElement = document.querySelector(
        `[data-weather-block=${dataValue}]`,
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
        prefectureList,
      );
      const url = `https://getweatherinformation-afq4w33w3q-uc.a.run.app/?prefecture=${prefectureEn}`;
      const data = await fetchData(url);
      const weatherData = formatWeatherData(data);
      const defaultBlock = document.querySelector(
        "[data-weather-block=default]",
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
