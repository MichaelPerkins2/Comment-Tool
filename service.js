chrome.commands.onCommand.addListener((shortcut) => {
    if (shortcut === 'reload') {
        console.log('Reloading extension...');
        chrome.runtime.reload();
    }
})