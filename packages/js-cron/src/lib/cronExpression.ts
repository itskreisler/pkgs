// Definimos tipos para representar posibles valores de "*/x" y "x-y".
type StarDivisors = `*/${2 | 3 | 4 | 5 | 6 | 10 | 15 | 20 | 30}`
type Rango = `${HourValues}-${HourValues}` // Tipo general para rangos (ej. "6-23").

// Valores específicos para cada campo en la expresión cron.
type MinuteHourValues = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59}`
type HourValues = `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23}`
type YearValues = `${2023 | 2024 | 2025 | 2026 | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 | 2038 | 2039 | 2040}`
// Tipos específicos para cada campo.
type SecondType = '*' | StarDivisors | MinuteHourValues | Rango
type MinuteType = '*' | StarDivisors | MinuteHourValues | Rango
type HourType = '*' | StarDivisors | HourValues | Rango
type DayOfMonthType = '*' | StarDivisors | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31}` | Rango
type MonthType = '*' | `${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
type DayOfWeekType = '*' | `${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}`
type YearType = '*' | YearValues | `${YearValues}-${YearValues}`

// Creamos el tipo para el objeto de cron con autocompletado específico.
interface CronFields {
  second?: SecondType
  minute?: MinuteType
  hour?: HourType
  dayOfMonth?: DayOfMonthType
  month?: MonthType
  dayOfWeek?: DayOfWeekType
  year?: YearType
}
/**
 * @description
 * ┌───────────── second (0 - 59)
 * │ ┌───────────── minute (0 - 59)
 * │ │ ┌───────────── hour (0 - 23)
 * │ │ │ ┌───────────── day of the month (1 - 31)
 * │ │ │ │ ┌───────────── month (1 - 12)
 * │ │ │ │ │ ┌───────────── day of the week (0 - 7) (Sunday to Saturday, 0 and 7 both represent Sunday)
 * │ │ │ │ │ │ ┌───────────── year (optional)
 * │ │ │ │ │ │ │
 * 0 59 6-23 * * * *
 * @param cronFields
 * @returns
 */
// Función que crea la cadena cron basada en el objeto recibido.
function buildCronExpression(cronFields: CronFields): string {
  const {
    second = '*',
    minute = '*',
    hour = '*',
    dayOfMonth = '*',
    month = '*',
    dayOfWeek = '*',
    year = '*'
  } = cronFields

  return `${second} ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${year}`
}

// Ejemplo de uso con autocompletado.
const cronObject: CronFields = { second: '0', minute: '59', hour: '6-23', month: '12', dayOfWeek: '1', year: '2024-2031' }
const cronExpression = buildCronExpression(cronObject)
console.log(cronExpression) // Output: '0 */15 6-23 * * * *'
