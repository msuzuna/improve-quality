import { fetchData } from "./fetch.js";

/**
 * 映画APIを利用して現在放映されている映画のポスターを表示させる
 * @async
 * @function
 * @returns {void} 返り値なし
 */
export const displayMoviePoster = () => {
  /** @type {string} */
  const url = "https://getmovieinformation-afq4w33w3q-uc.a.run.app/";

  /**
   * 次のページ数を取得する関数を生成する関数
   * @async
   * @function
   * @returns {Function} 次のページ数を取得する関数
   */
  const getNextIndexFactory = async () => {
    /** @type {Object} 映画情報が格納されたオブジェクト */
    const defaultData = await fetchData(url);
    /** @type {{ page: number, total_pages: number}} */
    const { page: defaultPage, total_pages: totalPages } = defaultData;
    let currentPageIndex = defaultPage;

    /**
     * 次のページ数を取得する
     * @function
     * @returns {number}
     */
    const getNextIndex = () => {
      if (currentPageIndex === totalPages) {
        currentPageIndex = defaultPage;
      } else {
        currentPageIndex += 1;
      }
      return currentPageIndex;
    };
    return getNextIndex;
  };

  /**
   * 映画のポスターを取得し、映画ポスター要素を生成する関数
   * @function
   * @param {number} pageIndex
   * @returns {void}
   */
  const createPosterElement = async (pageIndex = 1) => {
    /** @type {HTMLElement | null} */
    const posterBlock = document.querySelector("[data-movie='block']");
    if (!(posterBlock instanceof HTMLElement)) return;

    /** @type {Object} 映画情報が格納されたオブジェクト */
    const data = await fetchData(`${url}?page=${pageIndex}`);
    /** @type {{results: Array<Object>}} */
    const { results } = data;

    results.forEach((result) => {
      /** @type {{poster_path: string | null, title: string}} */
      const { poster_path, title } = result;
      if (poster_path === null) return;
      const srcUrl = `https://image.tmdb.org/t/p/w300_and_h450_bestv2${poster_path}`;
      const imgWidth = 100;
      const imgHeight = 150;
      const img = document.createElement("img");
      img.src = srcUrl;
      img.alt = title;
      img.width = imgWidth;
      img.height = imgHeight;
      posterBlock.appendChild(img);
    });
  };
  createPosterElement();
};
