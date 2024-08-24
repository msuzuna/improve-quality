/**
 * ブロックを削除する関数
 * @function
 * @param {string} dataKey
 * @param {string} dataValue
 * @returns {void} 返り値なし
 */
const deleteSelectBlock = (dataKey, dataValue) => {
  /** @type {HTMLMenuElement | null} ボタンリストのElement */
  const blockElement = document.querySelector(`[${dataKey}="${dataValue}"]`);
  if (!(blockElement instanceof HTMLMenuElement)) return;
  blockElement.innerHTML = "";
};

/**
 * 地域ボタンのElementを作成する関数
 * @function
 * @param {{key: string, list: Array<{value: string | null, ja: string}>}} optionData
 * @param {string} dataKey
 * @returns {void} 返り値なし
 */
export const createSelectBlock = (optionData, dataKey) => {
  const { key, list } = optionData;
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
 * @param {{key: string, list: Array<{value: string | null, ja: string}>}} categoryData
 * @param {{key: string, list: Array<{name: string | null, value: string | null, ja:string, category: string}> }} optionRowData
 * @param {string} dataKey
 * @returns {void} 返り値なし
 */
export const updateSelectBlock = (categoryData, optionRowData, dataKey) => {
  const { key: categoryKey } = categoryData;
  const { key: optionKey, list } = optionRowData;

  /** @type {NodeListOf<HTMLInputElement>} */
  const regionInputs = document.getElementsByName(`${categoryKey}-${dataKey}`);

  /**
   * 地域に合致する都道府県の一覧を返す関数
   * @function
   * @param {string} categoryName
   * @param {Array<{name: string | null, value: string | null, ja:string, category: string}>} optionList
   * @returns {Array<{name: string | null, value: string | null, ja:string, category: string}>}
   */
  const getMatchList = (categoryName, optionList) => {
    const matchList = optionList.filter(
      (item) => item.category === categoryName,
    );
    return matchList;
  };

  /**
   * 都道県データを整形する関数
   * @function
   * @param {string} optionKey
   * @param {Array<{name: string | null, value: string | null, ja:string, category: string}>} matchList
   * @returns {{key: string, list: Array<{value: string | null, ja:string}>}}
   */
  const formatData = (optionKey, matchList) => {
    const formatList = [];
    matchList.forEach((item) => {
      const obj = {};
      if (item.value) {
        obj.value = item.value;
      }
      obj.ja = item.ja;
      formatList.push(obj);
    });
    const formatData = {
      key: optionKey,
      list: formatList,
    };
    return formatData;
  };

  regionInputs?.forEach((input) => {
    input.addEventListener("change", (event) => {
      const targetInput = event.target;
      if (!(targetInput instanceof EventTarget)) return;
      /** @type {string} */
      const categoryName = targetInput.value;
      if (categoryName === "") return;

      const matchList = getMatchList(categoryName, list);
      const formattedData = formatData(optionKey, matchList);
      deleteSelectBlock(`data-${dataKey}-list`, optionKey);
      createSelectBlock(formattedData, dataKey);
    });
  });
};
