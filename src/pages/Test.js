import React, { useState, useEffect } from 'react';

// [MOCK 데이터] 입출고 이력 예시 데이터
// 실제로는 API (GET /api/inventory/history)에서 받아옵니다.
const MOCK_HISTORY = [
  { id: 1, date: '2025-01-20 09:30', type: 'IN', category: '자재입고', productCode: 'MAT-PB', productName: '납 (Lead)', lotNo: 'LOT-250120-A01', qty: 1000, unit: 'KG', location: '자재창고', worker: '김철수', remark: '정기 입고' },
  { id: 2, date: '2025-01-20 10:15', type: 'OUT', category: '생산투입', productCode: 'MAT-PB', productName: '납 (Lead)', lotNo: 'LOT-250120-A01', qty: 200, unit: 'KG', location: '생산 1라인', worker: '이영희', remark: '오전 생산분' },
  { id: 3, date: '2025-01-20 14:00', type: 'IN', category: '생산입고', productCode: 'BAT-12V-80A', productName: 'GB80L (완제품)', lotNo: 'PROD-250120-001', qty: 50, unit: 'EA', location: '완제품창고', worker: '박지민', remark: '생산 완료' },
  { id: 4, date: '2025-01-21 09:00', type: 'OUT', category: '제품출하', productCode: 'BAT-12V-80A', productName: 'GB80L (완제품)', lotNo: 'PROD-250120-001', qty: 30, unit: 'EA', location: '출하장', worker: '최민수', remark: '현대차 납품' },
  { id: 5, date: '2025-01-21 11:30', type: 'ADJUST', category: '재고조정', productCode: 'MAT-ACID', productName: '황산', lotNo: 'ACID-2412', qty: -5, unit: 'L', location: '자재창고', worker: '관리자', remark: '누수 폐기' },
];

/**
 * [입출고 이력 조회 페이지]
 */
const Test = () => {
  // --- 상태 관리 (State) ---
  const [historyList, setHistoryList] = useState(MOCK_HISTORY); // 전체 데이터
  const [filteredList, setFilteredList] = useState(MOCK_HISTORY); // 필터링된 데이터
  
  // 검색 조건
  const [searchParams, setSearchParams] = useState({
    startDate: '2025-01-20',
    endDate: '2025-01-21',
    keyword: '',
    type: 'ALL' // 전체, 입고(IN), 출고(OUT)
  });

  // 요약 정보 (Total)
  const [summary, setSummary] = useState({ totalIn: 0, totalOut: 0 });

  // --- 훅 (Effects) ---
  // 리스트가 바뀔 때마다 상단 요약(Summary) 재계산
  useEffect(() => {
    let tIn = 0;
    let tOut = 0;

    filteredList.forEach(item => {
      if (item.type === 'IN') tIn += item.qty;
      else if (item.type === 'OUT') tOut += item.qty;
      // ADJUST(조정) 등은 제외하거나 별도 처리
    });

    setSummary({ totalIn: tIn, totalOut: tOut });
  }, [filteredList]);

  // --- 핸들러 (Handlers) ---
  // 입력값 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({ ...searchParams, [name]: value });
  };

  // 조회 버튼 클릭 (필터링 로직)
  const handleSearch = () => {
    let result = historyList;

    // 1. 날짜 필터 (문자열 비교로 단순화함)
    if (searchParams.startDate) {
      result = result.filter(item => item.date >= searchParams.startDate);
    }
    if (searchParams.endDate) {
      // endDate는 당일 23:59:59까지 포함해야 하므로 날짜 비교 시 주의 필요 (여기선 단순비교)
      result = result.filter(item => item.date.split(' ')[0] <= searchParams.endDate);
    }

    // 2. 구분(Type) 필터
    if (searchParams.type !== 'ALL') {
      result = result.filter(item => item.type === searchParams.type);
    }

    // 3. 키워드 검색 (품목명, 코드, LOT번호, 담당자 등 통합 검색)
    if (searchParams.keyword) {
      const kw = searchParams.keyword.toLowerCase();
      result = result.filter(item => 
        item.productName.toLowerCase().includes(kw) || 
        item.productCode.toLowerCase().includes(kw) ||
        item.lotNo.toLowerCase().includes(kw) ||
        item.worker.includes(kw)
      );
    }

    setFilteredList(result);
  };

  // 구분 뱃지 렌더링 함수
  const renderTypeBadge = (type, category) => {
    let style = styles.badgeDefault;
    if (type === 'IN') style = styles.badgeIn;
    else if (type === 'OUT') style = styles.badgeOut;
    else if (type === 'ADJUST') style = styles.badgeAdjust;

    return <span style={style}>{category}</span>;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📦 입출고 이력 조회</h2>

      {/* 1. 검색 필터 영역 */}
      <div style={styles.searchBar}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>조회 기간</label>
          <input 
            type="date" name="startDate" 
            value={searchParams.startDate} onChange={handleChange} 
            style={styles.inputDate} 
          />
          <span style={{margin: '0 5px'}}>~</span>
          <input 
            type="date" name="endDate" 
            value={searchParams.endDate} onChange={handleChange} 
            style={styles.inputDate} 
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>구분</label>
          <select name="type" value={searchParams.type} onChange={handleChange} style={styles.select}>
            <option value="ALL">전체</option>
            <option value="IN">입고 (In)</option>
            <option value="OUT">출고 (Out)</option>
            <option value="ADJUST">재고조정</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>통합 검색</label>
          <input 
            type="text" name="keyword" 
            placeholder="품목, LOT, 담당자 검색" 
            value={searchParams.keyword} onChange={handleChange} 
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            style={styles.inputText} 
          />
        </div>

        <button onClick={handleSearch} style={styles.searchBtn}>🔍 조회</button>
        <button style={styles.excelBtn} onClick={() => alert('엑셀 다운로드 기능 구현')}>📥 엑셀</button>
      </div>

      {/* 2. 요약 정보 (Summary Cards) */}
      <div style={styles.summaryContainer}>
        <div style={styles.summaryCard}>
          <span style={styles.summaryLabel}>총 조회 건수</span>
          <span style={styles.summaryValue}>{filteredList.length} 건</span>
        </div>
        <div style={{...styles.summaryCard, borderLeft: '4px solid #10B981'}}>
          <span style={styles.summaryLabel}>총 입고 수량</span>
          <span style={{...styles.summaryValue, color: '#10B981'}}>
            +{summary.totalIn.toLocaleString()}
          </span>
        </div>
        <div style={{...styles.summaryCard, borderLeft: '4px solid #EF4444'}}>
          <span style={styles.summaryLabel}>총 출고 수량</span>
          <span style={{...styles.summaryValue, color: '#EF4444'}}>
            -{summary.totalOut.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 3. 데이터 그리드 (테이블) */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>일자 (시간)</th>
              <th style={styles.th}>구분</th>
              <th style={styles.th}>품목코드</th>
              <th style={styles.th}>품목명</th>
              <th style={styles.th}>LOT No.</th>
              <th style={styles.th}>수량</th>
              <th style={styles.th}>위치 (창고)</th>
              <th style={styles.th}>담당자</th>
              <th style={styles.th}>비고</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan="9" style={styles.emptyTd}>조회된 데이터가 없습니다.</td>
              </tr>
            ) : (
              filteredList.map((item) => (
                <tr key={item.id} style={styles.tr}>
                  <td style={styles.tdCenter}>{item.date}</td>
                  <td style={styles.tdCenter}>
                    {renderTypeBadge(item.type, item.category)}
                  </td>
                  <td style={styles.tdCenter}>{item.productCode}</td>
                  <td style={styles.tdLeft}>
                    <strong>{item.productName}</strong>
                  </td>
                  <td style={styles.tdCenter}>{item.lotNo}</td>
                  <td style={styles.tdRight}>
                    {/* 수량 색상 구분 */}
                    <span style={{
                      color: item.type === 'IN' ? '#10B981' : item.type === 'OUT' ? '#EF4444' : '#333',
                      fontWeight: 'bold'
                    }}>
                      {item.type === 'OUT' ? '-' : item.type === 'IN' ? '+' : ''}
                      {item.qty.toLocaleString()}
                    </span> 
                    <span style={{fontSize: '11px', color: '#888', marginLeft: '2px'}}>{item.unit}</span>
                  </td>
                  <td style={styles.tdCenter}>{item.location}</td>
                  <td style={styles.tdCenter}>{item.worker}</td>
                  <td style={styles.tdLeft}>{item.remark}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- [스타일 정의] ---
const styles = {
  container: { padding: '20px', backgroundColor: '#f5f7fa', minHeight: '100vh', fontFamily: 'sans-serif' },
  title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#333' },

  // 검색바 스타일
  searchBar: { display: 'flex', alignItems: 'flex-end', gap: '15px', backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#555' },
  inputDate: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' },
  select: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '120px' },
  inputText: { padding: '8px', border: '1px solid #ddd', borderRadius: '4px', minWidth: '200px' },
  
  searchBtn: { padding: '9px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' },
  excelBtn: { padding: '9px 20px', backgroundColor: '#217346', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },

  // 요약 카드 스타일
  summaryContainer: { display: 'flex', gap: '20px', marginBottom: '20px' },
  summaryCard: { flex: 1, backgroundColor: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #666' },
  summaryLabel: { fontSize: '13px', color: '#888', marginBottom: '5px' },
  summaryValue: { fontSize: '20px', fontWeight: 'bold', color: '#333' },

  // 테이블 스타일
  tableWrapper: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', whiteSpace: 'nowrap' },
  thRow: { backgroundColor: '#f8f9fa' },
  th: { padding: '12px 15px', borderBottom: '2px solid #dee2e6', textAlign: 'center', color: '#495057', fontWeight: 'bold' },
  tr: { borderBottom: '1px solid #f1f3f5' },
  tdCenter: { padding: '12px 15px', textAlign: 'center', color: '#333' },
  tdLeft: { padding: '12px 15px', textAlign: 'left', color: '#333' },
  tdRight: { padding: '12px 15px', textAlign: 'right', color: '#333' },
  emptyTd: { padding: '50px', textAlign: 'center', color: '#999' },

  // 뱃지 스타일
  badgeDefault: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#eee', color: '#555' },
  badgeIn: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ECFDF5', color: '#10B981' }, // 초록
  badgeOut: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#FEF2F2', color: '#EF4444' }, // 빨강
  badgeAdjust: { padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#FFF7ED', color: '#D97706' }, // 주황
};

export default Test;