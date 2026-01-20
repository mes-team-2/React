import React, { useState, useEffect } from 'react';

// [MOCK 데이터 1: 자재 기초 정보 (이게 있어야 BOM을 짬)]
const MOCK_MATERIALS = [
  { id: 101, code: 'MAT-PB', name: '납 (Lead)', unit: 'KG' },
  { id: 102, code: 'MAT-ACID', name: '황산 (Sulfuric Acid)', unit: 'L' },
  { id: 103, code: 'MAT-CASE-80', name: '배터리 케이스 (80Ah용)', unit: 'EA' },
  { id: 104, code: 'MAT-SEP', name: '격리판 (Separator)', unit: 'EA' },
  { id: 105, code: 'MAT-TERM', name: '단자 (Terminal)', unit: 'EA' },
];

// [MOCK 데이터 2: 제품 목록 (BOM 포함)]
const MOCK_PRODUCTS = [
  { 
    id: 1, code: 'BAT-12V-80A', name: 'GB80L (표준형 80Ah)', model: 'GB80L', spec: '12V 80Ah', unit: 'EA', remark: '현대/기아 납품용',
    // 이미 등록된 BOM 예시
    bom: [
      { materialId: 101, name: '납 (Lead)', reqQty: 10 },
      { materialId: 102, name: '황산 (Sulfuric Acid)', reqQty: 5 },
      { materialId: 103, name: '배터리 케이스 (80Ah용)', reqQty: 1 },
    ]
  },
  { 
    id: 2, code: 'BAT-12V-70A', name: 'AGM70 (고성능 70Ah)', model: 'AGM70', spec: '12V 70Ah', unit: 'EA', remark: 'ISG 차량용',
    bom: []
  },
];

/**
 * [자식 컴포넌트] 제품 및 BOM 등록 모달
 */
const ProductFormModal = ({ isOpen, onClose, onSave, initialData, isEditMode }) => {
  // 1. 제품 기본 정보 State
  const [formData, setFormData] = useState({
    code: '', name: '', model: '', spec: '', unit: 'EA', remark: ''
  });

  // 2. BOM 정보 State (자재 목록)
  const [bomList, setBomList] = useState([]);

  // 3. BOM 입력용 임시 State
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [inputQty, setInputQty] = useState(0);

  // 초기화 (모달 열릴 때)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setBomList(initialData.bom || []); // 기존 BOM이 있으면 불러옴
    } else {
      setFormData({ code: '', name: '', model: '', spec: '', unit: 'EA', remark: '' });
      setBomList([]);
    }
    // BOM 입력창 초기화
    setSelectedMaterialId('');
    setInputQty(0);
  }, [initialData, isOpen]);

  // 핸들러: 기본 정보 입력
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 핸들러: BOM 추가 버튼 클릭
  const handleAddBom = () => {
    if (!selectedMaterialId || inputQty <= 0) {
      alert("자재를 선택하고 소요량을 0보다 크게 입력해주세요.");
      return;
    }

    // 이미 등록된 자재인지 체크
    if (bomList.some(item => item.materialId === parseInt(selectedMaterialId))) {
      alert("이미 BOM에 등록된 자재입니다.");
      return;
    }

    const materialInfo = MOCK_MATERIALS.find(m => m.id === parseInt(selectedMaterialId));
    
    const newBomItem = {
      materialId: materialInfo.id,
      name: materialInfo.name,
      reqQty: parseFloat(inputQty)
    };

    setBomList([...bomList, newBomItem]);
    
    // 입력창 초기화
    setSelectedMaterialId('');
    setInputQty(0);
  };

  // 핸들러: BOM 삭제 버튼 클릭
  const handleRemoveBom = (materialId) => {
    setBomList(bomList.filter(item => item.materialId !== materialId));
  };

  // 핸들러: 최종 저장
  const handleSubmit = () => {
    if (!formData.code || !formData.name) {
      alert("제품 코드와 제품명은 필수입니다.");
      return;
    }
    // BOM 정보까지 합쳐서 부모에게 전달
    onSave({ ...formData, bom: bomList });
  };

  if (!isOpen) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3>{isEditMode ? '제품 및 BOM 수정' : '신규 제품 등록'}</h3>
          <button style={styles.closeBtn} onClick={onClose}>X</button>
        </div>

        <div style={styles.modalBody}>
          {/* --- 섹션 1: 제품 기본 정보 --- */}
          <h4 style={styles.sectionTitle}>1. 제품 기본 정보</h4>
          <div style={styles.gridRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>제품 코드 <span style={styles.required}>*</span></label>
              <input 
                type="text" name="code" value={formData.code} onChange={handleChange} 
                style={styles.input} placeholder="BAT-001" readOnly={isEditMode} 
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>제품명 <span style={styles.required}>*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} placeholder="GB80L" />
            </div>
          </div>

          <div style={styles.gridRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>모델/규격</label>
              <input type="text" name="spec" value={formData.spec} onChange={handleChange} style={styles.input} placeholder="12V 80Ah" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>단위</label>
              <select name="unit" value={formData.unit} onChange={handleChange} style={styles.select}>
                <option value="EA">EA</option>
                <option value="SET">SET</option>
              </select>
            </div>
          </div>

          <hr style={styles.divider} />

          {/* --- 섹션 2: BOM 관리 (핵심 추가 부분) --- */}
          <h4 style={styles.sectionTitle}>2. BOM (자재 소요량) 등록</h4>
          
          {/* BOM 입력 행 */}
          <div style={styles.bomInputRow}>
            <select 
              value={selectedMaterialId} 
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              style={styles.bomSelect}
            >
              <option value="">-- 자재 선택 --</option>
              {MOCK_MATERIALS.map(mat => (
                <option key={mat.id} value={mat.id}>
                  [{mat.code}] {mat.name} ({mat.unit})
                </option>
              ))}
            </select>
            <input 
              type="number" 
              placeholder="소요량" 
              value={inputQty} 
              onChange={(e) => setInputQty(e.target.value)}
              style={styles.bomInput}
            />
            <button onClick={handleAddBom} style={styles.addBtnSmall}>+ 추가</button>
          </div>

          {/* BOM 리스트 테이블 */}
          <div style={styles.bomTableWrapper}>
            <table style={styles.bomTable}>
              <thead>
                <tr>
                  <th>자재명</th>
                  <th>소요량</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {bomList.length === 0 ? (
                  <tr><td colSpan="3" style={{textAlign:'center', padding:'10px', color:'#999'}}>등록된 자재가 없습니다.</td></tr>
                ) : (
                  bomList.map((bom, idx) => (
                    <tr key={idx}>
                      <td>{bom.name}</td>
                      <td style={{textAlign:'center'}}>{bom.reqQty}</td>
                      <td style={{textAlign:'center'}}>
                        <button onClick={() => handleRemoveBom(bom.materialId)} style={styles.delBtnSmall}>삭제</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>취소</button>
          <button style={styles.saveBtn} onClick={handleSubmit}>저장</button>
        </div>
      </div>
    </div>
  );
};

/**
 * [메인 컴포넌트]
 */
const Test = () => {
  const [productList, setProductList] = useState(MOCK_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // 핸들러 로직은 이전과 동일
  const handleOpenAdd = () => { setCurrentProduct(null); setIsModalOpen(true); };
  const handleOpenEdit = (product) => { setCurrentProduct(product); setIsModalOpen(true); };
  
  const handleSaveData = (formData) => {
    if (currentProduct) {
      setProductList(prev => prev.map(item => item.id === currentProduct.id ? { ...formData, id: item.id } : item));
    } else {
      const newId = productList.length > 0 ? Math.max(...productList.map(p => p.id)) + 1 : 1;
      setProductList([{ ...formData, id: newId }, ...productList]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("삭제하시겠습니까?")) setProductList(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>제품 및 BOM 관리</h2>
      <div style={styles.toolbar}>
        <button onClick={handleOpenAdd} style={styles.addBtn}>+ 신규 제품 등록</button>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thRow}>
              <th style={styles.th}>제품코드</th>
              <th style={styles.th}>제품명</th>
              <th style={styles.th}>규격</th>
              <th style={styles.th}>BOM 수</th>
              <th style={styles.th}>관리</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.tdCode}>{item.code}</td>
                <td style={styles.tdLeft}>{item.name}</td>
                <td style={styles.td}>{item.spec}</td>
                <td style={styles.td}>{item.bom ? item.bom.length : 0} 종</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleOpenEdit(item)}>수정/BOM</button>
                  <button style={styles.delBtn} onClick={() => handleDelete(item.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveData}
        initialData={currentProduct}
        isEditMode={!!currentProduct}
      />
    </div>
  );
};

// --- [스타일 객체] ---
const styles = {
  container: { padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh', fontFamily: 'sans-serif' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#333' },
  toolbar: { marginBottom: '15px', textAlign: 'right' },
  addBtn: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  
  tableWrapper: { backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '14px' },
  thRow: { backgroundColor: '#e9ecef' },
  th: { padding: '12px', borderBottom: '2px solid #dee2e6', textAlign: 'center', color: '#495057' },
  tr: { borderBottom: '1px solid #f1f3f5' },
  td: { padding: '12px', textAlign: 'center', color: '#212529' },
  tdCode: { padding: '12px', textAlign: 'center', color: '#007bff', fontWeight: 'bold' },
  tdLeft: { padding: '12px', textAlign: 'left', color: '#212529' },
  editBtn: { padding: '5px 10px', marginRight: '5px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  delBtn: { padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' },

  // 모달 스타일
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', borderRadius: '8px', width: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
  modalHeader: { padding: '15px 20px', backgroundColor: '#343a40', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  modalBody: { padding: '20px' },
  modalFooter: { padding: '15px 20px', borderTop: '1px solid #eee', textAlign: 'right', backgroundColor: '#f8f9fa' },
  
  sectionTitle: { fontSize: '15px', fontWeight: 'bold', color: '#007bff', marginTop: '0', marginBottom: '10px' },
  divider: { border: 'none', borderTop: '1px dashed #ccc', margin: '20px 0' },
  gridRow: { display: 'flex', gap: '15px', marginBottom: '10px' },
  formGroup: { flex: 1 },
  label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#555' },
  required: { color: 'red', marginLeft: '3px' },
  input: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
  select: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' },
  saveBtn: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },

  // BOM 관련 스타일
  bomInputRow: { display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' },
  bomSelect: { flex: 2, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' },
  bomInput: { flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '4px' },
  addBtnSmall: { padding: '8px 15px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  bomTableWrapper: { border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' },
  bomTable: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  delBtnSmall: { padding: '2px 8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '11px' },
};

export default Test;