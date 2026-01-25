import React from 'react';
import styled from 'styled-components';
import SearchDate from '../components/SearchDate'; // 경로에 맞게 수정해주세요

const Test = () => {
  return (
    <PageContainer>
      <Title>SearchDate 컴포넌트 테스트</Title>

      {/* 1. S 사이즈 테스트 */}
      <Section>
        <Label>1. Small Size (width="s")</Label>
        <SearchDate width="s" />
      </Section>

      {/* 2. M 사이즈 테스트 */}
      <Section>
        <Label>2. Medium Size (width="m")</Label>
        <SearchDate width="m" />
      </Section>

      {/* 3. L 사이즈 테스트 */}
      <Section>
        <Label>3. Large Size (width="l")</Label>
        <SearchDate width="l" />
      </Section>

      {/* 4. 커스텀 너비 테스트 */}
      <Section>
        <Label>4. Custom Width (width="100%")</Label>
        <div style={{ width: '800px', border: '1px dashed #ddd', padding: '10px' }}>
          <SearchDate width="100%" />
        </div>
      </Section>

    </PageContainer>
  );
};

export default Test;

/* =========================
   스타일 컴포넌트
========================= */
const PageContainer = styled.div`
  padding: 40px;
  background-color: #f5f5f5; /* 배경색을 넣어 컴포넌트가 잘 보이게 함 */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: transparent;
`;

const Label = styled.h3`
  font-size: 16px;
  color: #666;
  font-weight: 600;
`;