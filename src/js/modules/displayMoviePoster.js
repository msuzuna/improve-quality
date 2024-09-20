// @ts-check

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
 * @property {number} page
 * @property {Result[]} results
 */

export const displayMoviePoster = async () => {
  /**
   * 映画データ取得APIを叩くだけの関数
   * @param {number} _pageIndex ページ番号
   */
  const fetchMovieData = async (_pageIndex) => {
    const url = `https://getmovieinformation-afq4w33w3q-uc.a.run.app/?page=${_pageIndex}`;

    /** @type {MovieData} */
    const data = await (await fetch(url)).json();
    return data;
  };

  /**
   * データを元にUIを描画するだけの関数
   * @param {Result[]} results
   */
  const appendMoviePosterImages = async (results) => {
    const posterBlock = document.querySelector("[data-movie='block']");
    if (posterBlock === null) {
      throw new Error('Cannot find "poster block" element');
    }

    const fragment = new DocumentFragment();

    results.forEach((result) => {
      const { poster_path, title } = result;
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
   * ダイアログが最後までスクロールされたときに任意の関数を実行するよう Observer に登録するだけの関数
   * @param {() => void} cb ダイアログが最後までスクロールされたときに実行する関数
   */
  const observeDialogScroll = (cb) => {
    const observationTrigger = document.querySelector(
      "[data-modal-open='movie-poster']",
    );
    const scrollArea = document.getElementById("movie-poster");
    const target = document.querySelector('[data-movie="end"]');

    if (observationTrigger === null || target === null) {
      throw new Error("Cannot find element");
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            cb();
          }
        });
      },
      {
        root: scrollArea,
        threshold: 0,
      },
    );

    observationTrigger.addEventListener("click", () => {
      intersectionObserver.observe(target);
    });
  };

  /**
   * - `fetchMovieData` を呼び出す関数を返す関数
   * - 呼び出すたびに pageIndex はインクリメントし、maxPage を超えたら以降は実行しない
   */
  const createMovieFetcher = () => {
    let currentPage = 1;
    let maxPage = 0;

    // クロージャを返す
    return async () => {
      if (maxPage && currentPage > maxPage) return null;

      const data = await fetchMovieData(currentPage);
      const { total_pages } = data;
      maxPage = total_pages;
      currentPage += 1;
      return data;
    };
  };

  const init = async () => {
    const fetchMovie = createMovieFetcher();
    const createMoviePosterListFromFetch = async () => {
      const results = (await fetchMovie())?.results;
      if (!results)
        throw new Error('Cannot find "results" property in movieData');

      await appendMoviePosterImages(results);
    };

    try {
      await createMoviePosterListFromFetch();

      observeDialogScroll(async () => {
        await createMoviePosterListFromFetch();
      });
    } catch (error) {
      const observationTrigger = document.querySelector(
        "[data-modal-open='movie-poster']",
      );

      if (observationTrigger instanceof HTMLButtonElement) {
        observationTrigger && (observationTrigger.disabled = true);
      }
      console.error(error);
    }
  };
  init();
};
