/**
 * ブロックを削除する関数
 * @param {string} dataKey
 * @param {string} dataValue
 */
const deleteSelectBlock = (dataKey, dataValue) => {
  const blockElement = document.querySelector(`[${dataKey}="${dataValue}"]`);
  if (!(blockElement instanceof HTMLMenuElement)) return;
  blockElement.innerHTML = "";
};

/**
 * 地域ボタンのElementを作成する関数
 * @param {{key: string, list: Array<{value: string, ja: string, category: string}>}} optionData
 * @param {string} dataKey
 */
export const createSelectBlock = (optionData, dataKey) => {
  const { key, list } = optionData;
  const listElement = document.querySelector(`[data-${dataKey}-list=${key}]`);
  if (!(listElement instanceof HTMLMenuElement)) return;

  const fragment = new DocumentFragment();

  list?.forEach((listItem) => {
    const id = listItem.id ?? window.crypto.randomUUID();
    const li = document.createElement("li");
    const input = document.createElement("input");
    const label = document.createElement("label");
    li.classList.add("input-wrap");
    input.type = "radio";
    input.name = `${key}-${dataKey}`;
    input.value = listItem.value !== "" ? listItem.value : listItem.ja;
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
 * @param {{key: string, list: Array<{value: string, ja: string, category: string}>}} categoryData
 * @param {{key: string, list: Array<{value: string, ja: string, category: string}> }} optionRowData
 * @param {string} dataKey
 */
export const updateSelectBlock = (categoryData, optionRowData, dataKey) => {
  const { key: categoryKey } = categoryData;
  const { key: optionKey, list } = optionRowData;
  const regionInputs = document.getElementsByName(`${categoryKey}-${dataKey}`);

  /**
   * 地域に合致する都道府県の一覧を返す関数
   * @param {string} categoryName
   * @param {Array<{value: string, ja: string, category: string}>} optionList
   */
  const getMatchList = (categoryName, optionList) => {
    const matchList = optionList.filter(
      (item) => item.category === categoryName
    );
    return matchList;
  };

  /**
   * 都道県データを整形する関数
   * @param {string} optionKey
   * @param {Array<{value: string, ja: string, category: string}>} matchList
   */
  const formatData = (optionKey, matchList) => {
    const formatData = {
      key: optionKey,
      list: matchList,
    };
    return formatData;
  };

  regionInputs?.forEach((input) => {
    input.addEventListener("change", (event) => {
      const targetInput = event.target;
      if (!(targetInput instanceof HTMLInputElement)) return;
      const categoryName = targetInput.value;
      if (categoryName === "") return;

      const matchList = getMatchList(categoryName, list);
      const formattedData = formatData(optionKey, matchList);
      deleteSelectBlock(`data-${dataKey}-list`, optionKey);
      createSelectBlock(formattedData, dataKey);
    });
  });
};
