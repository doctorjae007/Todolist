import { useEffect, useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebase";

import useLocalStorageState from "./hooks/useLocalStorageState";
import { fetchCollection, updateDocument } from "./utils/firestoreHelpers";
import { updateItemInList, toggleInArray } from "./utils/stateHelpers";
import { buildStarLeaderboard, sortByFieldDesc } from "./utils/leaderboardHelpers";

import StarLeaderboard from "./components/StarLeaderboard";
import ScoreLeaderboard from "./components/ScoreLeaderboard";
import AssignmentForm from "./components/AssignmentForm";
import AssignmentCard from "./components/AssignmentCard";

const ADMIN_EMAIL = [
  "bankhuha888@gmail.com",
  "jaeautobot@gmail.com",
  "kam.khliktho@gmail.com",
];

const STUDENTS = [
  "ภูมิ","พีพี","คิงคอง","กฤษฎา","จารุวิทย์","เพชร",
  "ธนวัติ","เชียร์","เอ","โจ้","เพียว","จัมโบ้",
  "เอ็มเค","โลตัส","แจ๊ค","หมูอ้วน","สายธาร","สาว",
  "วิว","อาร์ม","สปาย","แอฟ","จีจ้า","ญาญ่า","กีตาร์","สา",
];

const provider = new GoogleAuthProvider();

export default function App() {
  // ── Auth ──
  const [isTeacher, setIsTeacher, clearIsTeacher] =
    useLocalStorageState("isTeacher", false);
  const [user, setUser, clearUser] =
    useLocalStorageState("user", null);

  const loginTeacher = async () => {
    const result = await signInWithPopup(auth, provider);
    const email = result.user.email?.toLowerCase().trim();

    if (ADMIN_EMAIL.includes(email)) {
      setIsTeacher(true);
      setUser(result.user);
    } else {
      alert("ไม่ใช่ครู");
    }
  };

  const logoutTeacher = async () => {
    if (!confirm("ออกจากระบบ?")) return;
    await signOut(auth);
    clearIsTeacher();
    clearUser();
  };

  // ── Data ──
  const [assignments, setAssignments] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    (async () => {
      const [a, s] = await Promise.all([
        fetchCollection("assignments"),
        fetchCollection("scores"),
      ]);
      setAssignments(a);
      setScores(s);
    })();
  }, []);

  // ── Toggle + Star logic ──
  const toggleStudent = async (assignmentId, student) => {
    if (!isTeacher) return;

    const a = assignments.find((x) => x.id === assignmentId);
    const completed = a.completedStudents || [];
    const stars = a.first5Stars || [];

    const [newCompleted, wasAdded] = toggleInArray(completed, student);

    let newStars = stars;
    if (wasAdded && !stars.includes(student) && stars.length < 5) {
      newStars = [...stars, student];
    }

    await updateDocument("assignments", assignmentId, {
      completedStudents: newCompleted,
      first5Stars: newStars,
    });

    // Score +1 when marking complete
    const scoreDoc = scores.find((s) => s.studentName === student);
    if (scoreDoc && wasAdded) {
      const newScore = scoreDoc.score + 1;
      await updateDocument("scores", scoreDoc.id, { score: newScore });

      setScores((prev) =>
        updateItemInList(prev, (s) => s.studentName === student, {
          score: newScore,
        })
      );
    }

    setAssignments((prev) =>
      updateItemInList(prev, (x) => x.id === assignmentId, {
        completedStudents: newCompleted,
        first5Stars: newStars,
      })
    );
  };

  // ── Leaderboards ──
  const starLeaderboard = buildStarLeaderboard(assignments);
  const scoreLeaderboard = sortByFieldDesc(scores, "score");

  // ── UI ──
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-black text-center mb-4">
        🏫 Classroom System
      </h1>

      <StarLeaderboard leaderboard={starLeaderboard} />
      <ScoreLeaderboard leaderboard={scoreLeaderboard} />

      {isTeacher && (
        <AssignmentForm
          onAdded={(newA) => setAssignments((prev) => [...prev, newA])}
        />
      )}

      {assignments.map((a) => (
        <AssignmentCard
          key={a.id}
          assignment={a}
          students={STUDENTS}
          onToggle={toggleStudent}
        />
      ))}
    </div>
  );
}
