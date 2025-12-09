import React from 'react';

interface Props {
  content: string;
}

const AuditReportRenderer: React.FC<Props> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inTable = false;
  let tableRows: string[][] = [];
  let buffer: string[] = [];

  const flushBuffer = (keyPrefix: number) => {
    if (buffer.length > 0) {
       elements.push(
         <div key={`p-${keyPrefix}`} className="whitespace-pre-wrap text-brand-black/80 leading-7 mb-4 text-sm md:text-base">
           {buffer.join('\n')}
         </div>
       );
       buffer = [];
    }
  };

  const flushTable = (keyPrefix: number) => {
      if (tableRows.length > 0) {
          const headers = tableRows[0];
          const rows = tableRows.slice(2); // Skip header and separator
          
          elements.push(
            <div key={`t-${keyPrefix}`} className="overflow-x-auto my-8 rounded-xl border border-sage-3 shadow-soft bg-white">
              <table className="min-w-full text-sm text-right text-brand-black">
                <thead className="bg-sage-1 text-brand-black font-bold border-b border-sage-2">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="px-6 py-4 whitespace-nowrap">{h.trim()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-2 bg-white">
                  {rows.map((row, i) => (
                    <tr key={i} className={`hover:bg-sage-1/50 transition-colors`}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-6 py-4 text-brand-black/80">{cell.trim()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableRows = [];
          inTable = false;
      }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Table Start/Content
    if (line.trim().startsWith('|')) {
       if (!inTable) {
           flushBuffer(i);
           inTable = true;
       }
       tableRows.push(line.split('|').filter((c, idx, arr) => idx !== 0 && idx !== arr.length - 1));
       continue;
    } 
    
    if (inTable && !line.trim().startsWith('|')) {
        flushTable(i);
    }

    // Detect Progress Bar (Fraud Risk)
    if (line.includes('█')) {
        flushBuffer(i);
        const match = line.match(/(\d+)[٪%]/); // Find percentage
        const percentage = match ? parseInt(match[1]) : 90;
        const label = line.replace(/[█▒]+/g, '').trim();
        
        elements.push(
            <div key={`bar-${i}`} className="my-8 bg-red-low/20 p-6 rounded-xl border border-red-high/30">
                <div className="flex justify-between mb-3 items-center">
                    <span className="text-base font-bold text-brand-brown flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-high" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        تحلیل ریسک تقلب
                    </span>
                    <span className="text-xl font-heading font-bold text-brand-brown">{percentage}٪</span>
                </div>
                <div className="w-full bg-white rounded-full h-4 overflow-hidden border border-red-high/20">
                    <div className="bg-gradient-to-l from-brand-brown to-red-high h-4 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-sm text-brand-brown mt-3 font-medium text-left dir-ltr opacity-80">{label}</p>
            </div>
        );
        continue;
    }

    // Bullet points
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
         flushBuffer(i);
         elements.push(
             <div key={`li-${i}`} className="flex items-start gap-3 mb-3 px-2">
                 <span className="text-brand-green mt-1.5 text-xl leading-none">•</span>
                 <span className="text-brand-black/90">{line.replace(/^[•-]\s*/, '')}</span>
             </div>
         );
         continue;
    }
    
    // Headers
    if (line.trim().length > 0 && line.trim().length < 60 && !line.includes('|') && !line.endsWith('.') && !line.includes('http')) {
         flushBuffer(i);
         elements.push(
             <h3 key={`h-${i}`} className="text-xl font-heading font-medium text-brand-black mt-8 mb-4 pb-2 border-b border-sage-3">
                 {line.trim()}
             </h3>
         );
         continue;
    }

    if (line.trim()) {
        buffer.push(line);
    }
  }

  flushBuffer(lines.length);
  if (inTable) flushTable(lines.length);

  return (
    <div className="space-y-1 font-sans">
      {elements}
    </div>
  );
};

export default AuditReportRenderer;