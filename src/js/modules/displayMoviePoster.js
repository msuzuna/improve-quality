import { fetchData } from "./fetch.js";
import { switchButtonDisable } from "./switchButtonDisable.js";

/**
 * @typedef {Object} Result
 * @property {number} id
 * @property {boolean} adult
 * @property {string} backdrop_path
 * @property {number[]} genre_ids
 * @property {string} original_language
 * @property {string} original_title
 * @property {string} overview
 * @property {number} popularity
 * @property {string} poster_path
 * @property {string} release_date
 * @property {string} title
 * @property {boolean} video
 * @property {number} vote_average
 * @property {number} vote_count
 */

/**
 * @typedef {Object} MovieData
 * @property {number} page
 * @property {number} total_pages
 * @property {number} total_results
 * @property {Result[]} results
 */

/**
 * 映画APIを利用して現在放映されている映画のポスターを表示させる
 */
export const displayMoviePoster = async () => {
  const observationTrigger = document.querySelector(
    "[data-modal-open='movie-poster']"
  );
  if (!(observationTrigger instanceof HTMLButtonElement)) return;

  const isButtonDisabled = observationTrigger?.disabled;
  // モーダルを開くボタンとモーダルの中身のidが一致しない場合モーダルが開かないため、早期リターン
  if (!(observationTrigger instanceof HTMLButtonElement) || isButtonDisabled)
    return;

  const posterBlock = document.querySelector("[data-movie='block']");
  if (!(posterBlock instanceof HTMLElement)) {
    observationTrigger.disabled = true;
    return;
  }

  const url = "https://getmovieinformation-afq4w33w3q-uc.a.run.app/";
  /** @type {MovieData} 映画情報が格納されたオブジェクト */
  const defaultData = await fetchData(url);
  const { page: defaultPage, total_pages: totalPages } = defaultData;
  // 通信がうまくいかなかったなど、必要な情報が得られなかった場合は早期リターン
  if (defaultPage === undefined || totalPages === undefined) {
    observationTrigger.disabled = true;
    return;
  }

  /**
   * 映画のポスターを取得し、映画ポスター要素を生成する関数
   */
  const createPosterElement = async (pageIndex = 1) => {
    /** @type {MovieData} 映画情報が格納されたオブジェクト */
    const data = await fetchData(`${url}?page=${pageIndex}`);
    const { results } = data;
    if (results === undefined) {
      observationTrigger.disabled = true;
      return;
    }

    const fragment = new DocumentFragment();

    results.forEach((result) => {
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
   * @param {number} defaultPageIndex
   * @param {number} totalPageIndex
   */
  const startObservation = (defaultPageIndex, totalPageIndex) => {
    const scrollArea = document.getElementById("movie-poster");
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

    /**
     * 次のページ数を取得する関数を生成する関数
     * @param {number} defaultPageIndex
     * @param {number} totalPageIndex
     */
    const getNextIndexFactory = (defaultPageIndex, totalPageIndex) => {
      let currentPageIndex = defaultPageIndex;

      /**
       * 次のページ数を取得する
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

    const nextIndex = getNextIndexFactory(defaultPageIndex, totalPageIndex);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            createPosterElement(nextIndex());
          }
        });
      },
      {
        root: scrollArea,
        threshold: 0,
      }
    );

    observationTrigger.addEventListener("click", () => {
      intersectionObserver.observe(target);
    });
  };

  createPosterElement();
  startObservation(defaultPage, totalPages);
};
