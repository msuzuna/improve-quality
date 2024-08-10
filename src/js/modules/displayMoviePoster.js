import { fetchData } from "./fetch.js";

/**
 * 映画APIを利用して現在放映されている映画のポスターを表示させる
 * @async
 * @function
 * @returns {void} 返り値なし
 */
export const displayMoviePoster = async () => {
  /** @type {HTMLButtonElement | null} */
  const observationTrigger = document.querySelector(
    "[data-modal-open='movie-poster']",
  );
  /** @type {boolean | null} */
  const isButtonDisabled = observationTrigger?.disabled;
  // モーダルを開くボタンとモーダルの中身のidが一致しない場合モーダルが開かないため、早期リターン
  if (!(observationTrigger instanceof HTMLButtonElement) || isButtonDisabled)
    return;

  /** @type {HTMLElement | null} */
  const posterBlock = document.querySelector("[data-movie='block']");
  if (!(posterBlock instanceof HTMLElement)) {
    observationTrigger.disabled = true;
    return;
  }

  /** @type {string} */
  const url = "https://getmovieinformation-afq4w33w3q-uc.a.run.app/";
  /** @type {Object} 映画情報が格納されたオブジェクト */
  const defaultData = await fetchData(url);
  /** @type {{ page: number | undefined, total_pages: number | undefined}} */
  const { page: defaultPage, total_pages: totalPages } = defaultData;
  // 通信がうまくいかなかったなど、必要な情報が得られなかった場合は早期リターン
  if (defaultPage === undefined || totalPages === undefined) {
    observationTrigger.disabled = true;
    return;
  }

  /**
   * 映画のポスターを取得し、映画ポスター要素を生成する関数
   * @async
   * @function
   * @param {number} pageIndex
   * @returns {void}
   */
  const createPosterElement = async (pageIndex = 1) => {
    /** @type {Object} 映画情報が格納されたオブジェクト */
    const data = await fetchData(`${url}?page=${pageIndex}`);
    /** @type {{results: Array<Object> | undefined}} */
    const { results } = data;
    if (results === undefined) {
      observationTrigger.disabled = true;
      return;
    }

    /** @type {DocumentFragment} */
    const fragment = new DocumentFragment();

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
      fragment.append(img);
    });

    posterBlock.append(fragment);
  };

  /**
   * 監視を開始する関数
   * @function
   * @param {number} defaultPageIndex
   * @param {number} totalPageIndex
   * @returns {void}
   */
  const startObservation = (defaultPageIndex, totalPageIndex) => {
    /** @type {HTMLElement | null} */
    const scrollArea = document.getElementById("movie-poster");
    /** @type {HTMLElement | null} */
    const target = document.querySelector("[data-movie='end']");

    /**
     * scrollAreaは以下の理由からnullチェック不要
     * モーダルを開くボタンをモーダルコンテンツでIDが違う場合はすでにreturnされている
     * モーダルを開くボタンのdata属性がmovie-posterではない場合はすでにreturnされている
     */
    if (!(target instanceof HTMLElement)) {
      observationTrigger.disabled = true;
      return;
    }

    /** @type {{root: HTMLElement, threshold: number}} */
    const options = {
      root: scrollArea,
      threshold: 0,
    };

    /**
     * 次のページ数を取得する関数を生成する関数
     * @function
     * @param {number} defaultPageIndex
     * @param {number} totalPageIndex
     * @returns {Function | undefined} 次のページ数を取得する関数
     */
    const getNextIndexFactory = (defaultPageIndex, totalPageIndex) => {
      let currentPageIndex = defaultPageIndex;

      /**
       * 次のページ数を取得する
       * @function
       * @returns {number}
       */
      const getNextIndex = () => {
        if (currentPageIndex === totalPageIndex) {
          currentPageIndex = defaultPageIndex;
        } else {
          currentPageIndex += 1;
        }
        return currentPageIndex;
      };
      return getNextIndex;
    };

    /** @type {Function} */
    const nextIndex = getNextIndexFactory(defaultPageIndex, totalPageIndex);

    /**
     * オブザーバーの引数に設定するコールバック関数
     * @function
     * @param {IntersectionObserverEntry} entries
     * @returns {void}
     */
    const infiniteScroll = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          createPosterElement(nextIndex());
        }
      });
    };

    /** @type {IntersectionObserver} */
    const intersectionObserver = new IntersectionObserver(
      infiniteScroll,
      options,
    );

    observationTrigger.addEventListener("click", () => {
      intersectionObserver.observe(target);
    });
  };

  createPosterElement();
  startObservation(defaultPage, totalPages);
};
