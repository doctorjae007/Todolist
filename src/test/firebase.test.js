import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: 'mock-app' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

describe('firebase.js', () => {
  it('exports auth and db after initializing Firebase', async () => {
    const { auth, db } = await import('../firebase.js');
    expect(auth).toBeDefined();
    expect(db).toBeDefined();
  });

  it('calls initializeApp with env config', async () => {
    const { initializeApp } = await import('firebase/app');
    expect(initializeApp).toHaveBeenCalled();
  });

  it('calls getAuth with the app instance', async () => {
    const { getAuth } = await import('firebase/auth');
    expect(getAuth).toHaveBeenCalled();
  });

  it('calls getFirestore with the app instance', async () => {
    const { getFirestore } = await import('firebase/firestore');
    expect(getFirestore).toHaveBeenCalled();
  });
});
