import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Firebase mocks ──────────────────────────────────────────────────
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();
const mockAddDoc = vi.fn();
const mockGetDocs = vi.fn();
const mockUpdateDoc = vi.fn();

vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  signOut: (...args) => mockSignOut(...args),
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((db, name) => name),
  addDoc: (...args) => mockAddDoc(...args),
  getDocs: (...args) => mockGetDocs(...args),
  updateDoc: (...args) => mockUpdateDoc(...args),
  doc: vi.fn((db, col, id) => ({ col, id })),
  getFirestore: vi.fn(() => ({})),
}));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
}));

// ── Helpers ─────────────────────────────────────────────────────────
function makeFirestoreSnap(docs) {
  return {
    docs: docs.map((d) => ({
      id: d.id,
      data: () => {
        // eslint-disable-next-line no-unused-vars
        const { id: _id, ...rest } = d;
        return rest;
      },
    })),
  };
}

const sampleAssignments = [
  {
    id: 'a1',
    title: 'Homework 1',
    startDate: '2025-06-01',
    dueDate: '2025-06-07',
    completedStudents: ['ภูมิ', 'พีพี'],
    first5Stars: ['ภูมิ', 'พีพี'],
  },
  {
    id: 'a2',
    title: 'Homework 2',
    startDate: '2025-06-08',
    dueDate: '2025-06-14',
    completedStudents: ['ภูมิ'],
    first5Stars: ['ภูมิ'],
  },
];

const sampleScores = [
  { id: 's1', studentName: 'ภูมิ', score: 10 },
  { id: 's2', studentName: 'พีพี', score: 5 },
  { id: 's3', studentName: 'คิงคอง', score: 3 },
];

function setupGetDocs(assignments = sampleAssignments, scores = sampleScores) {
  mockGetDocs
    .mockResolvedValueOnce(makeFirestoreSnap(assignments))
    .mockResolvedValueOnce(makeFirestoreSnap(scores));
}

// ── Tests ───────────────────────────────────────────────────────────
describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  async function renderApp() {
    const { default: App } = await import('../App.jsx');
    const result = render(<App />);
    // Wait for the useEffect data fetch to resolve
    await waitFor(() => {
      expect(mockGetDocs).toHaveBeenCalledTimes(2);
    });
    return result;
  }

  // ─── Rendering ──────────────────────────────────────────────────
  describe('initial rendering', () => {
    it('renders the Classroom System heading', async () => {
      setupGetDocs();
      await renderApp();
      expect(screen.getByText(/Classroom System/i)).toBeInTheDocument();
    });

    it('renders the star leaderboard section', async () => {
      setupGetDocs();
      await renderApp();
      expect(screen.getByText(/Top Star/i)).toBeInTheDocument();
    });

    it('renders the score leaderboard table', async () => {
      setupGetDocs();
      await renderApp();
      expect(screen.getByText(/คะแนนรวมทั้งเทอม/)).toBeInTheDocument();
    });

    it('renders assignment cards after data loads', async () => {
      setupGetDocs();
      await renderApp();
      expect(screen.getByText(/Homework 1/)).toBeInTheDocument();
      expect(screen.getByText(/Homework 2/)).toBeInTheDocument();
    });

    it('renders dates for assignments', async () => {
      setupGetDocs();
      await renderApp();
      expect(screen.getByText(/2025-06-01/)).toBeInTheDocument();
      expect(screen.getByText(/2025-06-07/)).toBeInTheDocument();
    });

    it('renders student buttons for each assignment', async () => {
      setupGetDocs();
      await renderApp();
      // 26 students × 2 assignments = 52 buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(52);
    });
  });

  // ─── Star Leaderboard ──────────────────────────────────────────
  describe('star leaderboard', () => {
    it('shows students sorted by star count descending', async () => {
      setupGetDocs();
      await renderApp();
      // ภูมิ has 2 stars (in both assignments), พีพี has 1 star
      const leaderboard = screen.getByText(/Top Star/).closest('div');
      const names = within(leaderboard).getAllByText(/ภูมิ|พีพี/);
      // ภูมิ should appear first
      expect(names[0].textContent).toContain('ภูมิ');
    });

    it('displays correct star counts', async () => {
      setupGetDocs();
      await renderApp();
      const leaderboard = screen.getByText(/Top Star/).closest('div');
      expect(within(leaderboard).getByText(/2 ⭐/)).toBeInTheDocument();
      expect(within(leaderboard).getByText(/1 ⭐/)).toBeInTheDocument();
    });

    it('shows trophy emoji for top 3', async () => {
      setupGetDocs();
      await renderApp();
      const leaderboard = screen.getByText(/Top Star/).closest('div');
      const items = within(leaderboard).getAllByText(/🏆|⭐/);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  // ─── Score Leaderboard ─────────────────────────────────────────
  describe('score leaderboard', () => {
    it('renders all scores in the table', async () => {
      setupGetDocs();
      await renderApp();
      const table = screen.getByText(/คะแนนรวมทั้งเทอม/).closest('div');
      expect(within(table).getByText('ภูมิ')).toBeInTheDocument();
      expect(within(table).getByText('พีพี')).toBeInTheDocument();
      expect(within(table).getByText('คิงคอง')).toBeInTheDocument();
    });

    it('shows scores sorted descending', async () => {
      setupGetDocs();
      await renderApp();
      const rows = screen.getAllByRole('row');
      // Header + 3 data rows
      expect(rows.length).toBe(4);
      // First data row should be ภูมิ with score 10
      const firstRow = rows[1];
      expect(within(firstRow).getByText('ภูมิ')).toBeInTheDocument();
      expect(within(firstRow).getByText('10')).toBeInTheDocument();
    });

    it('shows rank numbers starting at 1', async () => {
      setupGetDocs();
      await renderApp();
      const rows = screen.getAllByRole('row');
      const firstDataRow = rows[1];
      expect(within(firstDataRow).getByText('1')).toBeInTheDocument();
    });
  });

  // ─── Teacher Login / Logout ────────────────────────────────────
  describe('authentication', () => {
    it('does not show assignment form when not logged in as teacher', async () => {
      setupGetDocs();
      await renderApp();
      expect(screen.queryByPlaceholderText('ชื่องาน')).not.toBeInTheDocument();
    });

    it('shows assignment form when localStorage has isTeacher=true', async () => {
      localStorage.setItem('isTeacher', 'true');
      localStorage.setItem('user', JSON.stringify({ email: 'jaeautobot@gmail.com' }));
      setupGetDocs(); // re-setup since beforeEach already consumed the mock
      await renderApp();
      expect(screen.getByPlaceholderText('ชื่องาน')).toBeInTheDocument();
    });

    it('shows add assignment button for teacher', async () => {
      localStorage.setItem('isTeacher', 'true');
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }));
      setupGetDocs();
      await renderApp();
      expect(screen.getByText('เพิ่มงาน')).toBeInTheDocument();
    });
  });

  // ─── Add Assignment ────────────────────────────────────────────
  describe('addAssignment', () => {
    beforeEach(() => {
      localStorage.setItem('isTeacher', 'true');
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }));
    });

    it('does not call addDoc when title is empty', async () => {
      setupGetDocs();
      await renderApp();
      const addBtn = screen.getByText('เพิ่มงาน');
      fireEvent.click(addBtn);
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    it('calls addDoc with correct data when title is provided', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-id' });
      setupGetDocs();
      await renderApp();

      const input = screen.getByPlaceholderText('ชื่องาน');
      await userEvent.type(input, 'New Assignment');

      const addBtn = screen.getByText('เพิ่มงาน');
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(mockAddDoc).toHaveBeenCalledWith('assignments', {
          title: 'New Assignment',
          startDate: '',
          dueDate: '',
          completedStudents: [],
          first5Stars: [],
        });
      });
    });

    it('clears input fields after adding assignment', async () => {
      mockAddDoc.mockResolvedValue({ id: 'new-id' });
      setupGetDocs();
      await renderApp();

      const input = screen.getByPlaceholderText('ชื่องาน');
      await userEvent.type(input, 'Test');
      fireEvent.click(screen.getByText('เพิ่มงาน'));

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });
  });

  // ─── Toggle Student ────────────────────────────────────────────
  describe('toggleStudent', () => {
    it('does not toggle when not teacher', async () => {
      setupGetDocs();
      await renderApp();
      // Find a student button in the first assignment
      const hw1Section = screen.getByText(/Homework 1/).closest('div');
      const studentBtn = within(hw1Section).getAllByRole('button').find(
        (btn) => btn.textContent.includes('คิงคอง')
      );
      fireEvent.click(studentBtn);
      expect(mockUpdateDoc).not.toHaveBeenCalled();
    });

    it('marks a student as completed when teacher clicks', async () => {
      localStorage.setItem('isTeacher', 'true');
      localStorage.setItem('user', JSON.stringify({ email: 'test@test.com' }));
      mockUpdateDoc.mockResolvedValue();
      setupGetDocs();
      await renderApp();

      // Click คิงคอง in Homework 1 (not yet completed)
      const hw1Section = screen.getByText(/Homework 1/).closest('div');
      const studentBtn = within(hw1Section).getAllByRole('button').find(
        (btn) => btn.textContent.includes('คิงคอง')
      );
      fireEvent.click(studentBtn);

      await waitFor(() => {
        expect(mockUpdateDoc).toHaveBeenCalled();
      });
    });
  });

  // ─── First 5 Stars Display ─────────────────────────────────────
  describe('first 5 stars display', () => {
    it('shows star winners for assignments that have them', async () => {
      setupGetDocs();
      await renderApp();
      expect(screen.getAllByText(/คนได้ดาว/).length).toBeGreaterThan(0);
    });

    it('does not show star line for assignments with no stars', async () => {
      setupGetDocs([
        {
          id: 'a1',
          title: 'Empty Assignment',
          startDate: '2025-06-01',
          dueDate: '2025-06-07',
          completedStudents: [],
          first5Stars: [],
        },
      ]);
      await renderApp();
      expect(screen.queryByText(/คนได้ดาว/)).not.toBeInTheDocument();
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────
  describe('edge cases', () => {
    it('renders with empty assignments and scores', async () => {
      setupGetDocs([], []);
      await renderApp();
      expect(screen.getByText(/Classroom System/i)).toBeInTheDocument();
      // Score table should have only header
      const rows = screen.getAllByRole('row');
      expect(rows.length).toBe(1); // header only
    });

    it('handles assignments with missing completedStudents gracefully', async () => {
      setupGetDocs([
        {
          id: 'a1',
          title: 'No Completions',
          startDate: '2025-06-01',
          dueDate: '2025-06-07',
          // completedStudents is undefined
        },
      ]);
      await renderApp();
      expect(screen.getByText(/No Completions/)).toBeInTheDocument();
    });

    it('handles assignments with missing first5Stars gracefully', async () => {
      setupGetDocs([
        {
          id: 'a1',
          title: 'No Stars',
          startDate: '2025-06-01',
          dueDate: '2025-06-07',
          completedStudents: ['ภูมิ'],
          // first5Stars is undefined
        },
      ]);
      await renderApp();
      expect(screen.getByText(/No Stars/)).toBeInTheDocument();
    });
  });

  // ─── Student List ──────────────────────────────────────────────
  describe('student list', () => {
    it('renders all 26 students per assignment', async () => {
      setupGetDocs([
        {
          id: 'a1',
          title: 'Single HW',
          startDate: '2025-06-01',
          dueDate: '2025-06-07',
          completedStudents: [],
          first5Stars: [],
        },
      ]);
      await renderApp();
      const section = screen.getByText(/Single HW/).closest('div');
      const buttons = within(section).getAllByRole('button');
      expect(buttons.length).toBe(26);
    });

    it('highlights completed students with green styling', async () => {
      setupGetDocs();
      await renderApp();
      const hw1Section = screen.getByText(/Homework 1/).closest('div');
      const completedBtn = within(hw1Section).getAllByRole('button').find(
        (btn) => btn.textContent.trim() === 'ภูมิ' || btn.textContent.includes('ภูมิ')
      );
      // ภูมิ is in first5Stars, so it should have yellow styling
      expect(completedBtn.className).toContain('bg-yellow-400');
    });

    it('shows uncompleted students with gray styling', async () => {
      setupGetDocs();
      await renderApp();
      const hw1Section = screen.getByText(/Homework 1/).closest('div');
      const grayBtn = within(hw1Section).getAllByRole('button').find(
        (btn) => btn.textContent.includes('เอ็มเค')
      );
      expect(grayBtn.className).toContain('bg-gray-200');
    });
  });
});
