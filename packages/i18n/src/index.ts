export * from '@/i18n/i18n.v1'
export * from '@/i18n/i18n.v2'

// ejemplo de overload de función
export function suma(a: number, b: number): number;
export function suma(a: string, b: string): string;
export function suma(a: any, b: any): any {
    if (typeof a === 'number' && typeof b === 'number') {
        return a + b
    } else if (typeof a === 'string' && typeof b === 'string') {
        return (Number(a) + Number(b)).toString()
    } else {
        throw new Error('Both parameters must be of the same type (either both numbers or both strings)')
    }
}
