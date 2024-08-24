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
