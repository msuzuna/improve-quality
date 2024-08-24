/**
 * ブロックを削除する関数
 * @function
 * @param {string} dataKey
 * @param {string} dataValue
 * @returns {void} 返り値なし
 */
const deleteAreaBlock = (dataKey, dataValue) => {
  /** @type {HTMLMenuElement | null} ボタンリストのElement */
  const blockElement = document.querySelector(`[${dataKey}="${dataValue}"]`);
  if (!(blockElement instanceof HTMLMenuElement)) return;
  blockElement.innerHTML = "";
};

/**
 * 地域ボタンのElementを作成する関数
 * @function
 * @param {{key: string, list: Array<string>}} areaData
 * @param {string} dataKey
 * @returns {void} 返り値なし
 */
export const createSelectBlock = (areaData, dataKey) => {
  const { key, list } = areaData;
  /** @type {HTMLMenuElement | null} ボタンリストのElement */
  const listElement = document.querySelector(`[data-${dataKey}-list=${key}]`);
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
 * @param {{key: string,  list: Array<string>}} regionData
 * @param {{key: string,  prefectureList: Array<{name: string | null, id: string| null, ja:string, region: string}>}} prefectureRowData
 * @param {string} dataKey
 * @returns {void} 返り値なし
 */
export const updatePrefectureBlock = (
  regionData,
  prefectureRowData,
  dataKey,
) => {
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
   * @param {{key: string, prefectureList: Array<{name: string, ja:string, region: string}>}} prefectureRowData
   * @param {Array<string>} matchList
   * @returns {{key: string, list: Array<string>}}
   */
  const formatPrefectureData = (prefectureRowData, matchList) => {
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
      if (!(targetInput instanceof EventTarget)) return;
      /** @type {string} */
      const regionName = targetInput.value;
      if (regionName === "") return;

      const prefectureNameList = getMatchList(regionName, prefectureList);
      const prefectureData = formatPrefectureData(
        prefectureRowData,
        prefectureNameList,
      );
      deleteAreaBlock(`data-${dataKey}-list`, prefectureKey);
      createSelectBlock(prefectureData, dataKey);
    });
  });
};
