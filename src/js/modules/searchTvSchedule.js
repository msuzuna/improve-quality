/**
 * @typedef {Object} tyData
 * @property {Object} list
 */

/**
 * @typedef {Object} imgData
 * @property {string} url
 * @property {string} width
 * @property {string} height
 */

/**
 * @typedef {Object} areaData
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} serviceData
 * @property {string} id
 * @property {string} name
 * @property {imgData} logo_s
 * @property {imgData} logo_m
 * @property {imgData} logo_l
 */

/**
 * @typedef {Object} listData
 * @property {string} id
 * @property {string} event_id
 * @property {string} start_time
 * @property {string} end_time
 * @property {areaData} area
 * @property {serviceData} service
 * @property {string} title
 * @property {string} subtitle
 * @property {string} content
 * @property {string} act
 * @property {string[]} genres
 */

import { cityData } from "../data/city.js";
import { tvArea } from "../data/tv-area.js";
import { tvService } from "../data/tv-service.js";
import { createSelectBlock, updateSelectBlock } from "./selectBlock.js";
import { fetchData } from "./fetch.js";

/**
 * NHK番組APIを利用し、番組表を検索し表示させる関数
 */
export const searchTvSchedule = () => {
  const updateResultBlock = () => {
    /**
     *
     * @param {string} startData
     * @param {string} endData
     */
    const formatTime = (startData, endData) => {
      const dayMap = {
        0: "日",
        1: "月",
        2: "火",
        3: "水",
        4: "木",
        5: "金",
        6: "土",
      };
      /**
       *
       * @param {string} timeData
       */
      const convertedToDate = (timeData) => {
        const dataArray = timeData.split("T");
        const dateArray = dataArray[0].split("-").map((item) => Number(item));
        const timeArray = dataArray[1]
          .split("+")[0]
          .split(":")
          .map((item) => Number(item));

        const [y, m, d] = dateArray;
        const [h, minute, s] = timeArray;
        const date = new Date(y, m - 1, d, h, minute, s);

        return date;
      };

      const startDateData = convertedToDate(startData);
      const startMonth = startDateData.getMonth() + 1;
      const startDate = startDateData.getDate();
      /** @type {number} */
      const test = startDateData.getDay();
      const startDay = dayMap[test];
      const startHour = String(startDateData.getHours()).padStart(2, "0");
      const startMin = String(startDateData.getMinutes()).padStart(2, "0");
      const endDateData = convertedToDate(endData);
      const endHour = String(endDateData.getHours()).padStart(2, "0");
      const endMin = String(endDateData.getMinutes()).padStart(2, "0");
      const durationTime = endDateData.getTime() - startDateData.getTime();
      const hour = Math.floor((durationTime / 1000 / 60 / 60) % 24);
      const min = Math.floor((durationTime / 1000 / 60) % 60);
      const formattedDate = `${startMonth}月${startDate}日 (${startDay}) ${startHour}:${startMin}〜${endHour}:${endMin}(${hour === 0 ? "" : hour + "時間"}${min}分)`;
      return formattedDate;
    };

    /**
     *
     * @param {Object} list
     */
    const addListItemToFragment = (list) => {
      const fragment = new DocumentFragment();
      const keys = Object.keys(list);
      keys.forEach((key) => {
        /** @type {Array<listData>} */
        const array = list[key];
        array.forEach((item) => {
          const formattedDate = formatTime(item.start_time, item.end_time);
          const li = document.createElement("li");
          const spanDate = document.createElement("span");
          const spanChannel = document.createElement("span");
          const spanTitle = document.createElement("span");
          const spanContent = document.createElement("span");
          spanDate.innerText = formattedDate;
          spanChannel.innerText = item.service.name;
          spanTitle.innerText = item.title;
          spanContent.innerText = item.subtitle;
          li.append(spanDate);
          li.append(spanChannel);
          li.append(spanTitle);
          li.append(spanContent);
          fragment.append(li);
        });
      });
      return fragment;
    };

    const areaKey = "city-tv";
    const serviceKey = "service-tv";
    const requestButton = document.querySelector("[data-request='tv']");
    const resultList = document.querySelector("[data-tv-block='result']");
    const defaultBlock = document.querySelector('[data-tv-block="default"]');
    if (
      !(requestButton instanceof HTMLButtonElement) ||
      !(resultList instanceof HTMLUListElement) ||
      !(defaultBlock instanceof HTMLDivElement)
    )
      return;

    requestButton.addEventListener("click", async () => {
      const cityInputs = document.getElementsByName(areaKey);
      const checkedCityElement = [...cityInputs].find((input) => {
        if (input instanceof HTMLInputElement) {
          return input.checked;
        }
      });
      if (!(checkedCityElement instanceof HTMLInputElement)) return;
      const cityValue = checkedCityElement.value;

      const serviceInputs = document.getElementsByName(serviceKey);
      const selectedServiceElement = [...serviceInputs].find((input) => {
        if (input instanceof HTMLInputElement) {
          return input.checked;
        }
      });
      if (!(selectedServiceElement instanceof HTMLInputElement)) return;
      const serviceValue = selectedServiceElement.value;

      const url = `https://gettvschedule-afq4w33w3q-uc.a.run.app?area=${cityValue}&service=${serviceValue}`;
      /** @type {tyData} */
      const data = await fetchData(url);
      const { list } = data;
      const fragment = addListItemToFragment(list);
      resultList.append(fragment);
      resultList.hidden = false;
      defaultBlock.hidden = true;
    });
  };

  const dataKey = "tv";
  const { region: regionData } = cityData;
  const { city: cityRowData } = tvArea;
  const { serviceCategory: serviceCategoryData, service: serviceRowData } =
    tvService;
  createSelectBlock(regionData, dataKey);
  createSelectBlock(serviceCategoryData, dataKey);
  updateSelectBlock(regionData, cityRowData, dataKey);
  updateSelectBlock(serviceCategoryData, serviceRowData, dataKey);
  updateResultBlock();
};
