import { useEffect, useState } from "react";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { auth, db } from "./firebase";

export default function App() {

  // =========================
  // LOGIN
  // =========================
  const [isTeacher, setIsTeacher] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("isTeacher")) || false;
    } catch {
      localStorage.removeItem("isTeacher");
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const provider = new GoogleAuthProvider();

  const ADMIN_EMAIL = [
    "bankhuha888@gmail.com",
    "jaeautobot@gmail.com",
    "kam.khliktho@gmail.com"
  ];

  const loginTeacher = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const email = result.user.email?.toLowerCase().trim();

      if (ADMIN_EMAIL.includes(email)) {
        setIsTeacher(true);
        setUser(result.user);

        localStorage.setItem("isTeacher", "true");
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        alert("ไม่ใช่ครู");
      }
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") return;
      console.error("Login failed:", err);
      alert("เข้าสู่ระบบไม่สำเร็จ: " + err.message);
    }
  };

  const logoutTeacher = async () => {
    const ok = confirm("ออกจากระบบ?");
    if (!ok) return;

    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
      alert("ออกจากระบบไม่สำเร็จ: " + err.message);
      return;
    }

    setIsTeacher(false);
    setUser(null);

    localStorage.removeItem("isTeacher");
    localStorage.removeItem("user");
  };

  // =========================
  // DATA
  // =========================
  const students = [
    "ภูมิ","พีพี","คิงคอง","กฤษฎา","จารุวิทย์","เพชร",
    "ธนวัติ","เชียร์","เอ","โจ้","เพียว","จัมโบ้",
    "เอ็มเค","โลตัส","แจ๊ค","หมูอ้วน","สายธาร","สาว",
    "วิว","อาร์ม","สปาย","แอฟ","จีจ้า","ญาญ่า","กีตาร์","สา"
  ];

  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // =========================
  // LOAD
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        setLoadError(null);
        setLoading(true);

        const aSnap = await getDocs(collection(db, "assignments"));
        const sSnap = await getDocs(collection(db, "scores"));

        setAssignments(aSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setScores(sSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Failed to load data:", err);
        setLoadError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // =========================
  // ADD ASSIGNMENT
  // =========================
  const addAssignment = async () => {
    if (!newTitle) return;

    try {
      const docRef = await addDoc(collection(db, "assignments"), {
        title: newTitle,
        startDate,
        dueDate,
        completedStudents: [],
        first5Stars: []
      });

      setAssignments(prev => [
        ...prev,
        {
          id: docRef.id,
          title: newTitle,
          startDate,
          dueDate,
          completedStudents: [],
          first5Stars: []
        }
      ]);

      setNewTitle("");
      setStartDate("");
      setDueDate("");
    } catch (err) {
      console.error("Failed to add assignment:", err);
      alert("เพิ่มงานไม่สำเร็จ: " + err.message);
    }
  };

  // =========================
  // TOGGLE + STAR SYSTEM
  // =========================
  const toggleStudent = async (assignmentId, student) => {

    if (!isTeacher) return;

    const a = assignments.find(x => x.id === assignmentId);
    if (!a) return;

    const list = a.completedStudents || [];
    const stars = a.first5Stars || [];

    const exists = list.includes(student);

    let newList;

    if (exists) {
      newList = list.filter(s => s !== student);
    } else {
      newList = [...list, student];
    }

    // ⭐ STAR LOGIC (first 5 only)
    let newStars = stars;

    if (!exists && !stars.includes(student) && stars.length < 5) {
      newStars = [...stars, student];
    }

    try {
      await updateDoc(doc(db, "assignments", assignmentId), {
        completedStudents: newList,
        first5Stars: newStars
      });
    } catch (err) {
      console.error("Failed to update assignment:", err);
      alert("อัปเดตงานไม่สำเร็จ: " + err.message);
      return;
    }

    // =========================
    // SCORE +1
    // =========================
    const scoreDoc = scores.find(s => s.studentName === student);

    if (scoreDoc && !exists) {
      const newScore = scoreDoc.score + 1;

      try {
        await updateDoc(doc(db, "scores", scoreDoc.id), {
          score: newScore
        });

        setScores(prev =>
          prev.map(s =>
            s.studentName === student
              ? { ...s, score: newScore }
              : s
          )
        );
      } catch (err) {
        console.error("Failed to update score:", err);
        alert("อัปเดตคะแนนไม่สำเร็จ: " + err.message);
      }
    }

    setAssignments(prev =>
      prev.map(a =>
        a.id === assignmentId
          ? {
              ...a,
              completedStudents: newList,
              first5Stars: newStars
            }
          : a
      )
    );
  };

  // =========================
  // STAR LEADERBOARD (รวมดาว)
  // =========================
  const starCount = {};

  assignments.forEach(a => {
    (a.first5Stars || []).forEach(name => {
      starCount[name] = (starCount[name] || 0) + 1;
    });
  });

  const starLeaderboard = Object.entries(starCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // =========================
  // SCORE LEADERBOARD
  // =========================
  const scoreLeaderboard = [...scores].sort((a, b) => b.score - a.score);

  // =========================
  // UI
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-red-600">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="text-sm text-gray-500">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      <h1 className="text-3xl font-black text-center mb-4">
        🏫 Classroom System
      </h1>

      {/* TOP STAR LEADERBOARD */}
      <div className="bg-yellow-100 p-4 rounded-xl mb-4">

        <h2 className="font-bold mb-2">⭐ Top Star (5 คนแรก)</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

          {starLeaderboard.map((s, i) => (
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

      {/* SCORE LEADERBOARD */}
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
            {scoreLeaderboard.map((s, i) => (
              <tr key={s.id} className="text-center">

                <td className="border p-2">
                  {i + 1}
                </td>

                <td className="border p-2">
                  {s.studentName}
                </td>

                <td className="border p-2 font-bold">
                  {s.score}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* ADD ASSIGNMENT */}
      {isTeacher && (
        <div className="bg-white p-4 rounded-xl mb-6">

          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
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
              onClick={addAssignment}
              className="bg-green-600 text-white px-4 rounded-xl"
            >
              เพิ่มงาน
            </button>

          </div>

        </div>
      )}

      {/* ASSIGNMENTS */}
      {assignments.map(a => (

        <div key={a.id} className="bg-white p-4 rounded-xl mb-4">

          <h2 className="font-bold">📌 {a.title}</h2>

          <p className="text-sm text-gray-600">
            📅 {a.startDate} → ⏰ {a.dueDate}
          </p>

          {/* ⭐ SHOW FIRST 5 */}
          {(a.first5Stars || []).length > 0 && (
            <p className="text-yellow-600 font-bold mt-2">
              ⭐ คนได้ดาว: {a.first5Stars.join(", ")}
            </p>
          )}

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">

            {students.map(s => {
              const done = a.completedStudents?.includes(s);
              const star = a.first5Stars?.includes(s);

              return (
                <button
                  key={s}
                  onClick={() => toggleStudent(a.id, s)}
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
      ))}

    </div>
  );
}