import React from 'react'
import logo from '../assets/logo.png'

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)
}

const numberToWords = (num) => {
  if (num === 0) return 'Zero Rupees Only'
  const a = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
  const b = ['','', 'Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']
  const s = (n) => {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n/10)] + (n%10 ? ' ' + a[n%10] : '')
    if (n < 1000) return a[Math.floor(n/100)] + ' Hundred' + (n%100 ? ' ' + s(n%100) : '')
    if (n < 100000) return s(Math.floor(n/1000)) + ' Thousand' + (n%1000 ? ' ' + s(n%1000) : '')
    if (n < 10000000) return s(Math.floor(n/100000)) + ' Lakh' + (n%100000 ? ' ' + s(n%100000) : '')
    return s(Math.floor(n/10000000)) + ' Crore' + (n%10000000 ? ' ' + s(n%10000000) : '')
  }
  return s(Math.floor(num)) + ' Rupees Only'
}

// formatRefBy removed from usage; keeping logic inline via label text

const formatDT = (value) => {
  if (!value) return ''
  try {
    const d = new Date(value)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    let hh = d.getHours()
    const min = String(d.getMinutes()).padStart(2, '0')
    const ampm = hh >= 12 ? 'PM' : 'AM'
    hh = hh % 12
    if (hh === 0) hh = 12
    const hhStr = String(hh).padStart(2, '0')
    return `${dd}-${mm}-${yyyy}/${hhStr}:${min}${ampm}`
  } catch {
    return String(value)
  }
}

const BillPreview = ({ data, onBack, onPrint }) => {
  const lab = data?.lab || {}
  const meta = data?.meta || {}
  const patient = data?.patient || {}
  const items = Array.isArray(data?.items) ? data.items : []
  const discount = Number(data?.discount) || 0
  const narration = data?.narration || ''

  const subtotal = items.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  const netAmount = Math.max(0, subtotal - (Number(discount) || 0))
  const receivedAmt = Number(data?.receivedAmt) || 0
  const duesAmt = Math.max(0, netAmount - receivedAmt)
  const logoSrc = (data?.lab && data.lab.logoUrl) ? data.lab.logoUrl : logo

  // removed preview header, so currentDate/currentTime not needed

  // Function to handle print
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title> </title>
        <style>
          @page { margin: 0; }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #fff; 
            color: #000;
            line-height: 1.4;
            font-size: 12px;
          }
          .bill-container { 
            max-width: 800px; 
            margin: 0 auto; 
            border: 2px solid #000; 
            padding: 15px;
            position: relative;
          }
          .header { 
            text-align: center; 
            padding-bottom: 10px; 
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
          }
          .lab-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #000; 
            margin-bottom: 2px;
            text-transform: uppercase;
          }
          .address { 
            font-size: 11px; 
            color: #000; 
            margin: 1px 0;
          }
          .contact-info { 
            font-size: 10px; 
            color: #000; 
            margin-top: 3px;
          }
          .receipt-title { 
            font-size: 18px; 
            font-weight: bold; 
            text-align: center; 
            margin: 10px 0;
            text-decoration: underline;
            text-transform: uppercase;
          }
          .patient-section, .meta-section { 
            margin-bottom: 10px;
          }
          .info-row-left { 
            margin: 2px 0; 
            padding: 0 5px;
            display: grid;
            grid-template-columns: 80px 9px auto;
            align-items: center;
          }
          .info-label-left { 
            font-weight: bold; 
            white-space: nowrap;
          }
          .colon-left { 
            display: inline-block; 
            width: 10px; 
            margin: 0;
            text-align: center; 
          }
          .info-value-left { 
            white-space: nowrap; 
          }
          .info-row-left span { white-space: nowrap; }

          .info-row-right { 
            margin: 2px 0; 
            padding: 0 5px;
            display: grid;
            grid-template-columns: 150px 10px auto;
            align-items: center;
          }
          .info-label-right { 
            font-weight: bold; 
            white-space: nowrap;
          }
          .colon-right { 
            display: inline-block; 
            width: 10px; 
            margin: 0;
            text-align: center; 
          }
          .info-value-right { 
            white-space: nowrap; 
          }
          .info-row-right span { white-space: nowrap; }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            border: 1px solid #000;
          }
          th { 
            background: #f0f0f0; 
            color: #000; 
            padding: 6px; 
            text-align: left;
            border: 1px solid #000;
            font-weight: bold;
          }
          td { 
            padding: 6px; 
            border: 1px solid #000;
          }
          .summary-section { 
            margin-top: 15px; 
          }
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 3px 0;
          }
          .amount-in-words { 
            font-style: italic; 
            margin: 10px 0; 
            padding: 8px; 
            background: #f8f8f8; 
            border: 1px solid #ccc;
            font-size: 11px;
          }
          .footer { 
            margin-top: 20px; 
            font-size: 9px; 
            color: #000;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
          .footer-note { 
            margin: 2px 0;
          }
          .signature { 
            margin-top: 20px; 
            text-align: right;
            font-size: 10px;
          }
          .watermark { 
            position: absolute; 
            top: 40%; 
            left: 50%; 
            transform: translate(-50%, -50%) rotate(-45deg); 
            opacity: 0.05; 
            font-size: 60px; 
            color: #000; 
            z-index: -1;
          }
          @media print {
            body { padding: 20px; }
            .no-print { display: none !important; }
            .bill-container { border: 2px solid #000; padding: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <div style="position:relative; text-align:center; min-height:96px;">
              ${logoSrc ? `<img src="${logoSrc}" alt="Logo" style="position:absolute; left:10px; top:0; width:96px; height:96px; object-fit:contain;" />` : ''}
              <div>
                <div class="lab-name">${lab.name || 'RADHA JYOTI DIAGNOSTICS'}</div>
                ${lab.addressLine1 ? `<div class="address">${lab.addressLine1}</div>` : ''}
                ${lab.addressLine2 ? `<div class="address">${lab.addressLine2}</div>` : ''}
                <div class="contact-info">
                  ${lab.contact1 || lab.contact2 ? `Contact No.: ${[lab.contact1, lab.contact2].filter(Boolean).join(', ')}` : ''}
                  ${lab.email ? ` | Email: ${lab.email}` : ''}
                </div>
              </div>
            </div>
          </div>
          
          <div class="receipt-title">MONEY RECEIPT</div>
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 15px;">
            <div class="patient-section" style="flex: 1;">
              <div class="info-row-left">
                <span class="info-label-left">AID</span>
                <span class="colon-left">:</span>
                <span class="info-value-left">${meta.id || 'R25-010503'}</span>
              </div>
              <div class="info-row-left">
                <span class="info-label-left">NAME</span>
                <span class="colon-left">:</span>
                <span class="info-value-left">${patient.name || ''} ${patient.name ? '(E3)' : ''}</span>
              </div>
              <div class="info-row-left">
                <span class="info-label-left">AGE</span>
                <span class="colon-left">:</span>
                <span class="info-value-left">${patient.age || ''}</span>
              </div>
              <div class="info-row-left">
                <span class="info-label-left">SEX</span>
                <span class="colon-left">:</span>
                <span class="info-value-left">${patient.sex || ''}</span>
              </div>
              <div class="info-row-left">
                <span class="info-label-left">REF. BY DR</span>
                <span class="colon-left">:</span>
                <span class="info-value-left">${patient.refBy || ''}</span>
              </div>
            </div>
            
            <div class="meta-section" style="flex: 1; margin-left: 20px;">
              <div class="info-row-right">
                <span class="info-label-right">SI NO</span>
                <span class="colon-right">:</span>
                <span class="info-value-right">${meta.siNo || '04/1219'}</span>
              </div>
              <div class="info-row-right">
                <span class="info-label-right">COLLECTION DATE TIME</span>
                <span class="colon-right">:</span>
                <span class="info-value-right">${formatDT(meta.collectionDateTime) || '04-12-2025/1:26PM'}</span>
              </div>
              <div class="info-row-right">
                <span class="info-label-right">BILLING DATE TIME</span>
                <span class="colon-right">:</span>
                <span class="info-value-right">${formatDT(meta.billingDateTime) || '04-12-2025/1:28PM'}*</span>
              </div>
              <div class="info-row-right">
                <span class="info-label-right">REPORTING TIME</span>
                <span class="colon-right">:</span>
                <span class="info-value-right">${formatDT(meta.reportingTime) || '04-12-2025/2:00PM'}</span>
              </div>
              <div class="info-row-right">
                <span class="info-label-right">MOBILE</span>
                <span class="colon-right">:</span>
                <span class="info-value-right">${patient.mobile || ''}</span>
              </div>
            </div>
          </div>
          
          <div style="font-weight: bold; margin: 10px 0 5px 0;">TEST NAME</div>
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>TEST NAME</th>
                <th style="width: 100px; text-align: right;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item, idx) => `
                <tr>
                  <td style="text-align: center;">${idx + 1}</td>
                  <td>${item.name || ''}</td>
                  <td style="text-align: right;">${item.amount > 0 ? formatCurrency(item.amount || 0) : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="text-align: right; margin: 5px 0; font-weight: bold;">Test: ${items.length}</div>
          
          <div style="margin: 15px 0; font-weight: bold;">In Words</div>
          
          <div class="amount-in-words">
            ${numberToWords(netAmount)}
          </div>
          
          <div class="summary-section">
            <div style="width: 300px; margin-left: auto;">
              <div class="summary-row">
                <span>Sub Total:</span>
                <span><strong>${formatCurrency(subtotal)}</strong></span>
              </div>
              <div class="summary-row">
                <span>Discount:</span>
                <span><strong>${formatCurrency(discount)}</strong></span>
              </div>
              <div class="summary-row">
                <span>Received Amt:</span>
                <span><strong>${formatCurrency(receivedAmt)}</strong></span>
              </div>
              <div class="summary-row">
                <span>Dues Amt.:</span>
                <span><strong>${formatCurrency(duesAmt)}</strong></span>
              </div>
              <div class="summary-row" style="border-top: 1px solid #000; padding-top: 5px; margin-top: 5px;">
                <span><strong>Net Amount:</strong></span>
                <span><strong>${formatCurrency(netAmount)}</strong></span>
              </div>
            </div>
          </div>
          
          ${narration ? `
            <div style="margin: 10px 0; padding: 5px; border: 1px solid #ccc;">
              <strong>Narration:</strong> ${narration}
            </div>
          ` : ''}
          
          <div class="footer">
            <div class="footer-note"><strong>Monday to Sunday, Time - 08 : 00 AM to 07 : 00 PM</strong></div>
            <div class="footer-note"><strong>Reports Can be taken after Full payment</strong></div>
            <div class="footer-note"><strong>Home Collection Available</strong></div>
            <div class="footer-note">1. Technical causes can delay analysis are require resampling for validation of report.</div>
            <div class="footer-note">2. All the reporting date will be depending upon the turn around time of the test.</div>
            <div class="footer-note">3. Biopsy,FNAC,Bone Marrow etc. patients may confirm the availability of report on phone.</div>
            <div class="footer-note">4. Report value will not be Communicated ever phone by any staff member.</div>
            
            <div class="signature">
              <div style="margin-top: 50px;">_______________________</div>
              <div>Authorised Signatory</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Top page header removed as requested */}

        {/* Bill Container - Matching Image Style */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-300">
          <div className="border-b border-gray-300 p-4 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center">
              {logoSrc ? <img src={logoSrc} alt="Logo" className="w-24 h-24 object-contain mr-4" /> : null}
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{lab.name || ''}</h1>
                <div className="mt-1 text-sm text-gray-700 space-y-0.5">
                  {lab.addressLine1 ? <div>{lab.addressLine1}</div> : null}
                  {lab.addressLine2 ? <div>{lab.addressLine2}</div> : null}
                  {(lab.contact1 || lab.contact2) ? <div className="font-semibold">Contact No.: {[lab.contact1, lab.contact2].filter(Boolean).join(', ')}</div> : null}
                  {lab.email ? <div>Email: {lab.email}</div> : null}
                </div>
              </div>
            </div>
          </div>

          {/* Money Receipt Title */}
          <div className="border-b border-gray-300 py-3 bg-gray-50">
            <h2 className="text-xl font-bold text-center uppercase tracking-wider">MONEY RECEIPT</h2>
          </div>

          {/* Patient and Bill Info Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Left Column - Patient Info */}
              <div className="space-y-1 text-sm">
                <div className="flex">
                  <span className="font-bold w-24">AID</span>
                  <span className="mx-1">:</span>
                  <span className="flex-1 whitespace-nowrap">{meta.id || 'R25-010503'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24">NAME</span>
                  <span className="mx-1">:</span>
                  <span className="flex-1 whitespace-nowrap">{patient.name || 'Mrs. SHANTI KUMARI'} {patient.name && '(E3)'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24">AGE</span>
                  <span className="mx-1">:</span>
                  <span className="flex-1 whitespace-nowrap">{patient.age || ''}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24">SEX</span>
                  <span className="mx-1">:</span>
                  <span className="flex-1 whitespace-nowrap">{patient.sex || ''}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-24">REF. BY DR</span>
                  <span className="mx-1">:</span>
                  <span className="flex-1 whitespace-nowrap">{patient.refBy || 'AMAR NATH JHA , MD'}</span>
                </div>
              </div>

              {/* Right Column - Bill Info */}
              <div className="space-y-1 text-sm">
                <div className="flex">
                  <span className="font-bold w-48">SI NO</span>
                  <span className="mx-1">:</span>
                  <span className="flex-none whitespace-nowrap">{meta.siNo || '04/1219'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-48">COLLECTION DATE TIME</span>
                  <span className="mx-1">:</span>
                  <span className="flex-none whitespace-nowrap">{formatDT(meta.collectionDateTime) || '04-12-2025/1:26PM'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-48">BILLING DATE TIME</span>
                  <span className="mx-1">:</span>
                  <span className="flex-none whitespace-nowrap">{formatDT(meta.billingDateTime) || '04-12-2025/1:28PM'}*</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-48">REPORTING TIME</span>
                  <span className="mx-1">:</span>
                  <span className="flex-none whitespace-nowrap">{formatDT(meta.reportingTime) || '04-12-2025/2:00PM'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-48">MOBILE</span>
                  <span className="mx-1">:</span>
                  <span className="flex-none whitespace-nowrap">{patient.mobile || ''}</span>
                </div>
              </div>
            </div>

            {/* Test Name Header */}
            <div className="mt-4 mb-2">
              <h3 className="font-bold text-lg">TEST NAME</h3>
            </div>

            {/* Test Items Table */}
            <div className="border border-gray-300 rounded-xl overflow-hidden mb-4">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 p-2 text-center w-10">#</th>
                    <th className="border border-gray-300 p-2 text-left">TEST NAME</th>
                    <th className="border border-gray-300 p-2 text-right w-28">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-200 p-2 text-center">{idx + 1}</td>
                      <td className="border border-gray-200 p-2">{item.name}</td>
                      <td className="border border-gray-200 p-2 text-right">
                        {item.amount > 0 ? formatCurrency(item.amount || 0) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right p-2 bg-gray-50 border-t border-gray-300">
                <span className="font-bold">Test: {items.length}</span>
              </div>
            </div>

            {/* In Words */}
            <div className="mb-4">
              <div className="font-bold mb-1">In Words</div>
              <div className="italic bg-gray-50 border border-gray-200 rounded p-3 text-gray-700 min-h-12">
                {numberToWords(netAmount)}
              </div>
            </div>

            {/* Amount Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Left Column - Empty or Narration */}
              <div>
                {narration && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="font-bold text-gray-700 mb-1">Narration:</div>
                    <div className="text-gray-600">{narration}</div>
                  </div>
                )}
              </div>

              {/* Right Column - Amount Summary */}
              <div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-bold">Sub Total:</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Discount:</span>
                    <span className="font-bold text-red-600">{discount > 0 ? formatCurrency(discount) : ''}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                    <span className="font-bold text-lg">Net Amount:</span>
                    <span className="font-bold text-lg text-blue-700">{formatCurrency(netAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Received Amt:</span>
                    <span className="font-medium text-green-600">{receivedAmt > 0 ? formatCurrency(receivedAmt) : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dues Amt.:</span>
                    <span className={`font-medium ${duesAmt > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {duesAmt > 0 ? formatCurrency(duesAmt) : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="mt-6 pt-4 border-t border-gray-300">
              <div className="text-xs text-gray-700 space-y-1">
                <div className="font-bold">Monday to Sunday, Time - 08 : 00 AM to 07 : 00 PM</div>
                <div className="font-bold">Reports Can be taken after Full payment</div>
                <div className="font-bold">Home Collection Available</div>
                <div className="mt-2 space-y-0.5">
                  <div>1. Technical causes can delay analysis are require resampling for validation of report.</div>
                  <div>2. All the reporting date will be depending upon the turn around time of the test.</div>
                  <div>3. Biopsy,FNAC,Bone Marrow etc. patients may confirm the availability of report on phone.</div>
                  <div>4. Report value will not be Communicated ever phone by any staff member.</div>
                </div>
              </div>

              {/* Signature */}
              <div className="mt-8 text-right">
                <div className="inline-block text-center">
                  <div className="mt-8 text-gray-900">_______________________</div>
                  <div className="text-sm font-medium text-gray-700 mt-1">Authorised Signatory</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-gray-100 border-t border-gray-300 flex justify-between">
            <button
              onClick={onBack}
              className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-medium flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Edit Bill
            </button>
            <button
              onClick={() => (onPrint ? onPrint() : handlePrint())}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Bill
            </button>
          </div>
        </div>

        {/* Preview Instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-bold mb-1">Print Instructions:</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Click "Print Bill" to open a printer-friendly version</li>
                <li>The print layout matches the exact format of your sample image</li>
                <li>Use Ctrl+P (Windows) or Cmd+P (Mac) for additional print options</li>
                <li>For best results, print in portrait mode</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillPreview
