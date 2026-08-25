const pdfjsImport = import("pdfjs-dist/legacy/build/pdf.mjs");

const CHUNK_SIZE = 3500;
const CHUNK_OVERLAP = 500;

function splitPageText(text, pageNumber, chunkIndexStart) {
    const chunks = [];
    let start = 0;
    let chunkIndex = chunkIndexStart;

    while (start < text.length) {
        const remainingText = text.length - start;
        let end = Math.min(start + CHUNK_SIZE, text.length);

        if (remainingText > CHUNK_SIZE) {
            const lastSpace = text.lastIndexOf(" ", end);
            if (lastSpace > start) {
                end = lastSpace;
            }
        }

        const chunkText = text.slice(start, end).trim();
        if (chunkText) {
            chunks.push({
                chunkIndex,
                pageNumber,
                text: chunkText
            });
            chunkIndex += 1;
        }

        if (end >= text.length) {
            break;
        }

        start = Math.max(end - CHUNK_OVERLAP, start + 1);
    }

    return chunks;
}

async function extractPdfChunks(buffer) {
    const pdfjs = await pdfjsImport;
    const loadingTask = pdfjs.getDocument({
        data: new Uint8Array(buffer),
        disableWorker: true
    });
    const pdf = await loadingTask.promise;
    const chunks = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item) => `${item.str}${item.hasEOL ? "\n" : " "}`)
            .join("")
            .replace(/[ \t]+/g, " ")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        if (pageText) {
            chunks.push(...splitPageText(pageText, pageNumber, chunks.length));
        }
    }

    return {
        pageCount: pdf.numPages,
        chunks
    };
}

module.exports = { extractPdfChunks };