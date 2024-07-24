/**
 * ボタン要素のdisabled属性を切り替える関数
 * @function
 * @param {HTMLButtonElement} buttonElement
 * @returns {{activateButton: Function, inactivateButton: Function}}
 */

export const switchButtonDisable = (buttonElement) => {
  const activateButton = () => {
    buttonElement.disabled = false;
  };

  const inactivateButton = () => {
    buttonElement.disabled = true;
  };

  return { activateButton, inactivateButton };
};
