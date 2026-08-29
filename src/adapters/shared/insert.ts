function nativeValueSetter(el: HTMLInputElement | HTMLTextAreaElement): ((value: string) => void) | undefined {
  const proto =
    el instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
  return Object.getOwnPropertyDescriptor(proto, 'value')?.set;
}

function dispatchInput(el: HTMLElement, data: string): void {
  el.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data, inputType: 'insertText' }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

export function insertIntoEditable(el: HTMLElement, text: string): boolean {
  el.focus();

  if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) {
    const setter = nativeValueSetter(el);
    if (setter) setter.call(el, text);
    else el.value = text;
    dispatchInput(el, text);
    return true;
  }

  if (!el.isContentEditable) return false;

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.deleteContents();
  selection?.removeAllRanges();
  selection?.addRange(range);

  const inserted = document.execCommand('insertText', false, text);
  if (!inserted) {
    el.textContent = text;
    dispatchInput(el, text);
  }
  return true;
}
