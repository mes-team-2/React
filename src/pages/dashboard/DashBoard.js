// src/pages/mes/Dashboard.js
import styled from "styled-components";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ===== react-icons ===== */
import {
  FaClock,
  FaCloudSun,
  FaTemperatureHigh,
  FaTint,
  FaChartBar,
  FaIndustry,
  FaExclamationTriangle,
  FaTools,
  FaUserCheck,
  FaUserCog,
  FaUserClock,
  FaTachometerAlt,
} from "react-icons/fa";

import SummaryCard from "../../components/SummaryCard";
import Status from "../../components/Status";

/* =========================
   MOCK DATA
========================= */

// 현재 시각
const getNowTime = () =>
  new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

// 🔥 시간별 계획 vs 실적 (핵심 차트)
const PROD_TREND = [
  { time: "08:00", plan: 120, actual: 110 },
  { time: "09:00", plan: 120, actual: 115 },
  { time: "10:00", plan: 120, actual: 105 },
  { time: "11:00", plan: 120, actual: 118 },
  { time: "12:00", plan: 120, actual: 95 },
  { time: "13:00", plan: 120, actual: 108 },
];

// 수율 / 불량률
const YIELD_CHART = [
  { name: "양품", value: 96.2 },
  { name: "불량", value: 3.8 },
];

// 설비 환경 (SensorLog 기반)
const MACHINE_ENV = [
  {
    machine: "전극공정-01",
    temperature: 32.5,
    humidity: 68,
    voltage: 12.1,
    status: "NORMAL",
  },
  {
    machine: "조립공정-02",
    temperature: 41.2,
    humidity: 75,
    voltage: 11.4,
    status: "WARNING",
  },
  {
    machine: "활성화공정-01",
    temperature: 55.8,
    humidity: 82,
    voltage: 10.8,
    status: "ERROR",
  },
];

// 작업자 정보
const WORKER_INFO = {
  total: 18,
  working: 14,
  standby: 4,
};

// 공정 효율
const PROCESS_EFF = {
  uph: 120,
  defectRate: 3.8,
  materialUsage: 52,
};

export default function Dashboard() {
  const [time, setTime] = useState(getNowTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getNowTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Wrapper>
      {/* ================= 상단 글로벌 ================= */}
      <Section>
        <Grid cols={4}>
          <SummaryCard label="현재 시각" value={time} icon={<FaClock />} />
          <SummaryCard label="외부 날씨" value="맑음" icon={<FaCloudSun />} />
          <SummaryCard
            label="평균 온도"
            value="38.2 ℃"
            icon={<FaTemperatureHigh />}
          />
          <SummaryCard label="평균 습도" value="71 %" icon={<FaTint />} />
        </Grid>
      </Section>

      {/* ================= 생산 정보 (핵심) ================= */}
      <Section>
        <SectionTitle>
          <FaChartBar /> 생산 정보
        </SectionTitle>

        <ChartGrid>
          {/* 시간별 계획 vs 실적 */}
          <ChartCard>
            <ChartTitle>
              <FaIndustry /> 시간별 계획 대비 생산량
            </ChartTitle>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={PROD_TREND}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar dataKey="actual" name="실적" fill="#004DFC" barSize={22} />

                <Line
                  type="monotone"
                  dataKey="plan"
                  name="계획"
                  stroke="#FF9F0A"
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 수율 / 불량률 */}
          <ChartCard>
            <ChartTitle>
              <FaExclamationTriangle /> 수율 / 불량률
            </ChartTitle>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={YIELD_CHART}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                >
                  <Cell fill="#004DFC" />
                  <Cell fill="#FF5B5B" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartGrid>
      </Section>

      {/* ================= 설비 환경 ================= */}
      <Section>
        <SectionTitle>
          <FaTools /> 설비별 환경 정보
        </SectionTitle>

        <Grid cols={3}>
          {MACHINE_ENV.map((m) => (
            <Card key={m.machine}>
              <CardHeader>
                <strong>{m.machine}</strong>
                <Status value={m.status} />
              </CardHeader>

              <EnvRow>
                <span>온도</span>
                <span>{m.temperature} ℃</span>
              </EnvRow>
              <EnvRow>
                <span>습도</span>
                <span>{m.humidity} %</span>
              </EnvRow>
              <EnvRow>
                <span>전압</span>
                <span>{m.voltage} V</span>
              </EnvRow>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* ================= 작업자 ================= */}
      <Section>
        <SectionTitle>
          <FaUserCheck /> 작업자 현황
        </SectionTitle>

        <Grid cols={3}>
          <SummaryCard
            label="출근 인원"
            value={`${WORKER_INFO.total} 명`}
            icon={<FaUserCheck />}
          />
          <SummaryCard
            label="작업 중"
            value={`${WORKER_INFO.working} 명`}
            icon={<FaUserCog />}
          />
          <SummaryCard
            label="대기 인원"
            value={`${WORKER_INFO.standby} 명`}
            icon={<FaUserClock />}
          />
        </Grid>
      </Section>

      {/* ================= 공정 효율 ================= */}
      <Section>
        <SectionTitle>
          <FaTachometerAlt /> 공정 효율
        </SectionTitle>

        <Grid cols={3}>
          <SummaryCard
            label="시간당 생산량 (UPH)"
            value={PROCESS_EFF.uph}
            icon={<FaTachometerAlt />}
          />
          <SummaryCard
            label="불량률"
            value={`${PROCESS_EFF.defectRate} %`}
            icon={<FaExclamationTriangle />}
          />
          <SummaryCard
            label="자재 소모량 (5분)"
            value={`${PROCESS_EFF.materialUsage} EA`}
            icon={<FaIndustry />}
          />
        </Grid>
      </Section>
    </Wrapper>
  );
}

/* =========================
   Layout Styles
========================= */

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 800;
  margin: 0;

  svg {
    color: #004dfc;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.cols}, 1fr);
  gap: 16px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;

  svg {
    color: #004dfc;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const EnvRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 4px 0;
`;
