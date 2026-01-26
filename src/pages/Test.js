import React from 'react';
import styled from 'styled-components';
import Button from '../components/Button'; // 경로 확인 필요

const Test = () => {
  return (
    <PageContainer>
      <Title>Button Component Test</Title>

      {/* 1. 크기별 테스트 */}
      <Section>
        <h3>1. Size Variants</h3>
        <Row>
          <Button size="s">Small (30px)</Button>
          <Button size="m">Medium (40px)</Button>
          <Button size="l">Large (50px)</Button>
        </Row>
      </Section>

      {/* 2. 종류별 테스트 */}
      <Section>
        <h3>2. Color Variants</h3>
        <Row>
          <Button variant="ok">저장 (Primary)</Button>
          <Button variant="cancel">취소 (Secondary)</Button>
          <Button variant="success">완료 (Success)</Button>
          <Button variant="error">삭제 (Danger)</Button>
        </Row>
      </Section>

      {/* 3. 너비 및 비활성화 테스트 */}
      <Section>
        <h3>3. Full Width & Disabled</h3>
        <Row>
          <Button width="100%" variant="ok">꽉 찬 버튼 (width=100%)</Button>
        </Row>
        <Row>
          <Button disabled>비활성화 버튼</Button>
        </Row>
      </Section>

    </PageContainer>
  );
};

export default Test;

/* 스타일 */
const PageContainer = styled.div`
  padding: 40px;
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #333;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Row = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;