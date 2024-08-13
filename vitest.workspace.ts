import { defineWorkspace } from 'vitest/config';

// defineWorkspace provides a nice type hinting DX
export default defineWorkspace([
  'packages/*',
  {
    test: {
      include: ['tests/**/*.{browser}.test.{ts,js}'],
      name: 'happy-dom',
      environment: 'happy-dom',
    },
  },
  {
    test: {
      include: ['tests/**/*.{node}.test.{ts,js}'],
      name: 'node',
      environment: 'node',
    },
  },
]);
