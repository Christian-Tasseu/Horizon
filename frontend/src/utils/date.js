export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
}