import { fetchData } from "./fetch.js";

/**
 * 天気APIを利用して現在の天気を取得し、ブラウザに表示させる関数
 * @async
 * @function
 * @returns {void} 返り値なし
 */
export const weather = async () => {
  /**
   * ブロックを削除する関数
   * @function
   * @param {string} key
   * @returns {void} 返り値なし
   */
  const deleteBlockArea = (key) => {
    const prefectureBlockName = `[data-weather-block="${key}"]`;
    const prefectureBlock = document.querySelector(prefectureBlockName);
    prefectureBlock?.remove();
  };

  /**
   * 地域ボタンのElementを作成する関数
   * @function
   * @param {{key: string, description: string, list: Array<string>}} areaData
   * @returns {void} 返り値なし
   */
  const createSelectBlock = (areaData) => {
    /** @type {HTMLDivElement | null} ボタンリストのElement */
    const weatherBlockElement = document.querySelector("[data-weather]");
    if (!weatherBlockElement) return;
    const { key, description, list } = areaData;

    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    const menu = document.createElement("menu");
    fieldset.setAttribute("data-weather-block", key);
    legend.innerHTML = description;
    legend.classList.add("weather-caption");
    menu.classList.add("input-list");
    menu.setAttribute("data-weather-list", key);
    fieldset.appendChild(legend);
    fieldset.appendChild(menu);
    weatherBlockElement.appendChild(fieldset);

    list?.forEach((listItem, index) => {
      const id = `${key}${index}`;
      const li = document.createElement("li");
      const input = document.createElement("input");
      const label = document.createElement("label");
      li.classList.add("input-wrap");
      input.setAttribute("type", "radio");
      input.setAttribute("name", key);
      input.setAttribute("value", listItem);
      input.setAttribute("id", id);
      label.setAttribute("for", id);
      label.innerText = listItem;
      li.appendChild(input);
      li.appendChild(label);
      menu.appendChild(li);
    });
  };

  /**
   * 都道府県ボタンのElementを作成する関数
   * @function
   * @param {{key: string, description: string, list: Array<string>}} regionData
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   * @returns {void} 返り値なし
   */
  const updatePrefectureBlock = (regionData, prefectureRowData) => {
    const { key: regionKey } = regionData;
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    /** @type {NodeListOf<HTMLInputElement>} */
    const regionInputs = document.getElementsByName(regionKey);

    /**
     * 地域に合致する都道府県の一覧を返す関数
     * @function
     * @param {string} regionName
     * @param {Array<{name: string, ja:string, region: string}>} prefectureList
     * @returns {Array<string>}
     */
    const getMatchList = (regionName, prefectureList) => {
      const matchList = prefectureList
        .filter((prefecture) => prefecture.region === regionName)
        .map((item) => item.ja);
      return matchList;
    };

    /**
     * 都道県データを整形する関数
     * @function
     * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
     * @param {Array<string>} matchList
     * @returns {{key: string, description: string, list: Array<string>}}
     */
    const formatPrefectureData = (prefectureRowData, matchList) => {
      const { key, description } = prefectureRowData;
      const formatData = {
        key: key,
        description: description,
        list: matchList,
      };
      return formatData;
    };

    regionInputs?.forEach((input) => {
      input.addEventListener("change", (event) => {
        const targetInput = event.target;
        if (!targetInput) return;
        /** @type {string} */
        const regionName = targetInput.value;
        if (regionName === "") return;

        const prefectureNameList = getMatchList(regionName, prefectureList);
        const prefectureData = formatPrefectureData(
          prefectureRowData,
          prefectureNameList,
        );
        deleteBlockArea(prefectureKey);
        createSelectBlock(prefectureData);
      });
    });
  };

  /**
   * 天気を取得するボタンの活性非活性を切り替える関数
   * @function
   * @param {{key: string, description: string, list: Array<string>}} regionData
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   * @returns {void} 返り値なし
   */
  const switchActiveRequestButton = (regionData, prefectureRowData) => {
    /** @type {HTMLButtonElement | null} */
    const requestButton = document.querySelector("[data-weather-request]");
    if (!requestButton) return;
    const { key: regionKey } = regionData;
    const { key: prefectureKey } = prefectureRowData;
    /** @type {NodeListOf<HTMLInputElement>} */
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
   * @function
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   * @returns {void} 返り値なし
   */
  const updateResultBlock = (prefectureRowData) => {
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    const dataKey = "result";
    /** @type {HTMLButtonElement | null} */
    const requestButton = document.querySelector("[data-weather-request]");
    if (!requestButton) return;

    /**
     * 都道府県の日本語から英語を取得する関数
     * @function
     * @param {string} prefectureJa
     * @param {Array<{name: string, ja:string, region: string}>} prefectureList
     * @returns {string}
     */
    const getPrefectureEn = (prefectureJa, prefectureList) => {
      const prefectureEn = prefectureList.find(
        (prefecture) => prefecture.ja === prefectureJa,
      ).name;
      return prefectureEn;
    };

    /**
     * 天気情報を整形する関数
     * @function
     * @param {Object} data
     * @returns {{areaName: string,iconURL: string, description: string,  temp: number, temp_min: number, temp_max: number}}
     */
    const formatWeatherData = (data) => {
      /** @type {{name: string}} */
      const { main, weather, name: areaName } = data;
      /** @type {{temp: number, temp_min: number, temp_max: number}} */
      const { temp, temp_min, temp_max } = main;
      const { icon, description } = weather[0];
      /** @type {string} */
      const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      const weatherData = {
        areaName,
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
     * @function
     * @param {{areaName: string,iconURL: string, description: string,  temp: number, temp_min: number, temp_max: number}} weatherData
     * @param {string} key
     * @returns {void} 返り値なし
     */
    const createResultBlock = (weatherData, key) => {
      /** @type {HTMLDivElement | null} ボタンリストのElement */
      const weatherWrapElement = document.querySelector("[data-weather-wrap]");
      if (!weatherWrapElement) return;
      const { areaName, iconURL, description, temp, temp_min, temp_max } =
        weatherData;

      const divWrap = document.createElement("div");
      const pTitle = document.createElement("p");
      const divContent = document.createElement("div");
      const img = document.createElement("img");
      const spanWeather = document.createElement("span");
      const dl = document.createElement("dl");
      const divTemp = document.createElement("div");
      const divTempMax = document.createElement("div");
      const divTempMin = document.createElement("div");
      const imageSize = 50;

      divWrap.classList.add("weather-result-wrap");
      divWrap.setAttribute("data-weather-block", key);
      pTitle.innerHTML = `現在の${areaName}の天気`;
      divContent.classList.add("weather-result-content");
      img.setAttribute("src", iconURL);
      img.setAttribute("width", imageSize);
      img.setAttribute("height", imageSize);
      img.setAttribute("alt", "");
      spanWeather.innerHTML = description;
      spanWeather.classList.add("weather-result-main");
      dl.classList.add("weather-result-temp-wrap");
      divTemp.innerHTML = `<dt class="weather-result-temp">現在の気温</dt><dd class="weather-result-temp">${temp}</dd>`;
      divTempMax.innerHTML = `<dt class="weather-result-temp">最高気温</dt><dd class="weather-result-temp">${temp_max}</dd>`;
      divTempMin.innerHTML = `<dt class="weather-result-temp">最低気温</dt><dd class="weather-result-temp">${temp_min}</dd>`;
      dl.appendChild(divTemp);
      dl.appendChild(divTempMax);
      dl.appendChild(divTempMin);
      divContent.appendChild(img);
      divContent.appendChild(spanWeather);
      divContent.appendChild(dl);
      divWrap.appendChild(pTitle);
      divWrap.appendChild(divContent);
      weatherWrapElement.appendChild(divWrap);
    };

    requestButton.addEventListener("click", async () => {
      /** @type {NodeListOf<HTMLInputElement>} */
      const prefectureInputs = document.getElementsByName(prefectureKey);
      /** @type {HTMLInputElement | number} */
      const checkedPrefectureInput = [...prefectureInputs].find(
        (input) => input.checked === true,
      );
      const checkedPrefectureValue = checkedPrefectureInput.value;
      const prefectureEn = getPrefectureEn(
        checkedPrefectureValue,
        prefectureList,
      );
      const url = `https://getweatherinformation-afq4w33w3q-uc.a.run.app/?prefecture=${prefectureEn}`;
      /** @type {Object} 天気データが格納されたオブジェクト */
      const data = await fetchData(url);
      const weatherData = formatWeatherData(data);
      deleteBlockArea(dataKey);
      createResultBlock(weatherData, dataKey);
      requestButton.blur();
    });
  };

  /** @type {Object} 地域情報が格納されたオブジェクト */
  const areaData = await fetchData("../../json/city.json");
  if (!areaData) return;
  const { region: regionData, prefecture: prefectureRowData } = areaData;
  if (!regionData || !prefectureRowData) return;
  createSelectBlock(regionData);
  updatePrefectureBlock(regionData, prefectureRowData);
  switchActiveRequestButton(regionData, prefectureRowData);
  updateResultBlock(prefectureRowData);
};
