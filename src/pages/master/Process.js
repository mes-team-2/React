import styled from "styled-components";
import { useEffect, useState } from "react";
import SummaryCard from "../../components/SummaryCard";
import { Layers, Zap, Droplets, Activity, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* =========================
   공정 정의
========================= */
const processSteps = [
  {
    title: "극판 적층",
    desc: "극판과 격리판 적층",
    icon: <Layers />,
    color: "#6366f1",
    data: "적층 수량 / 자재 LOT",
  },
  {
    title: "COS 용접",
    desc: "납 스트랩 용접",
    icon: <Zap />,
    color: "#f59e0b",
    data: "용접 온도 / 시간",
  },
  {
    title: "전해액 · 화성",
    desc: "충전 및 활성화",
    icon: <Droplets />,
    color: "#22c55e",
    data: "전압 / 전류 / 온도",
  },
  {
    title: "성능 검사",
    desc: "최종 검사",
    icon: <Activity />,
    color: "#ef4444",
    data: "OCV / OK·NG",
  },
];

/* =========================
   Component
========================= */
export default function Process() {
  /* ===== 실시간 전압 그래프 ===== */
  const [voltageData, setVoltageData] = useState([{ time: 0, voltage: 10.8 }]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVoltageData((prev) => {
        if (prev.length > 30) return prev;
        const nextVoltage =
          prev[prev.length - 1].voltage + Math.random() * 0.05;
        return [
          ...prev,
          {
            time: prev.length,
            voltage: Number(nextVoltage.toFixed(2)),
          },
        ];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Wrapper>
      <Header>
        <h2>배터리 핵심 공정 모니터링</h2>
        <span>자동차 배터리 MES</span>
      </Header>

      {/* ===== 공정 단계 ===== */}
      <SummaryGrid>
        {processSteps.map((p, i) => (
          <SummaryCard
            key={i}
            icon={p.icon}
            label={p.title}
            value={p.desc}
            color={p.color}
          />
        ))}
      </SummaryGrid>

      {/* ===== 실시간 화성 그래프 ===== */}
      <Card>
        <CardTitle>화성 공정 실시간 전압</CardTitle>
        <ChartBox>
          <ResponsiveContainer>
            <LineChart data={voltageData}>
              <XAxis dataKey="time" />
              <YAxis domain={[10.5, 13]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="voltage"
                stroke="#22c55e"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>
        <Hint>※ C# 설비 시뮬레이터에서 1초 단위 데이터 수신</Hint>
      </Card>

      {/* ===== 자재 소모 ===== */}
      <Card>
        <CardTitle>BOM 기반 자재 소모 현황</CardTitle>
        <MaterialGrid>
          <Material>
            <strong>극판 (+)</strong>
            <span>-24 EA</span>
          </Material>
          <Material>
            <strong>극판 (-)</strong>
            <span>-24 EA</span>
          </Material>
          <Material>
            <strong>격리판</strong>
            <span>-24 EA</span>
          </Material>
          <Material>
            <strong>황산</strong>
            <span>-3.2 L</span>
          </Material>
        </MaterialGrid>
      </Card>

      {/* ===== 불량 단축 조회 ===== */}
      <Card>
        <CardTitle>
          <AlertTriangle size={16} /> 불량 유형 빠른 조회
        </CardTitle>
        <DefectShortcuts>
          <button>전압 미달 (F1)</button>
          <button>누액 발생 (F2)</button>
          <button>내압 불량 (F3)</button>
          <button>용접 불량 (F4)</button>
        </DefectShortcuts>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 22px;
`;

const Header = styled.div`
  h2 {
    font-size: 22px;
    font-weight: 700;
  }

  span {
    font-size: 12px;
    opacity: 0.6;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.04);
`;

const CardTitle = styled.h4`
  font-size: 14px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ChartBox = styled.div`
  height: 260px;
`;

const Hint = styled.div`
  font-size: 12px;
  opacity: 0.6;
  margin-top: 6px;
`;

const MaterialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
`;

const Material = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 14px;

  strong {
    display: block;
    font-size: 13px;
  }

  span {
    margin-top: 6px;
    display: block;
    color: #ef4444;
    font-weight: 600;
  }
`;

const DefectShortcuts = styled.div`
  display: flex;
  gap: 10px;

  button {
    padding: 8px 14px;
    border-radius: 20px;
    border: none;
    font-size: 12px;
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
    cursor: pointer;
  }
`;
