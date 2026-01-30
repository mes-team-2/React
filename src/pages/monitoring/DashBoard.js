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

const getNowTime = () =>
  new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

/**
 * 시간별 생산 + 불량
 */
const PROD_TREND = [
  { time: "08:00", plan: 120, actual: 110, defect: 4 },
  { time: "09:00", plan: 120, actual: 115, defect: 3 },
  { time: "10:00", plan: 120, actual: 105, defect: 6 },
  { time: "11:00", plan: 120, actual: 118, defect: 2 },
  { time: "12:00", plan: 120, actual: 95, defect: 8 },
  { time: "13:00", plan: 120, actual: 108, defect: 5 },
];

/**
 * 불량 유형 분포
 * (전체 불량 기준)
 */
const DEFECT_TYPE_CHART = [
  { name: "전압 불량", value: 30 },
  { name: "용량 미달", value: 25 },
  { name: "외관 불량", value: 20 },
  { name: "누액", value: 15 },
  { name: "기타", value: 10 },
];

const PIE_COLORS = ["#FF5B5B", "#FF9F0A", "#FFD60A", "#34C759", "#AF52DE"];

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

const WORKER_INFO = {
  total: 18,
  working: 14,
  standby: 4,
};

const PROCESS_EFF = {
  uph: 120,
  defectRate: 3.8,
  materialUsage: 52,
};

/* =========================
   Dashboard
========================= */

export default function Dashboard() {
  const [time, setTime] = useState(getNowTime());

  useEffect(() => {
    const clock = setInterval(() => setTime(getNowTime()), 1000);
    return () => clearInterval(clock);
  }, []);

  return (
    <Wrapper>
      {/* ================= 상단 ================= */}
      <Section>
        <Grid cols={4}>
          <SummaryCard label="현재 시각" value={time} icon={<FaClock />} />
          <SummaryCard label="외부 날씨" value="맑음" icon={<FaCloudSun />} />
          <SummaryCard
            label="현재 온도"
            value="23 ℃"
            icon={<FaTemperatureHigh />}
          />
          <SummaryCard label="현재 습도" value="48 %" icon={<FaTint />} />
        </Grid>
      </Section>

      {/* ================= 생산 정보 ================= */}
      <Section>
        <SectionTitle>
          <FaChartBar /> 생산 정보
        </SectionTitle>

        <ChartGrid>
          {/* 시간별 생산 + 불량 */}
          <ChartCard>
            <ChartTitle>
              <FaIndustry /> 시간별 계획 대비 생산 / 불량
            </ChartTitle>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={PROD_TREND}>
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />

                <Bar
                  dataKey="actual"
                  name="생산량"
                  fill="#004DFC"
                  barSize={18}
                />
                <Bar
                  dataKey="defect"
                  name="불량 수량"
                  fill="#FF5B5B"
                  barSize={18}
                />
                <Line
                  dataKey="plan"
                  name="계획 수량"
                  stroke="#FF9F0A"
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 불량 유형 분포 */}
          <ChartCard>
            <ChartTitle>
              <FaExclamationTriangle /> 불량 유형 분포
            </ChartTitle>

            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={DEFECT_TYPE_CHART}
                  dataKey="value"
                  innerRadius={50}
                  outerRadius={85}
                >
                  {DEFECT_TYPE_CHART.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </ChartGrid>
      </Section>

      {/* ================= 설비별 환경 정보 ================= */}
      <Section>
        <SectionTitle>
          <FaTools /> 설비별 환경 정보
        </SectionTitle>

        <Grid cols={3}>
          {MACHINE_ENV.map((m) => (
            <EnvCard key={m.machine}>
              <EnvHeader>
                <strong>{m.machine}</strong>
                <Status value={m.status} />
              </EnvHeader>
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
            </EnvCard>
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
            label="시간당 생산량"
            value={PROCESS_EFF.uph}
            icon={<FaTachometerAlt />}
          />
          <SummaryCard
            label="불량률"
            value={`${PROCESS_EFF.defectRate} %`}
            icon={<FaExclamationTriangle />}
          />
          <SummaryCard
            label="자재 소모량(5분)"
            value={`${PROCESS_EFF.materialUsage} EA`}
            icon={<FaIndustry />}
          />
        </Grid>
      </Section>
    </Wrapper>
  );
}

/* =========================
   styles
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
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
`;

const EnvCard = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
`;

const EnvHeader = styled.div`
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
