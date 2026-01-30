import React, { useState } from "react";
import styled from "styled-components";
import Pagination from "../components/Pagination";

const Test = () => {
  // 1. 현재 페이지 상태 관리
  const [currentPage, setCurrentPage] = useState(1);

  // 2. 테스트용 설정 (총 페이지 수 10개 가정)
  const totalPages = 15;

  // 3. 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
    console.log(`페이지가 ${page}로 변경되었습니다.`);
  };

  return (
    <Container>
      <Title>Pagination Component Test</Title>

      <ContentBox>
        <StatusText>
          현재 보고 있는 페이지: <strong>{currentPage}</strong> / {totalPages}
        </StatusText>

        {/* 페이지 변경에 따른 가상의 데이터 영역 */}
        <MockDataBox>
          <p>데이터 리스트 내용 (Page {currentPage})</p>
          <ul>
            <li>Item {(currentPage - 1) * 10 + 1}</li>
            <li>Item {(currentPage - 1) * 10 + 2}</li>
            <li>Item {(currentPage - 1) * 10 + 3}</li>
            <li>...</li>
          </ul>
        </MockDataBox>
      </ContentBox>

      {/* 페이지네이션 컴포넌트 적용 */}
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </Container>
  );
};

export default Test;

/* ===== Test Styles ===== */
const Container = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  background-color: #f8f9fa;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
`;

const ContentBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatusText = styled.div`
  font-size: 18px;
  margin-bottom: 20px;
  color: var(--font);
  
  strong {
    color: var(--main);
    font-size: 22px;
  }
`;

const MockDataBox = styled.div`
  width: 100%;
  border: 1px dashed #ccc;
  padding: 20px;
  border-radius: 4px;
  background-color: #fafafa;
  
  ul {
    margin-top: 10px;
    padding-left: 20px;
    list-style: disc;
  }
  
  li {
    margin-bottom: 5px;
    color: #555;
  }
`;