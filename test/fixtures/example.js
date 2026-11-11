// JavaScript fallback without a semantic provider.
export function greet(user = { name: 'Bea' }) {
  const count = 42;
  return /^[a-z]+$/i.test(user.name) ? `${user.name}: ${count}` : null;
}
