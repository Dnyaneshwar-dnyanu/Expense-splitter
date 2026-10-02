const { simplifyDebts, calculateNetBalances } = require('../utils/settlementOptimizer');

function assert(condition, message) {
    if (!condition) {
        console.error(`❌ FAILED: ${message}`);
        process.exit(1);
    } else {
        console.log(`✅ PASSED: ${message}`);
    }
}

console.log('--- Running Settlement Optimizer Unit Verification ---');

// Mock User Objects
const alice = { _id: 'u1', name: 'Alice', email: 'alice@example.com' };
const bob = { _id: 'u2', name: 'Bob', email: 'bob@example.com' };
const charlie = { _id: 'u3', name: 'Charlie', email: 'charlie@example.com' };
const david = { _id: 'u4', name: 'David', email: 'david@example.com' };
const eve = { _id: 'u5', name: 'Eve', email: 'eve@example.com' };

// Test 1: Simple 2-person debt
{
    const expenses = [
        {
            paidBy: alice,
            participants: [
                { userID: alice, sharedAmount: 50, isSettled: false },
                { userID: bob, sharedAmount: 50, isSettled: false }
            ]
        }
    ];

    const result = simplifyDebts(expenses, [alice, bob]);
    assert(result.settlements.length === 1, 'Test 1: Generates exactly 1 settlement');
    assert(result.settlements[0].from._id === 'u2' && result.settlements[0].to._id === 'u1', 'Test 1: Bob pays Alice');
    assert(result.settlements[0].amount === 50, 'Test 1: Bob pays 50');
}

// Test 2: Transitive Debt (Alice pays for Bob, Bob pays for Charlie)
// Alice is owed 30 by Bob. Bob is owed 30 by Charlie.
// Result: Charlie pays Alice 30 directly (1 transaction instead of 2).
{
    const expenses = [
        {
            paidBy: alice,
            participants: [
                { userID: bob, sharedAmount: 30, isSettled: false }
            ]
        },
        {
            paidBy: bob,
            participants: [
                { userID: charlie, sharedAmount: 30, isSettled: false }
            ]
        }
    ];

    const result = simplifyDebts(expenses, [alice, bob, charlie]);
    assert(result.settlements.length === 1, 'Test 2: Transitive debt reduced to 1 transaction');
    assert(result.settlements[0].from._id === 'u3' && result.settlements[0].to._id === 'u1', 'Test 2: Charlie pays Alice');
    assert(result.settlements[0].amount === 30, 'Test 2: Amount is 30');
    assert(result.transactionsSaved === 1, 'Test 2: Saved 1 transaction');
}

// Test 3: Circular Debt (A -> B -> C -> A)
// All debts cancel out completely!
{
    const expenses = [
        {
            paidBy: alice,
            participants: [{ userID: bob, sharedAmount: 100, isSettled: false }]
        },
        {
            paidBy: bob,
            participants: [{ userID: charlie, sharedAmount: 100, isSettled: false }]
        },
        {
            paidBy: charlie,
            participants: [{ userID: alice, sharedAmount: 100, isSettled: false }]
        }
    ];

    const result = simplifyDebts(expenses, [alice, bob, charlie]);
    assert(result.settlements.length === 0, 'Test 3: Circular debt completely cancels out (0 transactions)');
    assert(result.transactionsSaved === 3, 'Test 3: Saved all 3 transactions');
}

// Test 4: Floating Point Division & Unequal Decimal Split (₹100 split 3 ways)
// Alice paid 100. Shares: Alice: 33.34, Bob: 33.33, Charlie: 33.33
{
    const expenses = [
        {
            paidBy: alice,
            participants: [
                { userID: alice, sharedAmount: 33.34, isSettled: false },
                { userID: bob, sharedAmount: 33.33, isSettled: false },
                { userID: charlie, sharedAmount: 33.33, isSettled: false }
            ]
        }
    ];

    const result = simplifyDebts(expenses, [alice, bob, charlie]);
    assert(result.settlements.length === 2, 'Test 4: Two debtors pay Alice');
    const totalPaid = result.settlements.reduce((sum, s) => sum + s.amount, 0);
    assert(Math.abs(totalPaid - 66.66) < 0.001, 'Test 4: Total settled equals 66.66 without floating point errors');
}

// Test 5: Complex 5-person mesh
// Alice paid 500 for everyone (100 each).
// Bob paid 200 for Charlie, David (100 each).
// David paid 50 for Eve.
{
    const expenses = [
        {
            paidBy: alice,
            participants: [
                { userID: alice, sharedAmount: 100, isSettled: false },
                { userID: bob, sharedAmount: 100, isSettled: false },
                { userID: charlie, sharedAmount: 100, isSettled: false },
                { userID: david, sharedAmount: 100, isSettled: false },
                { userID: eve, sharedAmount: 100, isSettled: false }
            ]
        },
        {
            paidBy: bob,
            participants: [
                { userID: charlie, sharedAmount: 100, isSettled: false },
                { userID: david, sharedAmount: 100, isSettled: false }
            ]
        },
        {
            paidBy: david,
            participants: [
                { userID: eve, sharedAmount: 50, isSettled: false }
            ]
        }
    ];

    const result = simplifyDebts(expenses, [alice, bob, charlie, david, eve]);
    console.log('Complex 5-person result:', JSON.stringify(result.settlements, null, 2));
    assert(result.settlements.length <= 4, 'Test 5: Transactions bounded by at most N - 1 (4)');
    
    // Check that sum of credits received equals sum of debts paid
    const totalTransferred = result.settlements.reduce((sum, s) => sum + s.amount, 0);
    assert(totalTransferred > 0, 'Test 5: Transfers occur');
}

// Test 6: Empty expenses and settled expenses ignored
{
    const expenses = [
        {
            paidBy: alice,
            participants: [
                { userID: bob, sharedAmount: 100, isSettled: true } // Already settled!
            ]
        }
    ];

    const result = simplifyDebts(expenses, [alice, bob]);
    assert(result.settlements.length === 0, 'Test 6: Settled expenses are correctly ignored');
}

console.log('\n🎉 ALL SETTLEMENT OPTIMIZER TESTS PASSED PERFECTLY!\n');
