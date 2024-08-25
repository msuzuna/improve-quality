import { cityData } from "../data/city.js";
import { tvArea } from "../data/tv-area.js";
import { tvService } from "../data/tv-service.js";
import { createSelectBlock, updateSelectBlock } from "./selectBlock.js";
import { fetchData } from "./fetch.js";

/**
 * NHK番組APIを利用し、番組表を検索し表示させる関数
 * @function
 * @returns {void} 返り値なし
 */
export const searchTvSchedule = () => {
  const updateResultBlock = () => {
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
      const startDay = dayMap[startDateData.getDay()];
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

    const addListItemToFragment = (list) => {
      const fragment = new DocumentFragment();
      const keys = Object.keys(list);
      keys.forEach((key) => {
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
    /** @type {HTMLButtonElement | null} */
    const requestButton = document.querySelector("[data-tv-request]");
    if (!(requestButton instanceof HTMLButtonElement)) return;

    const resultList = document.querySelector("[data-tv-block='result']");
    const defaultBlock = document.querySelector('[data-tv-block="default"]');

    requestButton.addEventListener("click", async () => {
      /** @type {NodeListOf<HTMLInputElement>} */
      const cityInputs = document.getElementsByName(areaKey);
      const cityValue = [...cityInputs].find((input) => input.checked).value;

      /** @type {NodeListOf<HTMLInputElement>} */
      const serviceInputs = document.getElementsByName(serviceKey);
      const serviceValue = [...serviceInputs].find(
        (input) => input.checked,
      ).value;

      const url = `https://gettvschedule-afq4w33w3q-uc.a.run.app?area=${cityValue}&service=${serviceValue}`;
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
