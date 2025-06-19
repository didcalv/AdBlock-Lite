console.log("Content script activo");

// Eliminar todos los iframes de la página
const iframes = document.querySelectorAll("iframe");
iframes.forEach(iframe => iframe.remove());
