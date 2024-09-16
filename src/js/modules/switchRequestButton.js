/**
 * 天気を取得するボタンの活性非活性を切り替える関数
 */
export const switchActiveRequestButton = () => {
  const requestButtons = document.querySelectorAll("[data-request]");

  requestButtons.forEach((requestButton) => {
    if (!(requestButton instanceof HTMLButtonElement)) return;

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

    const allRequiredChecked = requiredValueArray.every((item) => {
      if (item === undefined) return;
      const inputs = document.getElementsByName(item);
      const isRequiredChecked = [...inputs].some((input) => {
        if (!(input instanceof HTMLInputElement)) return;
        return input.checked;
      });
      return isRequiredChecked;
    });
    if (allRequiredChecked) {
      requestButton.disabled = false;
    }

    requiredValueArray.forEach((requiredValue) => {
      if (requiredValue === undefined) return;

      const triggerElement = document.querySelector(
        `[data-trigger-${requiredValue}]`,
      );
      if (!(triggerElement instanceof HTMLMenuElement)) return;

      const triggerValue = triggerElement.getAttribute(
        `data-trigger-${requiredValue}`,
      );
      if (triggerValue === null) return;

      const requiredInputs = document.getElementsByName(requiredValue);
      requiredInputs.forEach((requiredInput) => {
        requiredInput.addEventListener("change", () => {
          const allRequiredChecked = requiredValueArray.every((item) => {
            if (item === undefined) return;
            const inputs = document.getElementsByName(item);
            const isRequiredChecked = [...inputs].some((input) => {
              if (!(input instanceof HTMLInputElement)) return;
              return input.checked;
            });
            return isRequiredChecked;
          });
          if (allRequiredChecked) {
            requestButton.disabled = false;
          }
        });
      });

      const triggerInputs = document.getElementsByName(triggerValue);
      triggerInputs.forEach((triggerInput) => {
        triggerInput.addEventListener("change", () => {
          requestButton.disabled = true;

          const requiredInputs = document.getElementsByName(requiredValue);
          requiredInputs.forEach((requiredInput) => {
            requiredInput.addEventListener("change", () => {
              const allRequiredChecked = requiredValueArray.every((item) => {
                if (item === undefined) return;
                const inputs = document.getElementsByName(item);
                const isRequiredChecked = [...inputs].some((input) => {
                  if (!(input instanceof HTMLInputElement)) return;
                  return input.checked;
                });
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
