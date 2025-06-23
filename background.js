// background.js (Service Worker)

chrome.runtime.onInstalled.addListener(() => {
  // Cargar reglas desde el archivo 'rules.json'
  fetch(chrome.runtime.getURL('rules.json'))
    .then(response => response.json())
    .then(newRules => {
      // Obtener reglas dinámicas actuales para eliminarlas
      chrome.declarativeNetRequest.getDynamicRules(currentRules => {
        const currentRuleIds = currentRules.map(rule => rule.id);

        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: currentRuleIds,
          addRules: newRules
        }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error actualizando reglas:', chrome.runtime.lastError);
          } else {
            console.log('Reglas actualizadas correctamente');
          }
        });
      });
    })
    .catch(err => {
      console.error('Error cargando reglas:', err);
    });
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateRules') {
    // Cargar reglas desde el archivo 'rules.json'
    fetch(chrome.runtime.getURL('rules.json'))
      .then(response => response.json())
      .then(newRules => {
        // Obtener reglas dinámicas actuales para eliminarlas
        chrome.declarativeNetRequest.getDynamicRules(currentRules => {
          const currentRuleIds = currentRules.map(rule => rule.id);

          chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: currentRuleIds,
            addRules: newRules
          }, () => {
            if (chrome.runtime.lastError) {
              console.error('Error actualizando reglas:', chrome.runtime.lastError);
            } else {
              console.log('Reglas actualizadas correctamente');
              sendResponse({ success: true });
            }
          });
        });
      })
      .catch(err => {
        console.error('Error cargando reglas:', err);
        sendResponse({ success: false, error: err.message });
      });

    // Indicar que la respuesta será enviada de forma asíncrona
    return true;
  }
});