import React from 'react';
import Status from '../components/Status';

// [MOCK 데이터] DB에서 받아온 생산 지시 리스트
const WORK_ORDERS = [
  { id: 'WO-20250120-01', line: 'LINE-1', product: 'GB80L (배터리)', qty: 100, status: 'RUN' },
  { id: 'WO-20250120-02', line: 'LINE-2', product: 'AGM70 (배터리)', qty: 50,  status: 'WAITING' },
  { id: 'WO-20250119-99', line: 'LINE-1', product: 'DIN60 (배터리)', qty: 200, status: 'CAUTION' },
  { id: 'WO-20250120-03', line: 'LINE-3', product: 'GB80L (배터리)', qty: 0,   status: 'DANGER' }, // 에러 케이스
];

const Test = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>생산 작업 지시 현황</h2>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>지시 번호</th>
              <th style={styles.th}>라인</th>
              <th style={styles.th}>제품명</th>
              <th style={styles.th}>지시 수량</th>
              <th style={styles.th}>진행 상태</th>
            </tr>
          </thead>
          <tbody>
            {WORK_ORDERS.map((row) => (
              <tr key={row.id} style={styles.tr}>
                <td style={styles.td}>{row.id}</td>
                <td style={styles.td}>{row.line}</td>
                <td style={styles.tdLeft}>{row.product}</td>
                <td style={styles.td}>{row.qty} EA</td>
                <td style={styles.tdCenter}>
                  

                  <Status status={row.status} />
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- [스타일 정의] ---
const styles = {
  container: {
    padding: '40px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1f2937',
  },
  tableWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden', // 둥근 모서리 적용을 위해
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '15px',
  },
  thRow: {
    backgroundColor: '#f3f4f6',
    borderBottom: '2px solid #e5e7eb',
  },
  th: {
    padding: '16px',
    textAlign: 'center',
    fontWeight: '600',
    color: '#4b5563',
  },
  tr: {
    borderBottom: '1px solid #e5e7eb',
  },
  td: {
    padding: '16px',
    textAlign: 'center',
    color: '#374151',
  },
  tdLeft: {
    padding: '16px',
    textAlign: 'left',
    color: '#374151',
    fontWeight: '500',
  },
  tdCenter: {
    padding: '12px',
    textAlign: 'center',
  },
};

export default Test;