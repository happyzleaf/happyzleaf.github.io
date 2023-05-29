async function writeToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}

document.querySelector('.fa-discord').addEventListener('click', (e) => {
    e.preventDefault();
    writeToClipboard('happyz#6345');

    if (document.querySelector('.copy-alert')) {
        return;
    }

    let copyAlert = document.createElement('span');
    copyAlert.classList.add('copy-alert');
    copyAlert.innerText = `happyz#6345 copied in the clipboard.`;
    document.body.appendChild(copyAlert);
    setTimeout(() => {
        document.body.removeChild(copyAlert);
    }, 3000);
});
