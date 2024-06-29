/**
 * fetchでデータを取得する関数
 * @async
 * @function
 * @param {string} url
 * @returns {Promise<any>} Promiseオブジェクトはjsonデータを表す
 */
export const fetchData = async (url) => {
  /** @type {Response} responseオブジェクト */
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`リクエストに失敗しました: ${response.status}`);
  }

  /** @type {Object} jsonデータ */
  const data = response.json();
  return data;
};
