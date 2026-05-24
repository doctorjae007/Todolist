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
  deleteDoc,
  doc
} from "firebase/firestore";

import { auth, db } from "./firebase";

export default function App() {

  // =========================
  // LOGIN
  // =========================
  const [isTeacher, setIsTeacher] = useState(false);
  const [user, setUser] = useState(null);

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
      } else {
        alert("บัญชีนี้ไม่ใช่ครู");
      }

    } catch (err) {
      console.log(err);
    }
  };

  const logoutTeacher = async () => {
    await signOut(auth);
    setIsTeacher(false);
    setUser(null);
  };

  // =========================
  // STUDENTS
  // =========================
  const students = [
    "ภูมิ","พีพี","คิงคอง","กฤษฎา","จารุวิทย์","เพชร",
    "ธนวัติ","เชียร์","เอ","โจ้","เพียว","จัมโบ้",
    "เอ็มเค","โลตัส","แจ๊ค","หมูอ้วน","สายธาร","สาว",
    "วิว","อาร์ม","สปาย","แอฟ","จีจ้า","ญาญ่า","กีตาร์","สา"
  ];

  // =========================
  // FORM
  // =========================
  const [newTitle, setNewTitle] = useState("");
  const [newTheme, setNewTheme] = useState("tree");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // =========================
  // FIREBASE DATA
  // =========================
  const [assignments, setAssignments] = useState([]);

  // =========================
  // LOAD FROM FIREBASE (กันหายตอน refresh)
  // =========================
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "assignments"));

      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));

      setAssignments(data);
    };

    fetchData();
  }, []);

  // =========================
  // ADD ASSIGNMENT (Firebase)
  // =========================
  const addAssignment = async () => {
    if (!newTitle) return;

    const icons = {
      tree: "🌳",
      rocket: "🚀",
      cloud: "☁️",
      house: "🏡"
    };

    const newItem = {
      title: newTitle,
      theme: newTheme,
      icon: icons[newTheme],
      startDate,
      dueDate,
      completedStudents: []
    };

    const docRef = await addDoc(
      collection(db, "assignments"),
      newItem
    );

    setAssignments([
      ...assignments,
      { id: docRef.id, ...newItem }
    ]);

    setNewTitle("");
    setNewTheme("tree");
    setStartDate("");
    setDueDate("");
  };

  // =========================
  // DELETE (Firebase)
  // =========================
  const deleteAssignment = async (id) => {
    await deleteDoc(doc(db, "assignments", id));

    setAssignments(
      assignments.filter((a) => a.id !== id)
    );
  };

  // =========================
  // TOGGLE STUDENT (local only ยังไม่ sync firebase)
  // =========================
  const toggleStudent = (assignmentId, student) => {
    if (!isTeacher) return;

    const updated = assignments.map((a) => {
      if (a.id !== assignmentId) return a;

      const exists = a.completedStudents.includes(student);

      return {
        ...a,
        completedStudents: exists
          ? a.completedStudents.filter((s) => s !== student)
          : [...a.completedStudents, student]
      };
    });

    setAssignments(updated);
  };

  // =========================
  // POSITION
  // =========================
  const positions = [
    "top-10 left-10","top-24 left-40","top-10 left-72",
    "top-24 right-24","top-40 left-10","top-44 left-56",
    "top-36 right-8","top-56 left-24","top-60 left-72",
    "top-64 right-12","top-80 left-10","top-80 left-44",
    "top-80 left-80","top-96 left-20","top-96 left-56",
    "top-96 right-16","top-16 left-[420px]","top-48 left-[420px]",
    "top-72 left-[420px]","top-24 left-[520px]","top-56 left-[520px]",
    "top-84 left-[520px]","top-36 left-[620px]","top-72 left-[620px]",
    "top-[420px] left-[340px]","top-[420px] left-[520px]"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-100 to-green-200 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-green-800">
            🌳 Forest Classroom
          </h1>
        </div>

        {/* LOGIN */}
        <div className="flex justify-center gap-4 mb-8">

          {!isTeacher ? (
            <button
              onClick={loginTeacher}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold"
            >
              Login Teacher
            </button>
          ) : (
            <div className="flex gap-4 items-center">
              <div className="bg-white px-4 py-2 rounded-xl">
                {user?.email}
              </div>

              <button
                onClick={logoutTeacher}
                className="bg-red-500 text-white px-6 py-3 rounded-xl"
              >
                Logout
              </button>
            </div>
          )}

        </div>

        {/* TEACHER PANEL */}
        {isTeacher && (
          <div className="bg-white p-4 rounded-2xl mb-6">

            <input
              placeholder="ชื่องาน"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border p-2 mr-2"
            />

            <select
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              className="border p-2 mr-2"
            >
              <option value="tree">🌳</option>
              <option value="rocket">🚀</option>
              <option value="cloud">☁️</option>
              <option value="house">🏡</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 mr-2"
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border p-2 mr-2"
            />

            <button
              onClick={addAssignment}
              className="bg-green-600 text-white px-4 py-2 rounded-xl"
            >
              เพิ่มงาน
            </button>

          </div>
        )}

        {/* ASSIGNMENTS */}
        {assignments.map((a) => {

          const percent = Math.round(
            (a.completedStudents?.length || 0) / students.length * 100
          );

          return (
            <div key={a.id} className="bg-white p-6 rounded-2xl mb-6">

              <h2 className="text-xl font-bold">
                {a.icon} {a.title}
              </h2>

              <p>📅 {a.startDate} - ⏰ {a.dueDate}</p>
              <p>Progress: {percent}%</p>

              {/* students */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {students.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleStudent(a.id, s)}
                    className="p-2 bg-gray-200 rounded-xl"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {isTeacher && (
                <button
                  onClick={() => deleteAssignment(a.id)}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded-xl"
                >
                  ลบงาน
                </button>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}