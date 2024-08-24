import { cityData } from "../data/city.js";
import { tvArea } from "../data/tv-area.js";
import { createSelectBlock, updateSelectBlock } from "./selectBlock.js";

/**
 * NHK番組APIを利用し、番組表を検索し表示させる関数
 * @function
 * @returns {void} 返り値なし
 */
export const searchTvSchedule = () => {
  const dataKey = "tv";
  const { region: regionData } = cityData;
  const { city: cityRowData } = tvArea;
  createSelectBlock(regionData, dataKey);
  updateSelectBlock(regionData, cityRowData, dataKey);
};
