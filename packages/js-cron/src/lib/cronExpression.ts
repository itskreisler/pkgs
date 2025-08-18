// Tipos base para números específicos
type SecondMinuteNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59
type HourNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23
type DayOfMonthNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31
type MonthNumbers = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
type DayOfWeekNumbers = 1 | 2 | 3 | 4 | 5 | 6 | 7

// Nombres de meses (JAN-DEC)
type MonthNames = 'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC'

// Nombres de días (SUN-SAT)
type DayNames = 'SUN' | 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT'

// Conversión a string
type SecondMinuteStrings = `${SecondMinuteNumbers}`
type HourStrings = `${HourNumbers}`
type DayOfMonthStrings = `${DayOfMonthNumbers}`
type MonthStrings = `${MonthNumbers}`
type DayOfWeekStrings = `${DayOfWeekNumbers}`

// Divisores comunes
type CommonDivisors = 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30

// Patrones de divisor con asterisco (*/n)
type StarDivisor = `*/${CommonDivisors}`

// Tipos específicos para cada campo según la especificación

// Tipo para valores personalizados que mantiene el autocompletado
type CustomValue<T> = T | (string & {})

// Segundos: 0-59, caracteres especiales: , - * /
type SecondType =
  | '*'
  | SecondMinuteStrings
  | StarDivisor
  | `${SecondMinuteNumbers}-${SecondMinuteNumbers}`
  | `${SecondMinuteNumbers}-${SecondMinuteNumbers}/${CommonDivisors}`
  | `${SecondMinuteNumbers}/${CommonDivisors}`

// Patrones comunes para listas de minutos
type CommonMinuteLists =
  | '10,44' // 10 y 44 minutos
  | '0,15,30,45' // Cada cuarto de hora
  | '0,30' // Cada media hora
  | '15,45' // Cuartos de hora
  | '0,20,40' // Cada 20 minutos
  | '5,25,45' // Desfasado 5 minutos

// Minutos: 0-59, caracteres especiales: , - * /
type MinuteType = CustomValue<
  | '*'
  | SecondMinuteStrings
  | StarDivisor
  | `${SecondMinuteNumbers}-${SecondMinuteNumbers}`
  | `${SecondMinuteNumbers}-${SecondMinuteNumbers}/${CommonDivisors}`
  | `${SecondMinuteNumbers}/${CommonDivisors}`
  | CommonMinuteLists
>

// Patrones comunes para listas de horas
type CommonHourLists =
  | '14,18' // 2PM y 6PM
  | '9,12,15' // 9AM, 12PM, 3PM
  | '6,12,18' // 6AM, 12PM, 6PM
  | '0,6,12,18' // Cada 6 horas
  | '8,12,16,20' // Cada 4 horas desde las 8AM
  | '0,12' // Medianoche y mediodía
  | '9,17' // 9AM y 5PM (horario laboral)

// Horas: 0-23, caracteres especiales: , - * /
type HourType = CustomValue<
  | '*'
  | HourStrings
  | StarDivisor
  | `${HourNumbers}-${HourNumbers}`
  | `${HourNumbers}-${HourNumbers}/${CommonDivisors}`
  | `${HourNumbers}/${CommonDivisors}`
  | CommonHourLists
>

// Patrones comunes para días del mes
type CommonDayOfMonthLists =
  | '1,15' // Primero y quince
  | '1,8,15,22' // Cada semana aproximadamente
  | 'L-1' // Penúltimo día del mes

// Día del mes: 1-31, caracteres especiales: , - * ? / L W C
type DayOfMonthType = CustomValue<
  | '*'
  | '?'
  | 'L'
  | DayOfMonthStrings
  | StarDivisor
  | `${DayOfMonthNumbers}-${DayOfMonthNumbers}`
  | `${DayOfMonthNumbers}-${DayOfMonthNumbers}/${CommonDivisors}`
  | `${DayOfMonthNumbers}/${CommonDivisors}`
  | `${DayOfMonthNumbers}W` // Weekday
  | 'LW' // Last weekday
  | 'C' // Calendar
  | CommonDayOfMonthLists
>

// Patrones comunes para meses
type CommonMonthLists =
  | 'JAN,APR,JUL,OCT' // Trimestrales
  | 'MAR,JUN,SEP,DEC' // Estacionales
  | 'JAN,JUL' // Cada 6 meses

// Mes: 0-11 o JAN-DEC, caracteres especiales: , - * /
type MonthType = CustomValue<
  | '*'
  | MonthStrings
  | MonthNames
  | StarDivisor
  | `${MonthNumbers}-${MonthNumbers}`
  | `${MonthNumbers}-${MonthNumbers}/${CommonDivisors}`
  | `${MonthNumbers}/${CommonDivisors}`
  | `${MonthNames}-${MonthNames}`
  | CommonMonthLists
>

// Rangos comunes de días de la semana
type CommonDayRanges =
  | 'MON-FRI' // Lunes a viernes
  | 'MON-SAT' // Lunes a sábado
  | 'SAT-SUN' // Fin de semana

// Años comunes en rangos
type CommonYearRanges =
  | '2002-2005'
  | '2020-2025'
  | '2024-2030'

// Día de la semana: 1-7 o SUN-SAT, caracteres especiales: , - * ? / L C #
type DayOfWeekType = CustomValue<
  | '*'
  | '?'
  | 'L'
  | DayOfWeekStrings
  | DayNames
  | StarDivisor
  | `${DayOfWeekNumbers}-${DayOfWeekNumbers}`
  | `${DayOfWeekNumbers}-${DayOfWeekNumbers}/${CommonDivisors}`
  | `${DayOfWeekNumbers}/${CommonDivisors}`
  | `${DayNames}-${DayNames}`
  | CommonDayRanges
  | `${DayOfWeekNumbers}L` // Last occurrence of day
  | `${DayNames}L` // Last occurrence of day
  | `${DayOfWeekNumbers}#${1 | 2 | 3 | 4 | 5}` // Nth occurrence
  | 'C' // Calendar
>

// Año: vacío o 1970-2099, caracteres especiales: , - * /
type YearType = CustomValue<
  | '*'
  | `${1970 | 1971 | 1972 | 1973 | 1974 | 1975 | 1976 | 1977 | 1978 | 1979 | 1980 | 1981 | 1982 | 1983 | 1984 | 1985 | 1986 | 1987 | 1988 | 1989 | 1990 | 1991 | 1992 | 1993 | 1994 | 1995 | 1996 | 1997 | 1998 | 1999 | 2000 | 2001 | 2002 | 2003 | 2004 | 2005 | 2006 | 2007 | 2008 | 2009 | 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 | 2027 | 2028 | 2029 | 2030 | 2031 | 2032 | 2033 | 2034 | 2035 | 2036 | 2037 | 2038 | 2039 | 2040 | 2041 | 2042 | 2043 | 2044 | 2045 | 2046 | 2047 | 2048 | 2049 | 2050 | 2051 | 2052 | 2053 | 2054 | 2055 | 2056 | 2057 | 2058 | 2059 | 2060 | 2061 | 2062 | 2063 | 2064 | 2065 | 2066 | 2067 | 2068 | 2069 | 2070 | 2071 | 2072 | 2073 | 2074 | 2075 | 2076 | 2077 | 2078 | 2079 | 2080 | 2081 | 2082 | 2083 | 2084 | 2085 | 2086 | 2087 | 2088 | 2089 | 2090 | 2091 | 2092 | 2093 | 2094 | 2095 | 2096 | 2097 | 2098 | 2099}`
  | CommonYearRanges
>

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
 * @link https://cronjob.xyz/
 * @link https://crontab.guru/
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

// ━━ EJEMPLOS DE USO CON AUTOCOMPLETADO MEJORADO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/**
 * Ejemplos que demuestran el autocompletado específico para cada campo:
 * 
 * @example Horas - Autocompletado incluye valores comunes:
 * hour: '14,18' // ✅ 2PM y 6PM - valor predefinido con autocompletado
 * hour: '9,12,15' // ✅ 9AM, 12PM, 3PM - valor predefinido
 * hour: '8,20' // ✅ También permite valores personalizados
 * 
 * @example Minutos - Patrones comunes disponibles:
 * minute: '10,44' // ✅ Valor específico con autocompletado
 * minute: '0,15,30,45' // ✅ Cada cuarto de hora
 * minute: '5,35' // ✅ Valores personalizados también funcionan
 * 
 * @example Días de la semana - Rangos inteligentes:
 * dayOfWeek: 'MON-FRI' // ✅ Lunes a viernes con autocompletado
 * dayOfWeek: '6L' // ✅ Último viernes del mes
 * dayOfWeek: '6#3' // ✅ Tercer viernes del mes
 * 
 * @example Años - Rangos predefinidos y personalizados:
 * year: '2002-2005' // ✅ Rango predefinido con autocompletado
 * year: '2025' // ✅ Año específico
 * year: '2024-2030' // ✅ Valor personalizado también funciona
 */

// Ejemplo de uso con autocompletado.
// const cronObject: CronFields = { second: '0', minute: '59', hour: '6-23', month: '12', dayOfWeek: '1', year: '2024-2031' }
// const cronExpression = buildCronExpression(cronObject)
// console.log(cronExpression) // Output: '0 */15 6-23 * * * *'
export { buildCronExpression, type CronFields }
