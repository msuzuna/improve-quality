export const toggleModal = () => {
  const showModal = () => {
    const openTriggerKey = "data-modal-open";
    const openTriggers: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll(`[${openTriggerKey}]`);

    openTriggers.forEach((openTrigger) => {
      const id = openTrigger.getAttribute(openTriggerKey);
      const target = document.getElementById(id ?? "");
      if (!(target instanceof HTMLDialogElement)) {
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
    const closeTriggerKey = "data-modal-close";
    /** @type {NodeListOf<HTMLButtonElement>} モーダルを開くトリガー要素リスト */
    const closeTriggers = document.querySelectorAll(`[${closeTriggerKey}]`);

    closeTriggers.forEach((closeTrigger) => {
      const id = closeTrigger.getAttribute(closeTriggerKey);
      const target = document.getElementById(id ?? "");
      if (!(target instanceof HTMLDialogElement)) return;

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
