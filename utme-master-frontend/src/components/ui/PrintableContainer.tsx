import React, { forwardRef } from 'react'

interface Props {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
  showHeader?: boolean
  showFooter?: boolean
  pageBreaks?: boolean
}

const PrintableContainer = forwardRef<HTMLDivElement, Props>(({
  children,
  title,
  subtitle,
  className = '',
  showHeader = true,
  showFooter = true,
  pageBreaks = true
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`printable-container ${className}`}
      style={{
        backgroundColor: 'white',
        color: 'black',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.6',
        fontSize: '14px',
        padding: '20px',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}
    >
      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .printable-container {
            margin: 0 !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-only {
            display: block !important;
          }
          
          .page-break {
            page-break-before: always !important;
          }
          
          .avoid-break {
            page-break-inside: avoid !important;
          }
          
          .print-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 50px;
            background: white;
            border-bottom: 1px solid #ccc;
            padding: 10px 15mm;
            font-size: 10px;
            z-index: 1000;
          }
          
          .print-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30px;
            background: white;
            border-top: 1px solid #ccc;
            padding: 5px 15mm;
            font-size: 10px;
            z-index: 1000;
          }
          
          .print-content {
            margin-top: ${showHeader ? '60px' : '0'};
            margin-bottom: ${showFooter ? '40px' : '0'};
          }
          
          /* Chart and image optimization */
          canvas, img, svg {
            max-width: 100% !important;
            height: auto !important;
            page-break-inside: avoid !important;
          }
          
          /* Table optimization */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 11px !important;
          }
          
          th, td {
            border: 1px solid #ccc !important;
            padding: 4px !important;
            text-align: left !important;
          }
          
          th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
          }
          
          /* Card and container optimization */
          .card, .border {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            margin-bottom: 10px !important;
          }
          
          /* Button and interactive element hiding */
          button:not(.print-button), 
          .btn:not(.print-button),
          .interactive,
          .hover-effect,
          .tooltip,
          .dropdown,
          .modal,
          .sidebar,
          .navigation {
            display: none !important;
          }
          
          /* Text optimization */
          h1 { font-size: 18px !important; margin: 10px 0 !important; }
          h2 { font-size: 16px !important; margin: 8px 0 !important; }
          h3 { font-size: 14px !important; margin: 6px 0 !important; }
          h4 { font-size: 12px !important; margin: 4px 0 !important; }
          
          p { margin: 4px 0 !important; }
          
          /* Color adjustments for print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>

      {/* Print Header */}
      {showHeader && (
        <div className="print-header print-only">
          <div className="flex justify-between items-center">
            <div>
              <strong>UTME Master Platform</strong>
              {title && <span> - {title}</span>}
            </div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      )}

      {/* Screen Header */}
      {showHeader && title && (
        <div className="no-print mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
      )}

      {/* Main Content */}
      <div className="print-content">
        {children}
      </div>

      {/* Print Footer */}
      {showFooter && (
        <div className="print-footer print-only">
          <div className="flex justify-between items-center">
            <div>Generated by UTME Master Platform</div>
            <div>Page <span className="page-number"></span></div>
          </div>
        </div>
      )}

      {/* Page break utility */}
      {pageBreaks && (
        <div className="print-only">
          <script dangerouslySetInnerHTML={{
            __html: `
              // Add page numbers
              window.addEventListener('beforeprint', function() {
                const pageNumbers = document.querySelectorAll('.page-number');
                pageNumbers.forEach((el, index) => {
                  el.textContent = (index + 1).toString();
                });
              });
            `
          }} />
        </div>
      )}
    </div>
  )
})

PrintableContainer.displayName = 'PrintableContainer'

export default PrintableContainer