/**
 * 天気APIを利用して現在の天気を取得し、ブラウザに表示させる関数
 * @async
 * @function
 * @returns {void} 返り値なし
 */
export const weather = async () => {
  /**
   * 地域データをfetchで取得する関数
   * @async
   * @function
   * @returns {Promise<any>} Promiseオブジェクトはjsonデータを表す
   */
  const fetchCityData = async () => {
    /**
     * @type {Response} responseオブジェクト
     */
    const response = await fetch("../../json/city.json");
    /**
     * @type {Object} 地域情報が格納されたオブジェクト
     */
    const data = await response.json();
    return data;
  };

  /**
   * 天気APIを叩き、天気データを取得する関数
   * @async
   * @function
   * @param {string} prefectureEn
   * @returns  {Promise<any>} Promiseオブジェクトはjsonデータを表す
   */
  const fetchWeatherInformation = async (prefectureEn) => {
    const url = `https://getweatherinformation-afq4w33w3q-uc.a.run.app/?prefecture=${prefectureEn}`;
    /**
     * @type {Response} responseオブジェクト
     */
    const response = await fetch(url);
    /**
     * @type {Object} 地域情報が格納されたオブジェクト
     */
    const data = await response.json();
    return data;
  };

  /**
   * ブロックを削除する関数
   * @function
   * @param {string} key
   * @returns {void}
   */
  const deletePrefectureArea = (key) => {
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
    /**
     * @type {HTMLDivElement | null} ボタンリストのElement
     */
    const weatherBlockElement = document.querySelector("[data-weather]");
    if (!weatherBlockElement) return;
    const { key, description, list } = areaData;

    const div = document.createElement("div");
    const p = document.createElement("p");
    const ul = document.createElement("ul");
    div.classList.add("section-inner");
    div.setAttribute("data-weather-block", key);
    p.innerHTML = description;
    ul.classList.add("button-list");
    ul.setAttribute("data-weather-list", key);
    div.appendChild(p);
    div.appendChild(ul);
    weatherBlockElement.appendChild(div);

    list.forEach((listItem, index) => {
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
      ul.appendChild(li);
    });
  };

  /**
   * 都道府県ボタンのElementを作成する関数
   * @function
   * @param {{key: string, description: string, list: Array<string>}} regionData
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureData
   * @returns {void} 返り値なし
   */
  const updatePrefectureBlock = (regionData, prefectureRowData) => {
    const { key: regionKey } = regionData;
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    /**
     * @type {NodeListOf<HTMLInputElement>}
     */
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
     * @param {Array<string>} list
     * @returns {{key: string, description: string, list: Array<string>}}
     */
    const formatPrefectureData = (prefectureRowData, list) => {
      const { key, description } = prefectureRowData;
      const formatData = {
        key: key,
        description: description,
        list: list,
      };
      return formatData;
    };

    regionInputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        const regionName = event.target.value;
        const list = getMatchList(regionName, prefectureList);
        const prefectureData = formatPrefectureData(prefectureRowData, list);
        deletePrefectureArea(prefectureKey);
        createSelectBlock(prefectureData);
      });
    });
  };

  /**
   * 都道県データを整形する関数
   * @function
   * @param {{key: string, description: string, list: Array<string>}} regionData
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   * @returns {{key: string, description: string, list: Array<string>}}
   */
  const switchActiveSubmitButton = (regionData, prefectureRowData) => {
    const { key: regionKey } = regionData;
    const { key: prefectureKey } = prefectureRowData;
    /**
     * @type {NodeListOf<HTMLInputElement>}
     */
    const regionInputs = document.getElementsByName(regionKey);
    /**
     * @type {HTMLButtonElement | null}
     */
    const submitButton = document.querySelector("[data-weather-submit]");
    if (!submitButton) return;

    regionInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const prefectureInputs = document.getElementsByName(prefectureKey);
        submitButton.disabled = true;
        prefectureInputs.forEach((prefectureInput) => {
          prefectureInput.addEventListener("change", () => {
            submitButton.disabled = false;
          });
        });
      });
    });
  };

  /**
   * 選択された都道府県の英語を返す関数
   * @function
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   * @returns {void}
   */
  const updateWeatherInformation = (prefectureRowData) => {
    const { key: prefectureKey, prefectureList } = prefectureRowData;
    const dataKey = "result";
    /**
     * @type {HTMLButtonElement | null}
     */
    const submitButton = document.querySelector("[data-weather-submit]");
    if (!submitButton) return;

    /**
     * 都道府県の日本語から英語を取得する関数
     * @function
     * @param {string} prefectureJa
     * @param {Array<{name: string, ja:string, region: string}>} prefectureList
     * @returns {string}
     */
    const getPrefectureEn = (prefectureJa, prefectureList) => {
      const prefectureEn = prefectureList.find(
        (item) => item.ja === prefectureJa,
      ).name;
      return prefectureEn;
    };

    /**
     * 天気情報を整形する関数
     * @function
     * @param {Object} data
     * @returns {{iconURL: string, name: string, temp: number, temp_min: number, temp_max: number, weatherJa: string}}
     */
    const formatWeatherData = (data) => {
      /**
       * @type {{name: string}}
       */
      const { main, weather, name } = data;
      const weatherMap = {
        Thunderstorm: "雷雨",
        Drizzle: "霧雨",
        Rain: "雨",
        Snow: "雪",
        Clear: "晴れ",
        Clouds: "曇り",
        Mist: "霧",
        Smoke: "スモーク",
        Haze: "煙霧",
        Dust: "砂塵",
        Fog: "霧",
        Sand: "砂",
        Ash: "火山灰",
        Squall: "スコール",
        Tornado: "トルネード",
      };

      /**
       * @type {{temp: number, temp_min: number, temp_max: number}}
       */
      const { temp, temp_min, temp_max } = main;
      const { icon, main: weatherMain } = weather[0];
      /**
       * @type {string}
       */
      const weatherJa = weatherMap[weatherMain];
      const iconURL = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      const weatherData = {
        iconURL,
        weatherJa,
        temp,
        temp_min,
        temp_max,
        name,
      };

      return weatherData;
    };

    /**
     * 天気の結果を表示させる関数
     * @function
     * @param {{iconURL: string, name: string, temp: number, temp_min: number, temp_max: number, weatherJa: string}} weatherData
     * @returns {void}
     */
    const createResultBlock = (weatherData, key) => {
      /**
       * @type {HTMLDivElement | null} ボタンリストのElement
       */
      const weatherBlockElement = document.querySelector("[data-weather]");
      if (!weatherBlockElement) return;
      const { iconURL, name, temp, temp_min, temp_max, weatherJa } =
        weatherData;

      const divWrap = document.createElement("div");
      const pTitle = document.createElement("p");
      const divContent = document.createElement("div");
      const img = document.createElement("img");
      const spanWeather = document.createElement("span");
      const divTemp = document.createElement("div");
      const divTempMax = document.createElement("div");
      const divTempMin = document.createElement("div");

      divWrap.setAttribute("data-weather-block", key);
      pTitle.innerHTML = `現在の${name}の天気`;
      img.setAttribute("src", iconURL);
      img.setAttribute("width", 50);
      img.setAttribute("height", 50);
      spanWeather.innerHTML = weatherJa;
      divTemp.innerHTML = `<span>現在の気温</span><span>${temp}</span>`;
      divTempMax.innerHTML = `<span>最高気温</span><span>${temp_max}</span>`;
      divTempMin.innerHTML = `<span>最低気温</span><span>${temp_min}</span>`;
      divContent.appendChild(img);
      divContent.appendChild(spanWeather);
      divContent.appendChild(divTemp);
      divContent.appendChild(divTempMax);
      divContent.appendChild(divTempMin);
      divWrap.appendChild(pTitle);
      divWrap.appendChild(divContent);
      weatherBlockElement.appendChild(divWrap);
    };

    submitButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const prefectureInputs = [...document.getElementsByName(prefectureKey)];
      const checkedPrefecture = prefectureInputs.find(
        (input) => input.checked === true,
      ).value;
      const prefectureEn = getPrefectureEn(checkedPrefecture, prefectureList);
      const data = await fetchWeatherInformation(prefectureEn);
      const weatherData = formatWeatherData(data);
      createResultBlock(weatherData, dataKey);
    });
  };

  /**
   * @type {Object} 地域情報が格納されたオブジェクト
   */
  const areaData = await fetchCityData();
  const { region: regionData, prefecture: prefectureRowData } = areaData;
  createSelectBlock(regionData);
  updatePrefectureBlock(regionData, prefectureRowData);
  switchActiveSubmitButton(regionData, prefectureRowData);
  updateWeatherInformation(prefectureRowData);
};
