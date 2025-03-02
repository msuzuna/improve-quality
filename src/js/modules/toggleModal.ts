export const toggleModal = () => {
  const showModal = () => {
    const openTriggerKey = "data-modal-open";
    const openTriggers = document.querySelectorAll<HTMLButtonElement>(
      `[${openTriggerKey}]`
    );

    openTriggers.forEach((openTrigger) => {
      const id = openTrigger.getAttribute(openTriggerKey) ?? "";
      const target = document.getElementById(id) as HTMLDialogElement | null;
      if (!target) {
        openTrigger.disabled = true;
        return;
      }

      openTrigger.addEventListener("click", () => target.showModal());
    });
  };

  /**
   * モーダルを非表示にする
   */
  const closeModal = () => {
    const closeTriggerKey = "data-modal-close";
    const closeTriggers = document.querySelectorAll<HTMLButtonElement>(
      `[${closeTriggerKey}]`
    );

    closeTriggers.forEach((closeTrigger) => {
      const id = closeTrigger.getAttribute(closeTriggerKey) ?? "";
      const target = document.getElementById(id) as HTMLDialogElement | null;
      if (!target) return;

      closeTrigger.addEventListener("click", () => target.close());

      target.addEventListener("click", (event) => {
        const clickedElement = event.target as HTMLElement | null;
        if (!clickedElement) return;

        if (clickedElement === target) {
          target.close();
        }
      });
    });
  };

  showModal();
  closeModal();
};
