import React from 'react';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  data: CandleData[];
}

export default function CandlestickChart({ data }: Props) {
  const width = data.length * 10 + 40;
  const height = 300;
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">Brak danych</div>;
  }

  const min = Math.min(...data.map(d => d.low));
  const max = Math.max(...data.map(d => d.high));
  const yScale = (price: number) => {
    const padding = 10;
    return height - ((price - min) / (max - min)) * (height - padding * 2) - padding;
  };

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const x = 20 + i * 10;
        const openY = yScale(d.open);
        const closeY = yScale(d.close);
        const highY = yScale(d.high);
        const lowY = yScale(d.low);
        const color = d.close >= d.open ? '#16a34a' : '#dc2626';
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={highY} y2={lowY} stroke={color} strokeWidth={1} />
            <rect
              x={x - 3}
              y={Math.min(openY, closeY)}
              width={6}
              height={Math.max(Math.abs(closeY - openY), 1)}
              fill={color}
            />
          </g>
        );
      })}
    </svg>
  );
}
