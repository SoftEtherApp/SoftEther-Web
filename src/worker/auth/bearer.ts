/* ════════════════════════════════════
   Constant-time string comparison for bearer-token checks — the
   operator-supplied secret vs the request's Authorization header.
   Pure module (Node-testable).

   Length mismatches still burn a comparable pass; the comparison
   itself is XOR-accumulated so early-return timing never leaks how
   many leading bytes matched.
   ════════════════════════════════════ */

export function constantTimeEqual(a: string, b: string): boolean {
	if (a.length !== b.length) {
		// Burn a pass so length differences aren't observable either.
		let acc = 0;
		const max = Math.max(a.length, b.length);
		for (let i = 0; i < max; i++) acc |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
		void acc;
		return false;
	}
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}