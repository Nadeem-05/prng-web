// components/PrintButton.tsx
import React, { useCallback } from "react";

interface PrintButtonProps {
  label?: string;
  className?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
}

interface PrintStyles {
  pageSize: {
    width: string;
    height: string;
  };
  scale: number;
  margin: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({
  label = "Print (A2 - 104%)",
  className = "",
  onBeforePrint,
  onAfterPrint,
}) => {
  const printStyles: PrintStyles = {
    pageSize: {
      width: "420mm", // A2 width
      height: "594mm", // A2 height
    },
    scale: 1.04, // 104%
    margin: "1mm", // minimum margin
  };

  const generatePrintStyles = (styles: PrintStyles): string => {
    return `
      @page {
        size: A2;
        margin: ${styles.margin};
      }
      @media print {
        body {
          width: ${styles.pageSize.width};
          height: ${styles.pageSize.height};
          margin: 0;
          padding: ${styles.margin};
          box-sizing: border-box;
          zoom: ${styles.scale};
          -webkit-transform: scale(${styles.scale});
          transform: scale(${styles.scale});
          transform-origin: top left;
        }
        .no-print {
          display: none !important;
        }
        .printable-content {
          width: 100%;
          height: 100%;
        }
      }
    `;
  };

  const handlePrint = useCallback(() => {
    // Store original styles
    const originalStyle = document.body.style.cssText;

    try {
      // Call before print callback if provided
      onBeforePrint?.();

      // Create and append print styles
      const style = document.createElement("style");
      style.textContent = generatePrintStyles(printStyles);
      document.head.appendChild(style);

      // Trigger print
      window.print();

      // Cleanup
      document.head.removeChild(style);
      document.body.style.cssText = originalStyle;

      // Call after print callback if provided
      onAfterPrint?.();
    } catch (error) {
      console.error("Print error:", error);
      // Ensure cleanup happens even if there's an error
      document.body.style.cssText = originalStyle;
    }
  }, [onBeforePrint, onAfterPrint]);

  return (
    <button
      onClick={handlePrint}
      className={`ml-5 p-2 bg-blue-400 rounded mt-10 ${className}`}
      type="button"
    >
      {label}
    </button>
  );
};

export default PrintButton;
