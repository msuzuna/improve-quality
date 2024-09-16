export const registerToLocalStorage = () => {
  const requestButtons = document.querySelectorAll("[data-request]");

  requestButtons.forEach((requestButton) => {
    const value = requestButton.getAttribute("data-request");
    if (value === null) return;

    const requireElementArray = [
      ...document.querySelectorAll(`[data-request-${value}]`),
    ];

    const requiredValueArray = requireElementArray.map((item) => {
      const targetAttr = item.attributes.getNamedItem(`data-request-${value}`);
      if (targetAttr === null) return;
      return targetAttr.value;
    });

    requiredValueArray.forEach((requiredValue) => {
      if (requiredValue === undefined) return;
      const requiredInputs = document.getElementsByName(requiredValue);
      requiredInputs.forEach((requiredInput) => {
        requiredInput.addEventListener("change", (e) => {
          const { currentTarget } = e;
          if (!(currentTarget instanceof HTMLInputElement)) return;
          const { name, value } = currentTarget;
          localStorage.setItem(name, value);
        });
      });

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
          if (!(currentTarget instanceof HTMLInputElement)) return;
          const { name, value } = currentTarget;
          localStorage.setItem(name, value);

          const requiredInputs = document.getElementsByName(requiredValue);
          requiredInputs.forEach((requiredInput) => {
            requiredInput.addEventListener("change", (e) => {
              const { currentTarget } = e;
              if (!(currentTarget instanceof HTMLInputElement)) return;
              const { name, value } = currentTarget;
              localStorage.setItem(name, value);
            });
          });
        });
      });
    });
  });
};
