/**
 * @typedef {Object} Json
 * @property {boolean} ok
 * @property {any} data
 */

/**
 * fetchでデータを取得する関数
 * @param {string} url
 */
export const fetchData = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`リクエストに失敗しました: ${response.status}`);
  }

  /** @type {Json} */
  const json = await response.json();
  const { data, ok } = json;
  if (ok) {
    return data;
  } else {
    throw new Error(`データが取得できませんでした`);
  }
};
