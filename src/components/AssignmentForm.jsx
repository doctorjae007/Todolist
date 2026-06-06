import { useState } from "react";
import { addDocument } from "../utils/firestoreHelpers";

export default function AssignmentForm({ onAdded }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const submit = async () => {
    if (!title) return;

    const ref = await addDocument("assignments", {
      title,
      startDate,
      dueDate,
      completedStudents: [],
      first5Stars: [],
    });

    onAdded({ id: ref.id, title, startDate, dueDate, completedStudents: [], first5Stars: [] });

    setTitle("");
    setStartDate("");
    setDueDate("");
  };

  return (
    <div className="bg-white p-4 rounded-xl mb-6">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="ชื่องาน"
        className="border p-2 rounded-xl w-full mb-2"
      />

      <div className="flex gap-2 flex-wrap">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded-xl"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border p-2 rounded-xl"
        />

        <button
          onClick={submit}
          className="bg-green-600 text-white px-4 rounded-xl"
        >
          เพิ่มงาน
        </button>
      </div>
    </div>
  );
}
