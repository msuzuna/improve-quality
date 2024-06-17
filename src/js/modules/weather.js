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
   *
   * @param {{key: string, description: string, list: Array<string>}} regionData
   * @param {{key: string, description: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureData
   */
  const updatePrefectureList = (regionData, prefectureRowData) => {
    const { key: regionKey } = regionData;
    const { prefectureList } = prefectureRowData;
    /**
     * @type {NodeListOf<HTMLInputElement>}
     */
    const regionInputs = document.getElementsByName(regionKey);

    /**
     * 都道府県ブロックを削除する関数
     * @function
     * @returns {void}
     */
    const deletePrefectureArea = () => {
      const prefectureBlockName = '[data-weather-block="prefecture"]';
      const prefectureBlock = document.querySelector(prefectureBlockName);
      prefectureBlock?.remove();
    };

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
        deletePrefectureArea();
        createSelectBlock(prefectureData);
      });
    });
  };

  /**
   * @type {Object} 地域情報が格納されたオブジェクト
   */
  const areaData = await fetchCityData();
  const { region: regionData, prefecture: prefectureRowData } = areaData;
  createSelectBlock(regionData);
  updatePrefectureList(regionData, prefectureRowData);
};
