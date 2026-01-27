import styled from "styled-components";
import { useEffect, useMemo, useState } from "react";
import SummaryCard from "../../components/SummaryCard";
import {
  Zap,
  Wrench,
  BatteryCharging,
  Package,
  ClipboardCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

/* =========================
   공정 정의 (5단계)
   전극공정 -> 조립공정 -> 활성화공정 -> 팩 -> 최종 검사
========================= */
const processSteps = [
  {
    key: "electrode",
    title: "전극공정",
    desc: "극판/분리막 준비",
    icon: <Zap />,
    color: "#6366f1",
    metricLabel: "전류(A)",
  },
  {
    key: "assembly",
    title: "조립공정",
    desc: "셀 조립/용접",
    icon: <Wrench />,
    color: "#f59e0b",
    metricLabel: "온도(°C)",
  },
  {
    key: "activation",
    title: "활성화공정",
    desc: "전해액/화성",
    icon: <BatteryCharging />,
    color: "#22c55e",
    metricLabel: "전압(V)",
  },
  {
    key: "pack",
    title: "팩",
    desc: "모듈/팩 조립",
    icon: <Package />,
    color: "#0ea5e9",
    metricLabel: "토크(N·m)",
  },
  {
    key: "final",
    title: "최종 검사",
    desc: "성능/누액/OCV",
    icon: <ClipboardCheck />,
    color: "#ef4444",
    metricLabel: "OCV(V)",
  },
];

/* =========================
   Helpers
========================= */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

/** 공정별 “실시간” 값 생성 (지금은 MOCK, 나중에 C# 연동 시 교체) */
function nextMetric(stepKey, prev) {
  const last = prev?.[prev.length - 1]?.value ?? 0;

  switch (stepKey) {
    case "electrode": {
      // 전류(A): 40~80
      const base = last || 55;
      return clamp(base + (Math.random() * 6 - 3), 40, 80);
    }
    case "assembly": {
      // 온도(°C): 20~90
      const base = last || 45;
      return clamp(base + (Math.random() * 4 - 2), 20, 90);
    }
    case "activation": {
      // 전압(V): 10.8~13.0 (서서히 상승)
      const base = last || 10.8;
      return clamp(base + Math.random() * 0.06, 10.8, 13.0);
    }
    case "pack": {
      // 토크(N·m): 2~12
      const base = last || 6;
      return clamp(base + (Math.random() * 1.2 - 0.6), 2, 12);
    }
    case "final": {
      // OCV(V): 12.0~12.8 (가끔 흔들림)
      const base = last || 12.4;
      return clamp(base + (Math.random() * 0.08 - 0.04), 12.0, 12.8);
    }
    default:
      return last;
  }
}

/** 공정별 진행률(%) 업데이트 (지금은 MOCK, 나중에 C# 연동 시 교체) */
function nextProgress(prevProgressMap) {
  const next = { ...prevProgressMap };

  // 간단히: 앞 공정이 조금 더 빠르게 올라가고, 뒤 공정은 천천히 올라가게
  const order = ["electrode", "assembly", "activation", "pack", "final"];
  const deltas = {
    electrode: 2.0,
    assembly: 1.6,
    activation: 1.2,
    pack: 1.0,
    final: 0.8,
  };

  for (const k of order) {
    const current = next[k] ?? 0;

    // 앞 공정이 어느 정도 진행되어야 뒤 공정이 올라가게(자연스러운 흐름)
    const prevKey = order[order.indexOf(k) - 1];
    const gate = prevKey ? (next[prevKey] ?? 0) : 100;

    if (gate < 15 && k !== "electrode") {
      next[k] = 0;
      continue;
    }

    const inc = deltas[k] * (0.6 + Math.random() * 0.8);
    next[k] = clamp(current + inc, 0, 100);
  }

  // 완료 느낌: 최종이 100이면 다 100으로 맞춤(선택)
  if ((next.final ?? 0) >= 100) {
    order.forEach((k) => (next[k] = 100));
  }

  return next;
}

/* =========================
   Component
========================= */
export default function Process() {
  /* ===== 공정별 실시간 라인 데이터(각 공정 1개씩) ===== */
  const [seriesMap, setSeriesMap] = useState(() => {
    const init = {};
    for (const s of processSteps) {
      init[s.key] = [{ t: 0, value: nextMetric(s.key, []) }];
    }
    return init;
  });

  /* ===== 공정별 실시간 진행률(Bar) ===== */
  const [progressMap, setProgressMap] = useState(() => {
    const init = {};
    processSteps.forEach((s) => (init[s.key] = 0));
    return init;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // 1) 그래프 데이터 업데이트
      setSeriesMap((prev) => {
        const next = { ...prev };
        for (const s of processSteps) {
          const prevArr = prev[s.key] || [];
          const lastT = prevArr[prevArr.length - 1]?.t ?? 0;
          const nv = Number(nextMetric(s.key, prevArr).toFixed(2));
          const appended = [...prevArr, { t: lastT + 1, value: nv }];

          // 최근 30개만 유지
          next[s.key] =
            appended.length > 30
              ? appended.slice(appended.length - 30)
              : appended;
        }
        return next;
      });

      // 2) 진행률 업데이트
      setProgressMap((prev) => nextProgress(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressData = useMemo(() => {
    return processSteps.map((s) => ({
      name: s.title,
      key: s.key,
      percent: Math.round(progressMap[s.key] ?? 0),
    }));
  }, [progressMap]);

  const materialMock = useMemo(
    () => [
      { name: "납극판 (+)", delta: "-24 EA" },
      { name: "납극판 (-)", delta: "-24 EA" },
      { name: "격리막", delta: "-24 EA" },
      { name: "전해액(황산)", delta: "-3.2 L" },
    ],
    [],
  );

  return (
    <Wrapper>
      <Header>
        <h2>배터리 핵심 공정 모니터링</h2>
        <span>자동차 배터리 MES</span>
      </Header>

      {/* ===== 공정 단계 (5개) ===== */}
      <SummaryGrid>
        {processSteps.map((p) => (
          <SummaryCard
            key={p.key}
            icon={p.icon}
            label={p.title}
            value={p.desc}
            color={p.color}
          />
        ))}
      </SummaryGrid>

      {/* ===== 5개 공정 진행률 (Bar 형태) ===== */}
      <Card>
        <CardTitle>공정별 실시간 진행률</CardTitle>
        <ChartBoxTall>
          <ResponsiveContainer>
            <BarChart
              data={progressData}
              layout="vertical"
              margin={{ left: 20, right: 20 }}
              barCategoryGap={12} // 공정 간 간격
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip formatter={(v) => [`${v}%`, "진행률"]} />

              <Bar dataKey="percent" fill="#004DFC" radius={0} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBoxTall>
        <Hint>※ C# 설비 시뮬레이터 연동 시 1초 단위로 진행률/지표 갱신</Hint>
      </Card>

      {/* ===== 공정별 실시간 그래프 (각 공정 1개씩, 총 5개) ===== */}
      <Card>
        <CardTitle>공정별 실시간 지표</CardTitle>
        <MiniChartGrid>
          {processSteps.map((s) => {
            const data = seriesMap[s.key] || [];
            const last = data[data.length - 1]?.value;

            return (
              <MiniCard key={s.key}>
                <MiniHead>
                  <div className="left">
                    <MiniDot style={{ background: s.color }} />
                    <div>
                      <div className="title">{s.title}</div>
                      <div className="sub">{s.metricLabel}</div>
                    </div>
                  </div>
                  <div className="value">
                    {last?.toLocaleString?.() ?? "-"}{" "}
                  </div>
                </MiniHead>

                <MiniChartBox>
                  <ResponsiveContainer>
                    <LineChart data={data}>
                      <XAxis dataKey="t" hide />
                      <YAxis hide />
                      <Tooltip
                        formatter={(v) => [v, s.metricLabel]}
                        labelFormatter={(t) => `${t}s`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={s.color}
                        strokeWidth={2.5}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </MiniChartBox>
              </MiniCard>
            );
          })}
        </MiniChartGrid>
        <Hint>
          ※ 지금은 MOCK. C# → 백엔드(WebSocket/SSE) 수신으로 교체하면 됨
        </Hint>
      </Card>

      {/* ===== 자재 소모 ===== */}
      <Card>
        <CardTitle>BOM 기반 자재 소모 현황</CardTitle>
        <MaterialGrid>
          {materialMock.map((m) => (
            <Material key={m.name}>
              <strong>{m.name}</strong>
              <span>{m.delta}</span>
            </Material>
          ))}
        </MaterialGrid>
      </Card>

      {/* ❌ 불량 단축 조회 섹션 제거 (요청사항) */}
    </Wrapper>
  );
}

/* =========================
   styled (기존 톤 유지)
========================= */

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

/* 5개라서 2줄로 자연스럽게 */
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 18px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 820px) {
    grid-template-columns: repeat(2, 1fr);
  }
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

const ChartBoxTall = styled.div`
  height: 260px;
`;

const Hint = styled.div`
  font-size: 12px;
  opacity: 0.6;
  margin-top: 6px;
`;

/* ===== 미니 그래프 5개 ===== */
const MiniChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: 820px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MiniCard = styled.div`
  background: #f8fafc;
  border-radius: 14px;
  padding: 14px;
  border: 1px solid rgba(15, 23, 42, 0.06);
`;

const MiniHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;

  .left {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
  }

  .sub {
    margin-top: 2px;
    font-size: 11px;
    opacity: 0.65;
  }

  .value {
    font-size: 13px;
    font-weight: 700;
    opacity: 0.85;
    white-space: nowrap;
  }
`;

const MiniDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 999px;
`;

const MiniChartBox = styled.div`
  height: 120px;
`;

/* ===== 자재 소모 ===== */
const MaterialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, 1fr);
  }
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
