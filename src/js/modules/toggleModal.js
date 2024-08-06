/**
 * モーダルの表示非表示を行う
 * @function
 * @returns {void} 返り値なし
 */
export const toggleModal = () => {
  /**
   * モーダルを表示する
   * @function
   * @returns {void} 返り値なし
   */
  const showModal = () => {
    /** @type {NodeListOf<HTMLButtonElement>} モーダルを開くトリガー要素リスト */
    const openTriggers = document.querySelectorAll("[data-modal-open]");

    openTriggers.forEach((openTrigger) => {
      const id = openTrigger.getAttribute("data-modal-open");
      const target = document.getElementById(id);
      if (!(target instanceof HTMLElement)) {
        openTrigger.disabled = true;
        return;
      }

      openTrigger.addEventListener("click", () => {
        target.showModal();
      });
    });
  };

  /**
   * モーダルを非表示にする
   * @function
   * @returns {void} 返り値なし
   */
  const closeModal = () => {
    /** @type {NodeListOf<HTMLButtonElement>} モーダルを開くトリガー要素リスト */
    const closeTriggers = document.querySelectorAll("[data-modal-close]");

    closeTriggers.forEach((closeTrigger) => {
      const id = closeTrigger.getAttribute("data-modal-close");
      const target = document.getElementById(id);
      if (!(target instanceof HTMLElement)) return;

      closeTrigger.addEventListener("click", () => {
        target.close();
      });

      target.addEventListener("click", (event) => {
        const clickedElement = event.target;
        if (!(clickedElement instanceof HTMLElement)) return;

        if (clickedElement === target) {
          target.close();
        }
      });
    });
  };

  showModal();
  closeModal();
};
