/**
 * 天気を取得するボタンの活性非活性を切り替える関数
 * @function
 * @returns {void} 返り値なし
 */
export const switchActiveRequestButton = () => {
  /** @type {NodeListOf<HTMLButtonElement>} */
  const requestButtons = document.querySelectorAll("[data-request]");

  requestButtons.forEach((requestButton) => {
    /** @type {string | null}  */
    const value = requestButton.getAttribute("data-request");
    if (value === null) return;

    /** @type {Array<HTMLMenuElement>}  */
    const requireElementArray = [
      ...document.querySelectorAll(`[data-request-${value}]`),
    ];

    /** @type {Array<string>} */
    const requiredValueArray = requireElementArray.map(
      (item) => item.attributes.getNamedItem(`data-request-${value}`).value,
    );

    requiredValueArray.forEach((requiredValue) => {
      /** @type {HTMLMenuElement} */
      const triggerElement = document.querySelector(
        `[data-trigger-${requiredValue}]`,
      );
      if (!(triggerElement instanceof HTMLMenuElement)) return;

      /** @type {string | null} */
      const triggerValue = triggerElement.getAttribute(
        `data-trigger-${requiredValue}`,
      );
      if (triggerValue === null) return;

      const triggerInputs = document.getElementsByName(triggerValue);
      triggerInputs.forEach((triggerInput) => {
        triggerInput.addEventListener("change", () => {
          requestButton.disabled = true;

          const requiredInputs = document.getElementsByName(requiredValue);
          requiredInputs.forEach((requiredInput) => {
            requiredInput.addEventListener("change", () => {
              const allRequiredChecked = requiredValueArray.every((item) => {
                const inputs = document.getElementsByName(item);
                const isRequiredChecked = [...inputs].some(
                  (input) => input.checked,
                );
                return isRequiredChecked;
              });
              if (allRequiredChecked) {
                requestButton.disabled = false;
              }
            });
          });
        });
      });
    });
  });
};
