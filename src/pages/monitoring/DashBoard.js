// src/pages/mes/Dashboard.js
import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
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
  CartesianGrid,
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
   공정 정의
========================= */
const PROCESS_STEPS = [
  { key: "electrode", label: "전극공정" },
  { key: "assembly", label: "조립공정" },
  { key: "activation", label: "활성화공정" },
  { key: "pack", label: "팩" },
  { key: "final", label: "최종 검사" },
];

/* =========================
   MOCK DATA
========================= */

const getNowTime = () =>
  new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const PROD_TREND = [
  { time: "08:00", plan: 120, actual: 110, defect: 10 },
  { time: "09:00", plan: 120, actual: 115, defect: 4 },
  { time: "10:00", plan: 120, actual: 105, defect: 7 },
  { time: "11:00", plan: 120, actual: 118, defect: 3 },
  { time: "12:00", plan: 120, actual: 95, defect: 11 },
  { time: "13:00", plan: 120, actual: 108, defect: 9 },
];

const YIELD_CHART = [
  { name: "양품", value: 96.2 },
  { name: "불량", value: 3.8 },
];

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
  const [weather, setWeather] = useState({
    description: "-",
    temp: "-",
    humidity: "-",
  });

  const [progress, setProgress] = useState({
    electrode: 0,
    assembly: 0,
    activation: 0,
    pack: 0,
    final: 0,
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const API_KEY = "5c76dcc2e466465eb8990218262801";
        const CITY = "Seoul";

        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${CITY}&aqi=no`,
        );

        if (!res.ok) {
          throw new Error(`WeatherAPI error: ${res.status}`);
        }

        const data = await res.json();

        setWeather({
          description: data.current.condition.text,
          temp: `${data.current.temp_c} ℃`,
          humidity: `${data.current.humidity} %`,
        });
      } catch (err) {
        console.error("날씨 정보 조회 실패", err);
      }
    };

    // 🔹 최초 1회 실행
    fetchWeather();

    // 🔹 10분마다 재조회
    const intervalId = setInterval(fetchWeather, 600000);

    // 🔹 컴포넌트 언마운트 시 정리 (중요)
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setTime(getNowTime()), 1000);

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const next = { ...prev };
        PROCESS_STEPS.forEach((p) => {
          next[p.key] = Math.min(100, prev[p.key] + Math.random() * 2);
        });
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(clock);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <Wrapper>
      {/* ================= 상단 ================= */}
      <Section>
        <Grid cols={4}>
          <SummaryCard label="현재 시각" value={time} icon={<FaClock />} />
          <SummaryCard
            label="외부 날씨"
            value={weather.description}
            icon={<FaCloudSun />}
          />

          <SummaryCard
            label="현재 온도"
            value={weather.temp}
            icon={<FaTemperatureHigh />}
          />

          <SummaryCard
            label="현재 습도"
            value={weather.humidity}
            icon={<FaTint />}
          />
        </Grid>
      </Section>

      {/* ================= 생산 정보 ================= */}
      <Section>
        <SectionTitle>
          <FaChartBar /> 생산 정보
        </SectionTitle>

        <ChartGrid>
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
                <Bar dataKey="actual" fill="#004DFC" barSize={22} />
                <Bar dataKey="defect" fill="#ff0000" barSize={22} />
                <Line
                  dataKey="plan"
                  stroke="#FF9F0A"
                  strokeWidth={2}
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard>
            <ChartTitle>
              <FaExclamationTriangle /> 수율 / 불량률
            </ChartTitle>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={YIELD_CHART}
                  dataKey="value"
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
