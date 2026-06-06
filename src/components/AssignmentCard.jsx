export default function AssignmentCard({ assignment, students, onToggle }) {
  return (
    <div className="bg-white p-4 rounded-xl mb-4">
      <h2 className="font-bold">📌 {assignment.title}</h2>

      <p className="text-sm text-gray-600">
        📅 {assignment.startDate} → ⏰ {assignment.dueDate}
      </p>

      {(assignment.first5Stars || []).length > 0 && (
        <p className="text-yellow-600 font-bold mt-2">
          ⭐ คนได้ดาว: {assignment.first5Stars.join(", ")}
        </p>
      )}

      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
        {students.map((s) => {
          const done = assignment.completedStudents?.includes(s);
          const star = assignment.first5Stars?.includes(s);

          return (
            <button
              key={s}
              onClick={() => onToggle(assignment.id, s)}
              className={`p-2 rounded-xl font-bold transition-all
                ${star ? "bg-yellow-400 text-white" :
                  done ? "bg-green-500 text-white" :
                  "bg-gray-200"}
              `}
            >
              {star ? "⭐" : ""} {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
