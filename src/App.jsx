import { useState } from "react";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "firebase/auth";

import { auth } from "./firebase";

export default function App() {

  // =========================
  // LOGIN
  // =========================

  const [isTeacher, setIsTeacher] = useState(false);
  const [user, setUser] = useState(null);

  const provider = new GoogleAuthProvider();

  const loginTeacher = async () => {

    try {

      const result = await signInWithPopup(auth, provider);

      const email = result.user.email;

      // 🔥 เปลี่ยนเป็น Gmail ของครู
      const ADMIN_EMAIL = ["bankhuha888@gmail.com", "jaeautobot@gmail.com"];

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
    "ภูมิ",
    "พีพี",
    "คิงคอง",
    "กฤษฎา",
    "จารุวิทย์",
    "เพชร",
    "ธนวัติ",
    "เชียร์",
    "เอ",
    "โจ้",
    "เพียว",
    "จัมโบ้",
    "เอ็มเค",
    "โลตัส",
    "แจ๊ค",
    "หมูอ้วน",
    "สายธาร",
    "สาว",
    "วิว",
    "อาร์ม",
    "สปาย",
    "แอฟ",
    "จีจ้า",
    "ญาญ่า",
    "กีตาร์",
    "สา"
  ];

  // =========================
  // CREATE ASSIGNMENT
  // =========================

  const [newTitle, setNewTitle] = useState("");
  const [newTheme, setNewTheme] = useState("tree");

  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  // =========================
  // ASSIGNMENTS
  // =========================

  const [assignments, setAssignments] = useState([
    
  ]);

  // =========================
  // ADD ASSIGNMENT
  // =========================

  const addAssignment = () => {

    if (!newTitle) return;

    const icons = {
      tree: "🌳",
      rocket: "🚀",
      cloud: "☁️",
      house: "🏡"
    };

    const newAssignmentItem = {
      id: Date.now(),
      title: newTitle,
      theme: newTheme,
      icon: icons[newTheme],
      startDate,
      dueDate,
      completedStudents: []
    };

    setAssignments([
      ...assignments,
      newAssignmentItem
    ]);

    setNewTitle("");
    setNewTheme("tree");
    setStartDate("");
    setDueDate("");

  };

  // =========================
  // DELETE ASSIGNMENT
  // =========================

  const deleteAssignment = (id) => {

    const filtered = assignments.filter(
      (item) => item.id !== id
    );

    setAssignments(filtered);

  };

  // =========================
  // TOGGLE STUDENT
  // =========================

  const toggleStudent = (assignmentId, student) => {

    if (!isTeacher) return;

    const updated = assignments.map((assignment) => {

      if (assignment.id !== assignmentId) return assignment;

      const alreadyCompleted =
        assignment.completedStudents.includes(student);

      if (alreadyCompleted) {

        return {
          ...assignment,
          completedStudents:
            assignment.completedStudents.filter(
              (s) => s !== student
            )
        };

      } else {

        return {
          ...assignment,
          completedStudents: [
            ...assignment.completedStudents,
            student
          ]
        };

      }

    });

    setAssignments(updated);

  };

  // =========================
  // POSITION
  // =========================

  const positions = [
    "top-10 left-10",
    "top-24 left-40",
    "top-10 left-72",
    "top-24 right-24",
    "top-40 left-10",
    "top-44 left-56",
    "top-36 right-8",
    "top-56 left-24",
    "top-60 left-72",
    "top-64 right-12",
    "top-80 left-10",
    "top-80 left-44",
    "top-80 left-80",
    "top-96 left-20",
    "top-96 left-56",
    "top-96 right-16",
    "top-16 left-[420px]",
    "top-48 left-[420px]",
    "top-72 left-[420px]",
    "top-24 left-[520px]",
    "top-56 left-[520px]",
    "top-84 left-[520px]",
    "top-36 left-[620px]",
    "top-72 left-[620px]",
    "top-[420px] left-[340px]",
    "top-[420px] left-[520px]"
  ];

  return (

    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-green-100 to-green-200 p-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="text-center mb-8">

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-green-800">
            🌳 Forest Classroom
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-green-700 mt-2">
            ห้องเรียนแห่งการเติบโต
          </p>

        </div>

        {/* LOGIN */}

        <div className="flex justify-center gap-4 mb-8">

          {!isTeacher ? (

            <button
              onClick={loginTeacher}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all hover:scale-105"
            >
              🔐 Login Teacher
            </button>

          ) : (

            <div className="flex items-center gap-4 flex-wrap justify-center">

              <div className="bg-white px-4 py-2 rounded-2xl shadow font-bold">
                👩‍🏫 {user?.email}
              </div>

              <button
                onClick={logoutTeacher}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all hover:scale-105"
              >
                🚪 Logout
              </button>

            </div>

          )}

        </div>

        {/* TEACHER PANEL */}

        {isTeacher && (

          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-xl mb-8">

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-green-800 mb-2">
              👩‍🏫 Teacher Control
            </h2>

            <p className="text-sm sm:text-base text-green-700 mb-6">
              สร้างงานใหม่และจัดการสถานะนักเรียน
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

              <input
                type="text"
                placeholder="ชื่องาน..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-300"
              />

              <select
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-300"
              >

                <option value="tree">🌳 Tree</option>
                <option value="rocket">🚀 Rocket</option>
                <option value="cloud">☁️ Cloud</option>
                <option value="house">🏡 House</option>

              </select>

              <div>
                <label className="block text-sm font-medium text-green-700 mb-2">
                  📅 วันที่สั่งงาน
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-gray-300 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-red-600 mb-2">
                  ⏰ หมดเขต
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-gray-300 w-full"
                />
              </div>

              <button
                onClick={addAssignment}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg transition-all hover:scale-105"
              >
                ➕ เพิ่มงาน
              </button>

            </div>

          </div>

        )}

        {/* ASSIGNMENTS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">

          {assignments.map((assignment) => {

            const completed =
              assignment.completedStudents.length;

            const total = students.length;

            const percent = Math.round(
              (completed / total) * 100
            );

            return (

              <div
                key={assignment.id}
                className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-2xl"
              >

                {/* TOP */}

                <div className="flex justify-between items-start mb-4 flex-wrap gap-4">

                  <div>

                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-800">
                      {assignment.icon} {assignment.title}
                    </h2>

                    <div className="mt-3 space-y-1">

                      <p className="text-xs sm:text-sm md:text-base text-green-700 font-medium">
                        📅 วันที่สั่ง : {assignment.startDate}
                      </p>

                      <p className="text-xs sm:text-sm md:text-base text-red-500 font-medium">
                        ⏰ หมดเขต : {assignment.dueDate}
                      </p>

                      <p className="text-xs sm:text-sm md:text-base text-green-700 font-medium">
                        ✅ ส่งแล้ว {completed}/{total}
                      </p>

                    </div>

                  </div>

                  <div className="bg-green-100 px-3 py-2 rounded-2xl text-center">

                    <p className="text-xs sm:text-sm text-green-700">
                      ความคืบหน้า
                    </p>

                    <p className="text-lg sm:text-xl md:text-2xl font-black text-green-800">
                      {percent}%
                    </p>

                  </div>

                </div>

                {/* SCENE */}

                <div className="relative h-[250px] sm:h-[350px] md:h-[450px] lg:h-[500px] rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100 to-green-100 border border-green-200">

                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-green-400 rounded-t-[100%]" />

                  {/* CENTER OBJECT */}

                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2">

                    {assignment.theme === "tree" && (
                      <div className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[220px]">
                        🌳
                      </div>
                    )}

                    {assignment.theme === "rocket" && (
                      <div className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[220px] animate-bounce">
                        🚀
                      </div>
                    )}

                    {assignment.theme === "cloud" && (
                      <div className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[220px] animate-pulse">
                        ☁️
                      </div>
                    )}

                    {assignment.theme === "house" && (
                      <div className="text-[80px] sm:text-[120px] md:text-[160px] lg:text-[220px]">
                        🏡
                      </div>
                    )}

                  </div>

                  {/* STUDENTS */}

                  {students.map((student, index) => {

                    const isCompleted =
                      assignment.completedStudents.includes(student);

                    const specialStudent =
                      assignment.completedStudents.indexOf(student) < 3;

                    return (

                      <div
                        key={student}
                        className={`absolute ${positions[index]}`}
                      >

                        <button
                          onClick={() =>
                            toggleStudent(
                              assignment.id,
                              student
                            )
                          }
                          className={`
                            px-2 py-1 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-full
                            text-xs sm:text-sm md:text-base
                            font-bold shadow-lg
                            border-2
                            transition-all duration-300

                            ${
                              isTeacher
                                ? "hover:scale-110 cursor-pointer"
                                : ""
                            }

                            ${
                              isCompleted
                                ? specialStudent
                                  ? "bg-gradient-to-r from-yellow-300 to-orange-400 text-white border-yellow-200 animate-pulse"
                                  : "bg-green-400 text-white border-green-200"
                                : "bg-white/80 text-gray-700 border-gray-200"
                            }
                          `}
                        >

                          {isCompleted
                            ? specialStudent
                              ? "🌟"
                              : "🌿"
                            : "🍂"}

                          {" "}
                          {student}

                        </button>

                      </div>

                    );

                  })}

                </div>

                {/* PROGRESS */}

                <div className="mt-6">

                  <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{
                        width: `${percent}%`
                      }}
                    />

                  </div>

                  {/* BUTTONS */}

                  {isTeacher && (

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-4">

                      <button
                        className="bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 rounded-2xl text-sm sm:text-base font-bold transition-all hover:scale-105"
                      >
                        ✅ จัดการงาน
                      </button>

                      <button
                        onClick={() =>
                          deleteAssignment(assignment.id)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white py-2 sm:py-3 rounded-2xl text-sm sm:text-base font-bold transition-all hover:scale-105"
                      >
                        🗑 ลบงาน
                      </button>

                    </div>

                  )}

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

}