import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiBox, FiClock, FiActivity } from "react-icons/fi";
import Button from "../components/Button";

export default function Test() {
  // URL에서 :lotId 파라미터 추출 (예: LOT-20260204-A01)
  const { lotId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // 데이터 조회 시뮬레이션 (실제로는 API 호출)
  useEffect(() => {
    // 0.5초 뒤에 데이터를 불러온 척 함
    setTimeout(() => {
      setData({
        lotNo: lotId,
        productName: "12V 중형 배터리 (Standard)",
        productCode: "BAT-12V-65AH",
        qty: 1000,
        status: "PROCESS", // PROCESS, WAIT, DONE
        startDate: "2026-02-04 09:00",
        manager: "김하린",
      });
      setLoading(false);
    }, 500);
  }, [lotId]);

  if (loading) {
    return (
      <MobileWrapper>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </MobileWrapper>
    );
  }

  return (
    <MobileWrapper>
      <Header>
        <h3>작업지시 상세 정보</h3>
        <p>모바일 스캔 확인용 페이지</p>
      </Header>

      <Card>
        <StatusBadge $status={data.status}>
          <FiCheckCircle /> 생산 진행중
        </StatusBadge>

        <TitleSection>
          <Label>LOT NO</Label>
          <LotNumber>{data.lotNo}</LotNumber>
        </TitleSection>

        <Divider />

        <InfoGrid>
          <InfoItem>
            <Label>
              <FiBox /> 제품명
            </Label>
            <Value>{data.productName}</Value>
            <SubValue>{data.productCode}</SubValue>
          </InfoItem>

          <InfoItem>
            <Label>
              <FiActivity /> 지시 수량
            </Label>
            <Value>{data.qty.toLocaleString()} EA</Value>
          </InfoItem>

          <InfoItem>
            <Label>
              <FiClock /> 작업 시작일
            </Label>
            <Value>{data.startDate}</Value>
          </InfoItem>

          <InfoItem>
            <Label>담당자</Label>
            <Value>{data.manager}</Value>
          </InfoItem>
        </InfoGrid>
      </Card>

      <ActionArea>
        <Button
          variant="ok"
          size="l"
          style={{ width: "100%" }}
          onClick={() => alert("작업 시작 처리됨")}
        >
          작업 시작
        </Button>
        <Button
          variant="cancel"
          size="l"
          style={{ width: "100%" }}
          onClick={() => navigate(-1)}
        >
          뒤로 가기
        </Button>
      </ActionArea>
    </MobileWrapper>
  );
}

/* --- 모바일 최적화 스타일 --- */
const MobileWrapper = styled.div`
  max-width: 480px; /* 모바일 너비 제한 */
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f5f6f8;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`;

const Header = styled.div`
  margin-bottom: 20px;
  text-align: center;
  h3 {
    font-size: 20px;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
  }
  p {
    font-size: 13px;
    color: #888;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 25px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
`;

const StatusBadge = styled.div`
  align-self: center;
  background-color: #e0f2fe;
  color: #0284c7;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
`;

const TitleSection = styled.div`
  text-align: center;
`;

const LotNumber = styled.div`
  font-size: 24px;
  font-weight: 800;
  color: #333;
  word-break: break-all;
  margin-top: 4px;
`;

const Divider = styled.div`
  height: 1px;
  background-color: #eee;
  margin: 5px 0;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.div`
  font-size: 12px;
  color: #888;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Value = styled.div`
  font-size: 16px;
  color: #333;
  font-weight: 500;
`;

const SubValue = styled.span`
  font-size: 13px;
  color: #999;
`;

const ActionArea = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 16px;
  color: #666;
`;
