export default function StarLeaderboard({ leaderboard }) {
  if (leaderboard.length === 0) return null;

  return (
    <div className="bg-yellow-100 p-4 rounded-xl mb-4">
      <h2 className="font-bold mb-2">⭐ Top Star (5 คนแรก)</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {leaderboard.map((s, i) => (
          <div
            key={s.name}
            className="bg-white p-2 rounded-xl text-center font-bold"
          >
            {i < 3 ? "🏆" : "⭐"} {s.name}
            <div className="text-sm">{s.count} ⭐</div>
          </div>
        ))}
      </div>
    </div>
  );
}
