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
    p.innerHTML = description;
    ul.classList.add("button-list");
    ul.setAttribute("data-weather-area", key);
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
   * @type {Object} 地域情報が格納されたオブジェクト
   */
  const areaData = await fetchCityData();
  const { region } = areaData;
  createSelectBlock(region);
};
