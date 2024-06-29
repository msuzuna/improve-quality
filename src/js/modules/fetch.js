/**
 * fetchでデータを取得する関数
 * @async
 * @function
 * @param {string} url
 * @returns {Promise<any>} Promiseオブジェクトはjsonデータを表す
 */
export const fetchData = async (url) => {
  try {
    /** @type {Response} responseオブジェクト */
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`サーバーからの応答が異常です: ${response.status}`);
    }

    /** @type {Object} jsonデータ */
    const data = response.json();
    return data;
  } catch (error) {
    console.log("エラーが発生しました:", error);
  }
};
