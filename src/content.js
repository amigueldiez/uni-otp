function collectInputs() {
  return Array.from(document.querySelectorAll('input')).map((el, index) => ({
    index,
    name: el.name,
    id: el.id,
    placeholder: el.placeholder,
    type: el.type,
  }));
}

function fillInput(input, value) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

async function checkPage() {
  const inputs = Array.from(document.querySelectorAll('input'));
  const response = await chrome.runtime.sendMessage({
    type: 'CHECK_PAGE',
    text: document.body ? document.body.innerText : '',
    title: document.title,
    inputs: collectInputs(),
  }).catch(() => null);
  if (response && response.isMfa && typeof response.inputIndex === 'number') {
    const input = inputs[response.inputIndex];
    if (input) fillInput(input, response.code);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkPage);
} else {
  checkPage();
}
setTimeout(checkPage, 1500);
