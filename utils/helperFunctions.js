export const url2blob = async (url) => {
    try {
        const data = await fetch(url);
        const blob = await data.blob();
        return blob;
    } catch (err) {
        if (err.message) {
            return res.status(500).json({ error: err.message });
        }
        return res.status(500).json({ error: err });
    }
}
