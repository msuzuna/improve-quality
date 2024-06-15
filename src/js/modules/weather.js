/**
 * 天気APIを利用して現在の天気を取得し、ブラウザに表示させる関数
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
   * @type {Object} 地域情報が格納されたオブジェクト
   */
  const cityData = await fetchCityData();
  console.log(cityData);
};
