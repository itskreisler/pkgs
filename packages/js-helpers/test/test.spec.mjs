/**
 * @author Kreisler Ramirez Sierra
 * @file This file contains the test for the function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
import { describe, it } from 'node:test'
import assert from 'node:assert'

// » IMPORT MODULES
import { trimText, normalize, MarkdownWsp } from '../dist/index.mjs'

// ━━ TEST ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
describe('TESTING', async () => {
  it('trimText', async () => {
    assert.strictEqual(trimText('  Hello   World  '), 'Hello World')
  })
  it('normalize', async () => {
    assert.strictEqual(normalize('íóúáé'), 'iouae')
  })
  it('Markdown WhatsApp', async () => {
    const { Bold, BulletedList, InlineCode, Italic, Monospace, NumberedLists, Quote, Strikethrough } = MarkdownWsp
    assert.strictEqual(Bold('Hello World'), '*Hello World*')
    assert.strictEqual(BulletedList(['Hello', 'World']), '- Hello\n- World')
    assert.strictEqual(BulletedList('Hello World'), '- Hello World')
    assert.strictEqual(BulletedList('Hello World', '*'), '* Hello World')
    assert.strictEqual(BulletedList(['Hello', 'World'], '*'), '* Hello\n* World')
    assert.strictEqual(InlineCode('Hello World'), '`Hello World`')
    assert.strictEqual(Italic('Hello World'), '_Hello World_')
    assert.strictEqual(Monospace('Hello World'), '```Hello World```')
    assert.strictEqual(NumberedLists('Hello'), '1. Hello')
    assert.strictEqual(NumberedLists(['Hello', 'World']), '1. Hello\n2. World')
    assert.strictEqual(Quote('Hello World'), '> Hello World')
    assert.strictEqual(Strikethrough('Hello World'), '~Hello World~')
  })
})
