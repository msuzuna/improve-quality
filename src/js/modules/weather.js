import { cityData } from "../data/city.js";

/**
 * 天気APIを利用して現在の天気を取得し、ブラウザに表示させる関数
 * @async
 * @function
 * @returns {void} 返り値なし
 */
export const weather = async () => {
  /**
   * fetchでデータを取得する関数
   * @async
   * @function
   * @param {string} url
   * @returns {Promise<any>} Promiseオブジェクトはjsonデータを表す
   */
  const fetchData = async (url) => {
    try {
      /** @type {Response} responseオブジェクト */
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`サーバーからの応答が異常です: ${response.status}`);
      }

      /** @type {Object} jsonデータ */
      const data = response.json();
      return data;
    } catch (error) {
      console.log("エラーが発生しました:", error);
    }
  };

  /**
   * ブロックを削除する関数
   * @function
   * @param {string} dataProps
   * @param {string} key
   * @returns {void} 返り値なし
   */
  const deleteBlockArea = (dataProps, key) => {
    /** @type {HTMLElement | null} ボタンリストのElement */
    const blockElement = document.querySelector(`[${dataProps}="${key}"]`);
    if (!(blockElement instanceof HTMLElement)) return;
    blockElement.innerHTML = "";
  };

  /**
   * 地域ボタンのElementを作成する関数
   * @function
   * @param {{key: string, list: Array<string>}} areaData
   * @returns {void} 返り値なし
   */
  const createSelectBlock = (areaData) => {
    const { key, list } = areaData;
    /** @type {HTMLMenuElement | null} ボタンリストのElement */
    const listElement = document.querySelector(`[data-weather-list=${key}]`);
    if (!(listElement instanceof HTMLElement)) return;

    list?.forEach((listItem, index) => {
      const id = `${key}${index}`;
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
      listElement.appendChild(li);
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
        if (!(targetInput instanceof EventTarget)) return;
        /** @type {string} */
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
   * @function
   * @param {{key: string, description: string, list: Array<string>}} regionData
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   * @returns {void} 返り値なし
   */
  const switchActiveRequestButton = (regionData, prefectureRowData) => {
    /** @type {HTMLButtonElement | null} */
    const requestButton = document.querySelector("[data-weather-request]");
    if (!(requestButton instanceof HTMLElement)) return;
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
    if (!(requestButton instanceof HTMLElement)) return;

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
      const weatherResultElement = document.querySelector(
        `[data-weather-block=${key}]`,
      );
      if (!(weatherResultElement instanceof HTMLElement)) return;
      const { areaName, iconURL, description, temp, temp_min, temp_max } =
        weatherData;

      const pTitle = document.createElement("p");
      const divContent = document.createElement("div");
      const img = document.createElement("img");
      const spanWeather = document.createElement("span");
      const dl = document.createElement("dl");
      const divTemp = document.createElement("div");
      const divTempMax = document.createElement("div");
      const divTempMin = document.createElement("div");
      const imageSize = 50;

      pTitle.innerHTML = `現在の${areaName}の天気`;
      divContent.classList.add("weather-result-content");
      img.src = iconURL;
      img.width = imageSize;
      img.height = imageSize;
      img.alt = "";
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
      weatherResultElement.appendChild(pTitle);
      weatherResultElement.appendChild(divContent);
    };

    requestButton.addEventListener("click", async () => {
      /** @type {NodeListOf<HTMLInputElement>} */
      const prefectureInputs = document.getElementsByName(prefectureKey);
      /** @type {HTMLInputElement | number} */
      const checkedPrefectureInput = [...prefectureInputs].find(
        (input) => input.checked,
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
      deleteBlockArea("data-weather-block", dataKey);
      createResultBlock(weatherData, dataKey);
      requestButton.blur();
    });
  };

  const { region: regionData, prefecture: prefectureRowData } = cityData;
  if (
    typeof regionData === "undefined" ||
    typeof prefectureRowData === "undefined"
  )
    return;
  createSelectBlock(regionData);
  updatePrefectureBlock(regionData, prefectureRowData);
  switchActiveRequestButton(regionData, prefectureRowData);
  updateResultBlock(prefectureRowData);
};
