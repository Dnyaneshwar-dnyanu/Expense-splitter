/**
 * Greedy Cash Flow Minimization / Debt Simplification Algorithm
 * 
 * Problem:
 * In a group with N people, pairwise debts can lead to up to N*(N-1)/2 transactions.
 * For example:
 *   - Alice owes Bob ₹500
 *   - Bob owes Charlie ₹500
 * Without debt simplification: 2 transactions (Alice -> Bob, Bob -> Charlie).
 * With debt simplification: 1 transaction (Alice -> Charlie ₹500).
 * 
 * Algorithmic Strategy:
 * 1. Calculate the Net Balance for every participant:
 *    Net[i] = Sum(Amount Paid by i) - Sum(Share Owed by i)
 *    Invariant: Sum of all Net balances in a closed group is always 0.
 * 2. Filter out anyone with Net balance = 0.
 * 3. Separate members into Creditors (Net > 0) and Debtors (Net < 0).
 * 4. Greedily match the largest debtor with the largest creditor:
 *    transfer = min(|debt|, credit)
 *    debtor pays creditor `transfer`.
 *    Update debtor and creditor balances. Repeat until all balances reach 0.
 * 
 * Floating Point Precision:
 * All calculations use integer cents/pennies (cents = Math.round(amount * 100))
 * to prevent IEEE-754 binary floating-point rounding errors (e.g., 0.1 + 0.2 != 0.3).
 * 
 * Complexity:
 * - Time: O(N log N) using sorted matching (or O(N^2) worst case).
 * - Space: O(N) for user balance maps.
 * - Upper Bound: Generates at most N - 1 transactions.
 */

/**
 * Calculates net balance for all members across unsettled expenses.
 * @param {Array} expenses - Array of Mongoose Expense documents (populated with paidBy and participants.userID)
 * @param {Array} [allGroupMembers] - Optional array of User objects in the group
 * @returns {Map<string, { user: Object, balanceCents: number }>}
 */
function calculateNetBalances(expenses, allGroupMembers = []) {
    const balances = new Map();

    // Helper to register a user in the balance map
    const registerUser = (user) => {
        if (!user) return;
        const id = (user._id || user.id || user).toString();
        if (!balances.has(id)) {
            balances.set(id, {
                user: {
                    _id: id,
                    name: user.name || "Unknown",
                    email: user.email || ""
                },
                balanceCents: 0
            });
        }
    };

    // Pre-populate with all known group members if provided
    allGroupMembers.forEach(registerUser);

    // Compute net impact from each unsettled expense
    for (const expense of expenses) {
        if (!expense || !expense.paidBy || !Array.isArray(expense.participants)) {
            continue;
        }

        const payer = expense.paidBy;
        const payerId = (payer._id || payer).toString();
        registerUser(payer);

        for (const participant of expense.participants) {
            // Skip already settled shares
            if (participant.isSettled) continue;

            const participantUser = participant.userID;
            if (!participantUser) continue;

            const participantId = (participantUser._id || participantUser).toString();
            registerUser(participantUser);

            // If participant is the payer, they paid their own share (no debt created)
            if (payerId === participantId) continue;

            const shareCents = Math.round(Number(participant.sharedAmount || 0) * 100);
            if (shareCents <= 0) continue;

            // Payer is owed this amount (+credit)
            balances.get(payerId).balanceCents += shareCents;

            // Participant owes this amount (-debt)
            balances.get(participantId).balanceCents -= shareCents;
        }
    }

    return balances;
}

/**
 * Executes the Greedy Cash Flow Minimization algorithm.
 * @param {Array} expenses - Populated expense documents
 * @param {Array} [allGroupMembers] - Populated group members
 * @returns {Object} Optimized settlement summary
 */
function simplifyDebts(expenses, allGroupMembers = []) {
    const balanceMap = calculateNetBalances(expenses, allGroupMembers);

    const debtors = [];   // Net < 0 (owes money)
    const creditors = []; // Net > 0 (owed money)
    const netSummary = [];

    // Calculate raw pairwise transaction count for comparison
    let rawTransactionsCount = 0;
    for (const expense of expenses) {
        const payerId = (expense.paidBy._id || expense.paidBy).toString();
        for (const p of expense.participants || []) {
            const pId = (p.userID._id || p.userID).toString();
            if (!p.isSettled && pId !== payerId && Number(p.sharedAmount) > 0) {
                rawTransactionsCount++;
            }
        }
    }

    // Classify into creditors and debtors
    for (const [id, entry] of balanceMap.entries()) {
        const netAmount = entry.balanceCents / 100;
        netSummary.push({
            user: entry.user,
            netBalance: Number(netAmount.toFixed(2))
        });

        // Ignore dust values less than 1 cent (0.01)
        if (entry.balanceCents > 0) {
            creditors.push({
                user: entry.user,
                amountCents: entry.balanceCents
            });
        } else if (entry.balanceCents < 0) {
            debtors.push({
                user: entry.user,
                amountCents: Math.abs(entry.balanceCents)
            });
        }
    }

    // Sort descending by amount
    creditors.sort((a, b) => b.amountCents - a.amountCents);
    debtors.sort((a, b) => b.amountCents - a.amountCents);

    const settlements = [];

    let cIndex = 0;
    let dIndex = 0;

    // Greedy matching: match largest debtor with largest creditor
    while (cIndex < creditors.length && dIndex < debtors.length) {
        const creditor = creditors[cIndex];
        const debtor = debtors[dIndex];

        const transferCents = Math.min(creditor.amountCents, debtor.amountCents);

        if (transferCents > 0) {
            settlements.push({
                from: debtor.user,
                to: creditor.user,
                amount: Number((transferCents / 100).toFixed(2))
            });

            creditor.amountCents -= transferCents;
            debtor.amountCents -= transferCents;
        }

        // Advance pointers if balances are cleared
        if (creditor.amountCents === 0) cIndex++;
        if (debtor.amountCents === 0) dIndex++;
    }

    const transactionsSaved = Math.max(0, rawTransactionsCount - settlements.length);

    return {
        success: true,
        settlements,
        netBalances: netSummary.sort((a, b) => b.netBalance - a.netBalance),
        rawTransactionsCount,
        optimizedTransactionsCount: settlements.length,
        transactionsSaved
    };
}

module.exports = {
    calculateNetBalances,
    simplifyDebts
};
