import React, { useState } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FiX, FiActivity, FiAlertCircle, FiLayers } from "react-icons/fi";

// --- [Mock Data] 테스트용 더미 데이터 ---

// 1. 시간대별 생산 실적 데이터 (09시 ~ 18시)
const HOURLY_DATA = [
  { time: "09:00", plan: 100, prod: 95 },
  { time: "10:00", plan: 100, prod: 98 },
  { time: "11:00", plan: 100, prod: 102 }, // 초과 달성
  { time: "13:00", plan: 100, prod: 90 }, // 점심 이후 약간 저조
  { time: "14:00", plan: 100, prod: 85 }, // 설비 이슈 발생 가정
  { time: "15:00", plan: 100, prod: 92 },
  { time: "16:00", plan: 100, prod: 98 },
  { time: "17:00", plan: 100, prod: 100 },
];

// 2. 불량 원인 분석 데이터 (배터리 공정 특화)
const DEFECT_DATA = [
  { name: "COS 용접 불량", value: 12 },
  { name: "전압 미달", value: 8 },
  { name: "전해액 누수", value: 5 },
  { name: "스크래치", value: 3 },
  { name: "기타", value: 2 },
];

// 3. 투입 자재(LOT) 이력 데이터
const LOT_LOGS = [
  {
    id: 1,
    time: "09:15",
    lotNo: "P-251217-001",
    material: "Lead Plate A",
    status: "OK",
  },
  {
    id: 2,
    time: "10:30",
    lotNo: "P-251217-002",
    material: "Case Type-B",
    status: "OK",
  },
  {
    id: 3,
    time: "14:10",
    lotNo: "P-251217-003",
    material: "Electrolyte E-1",
    status: "NG",
  }, // 불량 발생
  {
    id: 4,
    time: "16:45",
    lotNo: "P-251217-004",
    material: "Lead Plate A",
    status: "OK",
  },
];

// 차트 색상 배열
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Test({ onClose }) {
  // 탭 상태 관리 (생산로그 / 자재이력)
  const [activeTab, setActiveTab] = useState("chart");

  return (
    <Container>
      {/* 헤더 영역: 닫기 버튼 및 타이틀 */}
      <Header>
        <TitleGroup>
          <h2>2025-12-17 생산 상세 리포트</h2>
          <Badge>12V 중형 배터리</Badge>
        </TitleGroup>
        <CloseBtn onClick={onClose}>
          <FiX size={24} />
        </CloseBtn>
      </Header>

      {/* 요약 카드 영역: 해당 일자의 핵심 지표 재요약 */}
      <SummaryRow>
        <Card>
          <IconBox color="#e0f2fe">
            <FiActivity color="#0284c7" />
          </IconBox>
          <div className="text-box">
            <span>가동률</span>
            <strong>92.5%</strong>
          </div>
        </Card>
        <Card>
          <IconBox color="#fee2e2">
            <FiAlertCircle color="#dc2626" />
          </IconBox>
          <div className="text-box">
            <span>주요 불량</span>
            <strong>COS 용접</strong>
          </div>
        </Card>
        <Card>
          <IconBox color="#dcfce7">
            <FiLayers color="#16a34a" />
          </IconBox>
          <div className="text-box">
            <span>투입 Lot</span>
            <strong>42개</strong>
          </div>
        </Card>
      </SummaryRow>

      {/* 메인 콘텐츠 영역: 차트 및 분석 */}
      <ContentArea>
        {/* 왼쪽: 시간대별 생산 추이 (Bar Chart) */}
        <ChartSection>
          <h3>시간대별 생산 추이 (UPH)</h3>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend iconType="circle" />
                <Bar
                  dataKey="plan"
                  name="계획"
                  fill="#e2e8f0"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="prod"
                  name="실적"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartSection>

        {/* 오른쪽: 불량 원인 분석 (Pie Chart) */}
        <ChartSection>
          <h3>불량 원인 분석</h3>
          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DEFECT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DEFECT_DATA.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartSection>
      </ContentArea>

      {/* 하단 리스트 영역: 상세 이력 테이블 */}
      <BottomSection>
        <h3>주요 자재 투입 이력</h3>
        <Table>
          <thead>
            <tr>
              <th>시간</th>
              <th>LOT 번호</th>
              <th>자재명</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {LOT_LOGS.map((log) => (
              <tr key={log.id}>
                <td>{log.time}</td>
                <td>{log.lotNo}</td>
                <td>{log.material}</td>
                <td>
                  <StatusTag status={log.status}>{log.status}</StatusTag>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </BottomSection>
    </Container>
  );
}

// --- 스타일 컴포넌트 ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background: #f8fafc;
  height: 100%;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
`;

const Badge = styled.span`
  background-color: #dbeafe;
  color: #2563eb;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  &:hover {
    color: #1e293b;
  }
`;

const SummaryRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const Card = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;

  .text-box {
    display: flex;
    flex-direction: column;
    span {
      font-size: 13px;
      color: #64748b;
    }
    strong {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
    }
  }
`;

const IconBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.color};
  font-size: 20px;
`;

const ContentArea = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  min-height: 300px;
`;

const ChartSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 20px;
  }
`;

const ChartWrapper = styled.div`
  flex: 1;
  min-height: 250px;
`;

const BottomSection = styled.div`
  background: white;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h3 {
    font-size: 16px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 16px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th {
    text-align: left;
    padding: 12px;
    color: #64748b;
    font-weight: 500;
    border-bottom: 1px solid #e2e8f0;
  }

  td {
    padding: 12px;
    color: #334155;
    border-bottom: 1px solid #f1f5f9;
  }
`;

const StatusTag = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${(props) =>
    props.status === "OK" ? "#dcfce7" : "#fee2e2"};
  color: ${(props) => (props.status === "OK" ? "#16a34a" : "#dc2626")};
`;
