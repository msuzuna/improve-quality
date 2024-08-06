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
    /** @type {Response} responseオブジェクト */
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`リクエストに失敗しました: ${response.status}`);
    }

    /** @type {Object} jsonデータ */
    const data = response.json();
    return data;
  };

  /**
   * ブロックを削除する関数
   * @function
   * @param {string} dataKey
   * @param {string} dataValue
   * @returns {void} 返り値なし
   */
  const deleteBlockArea = (dataKey, dataValue) => {
    /** @type {HTMLMenuElement | null} ボタンリストのElement */
    const blockElement = document.querySelector(`[${dataKey}="${dataValue}"]`);
    if (!(blockElement instanceof HTMLMenuElement)) return;
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
    if (!(listElement instanceof HTMLMenuElement)) return;

    /** @type {DocumentFragment} */
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
    if (!(requestButton instanceof HTMLButtonElement)) return;
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
    if (!(requestButton instanceof HTMLButtonElement)) return;

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
     * @returns {{areaDescription: string,iconURL: string, description: string,  temp: number, temp_min: number, temp_max: number}}
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
     * @function
     * @param {{areaDescription: string,iconURL: string, description: string,  temp: number, temp_min: number, temp_max: number}} weatherData
     * @param {string} dataValue
     * @returns {void} 返り値なし
     */
    const updateResultBlock = (weatherData, dataValue) => {
      /** @type {HTMLDivElement | null} ボタンリストのElement */
      const weatherResultElement = document.querySelector(
        `[data-weather-block=${dataValue}]`,
      );
      if (!(weatherResultElement instanceof HTMLDivElement)) return;
      const dataResultKey = "data-weather-result";
      /** @type {NodeListOf<HTMLElement>} 結果を表示させる要素リスト */
      const resultElements = document.querySelectorAll(`[${dataResultKey}]`);
      resultElements.forEach((resultElement) => {
        const resultId = resultElement.getAttribute(dataResultKey);
        if (resultId === "") {
          return;
        } else if (resultId === "iconURL") {
          resultElement.src = weatherData[resultId];
        } else {
          resultElement.innerText = weatherData[resultId];
        }
      });

      weatherResultElement.hidden = false;
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
      /** @type {HTMLDivElement | null} */
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
