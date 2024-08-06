/**
 * モーダルの表示非表示を行う
 */
export const toggleModal = () => {
  /**
   * モーダルを表示する
   */
  const showModal = () => {
    const openTriggerKey = "data-modal-open";
    const openTriggers = document.querySelectorAll(`[${openTriggerKey}]`);

    openTriggers.forEach((openTrigger) => {
      if (!(openTrigger instanceof HTMLButtonElement)) return;
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
   */
  const closeModal = () => {
    const closeTriggerKey = "data-modal-close";
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
