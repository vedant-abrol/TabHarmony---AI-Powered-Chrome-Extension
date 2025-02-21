
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'createTabGroup') {
    chrome.tabs.group({ tabIds: request.tabIds }, (groupId) => {
      chrome.tabGroups.update(groupId, {
        title: request.groupName,
        color: request.color
      });
    });
  }
});
