export default function ScoreLeaderboard({ leaderboard }) {
  if (leaderboard.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded-xl mb-6 overflow-x-auto">
      <h2 className="font-bold mb-2">📊 คะแนนรวมทั้งเทอม</h2>

      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">อันดับ</th>
            <th className="border p-2">ชื่อ</th>
            <th className="border p-2">คะแนน</th>
          </tr>
        </thead>

        <tbody>
          {leaderboard.map((s, i) => (
            <tr key={s.id} className="text-center">
              <td className="border p-2">{i + 1}</td>
              <td className="border p-2">{s.studentName}</td>
              <td className="border p-2 font-bold">{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
