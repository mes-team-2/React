import React, { useState, useEffect } from 'react';

// [MOCK 데이터 정의]
// 실제 DB의 MATERIAL_HISTORY 테이블과 연동되는 데이터 구조임
// type: 'IN' (입고), 'OUT' (출고), 'ADJ' (재고조정) 등으로 구분됨
const MOCK_HISTORY = [
  { id: 1, date: '2025-01-15 10:30:00', materialName: '납 (Lead)', type: 'IN', qty: 500, worker: '김철수', location: 'A-01 창고' },
  { id: 2, date: '2025-01-15 14:20:00', materialName: '황산 (Sulfuric Acid)', type: 'IN', qty: 200, worker: '박영희', location: 'B-02 탱크' },
  { id: 3, date: '2025-01-16 09:00:00', materialName: '납 (Lead)', type: 'OUT', qty: 100, worker: '시스템', location: '생산라인 1' },
  { id: 4, date: '2025-01-16 11:45:00', materialName: '배터리 케이스', type: 'IN', qty: 1000, worker: '이민수', location: 'C-01 창고' },
  { id: 5, date: '2025-01-17 15:10:00', materialName: '황산 (Sulfuric Acid)', type: 'OUT', qty: 50, worker: '시스템', location: '생산라인 2' },
];

const Test = () => {
  // --- [상태 관리 (State)] ---

  // 필드: 화면에 표시될 이력 리스트
  const [historyList, setHistoryList] = useState([]);

  // 필드: 검색 조건을 관리하는 객체 (시작일, 종료일, 구분, 검색어)
  const [filters, setFilters] = useState({
    startDate: '2025-01-01', // 기본값: 월초
    endDate: '2025-01-31',   // 기본값: 월말
    type: 'ALL',             // 'ALL', 'IN', 'OUT'
    keyword: ''              // 자재명 검색
  });

  // --- [라이프사이클 (Effect)] ---

  // 메소드: 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    fetchHistory();
  }, []);

  // --- [이벤트 핸들러 (Logic)] ---

  // 메소드: 필터 입력값 변경 시 상태 업데이트
  // 매개변수: e (Input 이벤트 객체)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // 메소드: 조회 버튼 클릭 또는 초기 로딩 시 데이터 조회
  // 역할: 날짜, 타입, 검색어 조건에 맞는 데이터를 필터링하여 가져옴
  const fetchHistory = () => {
    // 실제 API 호출: axios.get('/api/material/history', { params: filters })
    
    // 여기서는 MOCK_HISTORY를 필터링하는 로직으로 대체함
    const filtered = MOCK_HISTORY.filter(item => {
      // 1. 날짜 범위 체크 (문자열 비교)
      const dateOnly = item.date.split(' ')[0]; // '2025-01-15' 형태 추출
      const isDateInRange = dateOnly >= filters.startDate && dateOnly <= filters.endDate;
      
      // 2. 입출고 타입 체크 ('ALL'이면 통과, 아니면 일치여부 확인)
      const isTypeMatch = filters.type === 'ALL' || item.type === filters.type;

      // 3. 자재명 검색어 체크
      const isKeywordMatch = item.materialName.includes(filters.keyword);

      return isDateInRange && isTypeMatch && isKeywordMatch;
    });

    setHistoryList(filtered);
  };

  // --- [UI 렌더링 헬퍼] ---

  // 메소드: 입/출고 타입에 따라 뱃지(Badge) 스타일과 텍스트를 반환함
  // 역할: 사용자가 시각적으로 입고인지 출고인지 빠르게 파악하게 도움
  const getTypeBadge = (type) => {
    if (type === 'IN') return <span style={styles.badgeIn}>입고</span>;
    if (type === 'OUT') return <span style={styles.badgeOut}>출고</span>;
    return <span style={styles.badgeEtc}>{type}</span>;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>자재 입출고 이력 조회</h2>

      {/* 1. 검색 필터 영역 */}
      <div style={styles.filterContainer}>
        {/* 날짜 검색 */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>조회 기간</label>
          <input 
            type="date" 
            name="startDate" 
            value={filters.startDate} 
            onChange={handleFilterChange} 
            style={styles.dateInput} 
          />
          <span style={{ margin: '0 8px' }}>~</span>
          <input 
            type="date" 
            name="endDate" 
            value={filters.endDate} 
            onChange={handleFilterChange} 
            style={styles.dateInput} 
          />
        </div>

        {/* 구분 (입고/출고) */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>구분</label>
          <select 
            name="type" 
            value={filters.type} 
            onChange={handleFilterChange} 
            style={styles.select}
          >
            <option value="ALL">전체</option>
            <option value="IN">입고</option>
            <option value="OUT">출고</option>
          </select>
        </div>

        {/* 자재명 검색 */}
        <div style={styles.filterGroup}>
          <label style={styles.label}>자재명</label>
          <input 
            type="text" 
            name="keyword" 
            value={filters.keyword} 
            onChange={handleFilterChange} 
            placeholder="자재명 입력" 
            style={styles.textInput} 
          />
        </div>

        <button onClick={fetchHistory} style={styles.searchButton}>조회</button>
      </div>

      {/* 2. 리스트 영역 */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>No</th>
              <th style={styles.th}>일시</th>
              <th style={styles.th}>구분</th>
              <th style={styles.th}>자재명</th>
              <th style={styles.th}>수량</th>
              <th style={styles.th}>담당자/시스템</th>
              <th style={styles.th}>위치/공정</th>
            </tr>
          </thead>
          <tbody>
            {historyList.length === 0 ? (
              <tr><td colSpan="7" style={styles.emptyTd}>이력 데이터가 없습니다.</td></tr>
            ) : (
              historyList.map((item, index) => (
                <tr key={item.id} style={index % 2 === 0 ? styles.trEven : styles.trOdd}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{item.date}</td>
                  <td style={styles.td}>{getTypeBadge(item.type)}</td>
                  <td style={styles.tdLeft}>{item.materialName}</td>
                  {/* 수량은 숫자가 중요하므로 우측 정렬 및 강조 */}
                  <td style={styles.tdQty}>
                    {item.type === 'OUT' ? '-' : '+'}{item.qty.toLocaleString()}
                  </td>
                  <td style={styles.td}>{item.worker}</td>
                  <td style={styles.td}>{item.location}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- [스타일 객체] ---
const styles = {
  container: { padding: '20px', backgroundColor: '#f4f6f8', minHeight: '100vh' },
  title: { fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#333' },
  
  // 필터 영역
  filterContainer: { 
    display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', 
    backgroundColor: '#fff', padding: '20px', borderRadius: '8px', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '20px' 
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  label: { fontWeight: '600', fontSize: '14px', color: '#555' },
  dateInput: { padding: '6px', border: '1px solid #ddd', borderRadius: '4px' },
  select: { padding: '6px', border: '1px solid #ddd', borderRadius: '4px', width: '100px' },
  textInput: { padding: '6px', border: '1px solid #ddd', borderRadius: '4px', width: '150px' },
  searchButton: { 
    padding: '6px 20px', backgroundColor: '#4a90e2', color: '#fff', border: 'none', 
    borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' 
  },

  // 테이블 영역
  tableWrapper: { backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  thRow: { backgroundColor: '#f0f2f5', borderBottom: '2px solid #e1e4e8' },
  th: { padding: '12px', textAlign: 'center', color: '#333', fontWeight: 'bold' },
  trEven: { backgroundColor: '#fff' },
  trOdd: { backgroundColor: '#fafbfc' },
  td: { padding: '12px', borderBottom: '1px solid #eee', textAlign: 'center', color: '#555' },
  tdLeft: { padding: '12px', borderBottom: '1px solid #eee', textAlign: 'left', color: '#555' },
  tdQty: { padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold', color: '#333', paddingRight: '30px' },
  emptyTd: { padding: '50px', textAlign: 'center', color: '#999' },

  // 뱃지 스타일 (입고=파랑/녹색 계열, 출고=빨강/주황 계열)
  badgeIn: { backgroundColor: '#e3f2fd', color: '#1976d2', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  badgeOut: { backgroundColor: '#fbe9e7', color: '#d84315', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  badgeEtc: { backgroundColor: '#eee', color: '#555', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' },
};

export default Test;