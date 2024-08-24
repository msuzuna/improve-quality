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
 * @param {{key: string, list: Array<{name: string | null, value: string | null, ja: string, region: string}>}} areaData
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
    input.name = `${key}-${dataKey}`;
    input.value = listItem.value ?? listItem.ja;
    input.id = id;
    label.htmlFor = id;
    label.innerText = listItem.ja;
    li.appendChild(input);
    li.appendChild(label);
    fragment.append(li);
  });

  listElement.append(fragment);
};

/**
 * 都道府県ボタンのElementを作成する関数
 * @function
 * @param {{key: string, list: Array<string>}} regionData
 * @param {{key: string, prefectureList: Array<{name: string, ja:string, region: string}> | null, cityList: Array<{value: string, ja:string, region: string}> | null}} areaRowData
 * @param {string} dataKey
 * @returns {void} 返り値なし
 */
export const updatePrefectureBlock = (regionData, areaRowData, dataKey) => {
  const { key: regionKey } = regionData;
  const { key: prefectureKey, prefectureList, cityList } = areaRowData;
  const areaRowList = prefectureList ?? cityList;
  if (!areaRowList) return;
  /** @type {NodeListOf<HTMLInputElement>} */
  const regionInputs = document.getElementsByName(`${regionKey}-${dataKey}`);

  /**
   * 地域に合致する都道府県の一覧を返す関数
   * @function
   * @param {string} regionName
   * @param {Array<{name: string | null, value: string | null, ja:string, region: string}>} areaList
   * @returns {Array<{name: string | null, value: string | null, ja:string, region: string}>}
   */
  const getMatchList = (regionName, areaList) => {
    const matchList = areaList.filter((area) => area.region === regionName);
    return matchList;
  };

  /**
   * 都道県データを整形する関数
   * @function
   * @param {{key: string, areaRowList: Array<{name: string, ja:string, region: string}>}} areaRowData
   * @param {Array<{name: string | null, value: string|null, ja:string, region: string}>} matchList
   * @returns {{key: string, list: Array<{name: string | null, value: string | null ja:string, region: string}>}}
   */
  const formatAreaData = (areaRowData, matchList) => {
    const { key } = areaRowData;
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

      const regionMatchAreaList = getMatchList(regionName, areaRowList);
      const prefectureData = formatAreaData(areaRowData, regionMatchAreaList);
      deleteAreaBlock(`data-${dataKey}-list`, prefectureKey);
      createSelectBlock(prefectureData, dataKey);
    });
  });
};
