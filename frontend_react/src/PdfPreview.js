import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "./App.css";

// Set workerSrc for react-pdf (best-practice for proper loading)
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * PUBLIC_INTERFACE
 * PdfPreview component
 * Shows a styled, responsive preview for a PDF file (from URL or File object).
 * - Shows first page by default, with controls to navigate pages.
 * - Handles error states and loading.
 * - Designed to fit the PDF Wizard modern/minimal style.
 * 
 * Props:
 *   fileUrl: string | File | Blob | ArrayBuffer (URL or File object, as returned from upload)
 *   style: custom outer style object
 */
function PdfPreview({ fileUrl, style }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");

  // When pdf loads
  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
    setPdfError("");
    setLoading(false);
  }
  function onLoadError(error) {
    setPdfError("Could not display PDF preview. " + (error?.message || ""));
    setNumPages(null);
    setLoading(false);
  }

  return (
    <div 
      className="preview-box box"
      style={{
        maxWidth: 460,
        margin: "26px auto",
        border: "1.7px solid #b9a4e4",
        borderRadius: 20,
        boxShadow: "0 2px 8px rgba(98,78,141,0.10)",
        ...style
      }}
      tabIndex={0}
    >
      <div style={{fontWeight: 600, marginBottom: 8, color: "#624e8d", fontSize: 17}}>PDF Preview</div>
      {!fileUrl ? (
        <div style={{minHeight: 90, color: "#8974b6", textAlign: "center"}}>No PDF to show.</div>
      ) : (
        <div>
          <div style={{display: "flex", justifyContent: "center", minHeight: 310}}>
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onLoadError}
              loading={<span style={{color:"#aaa", fontSize:16}}>Loading PDF…</span>}
              error={<span style={{color:"#ab2b49"}}>Could not load PDF.</span>}
            >
              <Page
                pageNumber={pageNumber}
                width={390}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                loading=""
                style={{
                  margin: "0 auto",
                  borderRadius: 15,
                  boxShadow: "0 0 0 2px #e8e2f6",
                  background: "#faf9fd"
                }}
              />
            </Document>
          </div>

          {/* Controls */}
          {numPages && numPages > 1 && (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 8,
              gap: 8
            }}>
              <button
                style={{
                  background: "#b9a4e4",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "4px 14px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: pageNumber === 1 ? "not-allowed" : "pointer",
                  opacity: pageNumber === 1 ? 0.6 : 1,
                  transition: "opacity 0.2s"
                }}
                onClick={() => setPageNumber(page => Math.max(1, page - 1))}
                disabled={pageNumber === 1}
                aria-label="Previous page"
              >
                &lt;
              </button>
              <span style={{fontWeight: 500, fontSize: 15, color:"#624e8d"}}>
                Page {pageNumber} / {numPages}
              </span>
              <button
                style={{
                  background: "#b9a4e4",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "4px 14px",
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: pageNumber === numPages ? "not-allowed" : "pointer",
                  opacity: pageNumber === numPages ? 0.6 : 1,
                  transition: "opacity 0.2s"
                }}
                onClick={() => setPageNumber(page => Math.min(numPages, page + 1))}
                disabled={pageNumber === numPages}
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          )}
          {/* Error handling */}
          {pdfError && (
            <div style={{color: "#ab2b49", background: "#ffdbe2", borderRadius: 9, padding:"7px 10px", fontSize: 15, margin:"8px 0 0"}}>{pdfError}</div>
          )}
        </div>
      )}
    </div>
  );
}

export default PdfPreview;
