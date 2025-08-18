/**
 * @author Kreisler Ramirez Sierra
 * @file Test file for buildCronExpression function.
 */

// ━━ IMPORT MODULES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// » IMPORT NATIVE NODE MODULES
// @ts-expect-error - Node.js test module types not available
import { describe, it } from 'node:test'
// @ts-expect-error - Node.js assert module types not available
import assert from 'node:assert'

// » IMPORT MODULES
import { buildCronExpression, type CronFields } from '@/lib/cronExpression'

// ━━ TESTS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('buildCronExpression', () => {
    it('should create cron expression for "Fire at 12:00 PM (noon) every day"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '0',
            hour: '12',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 0 12 * * ? *')
    })

    it('should create cron expression for "Fire at 10:15 AM every day" (with dayOfWeek as *)', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '?',
            month: '*',
            dayOfWeek: '*'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 ? * * *')
    })

    it('should create cron expression for "Fire at 10:15 AM every day" (with dayOfMonth as *)', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 * * ? *')
    })

    it('should create cron expression for "Fire at 10:15 AM every day" (with explicit year)', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?',
            year: '*'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 * * ? *')
    })

    it('should create cron expression for "Fire at 10:15 AM every day during the year 2005"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?',
            year: '2005'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 * * ? 2005')
    })

    it('should create cron expression for "Fire every minute starting at 2:00 PM and ending at 2:59 PM, every day"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '*',
            hour: '14',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 * 14 * * ? *')
    })

    it('should create cron expression for "Fire every 5 minutes starting at 2:00 PM and ending at 2:55 PM, every day"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '0/5',
            hour: '14',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 0/5 14 * * ? *')
    })

    it('should create cron expression for "Fire every 5 minutes at 2PM and 6PM every day"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '0/5',
            hour: '14,18',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 0/5 14,18 * * ? *')
    })

    it('should create cron expression for "Fire every minute starting at 2:00 PM and ending at 2:05 PM, every day"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '0-5',
            hour: '14',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 0-5 14 * * ? *')
    })

    it('should create cron expression for "Fire at 2:10 PM and at 2:44 PM every Wednesday in March"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '10,44',
            hour: '14',
            dayOfMonth: '?',
            month: '3',
            dayOfWeek: 'WED'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 10,44 14 ? 3 WED *')
    })

    it('should create cron expression for "Fire at 10:15 AM every Monday through Friday"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '?',
            month: '*',
            dayOfWeek: 'MON-FRI'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 ? * MON-FRI *')
    })

    it('should create cron expression for "Fire at 10:15 AM on the 15th day of every month"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '15',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 15 * ? *')
    })

    it('should create cron expression for "Fire at 10:15 AM on the last day of every month"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: 'L',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 L * ? *')
    })

    it('should create cron expression for "Fire at 10:15 AM on the last Friday of every month"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '?',
            month: '*',
            dayOfWeek: '6L'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 ? * 6L *')
    })

    it('should create cron expression for "Fire at 10:15 AM on the last Friday of every month during 2002-2005"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '?',
            month: '*',
            dayOfWeek: '6L',
            year: '2002-2005'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 ? * 6L 2002-2005')
    })

    it('should create cron expression for "Fire at 10:15 AM on the third Friday of every month"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '15',
            hour: '10',
            dayOfMonth: '?',
            month: '*',
            dayOfWeek: '6#3'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 15 10 ? * 6#3 *')
    })

    it('should create cron expression for "Fire at 12 PM (noon) every 5 days every month, starting on the first day"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '0',
            hour: '12',
            dayOfMonth: '1/5',
            month: '*',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 0 12 1/5 * ? *')
    })

    it('should create cron expression for "Fire every November 11 at 11:11 AM"', () => {
        const cronFields: CronFields = {
            second: '0',
            minute: '11',
            hour: '11',
            dayOfMonth: '11',
            month: '11',
            dayOfWeek: '?'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '0 11 11 11 11 ? *')
    })

    // Tests adicionales para casos con defaults
    it('should use default values when fields are omitted', () => {
        const cronFields: CronFields = {
            minute: '30',
            hour: '8'
        }
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '* 30 8 * * * *')
    })

    it('should handle empty object with all defaults', () => {
        const cronFields: CronFields = {}
        const result = buildCronExpression(cronFields)
        assert.strictEqual(result, '* * * * * * *')
    })
})
