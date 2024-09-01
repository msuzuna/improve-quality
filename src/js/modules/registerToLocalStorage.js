export const registerToLocalStorage = () => {
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
        triggerInput.addEventListener("change", (e) => {
          const { currentTarget } = e;
          if (currentTarget === null) return;
          const { name, value } = currentTarget;
          localStorage.setItem(name, value);

          const requiredInputs = document.getElementsByName(requiredValue);
          requiredInputs.forEach((requiredInput) => {
            requiredInput.addEventListener("change", (e) => {
              const { currentTarget } = e;
              if (currentTarget === null) return;
              const { name, value } = currentTarget;
              localStorage.setItem(name, value);
            });
          });
        });
      });
    });
  });
};
