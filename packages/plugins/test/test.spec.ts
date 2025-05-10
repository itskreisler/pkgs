// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES

import { describe, it } from 'node:test'

import assert from 'node:assert'

// » IMPORT MODULES
import { greetUser, exampleUser } from '@/index'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('greetUser', () => {
    it('should return a greeting message with the provided name', () => {
        const result = greetUser(exampleUser)
        assert.strictEqual(result, 'Hello, John Doe! Your email is john.doe@example.com.')
    })
})
