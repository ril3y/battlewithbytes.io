// "use client";

// import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// export type HardwareScore = {
//   metric: string;
//   score: number;
// };

// export default function HardwareScoreRadar({ data }: { data: HardwareScore[] }) {
//   return (
//     <ResponsiveContainer width="100%" height={400}>
//       <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
//         <PolarGrid />
//         <PolarAngleAxis dataKey="metric" />
//         <PolarRadiusAxis angle={30} domain={[0, 10]} />
//         <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
//       </RadarChart>
//     </ResponsiveContainer>
//   );
// }
